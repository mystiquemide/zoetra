# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-04

### Added

- `ZoetraRegistry.sol`: register, heartbeat, live on-chain scoring, permissionless slash with bounty, deregister/withdraw
- Reference heartbeat daemon (`daemon/heartbeat.mjs`), one process per device
- Next.js dashboard with live device grid, verification panel, breach-alert webhooks, and a guided onboarding tour
- In-app block explorer (`/tx/[hash]`, `/address/[addr]`) so on-chain claims are checkable without leaving the app
- Wallet support for injected extensions and WalletConnect (including BOT Chain's BO Wallet)
- Deployed to BOT Chain testnet (chain 968)
- Public repository launch: README, CI, CodeQL, Dependabot, contributing guide, security policy, deployment docs
