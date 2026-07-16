# Zoetra PRD

## Product

Zoetra is a production BOT Chain mainnet heartbeat SLA registry for DePIN devices. Operators stake native BOT against a declared heartbeat interval and SLA. If a device stops sending heartbeats and its on-chain score falls below its SLA, any funded wallet can slash the device and receive a bounty.

## Problem

DePIN uptime is usually asserted by closed networks, private dashboards, or vendor-controlled monitors. A user cannot independently verify whether a device missed checks, how the score was computed, or whether penalties were applied fairly.

## Solution

Put the uptime promise on BOT Chain mainnet:

1. A device operator registers a device and stakes BOT.
2. The registered operator key sends heartbeat transactions.
3. `scoreOf(id)` computes live uptime from chain time and heartbeat history.
4. Anyone can slash once the device breaches its SLA.
5. BOTScan can verify every state transition.

## Why BOT Chain

BOT Chain is load-bearing, not decorative:

| Need | BOT Chain fit |
|---|---|
| Frequent heartbeat txs | Low fees make repeated heartbeat writes practical. |
| Fast feedback | Fast blocks make decay/recovery visible quickly. |
| Mainnet proof | Real BOT stake makes the SLA economically meaningful. |
| Public verification | BOTScan exposes contract, source, and tx proof. |
| User onboarding | Bridge + DEX provide a route to BOT for gas and stake. |

## Scope shipped

- Verified `ZoetraRegistry` contract on BOT Chain mainnet.
- Public product at `https://zoetra.xyz/live`.
- Wallet connection through injected wallets and WalletConnect.
- BO Wallet-compatible mobile QR connection path.
- Mainnet funding guidance through `bridge.botchain.ai` and `dex.botchain.ai`.
- Heartbeat daemon for registered operators.
- Optional stateless webhook relay for breach notifications.
- In-app address and transaction pages.
- CI and CodeQL on GitHub.

## Mainnet proof

| Proof | Link |
|---|---|
| Contract | https://scan.botchain.ai/address/0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac |
| Source verification | https://scan.botchain.ai/address/0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac#code |
| Deploy tx | https://scan.botchain.ai/tx/0xe2c09b1247462eb055a60250bf6915f5087c0432d96dedabb95f8fa9650b7258 |
| Production device registration | https://scan.botchain.ai/tx/0x055bd7b9aba0272cd0530fda82bb102d5d8783347c575419cca298a8eacb679a |
| Heartbeat proof | https://scan.botchain.ai/tx/0x87fdd75a61ddfce701a0028030023b9a577c20c5f67eafa9addf2028163fec21 |

## Acceptance criteria

- Product reads BOT Chain mainnet only.
- No mocked values in `/live`.
- Contract source verified on BOTScan.
- User can connect wallet, register device, and submit slash when conditions are met.
- Operator can run heartbeat client with a private key and device id.
- Docs explain how to get BOT through the bridge and DEX.
- README exposes the judge proof path in under two minutes.

## Known limitations

- Current heartbeat proof proves operator-key activity, not hardware-rooted physical-device attestation.
- Contract is tested and source-verified but not formally audited.
- Users are responsible for gas, key security, RPC access, and device uptime.
