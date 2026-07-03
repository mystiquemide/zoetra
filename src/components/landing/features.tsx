import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSignature, HeartPulse, Scissors } from "lucide-react"

const steps = [
  {
    icon: FileSignature,
    title: "Register & stake",
    description: "Declare a heartbeat interval and an SLA target, stake native BOT against it.",
  },
  {
    icon: HeartPulse,
    title: "Heartbeat on-chain",
    description: "Every beat is a real transaction. Uptime is scored live from a rolling window, no dashboard required.",
  },
  {
    icon: Scissors,
    title: "Breach gets slashed",
    description: "Fall below your own SLA and anyone can slash your stake, permissionlessly, and earn a bounty for catching it.",
  },
]

export function Features() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-z-text text-center">How it works</h2>
        <p className="mt-4 text-z-text-dim text-center max-w-xl mx-auto">
          No trust, no dashboards you have to believe. The chain is the proof.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="border-z-border bg-z-surface">
              <CardHeader>
                <step.icon className="h-8 w-8 text-z-accent mb-3" />
                <CardTitle className="text-z-text">{step.title}</CardTitle>
                <CardDescription className="text-z-text-dim">{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
