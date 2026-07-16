export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-12 py-16 pb-32">
      <h1 className="mb-12 text-[44px] font-semibold tracking-tighter text-z-alive">Documentation</h1>

      <div className="flex flex-col gap-9 text-base leading-relaxed">
        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">What is Zoetra?</h2>
          <p className="text-z-text-soft">
            Zoetra is a permissionless, on-chain heartbeat SLA registry for DePIN devices, deployed on BOT
            Chain. A device operator registers a wallet, declares how often it will &quot;check in&quot; (a
            heartbeat interval) and what percentage of the time it promises to be online (its SLA), and
            stakes native BOT against that promise. From that point, the device&apos;s uptime is measured
            entirely by an on-chain smart contract, not a dashboard, not a company, not an admin.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-[22px] font-semibold text-z-alive">Glossary</h2>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {[
                ["SLA", "Service Level Agreement, the uptime percentage a device promises (e.g., 90%)"],
                ["Heartbeat", "A transaction a device sends to prove it's alive, at its declared interval"],
                ["Score", "The device's current uptime, in basis points (bps), computed live on-chain"],
                ["bps", "Basis points; 10000 bps = 100%, 9000 bps = 90%"],
                ["Slash", "Cutting a portion of a device's stake because it breached its SLA"],
                ["Bounty", "The reward paid to whoever calls slash() successfully"],
                ["Deregister", "Voluntarily stopping a device's heartbeat obligation, starting a cooldown before withdrawal"],
                ["Proof trail", "The on-chain event history (registrations, beats, slashes) for one device"],
              ].map(([term, def], i, arr) => (
                <tr key={term} className={i < arr.length - 1 ? "border-b border-z-border" : ""}>
                  <td className="whitespace-nowrap py-2.5 pr-3 align-top font-semibold text-z-text">{term}</td>
                  <td className="py-2.5 align-top text-z-text-soft">{def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">How the Score Is Computed</h2>
          <p className="mb-3 text-z-text-soft">
            The contract does not run a background job or cron. Instead, <code className="rounded-[5px] bg-z-surface-2 px-1.5 py-0.5 font-mono text-[0.9em]">scoreOf(deviceId)</code> is
            a view function, meaning anyone can call it at any time and get a live-computed answer based on:
          </p>
          <ul className="mb-4 flex list-disc flex-col gap-2 pl-5 text-z-text-soft">
            <li>How many heartbeats the device has actually sent, tracked in a rolling window.</li>
            <li>How many heartbeats it should have sent by now, based on its declared interval and the current block&apos;s timestamp.</li>
          </ul>
          <div className="mb-3 rounded-[10px] border border-z-border bg-z-surface-2 px-5 py-4 font-mono text-sm">
            Score (bps) = (beats received &divide; beats expected) &times; 10,000, capped at 10,000.
          </div>
          <p className="text-z-text-soft">
            Because this is computed from block.timestamp at read time, the score decays visibly even if
            nobody sends a new transaction, time passing alone is what causes a dead device&apos;s score to
            fall.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">How to Register a Device</h2>
          <ol className="flex list-decimal flex-col gap-2.5 pl-5 text-z-text-soft">
            <li>Connect a wallet on BOT Chain mainnet (chain ID 677).</li>
            <li>If you need gas or stake, bridge funds at <a href="https://bridge.botchain.ai" target="_blank" rel="noopener noreferrer" className="font-semibold text-z-alive underline underline-offset-2">bridge.botchain.ai</a>, then swap for BOT at <a href="https://dex.botchain.ai" target="_blank" rel="noopener noreferrer" className="font-semibold text-z-alive underline underline-offset-2">dex.botchain.ai</a>.</li>
            <li>Choose a name, a heartbeat interval (5-300 seconds), an SLA threshold (50-99.99%), and a stake (minimum 0.05 BOT).</li>
            <li>Submit. Your wallet is now the device&apos;s operator; only that wallet can send valid heartbeats for it.</li>
            <li>
              Run a heartbeat client (see <code className="rounded-[5px] bg-z-surface-2 px-1.5 py-0.5 font-mono text-[0.9em]">daemon/heartbeat.mjs</code> for
              a reference implementation) that calls <code className="rounded-[5px] bg-z-surface-2 px-1.5 py-0.5 font-mono text-[0.9em]">heartbeat(deviceId)</code> at
              your declared interval, using your device&apos;s operator key.
            </li>
          </ol>
          <pre className="mt-4 overflow-x-auto rounded-[10px] border border-z-border bg-z-surface-2 px-5 py-4 font-mono text-[13px] leading-relaxed text-z-text-soft">
{`cd daemon
npm install
cp .env.example .env
# fill RPC_URL, REGISTRY_ADDRESS, PRIVATE_KEY, DEVICE_ID, INTERVAL_MS
npm start`}
          </pre>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">How Slashing Works</h2>
          <ol className="flex list-decimal flex-col gap-2.5 pl-5 text-z-text-soft">
            <li>If a device&apos;s live score falls below its own declared SLA, it becomes slashable.</li>
            <li>
              Anyone, using any wallet, can call <code className="rounded-[5px] bg-z-surface-2 px-1.5 py-0.5 font-mono text-[0.9em]">slash(deviceId)</code>.
            </li>
            <li>The contract verifies the breach is real at the moment the transaction executes (it will revert if the device has recovered).</li>
            <li>On success: 20% of the device&apos;s remaining stake is cut. Of that, 10% is paid to the caller as a bounty; the remainder is burned permanently.</li>
            <li>A cooldown period prevents the same device from being slashed repeatedly in rapid succession.</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">Architecture Summary</h2>
          <ul className="flex list-disc flex-col gap-2.5 pl-5 text-z-text-soft">
            <li><strong className="text-z-text">Smart contract (ZoetraRegistry.sol):</strong> the only source of truth. Handles registration, heartbeats, live scoring, slashing, deregistration, and withdrawal.</li>
            <li><strong className="text-z-text">Dashboard:</strong> a read-only viewer over the contract&apos;s public state and event logs, plus a write path (via your own connected wallet) for registering and slashing.</li>
            <li><strong className="text-z-text">Heartbeat client:</strong> a reference script any device operator can run (or reimplement in any language) to send heartbeats on schedule.</li>
            <li><strong className="text-z-text">Alert relay:</strong> one optional, stateless serverless endpoint that forwards breach notifications to a webhook URL you provide.</li>
          </ul>
          <p className="mt-4 text-z-text-soft">There is no database, no user accounts, and no admin key anywhere in this system.</p>
        </section>

        <section>
          <h2 className="mb-4 text-[22px] font-semibold text-z-alive">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-5">
            {[
              ["Can Zoetra reverse a slash if it was a mistake?", "No. There is no admin key and no override. This is intentional, it's what \"permissionless\" means."],
              ["What happens if my RPC or internet goes down but my device is actually fine?", "The contract only knows what transactions it received. If your heartbeat client can't reach the chain, your device's score will decay exactly as if it were genuinely offline. Uptime is measured by provable heartbeats, not by physical reality."],
              ["Can I use my own heartbeat client instead of the provided one?", "Yes. The contract doesn't care what sends the transaction, only that it comes from the registered operator wallet and calls heartbeat(deviceId)."],
              ["Is my stake insured?", "No. There is no insurance fund. Stake represents real risk you are voluntarily taking on by registering."],
              ["Does Zoetra work with devices from other DePIN networks?", "Yes, in principle, any device or wallet can register regardless of what network it otherwise belongs to. Zoetra does not require exclusivity or integration with any other protocol."],
            ].map(([q, a]) => (
              <div key={q}>
                <p className="mb-1.5 font-semibold text-z-alive">{q}</p>
                <p className="text-z-text-soft">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
