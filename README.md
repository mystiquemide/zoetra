# Zoetra

**DePIN uptime you can slash.**

Entry for the [BOT Chain Builder Challenge #1](https://rapid-change-2c1.notion.site/BOT-Chain-Builder-Challenge-1-38846f6c38d580c99a84d5022ba83ac5) (DePIN / Real World track).

DePIN networks pay devices for staying online, but "uptime" is normally just a number on an operator-controlled dashboard, nobody outside the company can verify it. Zoetra replaces the dashboard with the chain. Devices send a heartbeat transaction at a self-declared interval, a smart contract scores uptime over a rolling window in real time, and operators stake native BOT against their own SLA. Fall below your own threshold and **anyone** can slash your stake, permissionlessly, and earn a bounty for catching it.

This only works because BOT Chain has sub-second finality and near-zero fees. A heartbeat every few seconds is a real transaction; on most chains that's unaffordable, here it's the whole product.

- **Live dashboard:** https://zoetra.vercel.app/live
- **Contract (BOT Chain testnet, chain 968):** [`0x32550FbbB458380e2A198E97dABcc70fEe95b8E6`](https://scan.bohr.life/address/0x32550FbbB458380e2A198E97dABcc70fEe95b8E6)

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

## Prizes this targets

Track Award (DePIN / Real World) + Best Content (X thread with the kill-a-device demo) + PR/Bug/Optimization bounty (filed separately: BOT Chain's developer docs aren't linked from the marketing site or the faucet page, only discoverable via the challenge's Notion doc).

## License

MIT
