# Deployment

Zoetra's dashboard is a standard Next.js app with no database — deployment only needs the environment variables below, nothing else to provision.

## Prerequisites

- Node.js 20+
- A deployed `ZoetraRegistry` contract (see `contracts/README` or the Quick Start in the root `README.md`)
- A [Reown Cloud](https://cloud.reown.com) project id if you want WalletConnect/mobile wallet support

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CHAIN` | no | `testnet` (default) or `mainnet` |
| `NEXT_PUBLIC_REGISTRY_ADDRESS` | no | Overrides the built-in registry address |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | no | Reown/WalletConnect Cloud project id |

None of these are secret — the contract address and chain selector are public by nature, and the WalletConnect project id is a public client identifier, not a credential.

## Local production build

```bash
npm install
cp .env.example .env
npm run build
npm start
```

Verify the build serves correctly at `http://localhost:3010` before deploying.

## Vercel deployment

1. Import the repository at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected, no custom build config needed.
2. Add the environment variables above under Project Settings → Environment Variables.
3. Deploy. Vercel builds and serves the app with zero additional configuration.

```bash
vercel link
vercel env pull   # if you want to sync env vars locally
vercel deploy
vercel deploy --prod
```

## Post-deploy verification

- Load `/live` and confirm the verification panel shows a real contract address, detected bytecode, and a live block number
- Confirm at least one registered device renders with a live score
- Open `/tx/[hash]` for any recent transaction hash and confirm it decodes correctly
- Connect a wallet (injected and WalletConnect) and confirm both flows complete

## Troubleshooting

- **Dashboard loads but shows no on-chain data:** check `NEXT_PUBLIC_CHAIN` matches the network your registry is actually deployed to.
- **Empty dashboard when developing via `127.0.0.1`:** Next.js blocks client-side dev requests from origins not listed in `allowedDevOrigins` (see `next.config.ts`). Use `localhost` instead, or add your origin.
- **WalletConnect QR doesn't render:** confirm `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` is set to a real project id from cloud.reown.com, not left blank.
