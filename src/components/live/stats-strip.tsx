"use client"

import { useBlockNumber } from "wagmi"
import { Card } from "@/components/ui/card"
import { activeChain } from "@/lib/chains"

interface StatsStripProps {
  activeDevices: number
  totalDevices: number
  beats: number
  slashes: number
}

export function StatsStrip({ activeDevices, totalDevices, beats, slashes }: StatsStripProps) {
  const { data: blockNumber } = useBlockNumber({ chainId: activeChain.id, watch: true })

  const tiles = [
    { label: "Heartbeats", value: beats.toLocaleString() },
    { label: "Active", value: `${activeDevices} / ${totalDevices}` },
    { label: "Slashes", value: slashes.toLocaleString(), color: slashes > 0 ? "text-z-bleed" : undefined },
    { label: "Block", value: blockNumber ? blockNumber.toLocaleString() : "--" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} className="border-z-border bg-z-surface p-[18px]">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-z-text-dim">
            {tile.label}
          </div>
          <div className={`font-mono text-[26px] font-semibold ${tile.color ?? "text-z-text"}`}>
            {tile.value}
          </div>
        </Card>
      ))}
    </div>
  )
}
