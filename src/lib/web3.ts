import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { botChainTestnet, botChainMainnet } from "@/lib/chains"

// RainbowKit requires a non-empty WalletConnect Cloud project id to boot at all,
// even for wallets that never touch WalletConnect (MetaMask/injected work fine
// without one). Falls back to a placeholder so the app builds and injected
// wallets connect; set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID for real WC support.
export const config = getDefaultConfig({
  appName: "Zoetra",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "00000000000000000000000000000000",
  chains: [botChainTestnet, botChainMainnet],
  ssr: true,
})
