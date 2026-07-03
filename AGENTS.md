# AGENTS.md — Zoetra

Rules for any AI agent or human working in this repo. Read docs/ARCHITECTURE.md before writing code; it is the contract.

## Stack
- Solidity ^0.8.28 + Hardhat in `contracts/` (tests are mandatory before deploy)
- Next.js 16 App Router, TypeScript strict, Tailwind v4, wagmi v2 + viem + RainbowKit
- Plain Node daemon in `daemon/` (no build step, .mjs)
- No database, no API routes, no auth. The chain is the only backend. Do not add Prisma, NextAuth, or server state back.

## Chain facts (verified Jul 3 2026, do not guess new ones)
- Testnet (primary): 968, https://rpc.bohr.life, explorer https://scan.bohr.life
- Mainnet (optional): 677, https://rpc.botchain.ai, wss://ws-rpc.botchain.ai, https://scan.botchain.ai
- Faucet: https://faucet.botchain.ai/basic · Docs: https://dev-docs.botchain.ai/docs/Developers/quick-guide/

## Hard design rules (Mide's system, non-negotiable)
- No emoji anywhere in UI, code comments, or docs. Icons are lucide-react only
- No gradients, no serif, no italic. Dark theme only, tokens in docs/DESIGN.md
- Mono font for all numbers, hashes, addresses. Real footer links only

## Conventions
- Components: kebab-case files, one component per file, colocated under `src/components/live/`
- Hooks own all chain reads; components never call viem directly
- Every tx surface handles: disconnected, wrong network, pending, failed (with revert reason), confirmed (with explorer link)
- Explorer URLs always derive from the active chain config, never hardcoded
- Env names exactly as listed in docs/ARCHITECTURE.md §Env; never commit values; never expose private keys client-side

## Quality gates
- `npx hardhat test` green before any deploy; `npm run build` green before any commit that touches src/
- No TODO comments in committed code; cut scope instead
- Contract changes require rerunning the full test file, not a subset

## Honesty rules (hackathon-critical)
- Never fabricate chain data, tx hashes, or screenshots. If something fails, say so and fix or cut
- Sample/fixture data is forbidden in the live dashboard; it reads chain 968 or shows an honest empty state
- The judges must be able to reproduce every number from scan.bohr.life alone

## Memory
- Update memory.md after every working session: ACTIVE WORK checkboxes, SESSION LOG entry, decisions
