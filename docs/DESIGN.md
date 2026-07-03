# Zoetra — Design Spec

## Brand rules (hard, from Mide's design system)
No emoji anywhere (Lucide icons only). No gradients. No serif or italic type. Real footer links only. Diagrams built in code, never images.

## Feel
Mission-control, clinical, alive. A monitoring room, not a marketing site. Dark only. The interface should feel like it's breathing while devices are healthy and feel wrong when one dies, color does that work.

## Tokens (Tailwind v4 @theme)

| Token | Value | Use |
|---|---|---|
| bg | #0A0B0D | page |
| surface | #12141A | cards, feed |
| surface-2 | #1A1D26 | hover, modal |
| border | #232733 | 1px lines |
| text | #E8EBF1 | primary |
| text-dim | #8B93A7 | labels, meta |
| alive | #2DD4A7 | healthy score, pulse ring |
| bleed | #F4574D | decaying score, slash |
| warn | #E8B44C | score between SLA and 97% |
| accent | #5B8CFF | links, tx hashes, CTAs |

Type: Geist Sans (already in boilerplate) for everything, JetBrains Mono or Geist Mono for addresses, hashes, scores, intervals. Numbers always mono, tabular.

## Signature element: the pulse

Each DeviceCard has a status dot with a CSS ping ring that fires once per confirmed Beat event (animation triggered by event timestamp change, 600ms scale 1→1.8 + fade, color `alive`). When a device misses ~2 expected beats the dot stops ringing and holds solid `warn`; below SLA it switches to `bleed` with a slow 1.2s opacity throb. The kill scene is readable from the dot alone before you even see the number.

## Components

DeviceCard: name + mono device id · big mono score (e.g. `99.4%`) colored by state · sparkline of last ~40 score samples (client-side buffer, 1px stroke, no fill, no gradient) · stake in BOT · SLA target · interval chip · `HeartPulse` Lucide icon · Slash button (visible always, enabled only when score < SLA, `bleed` outline style, opens confirm with bounty preview).

EventFeed: reverse-chron rows: Lucide icon (`Activity` beat, `Scissors` slash, `Plus` register), device name, mono short-hash linking to explorer, relative time. Max 50 rows, new rows slide in 150ms.

StatsStrip: four tiles: Total heartbeats (live count-up), Active devices, Slashes executed, Chain badge (`bohr testnet 968` + block height ticking). Mono numbers.

RegisterModal: name, interval slider 5–300s, SLA slider 50–99.9%, stake input (min 0.05 BOT), single tx submit, states: disconnected → connect, wrong network → switch to 968, pending → spinner + hash, confirmed → card appears.

Landing (/): eyebrow: "The first permissionless SLA layer for DePIN." hero: "Uptime you can slash." sub: open to any device from any network, no backend, only possible on BOT Chain (one sentence). Two CTAs (Live dashboard, GitHub). Three-step row (Register & stake → Heartbeat on-chain → Breach gets slashed) using Lucide `FileSignature`, `HeartPulse`, `Scissors`. Live proof strip pulling real StatsStrip numbers. Footer: GitHub repo, scan.bohr.life contract link, BOT Chain docs, @BOTChain_ai. All links real.

## Wallet/edge states
Read-only visitors get the full live dashboard (no wall). Wrong network: inline banner with switch button, never a blocking modal. Tx failure: toast with revert reason + explorer link. RPC down: banner "RPC unreachable, retrying", cards hold last state with `warn` styling.

## Demo script (90s, record Jul 8 morning)

| t | Shot | Line |
|---|---|---|
| 0:00 | /live, 3 cards pulsing green | "Three real machines, every pulse is a transaction on BOT Chain" |
| 0:12 | Click a beat hash → scan.bohr.life | "Don't trust my dashboard, here's the explorer" |
| 0:25 | SSH to VM, kill daemon | "Now I kill the cloud node" |
| 0:33 | Card: dot stops, score bleeding red | "No heartbeat, the score is decaying on-chain, in seconds" |
| 0:50 | Score crosses SLA, Slash enables, click it | "It breached its SLA, so anyone, including you, can slash its stake. I just earned a bounty for catching it" |
| 1:05 | Slashed event + burn tx on explorer | "Stake burned, on-chain, verifiable" |
| 1:15 | Restart daemon, dot resumes, score climbs | "Honesty is recoverable. Fiction isn't. That's Zoetra: the first permissionless SLA layer for DePIN, uptime you can slash" |
