# Zoetra — Design Spec

Reflects the app as actually built and deployed (updated Jul 4 2026). Every screen below exists in the live app at the routes listed; nothing here is aspirational.

## Brand rules (hard, from Mide's design system)

No emoji anywhere (Lucide icons only). No gradients. No serif or italic type. Real footer links only. Diagrams built in code, never images. Mascot/illustration, if used, stays in the same geometric line-art language as the mark, no cartoon proportions, no full-color illustration, no cuteness, this is a monitoring product, not a consumer app.

## Feel

Mission-control, clinical, alive. A monitoring room, not a marketing site. Dark only. The interface should feel like it's breathing while devices are healthy and feel wrong when one dies, color does that work.

## Tokens (Tailwind v4 `@theme`, see `src/app/globals.css`)

| Token | Value | Use |
|---|---|---|
| bg | #0A0B0D | page |
| surface | #12141A | cards, feed |
| surface-2 | #1A1D26 | hover, modal, inputs |
| border | #232733 | 1px lines |
| text | #E8EBF1 | primary |
| text-dim | #8B93A7 | labels, meta |
| alive | #2DD4A7 | healthy score, pulse ring |
| bleed | #F4574D | breached score, slash, throb |
| warn | #E8B44C | score between SLA and 97% ("at risk") |
| accent | #5B8CFF | links, tx hashes, CTAs, eyebrow text |

Type: Geist Sans for everything, Geist Mono for addresses, hashes, scores, intervals, and every number on the page. Numbers are always mono and tabular so digits don't jitter as they update live.

## Signature element: the pulse

Each DeviceCard has a status dot with a CSS `pulse-ring` animation that fires once per confirmed heartbeat (triggered by `device.lastBeat` changing, 600ms scale 1→1.8 + fade, colored to match current status). When a device is genuinely breached the dot switches to `bleed` and gets a slow 1.2s opacity `throb` on top of the pulse. The kill scene is readable from the dot alone before you even look at the number.

## Status system

Every device resolves to exactly one of four states, derived from on-chain data only (never from timing heuristics, see the countdown note below):

| Status | Trigger | Color | Icon |
|---|---|---|---|
| Healthy | score ≥ 9700 bps | `alive` | `CheckCircle2` |
| At risk | SLA ≤ score < 9700 bps | `warn` | `AlertTriangle` |
| Breached | score < SLA (slashable) | `bleed` | `ShieldAlert` |
| Deregistered | operator has called `deregister()` | `text-dim` | `PowerOff` |

The status label and icon are the primary signal, shown next to the device name; the raw percentage is secondary, shown large below it.

## Screens

### Landing (`/`)

- **Nav**: Zoetra wordmark + `HeartPulse` icon, link to Live dashboard, GitHub button. Fixed top, blurred background on scroll.
- **Hero**: eyebrow line "A permissionless SLA registry for DePIN" in accent color, uppercase, tracked out. Headline "Uptime you can slash." Sub-paragraph: most DePIN uptime systems are closed; Zoetra is open to any device, any network; no backend; only possible on BOT Chain. Two CTAs: Live dashboard (primary), GitHub (outline).
- **How it works** (three-step row): `FileSignature` Register & stake → `HeartPulse` Heartbeat on-chain → `Scissors` Breach gets slashed. Each a card with icon, title, one sentence.
- **Live proof CTA**: pulls a real device count from `useDevices()`, not a static number. "Watch a device fail live." + count of devices currently live on the active chain + button into `/live`.
- **Footer**: "Zoetra · permissionless uptime SLAs for DePIN devices" + real links: GitHub repo, contract on BOTScan, BOT Chain docs, @BOTChain_ai. No placeholder links anywhere.

### Live Dashboard (`/live`)

Top to bottom:

1. **Header row**: "Live devices" + subtitle. Right side: "Demo script" link (`ScrollText` icon, → `/demo`), `ConnectButton` (RainbowKit, injected wallets only), "Register device" button (`Plus` icon, opens RegisterModal).
2. **Wrong-network banner**: only rendered when a wallet is connected AND on the wrong chain. Inline warning banner, never a blocking modal, dashboard stays fully readable underneath.
3. **Two-column strip** (`grid lg:grid-cols-[2fr_1fr]`):
   - **StatsStrip** (left, spans 2fr): four tiles, Heartbeats (session, live count), Active devices (`n/total`), Slashes executed, current chain block number (ticking via `useBlockNumber({watch:true})`).
   - **Right column** (1fr, stacked):
     - **VerificationPanel**: "Don't trust this dashboard" framing. Rows: Network, Contract (click-to-copy address), Bytecode (a real `eth_getCode` check, shows "detected, N bytes" in `alive` green or "not found" in `bleed` red, never a static checkmark), Devices registered, Latest block, Explorer link.
     - **AlertsSettings**: "Breach alerts" card. One-line explanation that this is a stateless relay (`/api/alert`), webhook URL stored only in `localStorage`. Input + Save button; invalid URLs are rejected with a toast before saving, nothing bad gets persisted silently.
