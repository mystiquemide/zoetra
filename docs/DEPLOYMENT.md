# Deployment

Zoetra production runs on BOT Chain mainnet and Vercel.

## Production values

| Item | Value |
|---|---|
| Product URL | `https://zoetra.xyz/live` |
| Verification URL | `https://zoetra.xyz/proof` |
| Network | BOT Chain mainnet |
| Chain ID | `677` |
| RPC | `https://rpc.botchain.ai` |
| Explorer | `https://scan.botchain.ai` |
| Registry | `0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac` |

## Frontend environment

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_REGISTRY_ADDRESS` | no | Overrides the built-in mainnet registry address. |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | no | Reown/WalletConnect project id for mobile wallets and BO Wallet. |

The frontend defaults to BOT Chain mainnet. No chain selector is needed for production.

## Vercel deployment

```bash
vercel link
vercel env add NEXT_PUBLIC_REGISTRY_ADDRESS production
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID production
vercel deploy --prod
```

Current production registry:

```text
0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac
```

## Contract deployment

```bash
cd contracts
npm install
npm test
npx hardhat run scripts/deploy.js --network botchain
npx hardhat verify --network botchain 0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac
```

Do not commit private keys. Use a local env file outside Git for deployer/operator keys.

## Device registration

```bash
cd contracts
DEVICE_NAME=zoetra-mainnet-sentinel \
DEVICE_INTERVAL_SEC=300 \
DEVICE_SLA_BPS=9000 \
DEVICE_STAKE_BOT=0.05 \
npx hardhat run scripts/register-mainnet-device.js --network botchain
```

## Heartbeat process

```bash
cd daemon
npm install
cp .env.example .env
# fill PRIVATE_KEY and DEVICE_ID
npm start
```

## Post-deploy checks

- `/live` returns HTTP 200.
- Verification panel shows BOT Chain, detected bytecode, and the mainnet contract.
- At least one active device renders from chain state.
- BOTScan opens the contract and source verification page.
- GitHub CI and CodeQL pass on the deployed commit.
