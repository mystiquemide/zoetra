"use client"

import { useBlockNumber } from "wagmi"
import { Activity, Cpu, Scissors, Blocks } from "lucide-react"
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
    { label: "Heartbeats (session)", value: beats.toLocaleString(), icon: Activity },
    { label: "Active devices", value: `${activeDevices}/${totalDevices}`, icon: Cpu },
    { label: "Slashes executed", value: slashes.toLocaleString(), icon: Scissors },
    {
      label: `${activeChain.name} block`,
      value: blockNumber ? blockNumber.toLocaleString() : "--",
      icon: Blocks,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} className="border-z-border bg-z-surface p-4">
          <div className="flex items-center gap-2 text-z-text-dim">
            <tile.icon className="h-4 w-4" />
            <span className="text-xs">{tile.label}</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums text-z-text">
            {tile.value}
          </div>
        </Card>
      ))}
    </div>
  )
}
