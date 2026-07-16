# Security Policy

## Scope

Zoetra consists of three pieces, each with a different security surface:

- **`contracts/ZoetraRegistry.sol`**  -  holds real staked BOT. This is the highest-value target.
- **`daemon/heartbeat.mjs`**  -  holds a device operator's private key locally; never transmits it anywhere except to sign transactions.
- **`src/` (dashboard)**  -  read-only unless a wallet is connected; the one server-side route (`/api/alert`) is a stateless webhook relay with no database and no chain-write access.

## Reporting a vulnerability

If you find a security issue  -  a way to drain stake incorrectly, bypass the slash cooldown, grief another operator, or anything else that breaks the contract's intended guarantees  -  please report it privately rather than opening a public issue.

Email **splashmediahub@gmail.com** with:
- A description of the issue and its impact
- Steps to reproduce (a failing test against the Hardhat suite is ideal)
- The BOT Chain mainnet transaction, address, or route it affects

Expect an acknowledgment within a few days. Once a fix is confirmed, we'll coordinate on disclosure timing before any public writeup.

## Out of scope

- Issues that only affect BOT Chain bridge, DEX, RPC, or explorer infrastructure  -  report those to BOT Chain directly
- Social engineering against a device operator's own key management
- Third-party wallet extension vulnerabilities (MetaMask, Rabby, etc.)  -  report those upstream

## Known tradeoffs

These are documented, not hidden:

- The contract has no admin/pause function by design  -  a real bug cannot be patched in place, only redeployed. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the reasoning.
- A heartbeat proves a *wallet* is active, not that the *physical device* sent it. See the README roadmap for the hardware-attestation gap.
