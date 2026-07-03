# memory.md

## PROJECT OVERVIEW
- Zoetra: on-chain heartbeat SLA registry for DePIN devices on BOT Chain (677). Devices prove liveness via heartbeat txs, contract scores uptime over a rolling window, operators stake BOT against an SLA, breached devices get permissionlessly slashed. Hackathon entry, BOT Chain Builder Challenge #1, DePIN track, submit by Jul 8 2026 23:59 UTC+8.
- Current status: MVP (pre-build, PRD done)
- Primary language and framework: Solidity + TypeScript (Next.js 16, wagmi v2/viem, Tailwind v4)
- Key goals right now: PRD approval → architecture → contract → daemon → dashboard → deploy → demo video

## PROJECT STRUCTURE
- src/app/ — Next.js App Router (landing, dashboard)
- src/components/ — ui/ (button, card, modal, toast, skeleton), web3/ (connect, provider), landing/
- src/lib/ — web3.ts (chain config), utils.ts
- contracts/ — (planned) ZoetraRegistry.sol + Hardhat
- daemon/ — (planned) Node heartbeat agent
- docs/ — PRD.md (done), TASKS.md, ARCHITECTURE.md, DESIGN.md, ANALYTICS.md (pending)
- prisma/ — to be stripped (no database; chain is the database)

## CORE MODULES & WHAT THEY DO
| File/Module | Purpose | Last Modified |
|---|---|---|
| docs/PRD.md | Full product requirements | Jul 3 2026 |
| src/lib/web3.ts | Chain/wagmi config, needs BOT Chain 677 custom chain | boilerplate |
| BOILERPLATE.md | Strip/customize guide | boilerplate |

## DATABASE / DATA MODELS
- None. All state on-chain in ZoetraRegistry. Dashboard reads events via RPC + Blockscout API v2.

## APIs & INTEGRATIONS
| Service | Purpose | Auth Method |
|---|---|---|
| BOT Chain RPC https://rpc.botchain.ai | reads, txs, event watching | none |
| Blockscout https://scan.botchain.ai/api/v2 | historical beats, tx deep links | none |
| Faucet https://faucet.botchain.ai/basic | gas for device wallets | manual |

## ENVIRONMENT VARIABLES
- NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
- NEXT_PUBLIC_BOTCHAIN_RPC
- NEXT_PUBLIC_REGISTRY_ADDRESS
- DEPLOYER_PRIVATE_KEY (contracts, never client-side)
- DEVICE_PRIVATE_KEY / DEVICE_ID / HEARTBEAT_INTERVAL_MS (daemon, per device)

## ACTIVE WORK & IN-PROGRESS
- [ ] Architecture approval (waiting on Mide)
- [ ] Phase 3 build: A1 strip boilerplate → B1 contract → tests → testnet deploy → daemon → dashboard
- [ ] Open blocker: Mide to submit registration form (separate from submission form)

## COMPLETED FEATURES
- Strategy, idea selection, name validation (Zoetra, clean)
- Repo cloned from boilerplate-web3, git re-initialized
- PRD written and approved (Jul 3)
- Testnet config received from Mide and live-verified: chain 968, rpc.bohr.life (eth_chainId 0x3c8), scan.bohr.life, wallet.bohr.life; mainnet WS wss://ws-rpc.botchain.ai (101 upgrade); docs at dev-docs.botchain.ai
- Phase 2 docs written: TASKS.md, ARCHITECTURE.md, DESIGN.md, ANALYTICS.md, AGENTS.md

## KNOWN BUGS / TECH DEBT
- package.json name still says boilerplate-ai-saas, fix during DevOps pass
- Prisma/auth/AI-sdk deps present but unused, strip during DevOps pass

## KEY DEPENDENCIES
| Package | Version | Why |
|---|---|---|
| next | 16.2.9 | app framework |
| wagmi/viem | 2.x | chain 677 config, event watching, tx writes |
| @rainbow-me/rainbowkit | 2.2.x | wallet connect for register/slash UI |
| lucide-react | 1.21 | icons (design rule: no emoji) |
| hardhat (to add) | latest | contract compile/test/deploy |

## IMPORTANT DECISIONS MADE
- Chain is the database: no Prisma, no backend API routes; UI reads chain directly (integration score + zero infra)
- Per-device heartbeat interval stored on-chain (5s demo drama, 30s steady-state gas economy)
- Rolling-window score, not lifetime average (visible decay in seconds, visible recovery)
- Permissionless slash with caller bounty (turns judges into participants during demo)
- Three real devices minimum (PC + cloud VM + third instance), kill the VM on camera

## SESSION LOG
### Session 1 — Jul 3 2026
- Parsed challenge (tweet → forms → Notion rulebook), live-verified chain 677 RPC/explorer/faucet
- Generated 5 fresh ideas, user picked heartbeat SLA registry; name Zoetra validated
- Cloned boilerplate-web3 → zoetra, wrote PRD, awaiting approval
