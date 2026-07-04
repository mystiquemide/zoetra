import { decodeFunctionData, decodeEventLog, formatEther, type Hex } from "viem"
import { registryAbi } from "@/lib/registry"
import type { BlockscoutLog } from "@/lib/blockscout"

// Decodes calls/events against our own known ABI rather than trusting
// Blockscout's decoded_input (which is null for this contract since it isn't
// verified on their end). We wrote the contract, we don't need their
// verification step to read it correctly.

export interface DecodedCall {
  functionName: string
  summary: string
}

export function decodeMethodCall(rawInput: string): DecodedCall | null {
  if (!rawInput || rawInput === "0x") return null
  try {
    const { functionName, args } = decodeFunctionData({ abi: registryAbi, data: rawInput as Hex })
    return { functionName, summary: summarizeCall(functionName, args) }
  } catch {
    return null
  }
}

function summarizeCall(functionName: string, args: readonly unknown[]): string {
  switch (functionName) {
    case "register": {
      const [name, intervalSec, slaBps] = args as [string, number, number]
      return `Register "${name}", every ${intervalSec}s, SLA ${(slaBps / 100).toFixed(0)}%`
    }
    case "heartbeat":
      return `Heartbeat for device #${args[0]}`
    case "slash":
      return `Slash device #${args[0]}`
    case "deregister":
      return `Deregister device #${args[0]}`
    case "withdraw":
      return `Withdraw stake for device #${args[0]}`
    default:
      return functionName
  }
}

export interface DecodedLog {
  eventName: string
  summary: string
}

export function decodeLog(log: BlockscoutLog): DecodedLog | null {
  const topics = log.topics.filter((t): t is string => t !== null) as [Hex, ...Hex[]]
  if (topics.length === 0) return null
  try {
    const { eventName, args } = decodeEventLog({
      abi: registryAbi,
      data: log.data as Hex,
      topics,
    })
    return { eventName, summary: summarizeLog(eventName, args as Record<string, unknown>) }
  } catch {
    return null
  }
}

function summarizeLog(eventName: string, args: Record<string, unknown>): string {
  switch (eventName) {
    case "Registered":
      return `Device #${args.id} "${args.name}" registered, staked ${formatEther(args.stake as bigint)} BOT`
    case "Beat":
      return `Beat recorded, score ${(Number(args.score) / 100).toFixed(1)}%`
    case "Slashed":
      return `Slashed ${formatEther(args.amount as bigint)} BOT (bounty ${formatEther(args.bounty as bigint)} BOT), score was ${(Number(args.score) / 100).toFixed(1)}%`
    case "Deregistered":
      return `Device #${args.id} deregistered`
    case "Withdrawn":
      return `Withdrew ${formatEther(args.amount as bigint)} BOT`
    default:
      return eventName
  }
}
