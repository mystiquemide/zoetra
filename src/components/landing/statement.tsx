import Image from "next/image"
import { Reveal } from "@/components/landing/reveal"

export function ChainStatement() {
  return (
    <section
      className="relative border-b border-z-border bg-cover bg-center px-6 py-24 text-center sm:px-12"
      style={{
        backgroundImage:
          "linear-gradient(rgba(10,11,13,0.72), rgba(10,11,13,0.72)), url('/design/chain-bg.jpg')",
      }}
    >
      <div className="mx-auto mb-8 flex items-center justify-center">
        <Image src="/design/zoetra-mascot.png" alt="Zoetra mascot" width={320} height={320} className="h-56 w-56 object-contain sm:h-80 sm:w-80" />
      </div>
      <Reveal as="h2" className="mx-auto mb-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tighter text-z-alive sm:text-6xl">
        No dashboard to trust.
        <br />
        Only a chain to check.
      </Reveal>
      <p className="mx-auto max-w-xl text-[17px] text-z-text-dim">
        Every number on Zoetra is a direct read from BOT Chain.
      </p>
    </section>
  )
}

export function BountyStatement() {
  return (
    <section className="border-b border-z-border bg-z-surface px-6 py-24 text-center sm:px-12">
      <Image src="/design/zoetra-logo.png" alt="Zoetra" width={96} height={96} className="mx-auto mb-8 h-20 w-20 object-contain sm:h-24 sm:w-24" />
      <Reveal as="h2" className="mx-auto mb-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tighter text-z-alive sm:text-6xl">
        Breach it, slash it, and keep the bounty.
      </Reveal>
      <p className="mx-auto max-w-xl text-[17px] text-z-text-dim">
        Anyone can call slash on a device below SLA. There is no permission needed.
      </p>
    </section>
  )
}
