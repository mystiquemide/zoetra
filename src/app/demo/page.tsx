import Link from "next/link"
import { ArrowRight, ExternalLink, Eye, Terminal, TrendingDown, Scissors, Wallet, PowerOff } from "lucide-react"
import { REGISTRY_ADDRESS } from "@/lib/registry"
import { explorerAddressUrl } from "@/lib/chains"

const STEPS = [
  { num: "01", icon: Eye, title: "Open /live and see devices pulsing green.", detail: "Three real machines. Every pulse is a transaction on BOT Chain." },
  { num: "02", icon: ExternalLink, title: "Click a beat hash to BOTScan.", detail: "Do not trust my dashboard. Verify the explorer." },
  { num: "03", icon: Terminal, title: "Stop the node or heartbeat daemon.", detail: "The device stops proving liveness." },
  { num: "04", icon: TrendingDown, title: "Watch score decay from Healthy to At risk to Breached.", detail: "No heartbeat means the SLA score decays on-chain." },
  { num: "05", icon: Scissors, title: "Slash the breached device.", detail: "Once below SLA, anyone can slash and claim the bounty." },
  { num: "06", icon: Wallet, title: "Verify the slashed event and burn transaction.", detail: "Stake moved according to contract rules." },
  { num: "07", icon: PowerOff, title: "Restart the device and watch heartbeats resume.", detail: "Honesty is recoverable." },
]

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-3xl px-12 pt-16 pb-0">
      <div className="mb-12">
        <h1 className="mb-3 text-4xl font-semibold tracking-tighter text-z-alive">Demo walkthrough</h1>
        <p className="mb-6 max-w-lg text-base leading-relaxed text-z-text-dim">
          Verify Zoetra by following the same path used in the product recording.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/live"
            className="flex items-center gap-2 rounded-[10px] bg-z-alive px-5 py-3 text-sm font-semibold text-z-bg"
          >
            Open live dashboard <ArrowRight className="h-[15px] w-[15px]" />
          </Link>
          <a
            href={explorerAddressUrl(REGISTRY_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-[10px] border border-z-border bg-z-surface px-5 py-3 text-sm font-semibold text-z-text"
          >
            <ExternalLink className="h-[15px] w-[15px]" /> Contract on explorer
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className="flex items-start gap-5 rounded-2xl border border-z-border bg-z-surface px-7 py-6"
          >
            <div className="flex shrink-0 items-center gap-3.5">
              <span className="rounded-lg bg-z-alive/10 px-2.5 py-1.5 font-mono text-[13px] font-semibold text-z-alive">
                {step.num}
              </span>
              <span className="flex h-9.5 w-9.5 items-center justify-center rounded-[10px] bg-z-surface-2">
                <step.icon className="h-[18px] w-[18px] text-z-alive" />
              </span>
            </div>
            <div>
              <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-z-alive">{step.title}</h3>
              <p className="text-sm leading-relaxed text-z-text-dim">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
