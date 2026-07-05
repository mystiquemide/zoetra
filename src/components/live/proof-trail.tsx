"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Activity, Scissors, Plus } from "lucide-react"
import type { FeedEntry } from "@/hooks/use-live-feed"
import { cn } from "@/lib/utils"

const ICON = { beat: Activity, slashed: Scissors, registered: Plus }
const COLOR = { beat: "text-z-alive", slashed: "text-z-bleed", registered: "text-z-alive" }

export function ProofTrail({ deviceId, entries }: { deviceId: bigint; entries: FeedEntry[] }) {
  const [open, setOpen] = useState(false)
  const mine = entries.filter((e) => e.deviceId === deviceId).slice(0, 6)

  return (
    <div className="mt-3 border-t border-z-border pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-xs text-z-text-dim hover:text-z-text"
      >
        <span>Proof trail ({mine.length})</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1.5">
          {mine.length === 0 && <span className="text-xs text-z-text-dim">No events observed yet this session.</span>}
          {mine.map((e) => {
            const Icon = ICON[e.kind]
            return (
              <div key={e.key} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-z-text-dim">
                  <Icon className={cn("h-3 w-3", COLOR[e.kind])} />
                  <span>{e.detail}</span>
                </div>
                <Link href={`/tx/${e.txHash}`} className="font-mono text-z-alive hover:underline">
                  {e.txHash.slice(0, 8)}
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