4. **Device grid** (`sm:grid-cols-2 lg:grid-cols-3`): one DeviceCard per registered device (see below). Empty state ("No devices registered yet. Be the first.") when the registry is empty; error banner ("RPC unreachable, retrying...") on read failure, cards otherwise hold last-known state.
5. **Live event feed**: reverse-chron rows across all devices, icon per kind (`Activity` beat, `Scissors` slashed, `Plus` registered), device id, one-line detail, mono short-hash linking to the explorer. Capped at 50 rows client-side.
6. **RegisterModal** (rendered but hidden until opened).

#### DeviceCard (the core unit)

Top to bottom inside the card:

- Pulse dot (see Signature element) + device name + mono `device #id`.
- Status badge, top right: icon + label from the Status system above.
- Big mono score percentage, colored by status.
- Sparkline: last ~40 score samples, 1px stroke, no fill, no gradient, colored by status. Built from state accumulated during render (not an effect) whenever the score value actually changes.
- Beats row: `{received} recv · {expected} exp` (left) and the live timing string (right, see Countdown logic below).
- Economics row: stake in BOT, SLA %, interval in seconds.
- At-risk row: BOT at risk if slashed, BOT bounty a slasher would earn. Both are pure math on numbers already on the card, no extra reads.
- Footer row: operator address (links to explorer) and a Slash button. Slash is only enabled when status is Breached; when disabled, a `title` tooltip explains why (deregistered / still above SLA / connect a wallet).
- Proof trail: collapsed by default, click to expand this device's own slice of the live event feed (last 6 events, tx-linked).

**Countdown logic (important, was a real bug once, fixed):** the timing string is gated on the device's on-chain *status*, never on a raw "seconds since last beat" heuristic. Healthy devices show "Next heartbeat due in Xs" (or "any moment" if briefly overdue past normal confirmation latency); Breached devices show "Slashable now"; only At-risk devices show a projected "Slashable in ~Xs," computed by a TS mirror of the contract's exact score formula, verified against live chain reads. This ordering means a 100%-healthy device can never flash a "Slashable" message just because a beat's confirmation happened to be slow that cycle.

### Demo (`/demo`)

A static, numbered walkthrough (`FileSignature`... actually icons: `Eye`, `ExternalLink`, `Terminal`, `TrendingDown`, `PowerOff`, `Wallet`, `Scissors`) mirroring the exact recording script below. Two CTAs at top (Live dashboard, contract on explorer). Exists so a judge can self-serve verification without waiting for the video.

## RegisterModal

Presets row first: three one-click buttons (Critical sensor 5s/99%, Standard node 15s/95%, Low-power device 60s/90%) that fill interval + SLA sliders. Then: name input, interval slider (5–300s), SLA slider (50–99.9%), stake input (min 0.05 BOT). States: disconnected → show `ConnectButton` inline; wrong network → prompt to switch; connected + correct network → live form; submit → wallet prompt → toast with tx hash on success/failure.

## Wallet/edge states

Read-only visitors get the full live dashboard, no wall. Connect modal shows two groups: **Installed** (MetaMask, Rabby, Coinbase extension, Brave, etc., anything injected) and **Mobile** (WalletConnect, for BO Wallet and any other mobile-only wallet, scan-to-pair). WalletConnect runs on a real registered project id (cloud.reown.com), not a placeholder, so there's no remote-config-fetch error in the console. Wrong network: inline banner with switch action, never a blocking modal. Tx failure: toast with revert reason. RPC down: banner "RPC unreachable, retrying," cards hold last state.

## Demo script (90s, the actual recording script, mirrored at `/demo`)

| t | Shot | Line |
|---|---|---|
| 0:00 | `/live`, 3 cards pulsing green | "Three real machines, every pulse is a transaction on BOT Chain" |
| 0:12 | Click a beat hash → scan.bohr.life | "Don't trust my dashboard, here's the explorer" |
| 0:25 | SSH to VM, kill daemon | "Now I kill the cloud node" |
| 0:33 | Card: dot stops, status flips to At risk then Breached | "No heartbeat, the score is decaying on-chain, in seconds" |
| 0:50 | Score crosses SLA, Slash enables, click it | "It breached its SLA, so anyone, including you, can slash its stake. I just earned a bounty for catching it" |
| 1:05 | Slashed event + burn tx on explorer | "Stake burned, on-chain, verifiable" |
| 1:15 | Restart daemon, dot resumes, score climbs | "Honesty is recoverable. Fiction isn't. That's Zoetra: uptime you can slash" |

## Brand assets (logo & mascot, drafted Jul 4 2026, not yet generated)

**Logo mark concept:** an ECG heartbeat pulse line that breaks into a clean diagonal cut partway through, then resumes, contained in a thin-stroke hexagon (a network node). Single accent-blue mark on near-black, no gradients, no glow, reads at favicon size. Full prompt kept in session notes, not restated here to avoid drift, regenerate from the same brief if needed: pulse-with-a-cut, hexagon container, flat vector, EKG-instrument feel, not a crypto-coin icon.

**Mascot concept (on-brand version):** a geometric line-art sentinel figure, chest/visor displays the same pulse-with-a-cut mark, calm and watchful posture (not playful), angular construction, single accent color outlined in off-white on near-black. Explicitly not a cartoon/plush-toy mascot, that direction was considered and rejected as inconsistent with the clinical mission-control identity; a fully illustrated colorful alternative exists as a documented option if the brand direction changes.
