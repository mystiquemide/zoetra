# Contributing to Zoetra

Thanks for taking a look at Zoetra. Whether you're fixing a typo, filing a bug, or building out a piece of the roadmap, contributions are welcome.

## Good first issues

Check the [issue tracker](https://github.com/mystiquemide/zoetra/issues) for anything labeled `good first issue`. If nothing's labeled yet, open an issue describing what you'd like to work on before sending a PR  -  it saves everyone time.

## Local setup

The [README's Quick Start](README.md#quick-start) covers all three pieces (contracts, daemon, dashboard). In short:

```bash
# dashboard
npm install
cp .env.example .env
npm run dev

# contracts
cd contracts && npm install && npx hardhat test

# daemon
cd daemon && npm install && cp .env.example .env
```

No database, no auth, no extra services to stand up  -  the chain is the only backend.

## Branches and pull requests

- Branch off `main`: `feature/short-description` or `fix/short-description`
- Keep PRs focused on one change; smaller PRs get reviewed faster
- Run `npm run lint` and `npx hardhat test` (if you touched contracts) before opening a PR
- Describe *why* the change is needed, not just what changed  -  the diff already shows what changed
- Link any related issue

## Code style

- TypeScript throughout the dashboard, Solidity 0.8.28 for contracts
- No new abstractions for a single use site  -  match the existing patterns in the file you're editing
- Comments explain *why*, not *what*  -  the code should already say what it does

## Reporting bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include the network (testnet/mainnet), a tx hash if relevant, and steps to reproduce.

## Code of Conduct

Be respectful and constructive. This project follows the spirit of the [Contributor Covenant](https://www.contributor-covenant.org/).
