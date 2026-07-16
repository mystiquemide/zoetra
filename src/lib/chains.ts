import { defineChain } from "viem"

export const botChainMainnet = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.botchain.ai"], webSocket: ["wss://ws-rpc.botchain.ai"] },
  },
  blockExplorers: { default: { name: "BOTScan", url: "https://scan.botchain.ai" } },
})

export const activeChain = botChainMainnet

export function explorerTxUrl(hash: string) {
  return `${activeChain.blockExplorers.default.url}/tx/${hash}`
}

export function explorerAddressUrl(address: string) {
  return `${activeChain.blockExplorers.default.url}/address/${address}`
}
