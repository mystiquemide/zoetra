"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Reveal } from "@/components/landing/reveal"
import { useDevices } from "@/hooks/use-devices"

export function LiveProofCta() {
  const { devices, isLoading } = useDevices()
  const live = devices.filter((d) => d.deregisteredAt === 0n).length

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12">
      <div
        className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-z-border bg-cover bg-center p-10 sm:p-12"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(10,11,13,0.88), rgba(10,11,13,0.55)), url('/design/device-hardware.jpg')",
        }}
      >
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-z-alive/80">
            Live proof
          </div>
          <Reveal as="h3" className="mb-2.5 text-2xl font-semibold tracking-tight text-z-alive sm:text-3xl">
            Watch a device fail live.
          </Reveal>
          <div className="font-mono text-[15px] text-z-text-dim">
            {isLoading ? "reading chain..." : `${live} live / ${devices.length} registered`}
          </div>
        </div>
        <Link
          href="/live"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-z-alive px-7 py-4 text-[15px] font-semibold text-z-bg"
        >
          Open live dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
