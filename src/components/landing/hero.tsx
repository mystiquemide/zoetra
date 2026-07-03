import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative pt-16 pb-20 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-z-text sm:text-6xl">
          Uptime you can slash.
        </h1>
        <p className="mt-6 text-lg text-z-text-dim max-w-2xl mx-auto">
          DePIN devices prove liveness with on-chain heartbeats. Zoetra scores uptime in
          real time and lets anyone slash an operator who breaches their own SLA, on BOT
          Chain, where a heartbeat every few seconds actually costs nothing.
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
