# memory.md

## PROJECT OVERVIEW
- Zoetra: on-chain heartbeat SLA registry for DePIN devices on BOT Chain testnet (968). Devices prove liveness via heartbeat txs, contract scores uptime over a rolling window computed live from `block.timestamp`, operators stake BOT against an SLA, breached devices get permissionlessly slashed for a caller bounty. Hackathon entry, BOT Chain Builder Challenge #1, DePIN track, submit by Jul 8 2026 23:59 UTC+8.
- Current status: **feature-complete and launch-polished**. Contract live on testnet at 60s heartbeat interval (devices 4/5/6, the original 1/2/3 cleanly deregistered), heartbeat daemons running persistently on Railway (not tied to any dev session), dashboard live on Vercel at the custom domain zoetra.xyz, full Claude Design import across all 8 screens, repo public with README/CI/CodeQL/CONTRIBUTING/SECURITY/CHANGELOG/v0.1.0 tag, CI+CodeQL both green as of commit `0d2ecd2`. Remaining work is submission packaging only (demo video, X post, submission form, bounty reports).
- Primary language and framework: Solidity 0.8.28 + TypeScript (Next.js 16, wagmi v2/viem, Tailwind v4)
- Key goals right now: demo video → X post @BOTChain_ai → submission form → bounty reports. No more code work planned before submission unless something breaks.

