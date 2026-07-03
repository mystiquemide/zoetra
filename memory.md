# memory.md

## PROJECT OVERVIEW
- Zoetra: on-chain heartbeat SLA registry for DePIN devices on BOT Chain testnet (968). Devices prove liveness via heartbeat txs, contract scores uptime over a rolling window computed live from `block.timestamp`, operators stake BOT against an SLA, breached devices get permissionlessly slashed for a caller bounty. Hackathon entry, BOT Chain Builder Challenge #1, DePIN track, submit by Jul 8 2026 23:59 UTC+8.
- Current status: **built and deployed**. Contract live on testnet, 3 devices registered and beating, dashboard live on Vercel. Remaining work is submission packaging (demo video, X post, submission form, bounty reports) plus a post-audit polish pass.
- Primary language and framework: Solidity 0.8.28 + TypeScript (Next.js 16, wagmi v2/viem, Tailwind v4)
- Key goals right now: post-launch audit fixes (lint, CI, license, judge-facing polish) → demo video → submission

## PROJECT STRUCTURE
- src/app/ — Next.js App Router: landing (`/`), live dashboard (`/live`)
- src/components/ — ui/ (button, card, modal, toast, skeleton), web3/ (connect, provider), landing/, live/ (device-card, event-feed, stats-strip, register-modal)
- src/hooks/ — use-devices.ts (getDevices poll), use-live-feed.ts (Beat/Slashed/Registered event watch)
- src/lib/ — chains.ts (BOT Chain testnet/mainnet), registry.ts (ABI + address), web3.ts (wagmi config), utils.ts
- contracts/ — Hardhat workspace: ZoetraRegistry.sol, 23 tests, deploy/setup/topup/slash scripts, deployments/ (public addresses + tx hashes, no keys)
- daemon/ — heartbeat.mjs, one process per device (Node + viem)
- docs/ — PRD.md, ARCHITECTURE.md, DESIGN.md, ANALYTICS.md, TASKS.md (all done)
- .secrets/ — gitignored, root-anchored; holds all wallet private keys, never committed

## CORE MODULES & WHAT THEY DO
| File/Module | Purpose | Last Modified |
|---|---|---|
| contracts/contracts/ZoetraRegistry.sol | register/heartbeat/scoreOf/slash/deregister/withdraw/getDevices | Jul 3 2026 |
| src/lib/registry.ts | Contract address, hand-written ABI, DeviceView/RawDeviceTuple types | Jul 3 2026 |
| src/lib/chains.ts | BOT Chain testnet (968) + mainnet (677) chain defs, explorer URL helpers | Jul 3 2026 |
| src/hooks/use-devices.ts | Polls getDevices() every 2s, decodes into DeviceView[] | Jul 3 2026 |
| src/hooks/use-live-feed.ts | Watches Beat/Slashed/Registered events, cumulative counts | Jul 3 2026 |
| daemon/heartbeat.mjs | Per-device heartbeat sender, fixed schedule, clean SIGINT | Jul 3 2026 |

## DATABASE / DATA MODELS
- None. All state on-chain in ZoetraRegistry. Dashboard reads events + view functions directly over RPC; no backend API routes, no database.

## APIs & INTEGRATIONS
| Service | Purpose | Auth Method |
|---|---|---|
| BOT Chain testnet RPC https://rpc.bohr.life | reads, txs, event watching (primary) | none |
| BOT Chain mainnet RPC https://rpc.botchain.ai | optional mainnet deploy target | none |
| Blockscout https://scan.bohr.life/api/v2 | historical beats, tx deep links | none |
| Faucet https://faucet.botchain.ai/basic | gas for device wallets (manual claim, one-time) | none |
| Vercel | production hosting | vercel CLI login |

