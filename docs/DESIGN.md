# Zoetra Design Notes

Zoetra should read like a real production mainnet product, not a temporary judging build.

## Product tone

- Mainnet-first.
- Dense and verifiable.
- No placeholder language.
- No free-gas or temporary-network language.
- Every proof path should point to BOT Chain mainnet and BOTScan.

## Primary screens

| Screen | Purpose |
|---|---|
| `/` | Product landing page: uptime you can slash. |
| `/live` | Mainnet dashboard: devices, scores, stake, slash state, and verification panel. |
| `/proof` | Verification walkthrough for judges, operators, and auditors. |
| `/docs` | Product documentation and registration instructions. |
| `/tx/[hash]` | In-app transaction decoder. |
| `/address/[addr]` | In-app address view. |
| `/terms` | Product terms for real BOT stake. |
| `/privacy` | Privacy policy for wallet, RPC, and localStorage behavior. |

## Live dashboard requirements

1. Header: `Live devices`, wallet connect, `Verification`, and `Register device`.
2. Funding bar: bridge at `https://bridge.botchain.ai`, then swap at `https://dex.botchain.ai`.
3. Verification panel: network, contract, bytecode status, registered device count, latest block, BOTScan link.
4. Device cards: name, id, status, score, heartbeat counts, stake, SLA, interval, at-risk amount, bounty, operator link, slash button.
5. Event feed: only real events from the active BOT Chain mainnet session.
6. No mocked numbers in `/live`.

## Visual system

- Dark, dense, infrastructure-grade.
- Use `z-alive` green only for health, verification, and key actions.
- Use amber for at-risk and red for breached/slashable states.
- Prefer tables, cards, and proof panels over marketing decoration.
- Icons are lucide-react only.

## Verification walkthrough

The `/proof` route should teach a reviewer how to verify the product without trusting Zoetra:

1. Open `/live`.
2. Confirm BOT Chain mainnet and detected bytecode.
3. Open the registry on BOTScan.
4. Inspect the production device.
5. Inspect a heartbeat transaction.
6. Watch a missed-heartbeat score decay.
7. Confirm slashing is permissionless once a device breaches.

## Mainnet copy rules

- Say `BOT Chain mainnet` or `chain 677`.
- Explorer links use `https://scan.botchain.ai`.
- Funding links use `https://bridge.botchain.ai` and `https://dex.botchain.ai`.
- Avoid wording that implies temporary tokens or temporary environment.
