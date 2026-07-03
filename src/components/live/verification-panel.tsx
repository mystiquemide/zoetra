"use client"

import { useState } from "react"
import { Fingerprint, Copy, Check, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { activeChain, explorerAddressUrl } from "@/lib/chains"
import { REGISTRY_ADDRESS } from "@/lib/registry"
import { useVerification } from "@/hooks/use-verification"

export function VerificationPanel({ deviceCount }: { deviceCount: number }) {
  const { hasBytecode, bytecodeSize, bytecodeLoading, blockNumber } = useVerification()
  const [copied, setCopied] = useState(false)

  function copyAddress() {
    navigator.clipboard.writeText(REGISTRY_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const rows: Array<[string, React.ReactNode]> = [
    ["Network", activeChain.name],
    [
      "Contract",
      <button
        key="addr"
        onClick={copyAddress}
        className="inline-flex items-center gap-1.5 font-mono text-z-accent hover:underline"
      >
        {REGISTRY_ADDRESS.slice(0, 10)}...{REGISTRY_ADDRESS.slice(-6)}
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>,
    ],
    [
      "Bytecode",
      bytecodeLoading ? (
        "checking..."
      ) : hasBytecode ? (
        <span className="text-z-alive">detected, {bytecodeSize.toLocaleString()} bytes</span>
      ) : (
        <span className="text-z-bleed">not found</span>
      ),
    ],
    ["Devices registered", deviceCount.toString()],
    ["Latest block", blockNumber ? blockNumber.toLocaleString() : "--"],
    [
      "Explorer",
      <a
        key="explorer"
        href={explorerAddressUrl(REGISTRY_ADDRESS)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-z-accent hover:underline"
      >
        view on {activeChain.blockExplorers.default.name} <ExternalLink className="h-3 w-3" />
      </a>,
    ],
  ]

  return (
    <Card className="border-z-border bg-z-surface">
      <div className="mb-4 flex items-center gap-2 text-z-text">
        <Fingerprint className="h-4 w-4 text-z-accent" />
        <span className="font-medium">On-chain verification</span>
      </div>
      <p className="mb-4 text-xs text-z-text-dim">
        Don&apos;t trust this dashboard. Every field below is read live from the chain, reproduce it yourself with any RPC client.
      </p>
      <div className="grid gap-2.5 font-mono text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-z-text-dim">{label}</span>
            <span className="text-z-text">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
