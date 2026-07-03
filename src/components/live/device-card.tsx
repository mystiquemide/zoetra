"use client"

import { useEffect, useRef, useState } from "react"
import { HeartPulse, Scissors, ExternalLink } from "lucide-react"
import { useAccount, useWriteContract } from "wagmi"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { activeChain, explorerAddressUrl } from "@/lib/chains"
import { REGISTRY_ADDRESS, registryAbi, type DeviceView } from "@/lib/registry"
import { useToast } from "@/components/ui/toast"

function scoreState(score: number, slaBps: number): "alive" | "warn" | "bleed" {
  if (score < slaBps) return "bleed"
  if (score < 9700) return "warn"
  return "alive"
}

export function DeviceCard({ device }: { device: DeviceView }) {
  const { isConnected } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()
  const { toast } = useToast()

  const [pulsing, setPulsing] = useState(false)
  const lastBeatRef = useRef(device.lastBeat)
  const [history, setHistory] = useState<number[]>([device.score])

  useEffect(() => {
    if (device.lastBeat !== lastBeatRef.current) {
      lastBeatRef.current = device.lastBeat
      setPulsing(true)
      const t = setTimeout(() => setPulsing(false), 600)
      return () => clearTimeout(t)
    }
  }, [device.lastBeat])

  useEffect(() => {
    setHistory((prev) => [...prev.slice(-39), device.score])
  }, [device.score])

  const state = scoreState(device.score, device.slaBps)
  const dead = device.deregisteredAt !== 0n
  const canSlash = !dead && device.score < device.slaBps

  const colorClass =
    state === "alive" ? "text-z-alive" : state === "warn" ? "text-z-warn" : "text-z-bleed"

  async function handleSlash() {
    try {
      const hash = await writeContractAsync({
        address: REGISTRY_ADDRESS,
        abi: registryAbi,
        functionName: "slash",
        args: [device.id],
        chainId: activeChain.id,
      })
      toast(`Slash submitted: ${hash.slice(0, 10)}...`, "success")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Slash failed"
      toast(message, "error")
    }
  }

  const points = sparklinePoints(history)

  return (
    <Card className="relative overflow-visible border-z-border bg-z-surface">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3 items-center justify-center">
            {pulsing && <span className={cn("pulse-ring absolute inline-flex h-3 w-3", colorClass)} />}
            <span
              className={cn(
                "relative inline-flex h-3 w-3 rounded-full",
                colorClass,
                state === "bleed" && "throb"
              )}
              style={{ backgroundColor: "currentColor" }}
            />
          </span>
          <div>
            <div className="font-medium text-z-text">{device.name}</div>
            <div className="font-mono text-xs text-z-text-dim">device #{device.id.toString()}</div>
          </div>
        </div>
        <HeartPulse className={cn("h-5 w-5", colorClass)} />
      </div>

      <div className={cn("mt-4 font-mono text-4xl font-semibold tabular-nums", colorClass)}>
        {(device.score / 100).toFixed(1)}%
      </div>

      <svg viewBox="0 0 100 24" className="mt-3 h-6 w-full" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={colorClass}
        />
      </svg>

      <div className="mt-4 flex items-center justify-between font-mono text-xs text-z-text-dim">
        <span>stake {(Number(device.stake) / 1e18).toFixed(3)} BOT</span>
        <span>SLA {(device.slaBps / 100).toFixed(0)}%</span>
        <span>every {device.intervalSec}s</span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <a
          href={explorerAddressUrl(device.operator)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-z-accent hover:underline"
        >
          operator <ExternalLink className="h-3 w-3" />
        </a>
        <Button
          variant="outline"
          size="sm"
          disabled={!isConnected || !canSlash || isPending}
          onClick={handleSlash}
          className={cn(
            "gap-1.5 border-z-bleed text-z-bleed hover:bg-z-bleed/10 disabled:opacity-40"
          )}
        >
          <Scissors className="h-3.5 w-3.5" />
          {isPending ? "Slashing..." : "Slash"}
        </Button>
      </div>
    </Card>
  )
}

function sparklinePoints(history: number[]): string {
  if (history.length < 2) return "0,24 100,24"
  const max = 10000
  return history
    .map((score, i) => {
      const x = (i / (history.length - 1)) * 100
      const y = 24 - (score / max) * 24
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")
}
