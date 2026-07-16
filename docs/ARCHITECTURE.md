# Zoetra Architecture

Zoetra is a mainnet BOT Chain product. The registry contract is the source of truth; the web app and heartbeat client only read from or write to that contract.

## Production network

| Item | Value |
|---|---|
| Network | BOT Chain mainnet |
| Chain ID | `677` |
| RPC | `https://rpc.botchain.ai` |
| WebSocket RPC | `wss://ws-rpc.botchain.ai` |
| Explorer | `https://scan.botchain.ai` |
| Contract | `0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac` |
| Funding path | Bridge at `https://bridge.botchain.ai`, then swap at `https://dex.botchain.ai` |

## System overview

```text
Device operator wallet ── register + stake BOT ──▶ ZoetraRegistry
Heartbeat client ─────── heartbeat(id) tx ───────▶ ZoetraRegistry
Any funded wallet ────── slash(id) if breached ─▶ ZoetraRegistry
Zoetra web app ───────── read state/events ──────▶ ZoetraRegistry
BOTScan ──────────────── public proof ──────────▶ verified contract + txs
```

There is no database, account server, scoring backend, keeper, oracle, or admin key. The only state that matters is on BOT Chain mainnet.

## Contract model

`ZoetraRegistry.sol` stores each device as:

```solidity
struct Device {
    address operator;
    uint128 stake;
    uint64 registeredAt;
    uint64 windowStart;
    uint64 lastBeat;
    uint64 deregisteredAt;
    uint64 lastSlashAt;
    uint32 intervalSec;
    uint32 beatsCurr;
    uint32 beatsPrev;
    uint16 slaBps;
    string name;
}
```

Constants:

| Constant | Meaning |
|---|---|
| `MIN_STAKE = 0.05 ether` | Minimum BOT stake to register. |
| `MIN_INTERVAL = 5` | Fastest heartbeat interval. |
| `MAX_INTERVAL = 300` | Slowest heartbeat interval. |
| `WINDOW_BEATS = 20` | Rolling score bucket size. |
| `SLASH_BPS = 2000` | 20% of remaining stake can be cut per valid slash. |
| `BOUNTY_BPS = 1000` | 10% of the cut goes to the caller as bounty. |

## Score math

Zoetra uses a two-bucket rolling window.

```text
expected = expected heartbeats over the rolling window
received = heartbeats received over the rolling window
score = min(10000, received * 10000 / expected)
```

Because `scoreOf(id)` uses `block.timestamp`, the score changes as time passes even when nobody sends a transaction. This is what makes a silent device decay without a backend worker.

## Frontend

- Next.js App Router
- wagmi + viem for contract reads/writes
- RainbowKit for injected wallets and WalletConnect
- BO Wallet support through WalletConnect QR pairing
- `/live` reads device state, scores, explorer URLs, and bytecode status from BOT Chain mainnet
- `/proof` gives the production verification walkthrough
- `/tx/[hash]` and `/address/[addr]` provide in-app explorer-style decoding
- `/api/alert` is a stateless relay for optional breach webhook notifications

## Heartbeat client

`daemon/heartbeat.mjs` signs `heartbeat(deviceId)` from the registered operator key.

Required env:

```text
RPC_URL=https://rpc.botchain.ai
CHAIN_ID=677
REGISTRY_ADDRESS=0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac
PRIVATE_KEY=...
DEVICE_ID=...
INTERVAL_MS=300000
```

`MAX_BEATS` can cap a controlled verification run. `0` means continuous.

## Integrations

| Integration | Role |
|---|---|
| BOT Chain mainnet | Settlement, scoring, staking, slashing. |
| Native BOT | Gas, device stake, slash bounty, burn. |
| BOTScan | Public proof for contract, txs, source verification. |
| BOT Chain bridge | Funding route for users. |
| BOT Chain DEX | Swap route into BOT. |
| BO Wallet + WalletConnect | Mobile wallet connection. |
| Vercel | Public production hosting. |
| GitHub Actions + CodeQL | CI and static security checks. |

## Trust boundaries

- Zoetra never has user private keys.
- The frontend cannot change scores; it only reads and submits user-signed transactions.
- The heartbeat client only controls the wallet key the operator gives it.
- The webhook relay stores nothing server-side.
- Slashing and withdrawals are final once confirmed on BOT Chain mainnet.
