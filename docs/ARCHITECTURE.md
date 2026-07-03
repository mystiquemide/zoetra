# Zoetra — Architecture

## System Overview

```
┌──────────────┐  heartbeat tx (interval i)  ┌─────────────────────┐
│ daemon (PC)  │────────────────────────────▶│                     │
├──────────────┤                             │  ZoetraRegistry.sol │
│ daemon (VM)  │────────────────────────────▶│  BOT Chain testnet  │
├──────────────┤                             │  (968, bohr.life)   │
│ daemon (3rd) │────────────────────────────▶│                     │
└──────────────┘                             └──────────┬──────────┘
                                                        │ events + views
                          ┌─────────────────────────────┼──────────────┐
                          ▼                             ▼              ▼
                 Next.js dashboard              Blockscout       verifier wallet
                 (Vercel, read-only RPC         (scan.bohr.life,  calls slash()
                  + wallet for register/slash)   public proof)
```

No backend, no database. The chain is the single source of truth; the dashboard is a pure view over events and view functions. This is deliberate: it maximizes the 35% integration score and means every UI number is reproducible from the explorer.

## Networks

| | Testnet (primary) | Mainnet (optional E3) |
|---|---|---|
| Chain ID | 968 | 677 |
| RPC | https://rpc.bohr.life | https://rpc.botchain.ai |
| WS | n/a (poll) | wss://ws-rpc.botchain.ai |
| Explorer | https://scan.bohr.life | https://scan.botchain.ai |
| Faucet | https://faucet.botchain.ai/basic | same page |
| Verified live | Jul 3 (eth_chainId 0x3c8) | Jul 3 (0x2a5) |

Docs: https://dev-docs.botchain.ai/docs/Developers/quick-guide/

## Contract: ZoetraRegistry.sol (~150 lines, Solidity ^0.8.28)

### Storage

```solidity
struct Device {
    address operator;      // signer allowed to beat; receives withdrawals
    uint128 stake;         // native BOT, wei
    uint64  windowStart;   // current bucket start (unix)
    uint64  lastBeat;
    uint64  deregisteredAt;// 0 while active
    uint64  lastSlashAt;
    uint32  intervalSec;   // declared heartbeat interval, 5..300
    uint32  beatsCurr;     // beats in current bucket
    uint32  beatsPrev;     // beats in previous bucket
    uint16  slaBps;        // SLA threshold, e.g. 9000 = 90%
    string  name;
}
uint256 public deviceCount;               // ids are 1..deviceCount
mapping(uint256 => Device) public devices;
```

Constants: `WINDOW_BEATS = 20` (bucket = 20 × interval), `MIN_STAKE = 0.05 ether`, `SLASH_BPS = 2000` (20% of stake per slash), `BOUNTY_BPS = 1000` (10% of slashed amount to caller), `WITHDRAW_COOLDOWN = 60s`, `SLASH_COOLDOWN = one bucket`.

### Score math (two-bucket sliding window)

Bucket length `L = intervalSec * WINDOW_BEATS`. On every heartbeat, roll buckets: if `now - windowStart >= 2L`, zero both and restart; else if `>= L`, shift curr→prev, advance windowStart by L.

`scoreOf(id)` (view, no state change; rolls virtually):
```
elapsed  = now - windowStart          (after virtual roll)
expected = (L + elapsed) / intervalSec         // trailing prev + partial curr
received = beatsPrev + beatsCurr               // after virtual roll, capped
score    = min(10000, received * 10000 / max(expected, 1))
```
Properties: full uptime holds ~10000 bps; a killed device visibly decays within a few missed intervals because `expected` keeps growing while `received` freezes; recovery climbs as new beats land and dead buckets age out (fully clean after 2L).

### Functions

