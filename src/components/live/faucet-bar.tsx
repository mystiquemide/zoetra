"use client"

import { ExternalLink, X } from "lucide-react"
import { useDismissed } from "@/hooks/use-dismissed"

const DISMISS_KEY = "zoetra_bot_chain_funding_bar_dismissed"

export const BOT_CHAIN_BRIDGE_URL = "https://bridge.botchain.ai"
export const BOT_CHAIN_DEX_URL = "https://dex.botchain.ai"

export function FaucetBar() {
  const { dismissed, dismiss } = useDismissed(DISMISS_KEY)

  if (dismissed) return null

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-z-alive/40 bg-z-alive/10 px-4 py-3 text-sm text-z-alive">
      <span className="flex items-center gap-2">
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        Need BOT on BOT Chain mainnet to register a device, stake, or run heartbeats?{" "}
        <a
          href={BOT_CHAIN_BRIDGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2"
        >
          Bridge funds to BOT Chain
        </a>
        {" "}then{" "}
        <a
          href={BOT_CHAIN_DEX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline underline-offset-2"
        >
          swap for BOT on the DEX
        </a>
      </span>
      <button
        onClick={dismiss}
        aria-label="Dismiss BOT Chain funding notice"
        className="flex shrink-0 text-z-alive/70 hover:text-z-alive"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
