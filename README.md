# Zoetra

**DePIN uptime you can slash.**

Entry for the [BOT Chain Builder Challenge #1](https://rapid-change-2c1.notion.site/BOT-Chain-Builder-Challenge-1-38846f6c38d580c99a84d5022ba83ac5) (DePIN / Real World track).

Every DePIN network builds its own closed uptime system: Helium's proof-of-coverage only works for Helium hotspots, io.net's monitoring only works for io.net nodes. Zoetra is the first open, permissionless SLA layer any device, from any network, can adopt without asking anyone's permission. There's no backend: uptime is scored live, entirely on-chain, from `block.timestamp` alone, no cron job, no indexer, no server keeping score. Operators stake native BOT against their own SLA, and if they breach it, **anyone** (not an admin) can slash the stake, permissionlessly, and earn a bounty for catching it.

None of this works without BOT Chain. Sub-second finality and near-zero fees are what turn a heartbeat every few seconds into a real, affordable transaction instead of a toy; on most chains this would be unaffordable, here it's the whole product.

- **Live dashboard:** https://zoetra.vercel.app/live
- **Contract (BOT Chain testnet, chain 968):** [`0x32550FbbB458380e2A198E97dABcc70fEe95b8E6`](https://scan.bohr.life/address/0x32550FbbB458380e2A198E97dABcc70fEe95b8E6)

## Judge quickstart

- Live demo: https://zoetra.vercel.app/live
- Contract: `0x32550FbbB458380e2A198E97dABcc70fEe95b8E6`
- Network: BOT Chain testnet ("Bohr"), chain ID 968
- Explorer: https://scan.bohr.life/address/0x32550FbbB458380e2A198E97dABcc70fEe95b8E6
- Demo video: recording in progress, link lands here before submission

What to watch:
1. Three device wallets heartbeat every 5 seconds, each one a real transaction.
2. Every card's score is computed live on-chain from `block.timestamp`, not cached or polled from a database.
3. Stop one daemon (`Ctrl+C` on `daemon/heartbeat.mjs`) and its score decays visibly within seconds.
4. Once a device's score falls below its own SLA, the Slash button activates for anyone, including you if you connect a wallet, and pays a bounty for catching the breach.

## How it works

1. **Register & stake** — declare a heartbeat interval (5–300s) and an SLA threshold (50–99.99%), stake ≥0.05 BOT.
2. **Heartbeat on-chain** — every beat is a real transaction. `scoreOf(id)` computes uptime live from a two-bucket rolling window and `block.timestamp`, so the score decays in real time even between transactions, no cron job required.
3. **Breach gets slashed** — once `scoreOf(id) < slaBps`, anyone can call `slash(id)`. 20% of the remaining stake is slashed, 10% of that goes to the caller as a bounty, the rest is burned.

## Architecture

No database, no backend API. The chain is the only source of truth; the dashboard is a pure read over contract events and view functions, so every number it shows is independently reproducible from the block explorer alone.

```
daemon/ (Node + viem)  ──heartbeat tx──▶  ZoetraRegistry.sol  ──events──▶  Next.js dashboard (wagmi/viem)
   one process per device                  BOT Chain testnet                reads-only unless a wallet
                                            (968, rpc.bohr.life)             connects to register/slash
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design, [`docs/PRD.md`](docs/PRD.md) for product scope, and [`docs/DESIGN.md`](docs/DESIGN.md) for the UI spec.

## Repo layout

```
contracts/   Hardhat workspace: ZoetraRegistry.sol, 23 tests, deploy/setup scripts
daemon/      heartbeat.mjs — one process per device, viem wallet client
src/         Next.js 16 App Router dashboard (wagmi + RainbowKit + viem)
docs/        PRD, architecture, design, analytics, task breakdown
```

## Running it yourself

### Contracts

```bash
cd contracts
npm install
npx hardhat test                              # 23 tests, all passing
cp .env.example .env                          # RPC URLs (non-secret)
# put DEPLOYER_PRIVATE_KEY in a separate .env you control, e.g. ../.secrets/deployer.env
npx hardhat run scripts/deploy.js --network bohr
```

Networks are pre-configured for both BOT Chain testnet (`bohr`, chain 968) and mainnet (`botchain`, chain 677).

### Daemon (per device)

```bash
cd daemon
npm install
cp .env.example .env
# fill RPC_URL, REGISTRY_ADDRESS, PRIVATE_KEY, DEVICE_ID, INTERVAL_MS
npm start
```

Run one process per device. Each is a real funded wallet sending real transactions, killing the process is the actual "device went offline" event, no simulation flag anywhere in this repo.

### Dashboard

```bash
npm install
cp .env.example .env
npm run dev
```

`NEXT_PUBLIC_CHAIN=testnet|mainnet` switches the whole app (RPC, explorer links, contract address) between BOT Chain testnet and mainnet.

> **Note:** Next.js blocks client-side dev resource requests when the dev server is accessed via `127.0.0.1` without `allowedDevOrigins` configured (see `next.config.ts`), silently breaking all on-chain reads. Use `localhost` or add your origin there if you hit an empty dashboard locally.

## What's real vs. what's a placeholder

- Contract, deployment, all three devices, every heartbeat, and the one slash referenced in the demo video are real transactions on BOT Chain testnet, verifiable at [scan.bohr.life](https://scan.bohr.life/address/0x32550FbbB458380e2A198E97dABcc70fEe95b8E6).
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` ships with a placeholder because RainbowKit hard-requires a non-empty value to boot at all, even for wallets that never touch WalletConnect. Injected wallets (MetaMask etc.) work out of the box; swap in a real WalletConnect Cloud project ID for the QR-code flow.
- `npm audit` reports vulnerabilities in the WalletConnect/RainbowKit dependency tree (root) and Hardhat's tooling tree (contracts). All fixes require `--force` and risk breaking wallet connect or the build right before submission, so they're deliberately left unpatched rather than risking a regression under deadline. None are in code this project's contract or daemon logic touches directly.

## Prizes this targets

Track Award (DePIN / Real World) + Best Content (X thread with the kill-a-device demo) + PR/Bug/Optimization bounty (filed separately: BOT Chain's developer docs aren't linked from the marketing site or the faucet page, only discoverable via the challenge's Notion doc).

## License

MIT
