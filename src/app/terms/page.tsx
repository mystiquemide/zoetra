export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-12 py-16 pb-32">
      <h1 className="mb-2 text-[44px] font-semibold tracking-tighter text-z-alive">Terms of Service</h1>
      <p className="mb-12 text-sm text-z-text-dim">Last updated: July 4, 2026</p>

      <div className="flex flex-col gap-9 text-base leading-relaxed">
        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">1. Acceptance of Terms</h2>
          <p className="text-z-text-soft">
            By accessing or using Zoetra (the &quot;Service&quot;), including the website, dashboard, smart
            contracts, and any associated tools, you agree to be bound by these Terms of Service
            (&quot;Terms&quot;). If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">2. What Zoetra Is</h2>
          <p className="mb-3 text-z-text-soft">
            Zoetra is a permissionless, on-chain heartbeat SLA (Service Level Agreement) registry for DePIN
            (Decentralized Physical Infrastructure Network) devices, deployed on BOT Chain. It consists of:
          </p>
          <ul className="mb-3 flex list-disc flex-col gap-1.5 pl-5 text-z-text-soft">
            <li>A smart contract (&quot;the Registry&quot;) deployed at a public address on BOT Chain, which anyone can read, call, or verify independently.</li>
            <li>A web dashboard that reads from and writes to the Registry.</li>
            <li>An optional heartbeat client (&quot;the daemon&quot;) that any device operator may run to send heartbeat transactions.</li>
            <li>One optional, stateless webhook relay endpoint for breach notifications.</li>
          </ul>
          <p className="text-z-text-soft">
            Zoetra does not operate, own, or control any physical device. Zoetra does not custody funds
            beyond what the Registry contract itself holds as stake, and does so entirely via public,
            auditable smart contract logic, not through any centralized account or admin key.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">3. No Account, No Registration</h2>
          <p className="text-z-text-soft">
            There is no user account system. Your identity on Zoetra is your wallet address. We do not
            verify identity, collect KYC information, or restrict access based on jurisdiction, though you
            remain responsible for complying with the laws applicable to you.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">4. Eligibility</h2>
          <p className="text-z-text-soft">
            You must be legally capable of entering into a binding agreement in your jurisdiction and must
            not be barred from using blockchain-based services under applicable law. You are solely
            responsible for determining whether your use of Zoetra is lawful where you are located.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">5. Testnet Notice</h2>
          <p className="text-z-text-soft">
            At the time of writing, Zoetra&apos;s primary deployment operates on BOT Chain&apos;s testnet
            (&quot;Bohr,&quot; chain ID 968). Testnet BOT tokens obtained via the public faucet have no
            monetary value and are provided solely for testing purposes. Any deployment to BOT Chain mainnet
            (chain ID 677) will use real BOT with real economic value, and all risks described in Section 8
            apply with full force to mainnet use.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">6. How the Service Works, What You&apos;re Agreeing To</h2>
          <p className="mb-3 text-z-text-soft">By registering a device on the Registry, you acknowledge and agree that:</p>
          <ul className="flex list-disc flex-col gap-2.5 pl-5 text-z-text-soft">
            <li>You are staking real value (native BOT) against a self-declared uptime promise (the &quot;SLA&quot;). You choose your own heartbeat interval and SLA threshold at registration; no one else sets these for you.</li>
            <li>Your stake is at risk automatically and permissionlessly. If your device&apos;s on-chain uptime score falls below your declared SLA threshold, any third party, not Zoetra, not an administrator, may call the slash() function against your device. This is by design: there is no admin key, no appeal process, and no human review built into the contract. The slash executes purely based on the on-chain score at the time the transaction is processed.</li>
            <li>A successful slash is irreversible. Once executed, a portion of your stake is transferred to the caller as a bounty and the remainder is permanently burned. There is no refund, chargeback, or dispute mechanism.</li>
            <li>You are solely responsible for keeping your device&apos;s heartbeat client running. Zoetra provides a reference heartbeat client (daemon/heartbeat.mjs) as an example implementation, but you are responsible for its uptime, its private key security, and its gas funding. Zoetra is not responsible for a slash that results from your own device, key, wallet, RPC provider, or infrastructure failing.</li>
            <li>Withdrawing your stake requires deregistering first, followed by a cooldown period defined in the contract, after which you may withdraw remaining funds. Attempting to withdraw before deregistering or before the cooldown elapses will fail.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">7. Permissionless Slashing, Acting as a Verifier</h2>
          <p className="mb-3 text-z-text-soft">You may also call slash() against devices you do not own, if their on-chain score has fallen below their declared SLA. Doing so:</p>
          <ul className="flex list-disc flex-col gap-2.5 pl-5 text-z-text-soft">
            <li>Requires you to pay the gas cost of the transaction yourself.</li>
            <li>Will fail (revert) if the target device&apos;s score is not actually below its threshold at the time your transaction is processed, meaning you can lose gas fees on an unsuccessful attempt if conditions change between when you observe the breach and when your transaction executes.</li>
            <li>Entitles you, if successful, to a bounty (a percentage of the slashed stake), paid automatically by the smart contract, not by Zoetra.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">8. Risks You Accept</h2>
          <p className="mb-3 text-z-text-soft">Use of Zoetra involves risks inherent to blockchain technology and DeFi-adjacent mechanisms, including but not limited to:</p>
          <ul className="flex list-disc flex-col gap-2.5 pl-5 text-z-text-soft">
            <li><strong className="text-z-text">Smart contract risk.</strong> Although the Registry contract has been tested, no smart contract is guaranteed to be free of bugs, exploits, or unintended behavior. Funds staked in the contract may be lost due to a vulnerability, regardless of intent.</li>
            <li><strong className="text-z-text">Irreversibility.</strong> Blockchain transactions, including registrations, heartbeats, slashes, and withdrawals, cannot be reversed, cancelled, or refunded by Zoetra once confirmed.</li>
            <li><strong className="text-z-text">Network and RPC risk.</strong> Zoetra depends on BOT Chain&apos;s network, public RPC endpoints, and block explorers operated by third parties. Outages, forks, reorganizations, or changes to these services are outside Zoetra&apos;s control and may affect scoring, transaction delivery, or dashboard accuracy.</li>
            <li><strong className="text-z-text">Score-timing risk.</strong> The uptime score is computed live from block.timestamp and your device&apos;s heartbeat history. Network congestion, RPC latency, or delayed transaction confirmation may cause your device to appear to have missed a heartbeat even if your daemon attempted to send one on time.</li>
            <li><strong className="text-z-text">No insurance, no recourse.</strong> There is no insurance fund, no customer support line that can reverse a transaction, and no guarantee of any kind regarding uptime, availability, or fitness for purpose.</li>
            <li><strong className="text-z-text">Third-party wallet risk.</strong> You are responsible for the security of your own wallet and private keys. Zoetra never has access to, requests, or stores your private key.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">9. No Warranty</h2>
          <p className="text-[14px] uppercase tracking-wide text-z-text-soft">
            The service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of
            any kind, express or implied, including but not limited to warranties of merchantability,
            fitness for a particular purpose, non-infringement, or that the service will be uninterrupted,
            error-free, or secure.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">10. Limitation of Liability</h2>
          <p className="text-[14px] uppercase tracking-wide text-z-text-soft">
            To the maximum extent permitted by law, Zoetra, its contributors, and its operators shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of
            funds, stake, data, or profits, arising out of or related to your use of the service, including
            but not limited to losses resulting from slashing, smart contract bugs, or network failures.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">11. Open Source</h2>
          <p className="text-z-text-soft">
            The Zoetra codebase, including the smart contract, dashboard, and heartbeat client, is released
            under the MIT License. You may inspect, fork, modify, and redeploy it subject to that
            license&apos;s terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">12. Third-Party Services</h2>
          <p className="text-z-text-soft">
            Zoetra integrates with or links to third-party services it does not control, including but not
            limited to: BOT Chain RPC providers, the BOTScan block explorer, wallet browser extensions
            (MetaMask, Rabby, Coinbase Wallet, etc.), and, if you configure it, a third-party webhook
            destination (e.g., Discord or Slack) of your own choosing. Zoetra is not responsible for the
            availability, accuracy, or conduct of these third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">13. Changes to the Service and Terms</h2>
          <p className="text-z-text-soft">
            Zoetra may be modified, paused, or discontinued at any time. These Terms may be updated
            periodically; continued use of the Service after changes constitutes acceptance of the revised
            Terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">14. Governing Interpretation</h2>
          <p className="text-z-text-soft">
            These Terms are intended to be interpreted in good faith, consistent with the permissionless,
            non-custodial nature of the Service described herein. Nothing in these Terms creates an
            employment, agency, partnership, or fiduciary relationship between you and Zoetra.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-[22px] font-semibold text-z-alive">15. Contact</h2>
          <p className="text-z-text-soft">
            Questions regarding these Terms may be directed via the contact information listed in the
            project repository.
          </p>
        </section>
      </div>
    </div>
  )
}
