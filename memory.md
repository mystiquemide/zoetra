# Zoetra Project Memory

## Current public state

Zoetra is a BOT Chain mainnet product for slashable DePIN uptime proofs.

- Product URL: https://zoetra.xyz/live
- Verification walkthrough: https://zoetra.xyz/proof
- Mainnet contract: `0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac`
- Explorer: https://scan.botchain.ai/address/0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac
- Network: BOT Chain mainnet, chain `677`
- Production device: `zoetra-mainnet-sentinel`, device `#2`

## Product model

Devices register on-chain, stake native BOT, and declare a heartbeat interval plus SLA. The operator key must send heartbeat transactions. `scoreOf(id)` computes uptime from BOT Chain timestamps and heartbeat history. If score falls below the device SLA, any funded wallet can call `slash(id)` and earn a bounty.

## Integrations

- BOT Chain mainnet for contract state, staking, scoring, heartbeats, and slashing.
- BOTScan for contract, source, and transaction verification.
- BOT Chain bridge for bringing funds onto BOT Chain.
- BOT Chain DEX for swapping into BOT.
- BO Wallet support through WalletConnect.
- wagmi, viem, and RainbowKit for web3 frontend behavior.
- Hardhat for deployment, tests, and verification.
- Vercel for production hosting.
- GitHub Actions and CodeQL for repo quality gates.

## Main files

- `src/app/live/page.tsx` - production mainnet dashboard.
- `src/app/proof/page.tsx` - verification walkthrough.
- `src/app/docs/page.tsx` - product documentation.
- `src/lib/chains.ts` - BOT Chain mainnet config.
- `src/lib/registry.ts` - mainnet registry address and ABI.
- `daemon/heartbeat.mjs` - operator heartbeat client.
- `contracts/contracts/ZoetraRegistry.sol` - source of truth contract.
- `contracts/deployments/botchain.json` - mainnet deployment metadata.
- `contracts/deployments/devices.botchain.json` - current production device metadata.

## Public copy rule

Public docs and app copy should read like a real product, not a temporary environment. Use BOT Chain mainnet, BOTScan, bridge, and DEX language. Avoid temporary-token language.