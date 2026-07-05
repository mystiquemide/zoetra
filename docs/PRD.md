# Zoetra  -  Product Requirements Document

Entry for BOT Chain Builder Challenge #1 · DePIN / Real World track · Submit by Jul 8 2026, 23:59 UTC+8

## Research Summary

DePIN networks (compute, hotspot, sensor) pay devices for staying online, but uptime is self-reported through operator-controlled dashboards. There is no cryptographic proof a device was actually alive at a given moment. Existing approaches (Helium PoC, io.net monitoring) are network-specific and closed. No general-purpose, chain-verified liveness registry exists on any EVM chain, and the economics explain why: proving liveness requires one transaction per device per interval, which is cost-prohibitive on Ethereum (~$288/day/device at 3s intervals at $0.01/tx) and unavailable to Solidity teams on Solana.

BOT Chain (chain ID 677) removes both blockers: 0.75s blocks, ~0.9s finality, near-zero fees, full EVM. Live-verified Jul 3: RPC https://rpc.botchain.ai answers, Blockscout at https://scan.botchain.ai (10.4M txs), faucet at https://faucet.botchain.ai/basic. Judging weights integration 35% / completeness 25% / innovation 20% / presentation 20%, with RPC-swap migrations explicitly downweighted. A heartbeat protocol makes the chain itself the product's engine, the strongest possible integration story. Competitive field (Telegram-recruited, first edition) predicts token deploys and ports clustered in the EVM Deployment track; DePIN track is expected to be thin.

## Overview

Zoetra is a permissionless, on-chain heartbeat SLA registry for DePIN devices. Most existing DePIN networks build their own closed uptime system, tied to their own hardware; Zoetra is open to any device, from any network, that chooses to run its heartbeat client. Devices prove liveness by sending heartbeat transactions to a registry contract at their declared interval. The contract scores uptime over a rolling window, computed live from `block.timestamp` with no backend, no cron job, no indexer. Operators stake BOT against an SLA threshold; when a device's score breaches the threshold, anyone (not an admin) can call slash() and earn a bounty for catching it. Uptime stops being a marketing claim and becomes slashable, verifiable state. None of this is affordable without BOT Chain: sub-second finality and near-zero fees are what make a heartbeat every few seconds a real transaction instead of a toy.

One line: uptime you can slash.

Note on positioning: research (Jul 3-4) found adjacent claims in this space, notably Parasail's "first trust layer for DePIN" service-guarantee positioning, so Zoetra does not claim to be "the first permissionless SLA layer for DePIN" as an unqualified absolute. The defensible claim: to our research, no direct public equivalent exists to this exact model, device heartbeat transactions, on-chain SLA scores decaying live from block.timestamp, stake-backed uptime, and permissionless slashing, on an EVM chain. If a narrower "first" claim is wanted, scope it to "the first BOT Chain-native heartbeat SLA registry for DePIN devices."

## User Roles

1. Device operator  -  registers a device, runs the heartbeat daemon, stakes BOT on an SLA target, withdraws stake on clean exit.
2. Verifier (anyone)  -  watches scores, verifies beats on Blockscout, calls slash() on breached devices, earns a slash bounty.
3. Observer  -  reads the live dashboard, cross-checks any beat or slash against the explorer without trusting Zoetra's UI.

## Core Features

F1. ZoetraRegistry contract (Solidity, BOT Chain)
- register(name, interval, slaThresholdBps) payable  -  stake attached, interval bounded (5s–300s)
- heartbeat(deviceId)  -  only device wallet, records beat, updates rolling window
- scoreOf(deviceId) view  -  uptime in basis points over last WINDOW expected beats
- slash(deviceId)  -  permissionless; valid only when score < threshold; burns slashPortion of stake, pays caller a bounty, emits Slashed
- deregister + withdrawStake  -  operator exit with cooldown
- Events for every state change: Registered, Beat, Slashed, Deregistered

F2. Heartbeat daemon (Node + viem)
- One process per device, own funded key, fires heartbeat at the device's interval
- Nonce-safe sequential sends, retry with backoff, clean SIGINT (demo kill)
- Config via env: RPC, key, deviceId, interval

F3. Live dashboard (Next.js, existing boilerplate)
- Device grid: pulse animation on each confirmed beat, live score, SLA threshold, stake
- Score sparkline per device (rolling window), decays visibly within seconds of missed beats
- Event feed: every Beat/Slashed with deep link to scan.botchain.ai tx
- Slash panel: connect wallet (RainbowKit, chain 677), call slash() on a breached device from the UI
- Network badge: BOT Chain 677, RPC health indicator
- Read path: viem watchContractEvent over RPC + Blockscout API v2 for history. No database; chain is the database.

F4. Registration flow (dashboard)
- Connect wallet, register a device with name/interval/threshold/stake in one tx

## User Stories & Acceptance Criteria

US1: As an operator, I register a device with 0.5 BOT stake, 15s interval, 90% SLA.
- AC: tx succeeds on chain 677; device appears in grid within one block; Registered event links to explorer.

US2: As an operator, my running daemon keeps my score at 100%.
- AC: with daemon running at interval i, score stays ≥ 9900 bps over any 5-minute stretch; each beat visible on Blockscout in <2s.

US3: As an observer, I watch a killed device bleed.
- AC: after daemon SIGKILL, score drops below 90% threshold within 10 missed beats; dashboard reflects each drop without page refresh.

US4: As a verifier, I slash a breached device and get paid.
- AC: slash() reverts while score ≥ threshold; succeeds below it; caller balance increases by bounty; device stake decreases; Slashed event in feed with tx link.

US5: As an operator, I withdraw remaining stake after deregistering.
- AC: withdraw before cooldown reverts; after cooldown returns exact remaining stake.

## RICE Backlog

| Item | Reach | Impact | Confidence | Effort | Score | Verdict |
|---|---|---|---|---|---|---|
| F1 contract | 10 | 10 | 9 | 3h | must | build |
| F2 daemon | 10 | 9 | 9 | 2h | must | build |
| F3 dashboard | 10 | 9 | 8 | 5h | must | build |
| F4 register UI | 8 | 6 | 8 | 2h | must | build |
| Slash-from-UI | 8 | 8 | 8 | 1h | must | build |
| Score history via Blockscout API | 6 | 5 | 7 | 2h | should | build if time |
| Multi-window analytics page | 3 | 3 | 6 | 3h | won't | cut |
| SLA insurance market | 2 | 8 | 3 | days | won't | later |

## KPIs (independently verifiable)

- 3 real devices beating live
- ≥ 1,000 real heartbeat txs on chain 677
- Kill-to-visible-decay latency < 15s
- On-chain slashes executed live, not simulated
- Every dashboard number reproducible from scan.botchain.ai alone

## Out of Scope (for now)

- Insurance/coverage market on top of SLAs (see roadmap)
- Device hardware attestation (TEE, signed sensor data)
- Database persistence, auth
- Token, governance, bridge functionality

## Launch Checklist (product-level)

- Contract address + verified source on scan.botchain.ai
- GitHub repo public, README with run-it-yourself path
- Live dashboard on Vercel
