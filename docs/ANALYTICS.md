# Zoetra  -  Analytics Spec

No third-party analytics, no tracking, no PII. Every metric derives from chain events, which makes the analytics layer itself independently verifiable. The dashboard is the analytics product.

## Metric schema (all computed client-side from events/views)

| Metric | Source | Where shown |
|---|---|---|
| Total heartbeats | count of `Beat` events since deploy (Blockscout API total + live increment) | StatsStrip, landing |
| Active devices | `getDevices` where `deregisteredAt == 0` | StatsStrip |
| Per-device score (bps) | `scoreOf(id)` poll 2s | DeviceCard |
| Score history sparkline | client ring buffer of score samples (last ~40) | DeviceCard |
| Slashes executed / BOT burned | `Slashed` events, sum `amount - bounty` | StatsStrip, feed |
| Beat confirm latency | daemon log: send → receipt (off-chain, quoted in README) | README |
| Block height / chain health | `eth_blockNumber` poll | chain badge |

## KPI targets (from PRD)
- ≥ 1,000 real `Beat` transactions
- Kill-to-visible-decay < 15s
- ≥ 1 on-chain `Slashed` event executed live
- 100% of dashboard numbers reproducible from scan.botchain.ai alone

## Events already carry the analytics
`Beat(id, timestamp, score)` embeds the post-beat score, so historical score curves are reconstructable from logs alone without archive-node state reads. This is the ADR-1 payoff: Blockscout is the data warehouse.
