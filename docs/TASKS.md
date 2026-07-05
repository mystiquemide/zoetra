# Zoetra  -  Task Breakdown

Ordered. Sizes: S ≤ 1h, M ≤ 3h, L ≤ 5h. Budget ~14h. Deadline Jul 8 2026 23:59 UTC+8 (4:59 PM WAT).

## Phase A  -  Foundation
- [ ] A1 (S) Strip boilerplate: remove prisma/, src/lib/db.ts, src/lib/auth.ts, src/middleware.ts, src/app/api/auth/, demo-data.ts; drop prisma, @prisma/client, next-auth, openai, @anthropic-ai/sdk, @auth/prisma-adapter from package.json; rename package to "zoetra". Deps: none
- [ ] A2 (S) Hardhat workspace at contracts/ (hardhat, toolbox, dotenv). Networks: bohr (968, https://rpc.bohr.life), botchain (677, https://rpc.botchain.ai). Deps: none
- [ ] A3 (S) Chain configs src/lib/chains.ts (defineChain 677 + 968, ws for 677), env-driven active chain. Deps: A1

## Phase B  -  Contract (the product)
- [ ] B1 (M) ZoetraRegistry.sol per ARCHITECTURE.md: register/heartbeat/scoreOf/slash/deregister/withdraw, two-bucket sliding window, enumeration views. Deps: A2
- [ ] B2 (M) Hardhat tests: score math (full uptime, decay, recovery, long-dead), slash gating + bounty + burn, withdraw cooldown, access control, reentrancy on withdraw/slash. Deps: B1
- [ ] B3 (S) Deploy script + testnet 968 deploy + Blockscout verification + address into .env/README. Deps: B2, faucet gas

## Phase C  -  Daemon
- [ ] C1 (M) daemon/heartbeat.mjs: viem wallet client, fixed-interval sends, sequential nonce, backoff retry, latency log, clean SIGINT. Deps: B3
- [ ] C2 (S) Provision 3 device wallets, faucet-fund, register all 3 on-chain, run daemon on PC + cloud VM + third process. Deps: C1

## Phase D  -  Dashboard
- [ ] D1 (L) /live page: device grid (pulse on Beat event, score, stake, SLA), event feed with scan.bohr.life/scan.botchain.ai links, stats strip, network badge. Poll scoreOf every 2s; watchContractEvent poll 1s. Deps: A3, B3
- [ ] D2 (M) Register modal (wallet connect, chain 968 switch, register tx) + Slash button (enabled only when score < threshold, fires slash(), toast with tx link). Deps: D1
- [ ] D3 (S) Landing page: hero, one-line pitch, three-step how-it-works, live stat pull, CTA to /live. Rules: Lucide, no gradients, no emoji. Deps: D1

## Phase E  -  Hardening & Deploy
- [ ] E1 (M) QA on testnet: 3 daemons 30+ min, kill test (decay < 15s visible), slash from UI, restart recovery, wrong-network and disconnected wallet states. Deps: C2, D2
- [ ] E2 (S) Vercel deploy + env vars + smoke test. Deps: E1
- [ ] E3 (S) Optional mainnet 677 deploy of same contract if faucet yields mainnet gas; README documents both. Deps: E1

## Phase F  -  Submission (Jul 8 morning)
- [ ] F1 (M) Demo video: 3 alive → kill VM → bleed → slash on-chain → recovery. Script in DESIGN.md §Demo. Deps: E2
- [ ] F2 (S) X post tagging @BOTChain_ai (mandatory), thread version for Best Content. Deps: F1
- [ ] F3 (S) Submission form: repo, live URL, contract addr, tx hashes, write-up, next steps. Deps: F2
- [ ] F4 (S) Bounty reports: docs discoverability (no docs link on botchain.ai, docs only reachable via Notion), faucet page missing network info, anything found during build. Deps: none

Critical path: A2 → B1 → B2 → B3 → C1 → C2 → E1 → F1 → F3.
