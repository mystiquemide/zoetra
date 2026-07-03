"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDevices } from "@/hooks/use-devices"
import { activeChain } from "@/lib/chains"

export function CTA() {
  const { devices, isLoading } = useDevices()
  const active = devices.filter((d) => d.deregisteredAt === 0n).length

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-3xl text-center rounded-2xl border border-z-border bg-z-surface p-12">
        <h2 className="text-3xl font-bold text-z-text">Watch a device fail live.</h2>
        <p className="mt-4 font-mono text-sm text-z-text-dim">
          {isLoading
            ? "reading chain..."
            : `${active} device${active === 1 ? "" : "s"} live on ${activeChain.name} right now`}
        </p>
        <div className="mt-6">
          <Link href="/live">
            <Button size="lg">Open the dashboard</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
