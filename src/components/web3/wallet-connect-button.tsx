"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Wallet, AlertTriangle } from "lucide-react"

/** RainbowKit's default <ConnectButton /> renders its own markup with its own
 * font stack and weight, so it never quite matches the rest of the header row
 * no matter what theme colors are passed in. ConnectButton.Custom hands us
 * the raw connection state and lets us render it with our own button, so it
 * reads as one consistent header instead of a foreign widget bolted on. */
export function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        if (!ready) {
          return (
            <button
              disabled
              className="flex items-center gap-2 rounded-[10px] border border-z-border bg-z-surface px-[18px] py-[11px] text-sm font-semibold text-z-text-dim opacity-60"
            >
              <Wallet className="h-[15px] w-[15px]" />
              Connect wallet
            </button>
          )
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="flex items-center gap-2 rounded-[10px] border border-z-border bg-z-surface px-[18px] py-[11px] text-sm font-semibold text-z-text"
            >
              <Wallet className="h-[15px] w-[15px]" />
              Connect wallet
            </button>
          )
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="flex items-center gap-2 rounded-[10px] border border-z-bleed/40 bg-z-bleed/10 px-[18px] py-[11px] text-sm font-semibold text-z-bleed"
            >
              <AlertTriangle className="h-[15px] w-[15px]" />
              Wrong network
            </button>
          )
        }

        return (
          <button
            onClick={openAccountModal}
            className="flex items-center gap-2 rounded-[10px] border border-z-alive/40 bg-z-alive/10 px-[18px] py-[11px] font-mono text-sm font-semibold text-z-alive"
          >
            <Wallet className="h-[15px] w-[15px]" />
            {account.displayName}
          </button>
        )
      }}
    </ConnectButton.Custom>
  )
}
