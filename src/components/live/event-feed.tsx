"use client"

import { Activity, Scissors, Plus, ExternalLink } from "lucide-react"
import { explorerTxUrl } from "@/lib/chains"
import type { FeedEntry } from "@/hooks/use-live-feed"
import { cn } from "@/lib/utils"

const iconFor = {
  beat: Activity,
  slashed: Scissors,
  registered: Plus,
}

const colorFor = {
  beat: "text-z-alive",
  slashed: "text-z-bleed",
  registered: "text-z-accent",
}

export function EventFeed({ entries }: { entries: FeedEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-z-text-dim">
        Waiting for the first heartbeat...
      </div>
    )
  }

  return (
    <div className="flex max-h-96 flex-col divide-y divide-z-border overflow-y-auto">
      {entries.map((entry) => {
        const Icon = iconFor[entry.kind]
        return (
          <div key={entry.key} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className={cn("h-4 w-4 shrink-0", colorFor[entry.kind])} />
              <span className="text-z-text-dim">device #{entry.deviceId.toString()}</span>
              <span className="truncate text-z-text">{entry.detail}</span>
            </div>
            <a
              href={explorerTxUrl(entry.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 font-mono text-xs text-z-accent hover:underline"
            >
              {entry.txHash.slice(0, 8)} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )
      })}
    </div>
  )
}