## PROJECT STRUCTURE
- src/app/ - Next.js App Router: landing (`/`), live dashboard (`/live`), `/demo`, `/docs`, `/terms`, `/privacy`, `/address/[addr]`, `/tx/[hash]` (in-app block explorer), `/api/alert` (stateless webhook relay, the one deliberate backend exception)
- src/components/ - ui/ (button, card, modal, toast, skeleton, copy-button), web3/ (wallet-connect-button.tsx - custom RainbowKit ConnectButton.Custom wrapper, provider), landing/ (hero, footer, statement, how-it-works, live-proof-cta, verify-strip, reveal), live/ (device-card, event-feed, stats-strip, register-modal, verification-panel, alerts-settings, onboarding-tour.tsx), layout/ (nav, footer, main-offset)
- src/hooks/ - use-devices.ts (getDevices poll), use-live-feed.ts (Beat/Slashed/Registered event watch), use-verification.ts, use-webhook-url.ts, use-breach-alerts.ts, use-clock-tick.ts
- src/lib/ - chains.ts (BOT Chain testnet/mainnet), registry.ts (ABI + address), web3.ts (wagmi config), utils.ts, blockscout.ts (explorer REST API), decode.ts (viem event/call decoding), score-math.ts (TS mirror of the contract's scoreOf), friendly-error.ts (viem BaseError → user-safe message)
- contracts/ - Hardhat workspace: ZoetraRegistry.sol, 23 tests, deploy/setup/topup/slash scripts, `scripts/migrate-interval.js` + `topup-new-devices.js` (the 5s→60s device migration), deployments/ (public addresses + tx hashes, no keys)
- daemon/ - heartbeat.mjs (one process per device, Node + viem), wait-and-start.mjs (polls a wallet balance, auto-launches heartbeat.mjs once funded), now deployed on Railway (project `zoetra-daemons`, 3 services, GitHub auto-deploy, root directory `/daemon`)
- docs/ - PRD.md, ARCHITECTURE.md, DESIGN.md, ANALYTICS.md, TASKS.md, DEPLOYMENT.md (new)
- public/design/ - real image assets from the Claude Design import (hero-network.jpg, chain-bg.jpg, device-hardware.jpg, botchain-logo.jpg, zoetra-logo.png, zoetra-mascot.png)
- .github/ - workflows/ci.yml, workflows/codeql.yml, dependabot.yml, ISSUE_TEMPLATE/, pull_request_template.md
- .secrets/ - gitignored, root-anchored; holds all wallet private keys (deployer.env, new-deployer.env, device-a/b/c.env, daemon-a/b/c.env), never committed

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
- NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID - real registered Reown Cloud project (`59c1f24b65c637cdc0c8f94240b74bd6`), not a placeholder; powers BO Wallet + mobile QR pairing
- NEXT_PUBLIC_CHAIN (testnet|mainnet)
- NEXT_PUBLIC_REGISTRY_ADDRESS
- DEPLOYER_PRIVATE_KEY (contracts only, lives in .secrets/deployer.env or .secrets/new-deployer.env, never committed)
- RPC_URL / PRIVATE_KEY / DEVICE_ID / INTERVAL_MS / REGISTRY_ADDRESS / CHAIN_ID (daemon, per device, lives in .secrets/daemon-*.env locally AND set directly as Railway service variables for the persistent deployment - never uploaded as a file, piped via `railway variable set --stdin`)

## ACTIVE WORK & IN-PROGRESS
- [ ] Record demo video (kill scene already proven live twice during dev, needs a clean recorded take)
- [ ] X post tagging @BOTChain_ai, submission form, 2-3 bounty reports (docs discoverability, faucet page missing network info)
- [x] ~~Decision pending from Mide: make GitHub repo public~~ - done, repo is public (Mide flipped this independently at some point, not something Claude did)
- [x] ~~Post-audit polish~~ - done: verification panel, proof trail, breach countdown, register presets, /demo page, full 8-screen Claude Design import, accessibility pass, all shipped

## COMPLETED FEATURES
- Strategy, idea selection, name validation (Zoetra, clean)
- Full PRD/architecture/design docs (docs/)
- ZoetraRegistry.sol written and deployed to testnet 968 at `0x32550FbbB458380e2A198E97dABcc70fEe95b8E6`, 23 Hardhat tests passing
- 3 real device wallets registered on-chain (ids 4/5/6 as of the interval migration; original 1/2/3 cleanly deregistered), heartbeat daemons running persistently on Railway at 60s interval
- Live dashboard built (device grid, event feed, stats strip, register/slash UI, verification panel, breach alerts, onboarding tour) and deployed to Vercel at the custom domain zoetra.xyz
- Full 8-screen Claude Design import: Landing, Live, Demo, Address, Tx, Docs, Terms, Privacy - all rebuilt as real Next.js pages against the literal `.dc.html` source files, zero fake data, real image assets matched and placed in public/design/
- In-app block explorer (`/address/[addr]`, `/tx/[hash]`) with custom 404 pages, so on-chain claims are checkable without leaving the app
- Ran two real kill tests: stopped a daemon, watched score decay live on testnet, executed a real on-chain slash, dashboard updated live with no refresh
- GitHub launch polish: README rewrite with Mermaid diagrams, CONTRIBUTING/SECURITY/CHANGELOG/DEPLOYMENT docs, CI/CodeQL/Dependabot workflows, issue/PR templates, tagged v0.1.0
- Accessibility pass: skip link, aria-labels, dialog semantics, header landmarks, tap targets, cursor pointer
- Repo is public (Mide's own call, done independently)
- Railway deployment: 3 daemon services with GitHub auto-deploy, so uptime no longer depends on any local session being open
- Independent audit run (Jul 3): 82/100, no product-breaking findings. Multiple follow-up pasted audits through Jul 4-5 - most novel findings were real and fixed, but several were stale (checking an older deploy) or false positives (e.g. flagging a correct `alt=""` on a decorative icon, or a tour that's correctly gated by localStorage) - always re-verify a pasted audit against the live site before trusting it.

## KNOWN BUGS / TECH DEBT
- `npm audit` reports vulnerabilities in the RainbowKit/Hardhat dependency trees, all require `--force` to fix and risk breaking wallet connect; deliberately left as-is, documented in README
- No mobile hamburger menu - intentional, documented in a code comment in `nav.tsx`; the 3-4 item nav wraps cleanly via flexbox at any width, revisit only if a 5th item is ever added
- A heartbeat only proves a *wallet* is active, not the *physical device* - documented as the honest hard problem in the README roadmap, not something fixable without hardware attestation

## KEY DEPENDENCIES
| Package | Version | Why |
|---|---|---|
| next | 16.2.9 | app framework |
| wagmi/viem | 2.x | chain 968/677 config, event watching, tx writes |
| @rainbow-me/rainbowkit | 2.2.x | wallet connect for register/slash UI |
| lucide-react | 1.21 | icons (design rule: no emoji) |
| hardhat | 2.22.x | contract compile/test/deploy |
| qr (via cuer, overridden) | 0.5.5 | pinned below the installed default (0.6.0) - cuer's QR renderer hardcodes `border: 0`, which 0.6.0's stricter validation rejects, crashing the WalletConnect QR modal |
| zod (overridden) | 3.25.76 | pinned globally - WalletConnect/Reown's chain needs v3, eslint-config-next's react-hooks plugin wants v4; picked v3 since that side is runtime-critical and the v4 consumer is lint-only |

## IMPORTANT DECISIONS MADE
- Chain is the database: no Prisma, no backend API routes; UI reads chain directly (integration score + zero infra)
- Per-device heartbeat interval stored on-chain - originally 5s for demo drama, migrated to 60s (fresh device ids 4/5/6) once the 5s cadence was burning faucet claims too fast for sustained real-world running
- Rolling-window score, not lifetime average (visible decay in seconds, visible recovery)
- Permissionless slash with caller bounty (turns judges into participants during demo)
- Testnet (968) primary over mainnet (677): free faucet gas, rules explicitly accept testnet
- Root ESLint ignores contracts/** and daemon/** - separate workspaces with their own CommonJS/Node conventions, not meant to be judged by Next.js's TypeScript lint rules
- Sitewide accent color is green (`z-alive #2DD4A7`), not blue - matches the literal Claude Design `.dc.html` source, which uses green for every heading/link/button on every screen; corrected after initially assuming blue was intentional
- Heartbeat daemons run on Railway, not locally or on Vercel - Vercel is serverless and can't run a long-lived process; Railway gives each device its own always-on container, connected to GitHub for auto-deploy, root directory pinned to `/daemon` (has to be set via the Railway dashboard, no CLI flag exists for it on a GitHub-connected service)

## SESSION LOG
### Session 1 - Jul 3 2026
- Parsed challenge (tweet → forms → Notion rulebook), live-verified chain RPC/explorer/faucet
- Generated 5 fresh ideas, user picked heartbeat SLA registry; name Zoetra validated
- Cloned boilerplate-web3 → zoetra, wrote PRD/architecture/design docs (approved)
- Built and deployed full stack: contract (testnet 968), daemon, dashboard; ran a real live kill+slash test; deployed to Vercel production
- Independent third-party audit came back 82/100; fixed lint (contracts/daemon excluded from root ESLint, typed getDevices tuple, moved sparkline state update out of an effect), added LICENSE and CI workflow

### Session 2 - Jul 4-5 2026
- Imported a full Claude Design project (8 `.dc.html` screens) and rebuilt Landing/Live/Demo/Address/Tx/Docs/Terms/Privacy against the literal mockup files, per explicit instruction to ignore the separate design-spec doc
- Corrected the sitewide accent from blue to green mid-stream after verifying the actual design source, not assuming
- Found and fixed a real WalletConnect-crashing bug (`invalid border=0`, a `cuer`/`qr` package version conflict) via an npm override
- Ran the `/github-launch-polish` skill: README rewrite, CONTRIBUTING/SECURITY/CHANGELOG/DEPLOYMENT docs, CI/CodeQL/Dependabot, issue/PR templates, tagged v0.1.0; repo went public (Mide's own action, discovered mid-session)
- Full accessibility pass: skip link, aria-labels, dialog semantics, header landmarks, tap targets, cursor pointer
- Migrated the 3 live devices from a 5s to a 60s heartbeat interval to stop burning faucet claims so fast; hit and resolved a real nonce-race bug caused by orphaned daemon processes from earlier in the same session that neither `ps`/`kill` could see, only PowerShell's `Get-CimInstance`/`Stop-Process` could
- Deployed the 3 heartbeat daemons to Railway (project `zoetra-daemons`) with GitHub auto-deploy, so uptime no longer depends on a local session being open
- Chased down three separate lock-file/dependency bugs before CI went green: two lock-file drift issues (daemon and root), then the real root cause underneath both - a genuine zod v3/v4 peer conflict, fixed via an override
- Worked through several rounds of pasted third-party UX audits; learned to re-verify each finding against the live site before acting, since a meaningful fraction were stale or false positives (correct `alt=""`, correctly-gated tour, a wallet-connect click that just needed a retry)
- Stopped at commit `0d2ecd2`, CI+CodeQL green, all code/infra work done; remaining is submission packaging only (video, X post, form, bounty reports)
