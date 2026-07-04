import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative pt-16 pb-20 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-z-accent">
          A permissionless SLA registry for DePIN
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-z-text sm:text-6xl">
          Uptime you can slash.
        </h1>
        <p className="mt-6 text-lg text-z-text-dim max-w-2xl mx-auto">
          Most DePIN uptime systems are closed. Zoetra is open to any device, from any
          network: no backend, no admin, uptime scored live on-chain from block.timestamp
          alone, and anyone can slash a breached SLA and earn the bounty. Only possible on
          BOT Chain, fast and cheap enough to make a heartbeat a real transaction.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/live">
            <Button size="lg" className="gap-2">
              Live dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="https://github.com/mystiquemide/zoetra" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="gap-2">
              <ExternalLink className="h-4 w-4" /> GitHub
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
