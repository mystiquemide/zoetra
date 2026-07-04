"use client"

import Link from "next/link"
import { Fingerprint } from "lucide-react"
import { Card } from "@/components/ui/card"
import { CopyButton } from "@/components/ui/copy-button"
import { activeChain } from "@/lib/chains"
import { REGISTRY_ADDRESS } from "@/lib/registry"
import { useVerification } from "@/hooks/use-verification"

export function VerificationPanel({ deviceCount }: { deviceCount: number }) {
  const { hasBytecode, bytecodeSize, bytecodeLoading, blockNumber } = useVerification()

  const rows: Array<[string, React.ReactNode]> = [
    ["Network", activeChain.name],
    [
      "Contract",
      <span key="addr" className="inline-flex items-center gap-1.5">
        <Link href={`/address/${REGISTRY_ADDRESS}`} className="font-mono text-z-accent hover:underline">
          {REGISTRY_ADDRESS.slice(0, 10)}...{REGISTRY_ADDRESS.slice(-6)}
        </Link>
        <CopyButton value={REGISTRY_ADDRESS} />
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
      "Details",
      <Link key="details" href={`/address/${REGISTRY_ADDRESS}`} className="text-z-accent hover:underline">
        view contract activity
      </Link>,
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
