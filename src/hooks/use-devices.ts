"use client"

import { useReadContract } from "wagmi"
import { activeChain } from "@/lib/chains"
import { REGISTRY_ADDRESS, registryAbi, type DeviceView, type RawDeviceTuple } from "@/lib/registry"

const MAX_DEVICES = 50

export function useDevices() {
  const { data, isLoading, isError, dataUpdatedAt } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: "getDevices",
    args: [0n, BigInt(MAX_DEVICES)],
    chainId: activeChain.id,
    query: {
      refetchInterval: 2000,
    },
  })

  const devices: DeviceView[] = []
  if (data) {
    const [ids, list, scores] = data as readonly [
      readonly bigint[],
      readonly RawDeviceTuple[],
      readonly number[],
    ]
    for (let i = 0; i < ids.length; i++) {
      const d = list[i]
      if (d.operator === "0x0000000000000000000000000000000000000000") continue
      devices.push({
        id: ids[i],
        operator: d.operator,
        stake: d.stake,
        registeredAt: d.registeredAt,
        windowStart: d.windowStart,
        lastBeat: d.lastBeat,
        deregisteredAt: d.deregisteredAt,
        lastSlashAt: d.lastSlashAt,
        intervalSec: d.intervalSec,
        beatsCurr: d.beatsCurr,
        beatsPrev: d.beatsPrev,
        slaBps: d.slaBps,
        name: d.name,
        score: scores[i],
      })
    }
  }

  return { devices, isLoading, isError, updatedAt: dataUpdatedAt }
}
