"use client"

import { useCallback, useRef, useState } from "react"
import { useWatchContractEvent } from "wagmi"
import { activeChain } from "@/lib/chains"
import { REGISTRY_ADDRESS, registryAbi } from "@/lib/registry"

export type FeedKind = "beat" | "slashed" | "registered"

export interface FeedEntry {
  key: string
  kind: FeedKind
  deviceId: bigint
  txHash: `0x${string}`
  timestamp: number
  detail: string
}

const MAX_ENTRIES = 50

export function useLiveFeed() {
  const [entries, setEntries] = useState<FeedEntry[]>([])
  const [counts, setCounts] = useState({ beat: 0, slashed: 0, registered: 0 })
  const seen = useRef(new Set<string>())

  const push = useCallback((entry: FeedEntry) => {
    if (seen.current.has(entry.key)) return
    seen.current.add(entry.key)
    setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES))
    setCounts((prev) => ({ ...prev, [entry.kind]: prev[entry.kind] + 1 }))
  }, [])

  useWatchContractEvent({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    eventName: "Beat",
    chainId: activeChain.id,
    pollingInterval: 1000,
    onLogs(logs) {
      for (const log of logs) {
        const { id, score } = log.args as { id: bigint; timestamp: bigint; score: number }
        push({
          key: `${log.transactionHash}-${log.logIndex}`,
          kind: "beat",
          deviceId: id,
          txHash: log.transactionHash!,
          timestamp: Date.now(),
          detail: `score ${(score / 100).toFixed(1)}%`,
        })
      }
    },
  })

  useWatchContractEvent({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    eventName: "Slashed",
    chainId: activeChain.id,
    pollingInterval: 1000,
    onLogs(logs) {
      for (const log of logs) {
        const { id, amount, bounty } = log.args as {
          id: bigint
          caller: `0x${string}`
          amount: bigint
          bounty: bigint
          score: number
        }
        push({
          key: `${log.transactionHash}-${log.logIndex}`,
          kind: "slashed",
          deviceId: id,
          txHash: log.transactionHash!,
          timestamp: Date.now(),
          detail: `slashed ${(Number(amount) / 1e18).toFixed(4)} BOT (bounty ${(Number(bounty) / 1e18).toFixed(4)})`,
        })
      }
    },
  })

  useWatchContractEvent({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    eventName: "Registered",
    chainId: activeChain.id,
    pollingInterval: 1000,
    onLogs(logs) {
      for (const log of logs) {
        const { id, name } = log.args as { id: bigint; operator: `0x${string}`; name: string }
        push({
          key: `${log.transactionHash}-${log.logIndex}`,
          kind: "registered",
          deviceId: id,
          txHash: log.transactionHash!,
          timestamp: Date.now(),
          detail: `registered "${name}"`,
        })
      }
    },
  })

  return { entries, counts }
}