| Function | Access | Behavior |
|---|---|---|
| `register(name, intervalSec, slaBps) payable` | anyone | `msg.value >= MIN_STAKE`, `5 <= interval <= 300`, `5000 <= slaBps <= 9999`. Emits `Registered` |
| `heartbeat(id)` | operator only | active device; rolls buckets; `beatsCurr++`; emits `Beat(id, timestamp, score)` |
| `scoreOf(id) → uint16` | view | bps as above |
| `slash(id)` | anyone | requires active, `scoreOf < slaBps`, `now - lastSlashAt >= SLASH_COOLDOWN`. `amount = stake * SLASH_BPS / 10000`; bounty to caller, remainder to `0x...dEaD`; emits `Slashed(id, caller, amount, bounty, score)` |
| `deregister(id)` | operator | sets `deregisteredAt`; beats stop counting |
| `withdraw(id)` | operator | after cooldown; transfers remaining stake; deletes device; emits `Withdrawn` |
| `getDevices(offset, limit) → Device[] + ids + scores` | view | enumeration for the UI, no multicall dependency |

### Security posture
- Checks-effects-interactions everywhere; stake transfers last; no reentrancy surface beyond `withdraw`/`slash` transfers (state zeroed/decremented before send)
- `call{value:}` with success require, no `transfer`
- Slash bounty caps griefing: caller pays gas, gets bounty only on a genuinely breached device; cooldown prevents slash-draining in one block
- No owner/admin functions at all: nothing to rug, nothing to audit-flag; constants are immutable by design (hackathon scope, honest tradeoff documented in README)
- Operator key on devices holds only faucet dust + its own stake

## Daemon (`daemon/heartbeat.mjs`)

Plain Node (no build step), viem wallet client. Env: `RPC_URL`, `PRIVATE_KEY`, `DEVICE_ID`, `INTERVAL_MS`. Loop: `sendTransaction(heartbeat)` → log hash + confirm latency; sequential awaits keep nonces ordered; on RPC error exponential backoff (1s → 8s max) without drifting the schedule (next tick = start + n*interval, skipped ticks are simply missed beats, which is honest). SIGINT prints `daemon stopped` and exits, which is the on-camera kill.

## Frontend (existing boilerplate, Next.js 16 App Router)

```
src/
  lib/
    chains.ts      # defineChain 968 + 677, active from NEXT_PUBLIC_CHAIN
    registry.ts    # address (env) + typed ABI
    web3.ts        # wagmi config → RainbowKit, chains from chains.ts
  hooks/
    use-devices.ts # getDevices poll every 2s (react-query)
    use-live-feed.ts # watchContractEvent Beat/Slashed/Registered, poll 1s
  app/
    page.tsx       # landing
    live/page.tsx  # dashboard
  components/
    live/device-card.tsx   # pulse ring on Beat, score, stake, SLA, slash button
    live/event-feed.tsx    # rolling feed, tx deep links to explorer
    live/stats-strip.tsx   # total beats, active devices, slashes, chain badge
    live/register-modal.tsx
```

Wallet states handled: disconnected (read-only dashboard still fully live), wrong network (switch prompt to 968), pending/failed/confirmed tx (toasts with explorer links). Explorer base URL derives from active chain.

## Env

```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
NEXT_PUBLIC_CHAIN=testnet            # testnet | mainnet
NEXT_PUBLIC_REGISTRY_ADDRESS_TESTNET=
NEXT_PUBLIC_REGISTRY_ADDRESS_MAINNET=
DEPLOYER_PRIVATE_KEY=                # contracts/ only
RPC_URL= PRIVATE_KEY= DEVICE_ID= INTERVAL_MS=   # daemon only
```

## ADRs

1. No database, chain-only reads. Reason: integration score, zero infra, every number judge-verifiable. Cost: history limited to RPC log range; acceptable, Blockscout API is the fallback for deep history.
2. Two-bucket sliding window on-chain instead of ring buffer. Reason: O(1) storage and gas per beat; visible decay and recovery; ring buffer gas cost buys nothing the demo needs.
3. Native BOT stake, no ERC-20. Reason: one fewer contract, one fewer approval step, faucet-fundable.
4. Permissionless slash with bounty. Reason: turns the trust model into a market and gives the demo its second actor; judges can slash from their own wallet.
5. Testnet 968 primary, mainnet 677 optional at E3. Reason: free faucet gas for thousands of beats; identical bytecode either way; rules accept testnet explicitly.
6. Per-device interval on-chain (5s demo, 30s steady). Reason: demo drama and gas economy are both first-class, chosen per device, no redeploys.