## ENVIRONMENT VARIABLES
- NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID (placeholder ships in code; injected wallets work without it)
- NEXT_PUBLIC_CHAIN (testnet|mainnet)
- NEXT_PUBLIC_REGISTRY_ADDRESS
- DEPLOYER_PRIVATE_KEY (contracts only, lives in .secrets/deployer.env, never committed)
- RPC_URL / PRIVATE_KEY / DEVICE_ID / INTERVAL_MS / REGISTRY_ADDRESS / CHAIN_ID (daemon, per device, lives in .secrets/daemon-*.env)

## ACTIVE WORK & IN-PROGRESS
- [ ] Post-audit polish: on-chain verification panel, per-device proof trail, breach countdown, register presets, /demo walkthrough page
- [ ] Record demo video (kill scene already proven live once during dev, needs a clean recorded take)
- [ ] X post tagging @BOTChain_ai, submission form, 2-3 bounty reports
- [ ] Decision pending from Mide: make GitHub repo public for judges (currently private)

## COMPLETED FEATURES
- Strategy, idea selection, name validation (Zoetra, clean)
- Full PRD/architecture/design docs (docs/)
- ZoetraRegistry.sol written and deployed to testnet 968 at `0x32550FbbB458380e2A198E97dABcc70fEe95b8E6`, 23 Hardhat tests passing
- 3 real device wallets registered on-chain (ids 1/2/3), heartbeat daemons running
- Live dashboard built (device grid, event feed, stats strip, register/slash UI) and deployed to Vercel: https://zoetra.vercel.app/live
- Ran a real kill test: stopped a daemon, watched score decay 100%→42% in ~35s on live testnet, executed a real on-chain slash, dashboard updated live with no refresh
- Independent audit run (Jul 3): 82/100, no product-breaking findings, all issues were packaging (lint, license, CI, private repo, no visible failure moment on the live page). Lint fixed, LICENSE added, CI added same session.

## KNOWN BUGS / TECH DEBT
- `npm audit` reports 24 (root) / 43 (contracts) vulnerabilities, all require `--force` to fix and risk breaking the WalletConnect/RainbowKit dependency tree right before submission; deliberately left as-is, documented in README
- GitHub repo is still private; judges may not be able to view code until Mide decides to flip visibility

## KEY DEPENDENCIES
| Package | Version | Why |
|---|---|---|
| next | 16.2.9 | app framework |
| wagmi/viem | 2.x | chain 968/677 config, event watching, tx writes |
| @rainbow-me/rainbowkit | 2.2.x | wallet connect for register/slash UI |
| lucide-react | 1.21 | icons (design rule: no emoji) |
| hardhat | 2.22.x | contract compile/test/deploy |

## IMPORTANT DECISIONS MADE
- Chain is the database: no Prisma, no backend API routes; UI reads chain directly (integration score + zero infra)
- Per-device heartbeat interval stored on-chain (5s demo drama, 30s steady-state gas economy)
- Rolling-window score, not lifetime average (visible decay in seconds, visible recovery)
- Permissionless slash with caller bounty (turns judges into participants during demo)
- Testnet (968) primary over mainnet (677): free faucet gas, rules explicitly accept testnet
- Root ESLint ignores contracts/** and daemon/** — separate workspaces with their own CommonJS/Node conventions, not meant to be judged by Next.js's TypeScript lint rules

## SESSION LOG
### Session 1 — Jul 3 2026
- Parsed challenge (tweet → forms → Notion rulebook), live-verified chain RPC/explorer/faucet
- Generated 5 fresh ideas, user picked heartbeat SLA registry; name Zoetra validated
- Cloned boilerplate-web3 → zoetra, wrote PRD/architecture/design docs (approved)
- Built and deployed full stack: contract (testnet 968), daemon, dashboard; ran a real live kill+slash test; deployed to Vercel production
- Independent third-party audit came back 82/100; fixed lint (contracts/daemon excluded from root ESLint, typed getDevices tuple, moved sparkline state update out of an effect), added LICENSE and CI workflow
