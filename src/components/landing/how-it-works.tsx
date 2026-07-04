import { FileSignature, HeartPulse, Scissors } from "lucide-react"
import { Reveal } from "@/components/landing/reveal"

const steps = [
  {
    n: "01",
    icon: FileSignature,
    title: "Register and stake",
    body: "Set interval, SLA, and BOT stake.",
    rot: -2.5,
    z: 1,
    delay: "0.05s",
  },
  {
    n: "02",
    icon: HeartPulse,
    title: "Heartbeat on-chain",
    body: "Each pulse is a tx. The dashboard reads chain state.",
    rot: 1.5,
    z: 2,
    delay: "0.2s",
  },
  {
    n: "03",
    icon: Scissors,
    title: "Breach gets slashed",
    body: "Below SLA, anyone can slash and claim the bounty.",
    rot: -1.5,
    z: 3,
    delay: "0.35s",
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 sm:px-12 sm:py-28">
      <Reveal as="h2" className="mb-16 text-center text-3xl font-semibold tracking-tighter text-z-alive sm:text-5xl">
        How Zoetra proves uptime
      </Reveal>
      <Reveal className="flex flex-col items-center">
        {steps.map((step, i) => (
          <div
            key={step.n}
            className="zt-card relative flex w-full max-w-xl items-start gap-5 rounded-2xl border border-z-border bg-z-surface p-8 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
            style={
              {
                "--rot": `${step.rot}deg`,
                transform: `rotate(${step.rot}deg)`,
                zIndex: step.z,
                marginTop: i === 0 ? 0 : "-2.25rem",
                animationDelay: step.delay,
              } as React.CSSProperties
            }
          >
            <span className="shrink-0 rounded-lg bg-z-alive/10 px-2.5 py-1 font-mono text-[13px] font-semibold text-z-alive">
              {step.n}
            </span>
            <div className="flex-1">
              <step.icon className="mb-4 h-5.5 w-5.5 text-z-alive" />
              <h3 className="mb-2.5 text-xl font-semibold tracking-tight text-z-alive">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-z-text-dim">{step.body}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
