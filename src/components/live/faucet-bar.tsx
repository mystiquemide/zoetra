"use client"

import { Droplet, X } from "lucide-react"
import { useDismissed } from "@/hooks/use-dismissed"

const DISMISS_KEY = "zoetra_faucet_bar_dismissed"

export const FAUCET_URL = "https://faucet.botchain.ai/"

export function FaucetBar() {
  const { dismissed, dismiss } = useDismissed(DISMISS_KEY)

  if (dismissed) return null

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-z-alive/40 bg-z-alive/10 px-4 py-3 text-sm text-z-alive">
      <span className="flex items-center gap-2">
        <Droplet className="h-3.5 w-3.5 shrink-0" />
        Need testnet BOT to register a device, stake, or run heartbeats?{" "}
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2"
        >
          Get free BOT from the faucet
        </a>
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss faucet notice"
        className="flex shrink-0 text-z-alive/70 hover:text-z-alive"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
