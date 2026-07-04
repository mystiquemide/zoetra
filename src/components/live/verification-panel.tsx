"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CopyButton } from "@/components/ui/copy-button"
import { activeChain, explorerAddressUrl } from "@/lib/chains"
import { REGISTRY_ADDRESS } from "@/lib/registry"
import { useVerification } from "@/hooks/use-verification"

export function VerificationPanel({ deviceCount }: { deviceCount: number }) {
  const { hasBytecode, bytecodeSize, bytecodeLoading, blockNumber } = useVerification()

  const rows: Array<[string, React.ReactNode]> = [
    ["Network", activeChain.name],
    [
      "Contract",
      <span key="addr" className="inline-flex items-center gap-1.5 text-z-alive">
        <Link href={`/address/${REGISTRY_ADDRESS}`} className="font-mono hover:underline">
          {REGISTRY_ADDRESS.slice(0, 10)}...{REGISTRY_ADDRESS.slice(-6)}
        </Link>
        <CopyButton value={REGISTRY_ADDRESS} className="text-z-alive hover:text-z-alive" />
      </span>,
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
        className="flex items-center gap-1.5 text-z-alive"
      >
        <ExternalLink className="h-3 w-3" />
      </a>,
    ],
  ]

  return (
    <Card id="tour-verify-panel" className="border-z-border bg-z-surface p-5">
      <div className="mb-3.5 text-sm font-semibold text-z-text">Do not trust this dashboard</div>
      <div className="flex flex-col gap-2.5 text-[13px]">
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
