import { defineChain } from "viem"

export const botChainTestnet = defineChain({
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.bohr.life"] } },
  blockExplorers: { default: { name: "BOTScan", url: "https://scan.bohr.life" } },
  testnet: true,
})

export const botChainMainnet = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.botchain.ai"], webSocket: ["wss://ws-rpc.botchain.ai"] },
  },
  blockExplorers: { default: { name: "BOTScan", url: "https://scan.botchain.ai" } },
})

export const activeChain =
  process.env.NEXT_PUBLIC_CHAIN === "mainnet" ? botChainMainnet : botChainTestnet

export function explorerTxUrl(hash: string) {
  return `${activeChain.blockExplorers.default.url}/tx/${hash}`
}

export function explorerAddressUrl(address: string) {
  return `${activeChain.blockExplorers.default.url}/address/${address}`
}
