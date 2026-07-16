export default function PrivacyPage() {
  const rows = [
    ["Wallet address, stake amount, SLA settings, heartbeat history, slash history", "Public blockchain state (BOT Chain)", "Anyone, forever, via any RPC client or block explorer"],
    ["Device name (text you choose at registration)", "Public blockchain state", "Anyone, forever"],
    ["Webhook URL for breach alerts", "Your browser's localStorage only", "Only you, on that browser, on that device"],
    ["Anything else", "Nowhere. Zoetra has no database.", "N/A"],
  ]

  return (
    <div className="mx-auto max-w-3xl px-12 py-16 pb-32">
      <h1 className="mb-2 text-[44px] font-semibold tracking-tighter text-z-alive">Privacy Policy</h1>
      <p className="mb-12 text-sm text-z-text-dim">Last updated: July 4, 2026</p>

      <div className="flex flex-col gap-9 text-base leading-relaxed">
        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">1. Overview</h2>
          <p className="text-z-text-soft">
            Zoetra is built around a simple principle: the blockchain is the only backend. This has direct
            privacy implications, described below, that are different from a typical web application.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">2. We Do Not Operate User Accounts</h2>
          <p className="text-z-text-soft">
            Zoetra has no sign-up, no login, no username/password, no email collection, and no user
            database. We cannot identify &quot;who you are&quot; beyond the public wallet address you
            choose to interact with the Registry from.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-[22px] font-semibold text-z-alive">3. What Data Exists, and Where</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-z-border">
                <th className="px-3 py-2.5 text-left font-semibold text-z-text-dim">Data</th>
                <th className="px-3 py-2.5 text-left font-semibold text-z-text-dim">Where it lives</th>
                <th className="px-3 py-2.5 text-left font-semibold text-z-text-dim">Who can see it</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i < rows.length - 1 ? "border-b border-z-border" : ""}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-3 align-top text-z-text-soft">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">4. On-Chain Data Is Public and Permanent</h2>
          <p className="mb-3 text-z-text-soft">
            Anything you submit to the Registry contract, your wallet address, device name, stake amount,
            heartbeat timestamps, is written to a public blockchain. This means:
          </p>
          <ul className="flex list-disc flex-col gap-2.5 pl-5 text-z-text-soft">
            <li>It is visible to anyone, indefinitely, including block explorers, chain analytics tools, and anyone running their own node.</li>
            <li>It cannot be deleted, redacted, or made private after the fact. Blockchains are append-only. If your jurisdiction&apos;s privacy law grants a &quot;right to be forgotten&quot; or similar right, be aware that this right cannot be technically fulfilled for data once committed to the chain. Do not register a device using a name or any field that contains personal information you are not comfortable making permanently public.</li>
            <li>Zoetra&apos;s dashboard is a read-only viewer over this public data. Removing the dashboard, or Zoetra ceasing to operate entirely, would not remove this data from the chain.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">5. The One Server-Side Component: the Alert Relay</h2>
          <p className="mb-3 text-z-text-soft">
            Zoetra includes exactly one server-side code path, a stateless serverless function at
            /api/alert. Here is precisely what it does and does not do:
          </p>
          <ul className="flex list-disc flex-col gap-2.5 pl-5 text-z-text-soft">
            <li><strong className="text-z-text">Does:</strong> when your browser detects (from public on-chain data it already read) that a device has breached its SLA, and you have configured a webhook URL, your browser sends a request to /api/alert containing the device ID, name, score, and your chosen webhook URL. The function validates the URL, forwards a short text message to it, and returns success or failure.</li>
            <li><strong className="text-z-text">Does not:</strong> store this request anywhere. There is no database, no logging pipeline, and no retention. Each request is processed and discarded.</li>
            <li><strong className="text-z-text">Does not:</strong> send data anywhere except the exact webhook URL you typed in yourself. It will refuse to relay to private/internal network addresses.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">6. Cookies and Tracking</h2>
          <p className="text-z-text-soft">
            Zoetra does not use tracking cookies, analytics scripts, or advertising identifiers. Your wallet
            browser extension (MetaMask, etc.) may itself set its own storage or communicate with its own
            servers; that is governed by that extension&apos;s own privacy policy, not Zoetra&apos;s.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">7. Local Storage</h2>
          <p className="text-z-text-soft">
            The only data Zoetra&apos;s frontend writes to your browser is the optional webhook URL
            described above, stored via standard browser localStorage, scoped to Zoetra&apos;s domain, and
            never transmitted anywhere except to the /api/alert relay when a breach fires. Clearing your
            browser storage removes it.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">8. Third-Party Wallets and RPCs</h2>
          <p className="text-z-text-soft">
            When you connect a wallet, that wallet extension (not Zoetra) mediates the connection and may
            have its own data practices. When the dashboard reads chain data, it queries public RPC
            endpoints (e.g., rpc.botchain.ai) operated by BOT Chain&apos;s infrastructure providers, not by
            Zoetra; those requests are subject to those providers&apos; own logging practices, which Zoetra
            does not control.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">9. Children&apos;s Privacy</h2>
          <p className="text-z-text-soft">
            Zoetra is not directed at children and does not knowingly process data related to children,
            consistent with the fact that it collects no personal data at all beyond what a user voluntarily
            and publicly commits to a blockchain.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">10. Changes to This Policy</h2>
          <p className="text-z-text-soft">
            This policy may be updated as the Service evolves (for example, if a future backend component is
            added). Material changes will be reflected in the &quot;Last updated&quot; date above and, where
            practical, noted in the project&apos;s public repository.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">11. Contact</h2>
          <p className="text-z-text-soft">
            Questions about this Privacy Policy may be directed via the contact information listed in the
            project repository.
          </p>
        </section>
      </div>
    </div>
  )
}
