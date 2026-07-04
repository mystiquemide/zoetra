import Link from "next/link"
import { ArrowRight, ExternalLink, Terminal, Eye, PowerOff, TrendingDown, Wallet, Scissors } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { REGISTRY_ADDRESS } from "@/lib/registry"
import { explorerAddressUrl } from "@/lib/chains"

const STEPS = [
  {
    icon: Eye,
    title: "Watch three devices heartbeat",
    body: "Open the live dashboard. Three real wallets are each sending a heartbeat transaction every 5 seconds. Every card's score is computed on-chain from block.timestamp, not cached anywhere.",
  },
  {
    icon: ExternalLink,
    title: "Don't trust the dashboard, check the explorer",
    body: "Click any tx hash in the event feed or the verification panel's explorer link. Every beat you saw client-side is independently visible on BOTScan.",
  },
  {
    icon: Terminal,
    title: "Kill a device",
    body: "In a terminal, Ctrl+C one of the daemon/heartbeat.mjs processes. That process is a real wallet with real gas; stopping it is the actual failure event, there's no simulate-failure switch anywhere in this codebase.",
  },
  {
    icon: TrendingDown,
    title: "Watch the score bleed, live",
    body: "Within seconds the dashboard shows that device's status flip from Healthy to At risk to Breached. The score, the beats-received count, and the sparkline all update from on-chain reads, no page refresh.",
  },
  {
    icon: PowerOff,
    title: "It's slashable",
    body: "Once score drops below the device's own SLA threshold, its Slash button activates. This isn't gated to an admin, slash() is permissionless on-chain.",
  },
  {
    icon: Wallet,
    title: "Connect a wallet",
    body: "Connect any wallet on BOT Chain testnet (968). You don't need to own the device to slash it, that's the point.",
  },
  {
    icon: Scissors,
    title: "Slash it",
    body: "Submit the slash. 20% of the remaining stake is cut: 10% of that pays your wallet as a bounty, the rest is burned. Watch the event feed and the device's stake number update live.",
  },
]

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-z-text">How to verify Zoetra is real</h1>
      <p className="mt-2 text-sm text-z-text-dim">
        This is the exact script used to record the submission demo. Every step is something you can
        reproduce yourself, right now, against the live testnet deployment.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/live">
          <Button className="gap-2">
            Open live dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <a href={explorerAddressUrl(REGISTRY_ADDRESS)} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            View contract on explorer <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <Card key={step.title} className="border-z-border bg-z-surface">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-z-border font-mono text-sm text-z-text-dim">
                {i + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 text-z-text">
                  <step.icon className="h-4 w-4 text-z-accent" />
                  <span className="font-medium">{step.title}</span>
                </div>
                <p className="mt-1.5 text-sm text-z-text-dim">{step.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
