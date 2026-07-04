"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { config } from "@/lib/web3"

const queryClient = new QueryClient()

const zoetraTheme = darkTheme({
  accentColor: "#2DD4A7",
  accentColorForeground: "#0A0B0D",
  borderRadius: "medium",
  overlayBlur: "small",
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={zoetraTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
