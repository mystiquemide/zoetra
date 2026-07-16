export const REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  "0x42233C40D7bE6ce4cECE6736D8bC0381d9Ea17Ac") as `0x${string}`

export const WINDOW_BEATS = 20
export const MIN_STAKE_BOT = 0.05

export const registryAbi = [
  {
    type: "function",
    name: "register",
    stateMutability: "payable",
    inputs: [
      { name: "name", type: "string" },
      { name: "intervalSec", type: "uint32" },
      { name: "slaBps", type: "uint16" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "heartbeat",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "scoreOf",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint16" }],
  },
  {
    type: "function",
    name: "slash",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "deregister",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "deviceCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getDevices",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [
      { name: "ids", type: "uint256[]" },
      {
        name: "list",
        type: "tuple[]",
        components: [
          { name: "operator", type: "address" },
          { name: "stake", type: "uint128" },
          { name: "registeredAt", type: "uint64" },
          { name: "windowStart", type: "uint64" },
          { name: "lastBeat", type: "uint64" },
          { name: "deregisteredAt", type: "uint64" },
          { name: "lastSlashAt", type: "uint64" },
          { name: "intervalSec", type: "uint32" },
          { name: "beatsCurr", type: "uint32" },
          { name: "beatsPrev", type: "uint32" },
          { name: "slaBps", type: "uint16" },
          { name: "name", type: "string" },
        ],
      },
      { name: "scores", type: "uint16[]" },
    ],
  },
  {
    type: "event",
    name: "Registered",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "operator", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "intervalSec", type: "uint32", indexed: false },
      { name: "slaBps", type: "uint16", indexed: false },
      { name: "stake", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Beat",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
      { name: "score", type: "uint16", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Slashed",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "caller", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "bounty", type: "uint256", indexed: false },
      { name: "score", type: "uint16", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Deregistered",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "operator", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const

export interface RawDeviceTuple {
  operator: `0x${string}`
  stake: bigint
  registeredAt: bigint
  windowStart: bigint
  lastBeat: bigint
  deregisteredAt: bigint
  lastSlashAt: bigint
  intervalSec: number
  beatsCurr: number
  beatsPrev: number
  slaBps: number
  name: string
}

export interface DeviceView {
  id: bigint
  operator: `0x${string}`
  stake: bigint
  registeredAt: bigint
  windowStart: bigint
  lastBeat: bigint
  deregisteredAt: bigint
  lastSlashAt: bigint
  intervalSec: number
  beatsCurr: number
  beatsPrev: number
  slaBps: number
  name: string
  score: number
}
