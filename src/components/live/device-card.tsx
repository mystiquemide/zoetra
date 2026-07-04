"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, AlertTriangle, ShieldAlert, PowerOff, Scissors, ExternalLink } from "lucide-react"
import { useAccount, useWriteContract } from "wagmi"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { activeChain, explorerAddressUrl } from "@/lib/chains"
import { REGISTRY_ADDRESS, registryAbi, type DeviceView } from "@/lib/registry"
import { useToast } from "@/components/ui/toast"
import { useClockTick } from "@/hooks/use-clock-tick"
import { ProofTrail } from "@/components/live/proof-trail"
import type { FeedEntry } from "@/hooks/use-live-feed"
import { computeScoreDetail, secondsUntilBreach, secondsUntilNextHeartbeatDue } from "@/lib/score-math"

type Status = "healthy" | "at-risk" | "breached" | "deregistered"

function statusOf(score: number, slaBps: number, dead: boolean): Status {
  if (dead) return "deregistered"
  if (score < slaBps) return "breached"
  if (score < 9700) return "at-risk"
  return "healthy"
}

const STATUS_META: Record<Status, { label: string; icon: typeof CheckCircle2; color: string }> = {
  healthy: { label: "Healthy", icon: CheckCircle2, color: "text-z-alive" },
  "at-risk": { label: "At risk", icon: AlertTriangle, color: "text-z-warn" },
  breached: { label: "Breached", icon: ShieldAlert, color: "text-z-bleed" },
  deregistered: { label: "Deregistered", icon: PowerOff, color: "text-z-text-dim" },
}

function slashDisabledReason(isConnected: boolean, canSlash: boolean, dead: boolean): string | undefined {
  if (dead) return "Device is deregistered"
  if (!canSlash) return "Score is still above its SLA threshold"
  if (!isConnected) return "Connect a wallet to slash this device"
  return undefined
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}

export function DeviceCard({ device, feedEntries }: { device: DeviceView; feedEntries: FeedEntry[] }) {
  const { isConnected } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()
  const { toast } = useToast()
  const nowSec = useClockTick()

  const [pulsing, setPulsing] = useState(false)
  const lastBeatRef = useRef(device.lastBeat)

  useEffect(() => {
    if (device.lastBeat !== lastBeatRef.current) {
      lastBeatRef.current = device.lastBeat
      setPulsing(true)
      const t = setTimeout(() => setPulsing(false), 600)
      return () => clearTimeout(t)
    }
  }, [device.lastBeat])

  // Adjust state during render (React's recommended pattern for deriving state
  // from a prop change) rather than an effect, which would cause an extra
  // cascading render on every score update.
  const [scoreHistory, setScoreHistory] = useState(() => ({
    lastScore: device.score,
    samples: [device.score],
  }))
  if (device.score !== scoreHistory.lastScore) {
    setScoreHistory({
      lastScore: device.score,
      samples: [...scoreHistory.samples.slice(-39), device.score],
    })
  }
  const history = scoreHistory.samples

  const dead = device.deregisteredAt !== 0n
  const canSlash = !dead && device.score < device.slaBps
  const status = statusOf(device.score, device.slaBps, dead)
  const meta = STATUS_META[status]
  const StatusIcon = meta.icon

  const scoreInputs = {
    intervalSec: device.intervalSec,
    registeredAt: Number(device.registeredAt),
    windowStart: Number(device.windowStart),
    beatsPrev: device.beatsPrev,
    beatsCurr: device.beatsCurr,
  }
  const { received, expected } = computeScoreDetail(scoreInputs, nowSec)
  const lastBeatSec = Number(device.lastBeat)

  // Gate the countdown text on the authoritative on-chain status (healthy/
  // at-risk/breached), not a latency-based "is it on schedule" heuristic:
  // real confirmation latency routinely exceeds a fixed multiple of the
  // heartbeat interval, so a timing-only check would flash a "Slashable in
  // ~Xs" projection on a device the chain still reports as 100% healthy.
  let timing: string
  if (dead) {
    timing = "Deregistered"
  } else if (status === "breached") {
    timing = "Slashable now"
  } else if (status === "healthy") {
    const dueIn = secondsUntilNextHeartbeatDue(device.intervalSec, lastBeatSec, nowSec)
    timing = dueIn > 0 ? `Next heartbeat due in ${formatSeconds(dueIn)}` : "Next heartbeat any moment"
  } else {
    const breachIn = secondsUntilBreach(scoreInputs, device.slaBps, nowSec)
    timing = breachIn === null || breachIn <= 0 ? "Monitoring..." : `Slashable in ~${formatSeconds(breachIn)}`
  }

  const stakeBot = Number(device.stake) / 1e18
  const atRiskBot = stakeBot * 0.2
  const bountyBot = atRiskBot * 0.1

  const colorClass = meta.color

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
                status === "breached" && "throb"
              )}
              style={{ backgroundColor: "currentColor" }}
            />
          </span>
          <div>
            <div className="font-medium text-z-text">{device.name}</div>
            <div className="font-mono text-xs text-z-text-dim">device #{device.id.toString()}</div>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", colorClass)}>
          <StatusIcon className="h-4 w-4" />
          {meta.label}
        </div>
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

      <div className="mt-3 flex items-center justify-between font-mono text-xs text-z-text-dim">
        <span title="Independent counters, not a fraction: a device can receive more beats than the window strictly expects.">
          {received} recv &middot; {expected} exp
        </span>
        <span className={dead ? undefined : colorClass}>{timing}</span>
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-xs text-z-text-dim">
        <span>stake {stakeBot.toFixed(3)} BOT</span>
        <span>SLA {(device.slaBps / 100).toFixed(0)}%</span>
        <span>every {device.intervalSec}s</span>
      </div>

      <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-z-text-dim">
        <span>at risk {atRiskBot.toFixed(3)} BOT</span>
        <span>bounty {bountyBot.toFixed(3)} BOT</span>
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
          title={slashDisabledReason(isConnected, canSlash, dead)}
          className={cn(
            "gap-1.5 border-z-bleed text-z-bleed hover:bg-z-bleed/10 disabled:opacity-40"
          )}
        >
          <Scissors className="h-3.5 w-3.5" />
          {isPending ? "Slashing..." : "Slash"}
        </Button>
      </div>

      <ProofTrail deviceId={device.id} entries={feedEntries} />
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
