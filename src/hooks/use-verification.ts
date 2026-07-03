"use client"

import { useBytecode, useBlockNumber } from "wagmi"
import { activeChain } from "@/lib/chains"
import { REGISTRY_ADDRESS } from "@/lib/registry"

/** Genuine on-chain proof that the registry is a deployed contract, not a
 * mock: reads the actual bytecode at the address via eth_getCode. */
export function useVerification() {
  const { data: bytecode, isLoading: bytecodeLoading } = useBytecode({
    address: REGISTRY_ADDRESS,
    chainId: activeChain.id,
  })
  const { data: blockNumber } = useBlockNumber({ chainId: activeChain.id, watch: true })

  const hasBytecode = !bytecodeLoading && !!bytecode && bytecode !== "0x"
  const bytecodeSize = bytecode ? (bytecode.length - 2) / 2 : 0

  return { hasBytecode, bytecodeSize, bytecodeLoading, blockNumber }
}
