import { connectorsForWallets } from "@rainbow-me/rainbowkit"
import { injectedWallet, coinbaseWallet } from "@rainbow-me/rainbowkit/wallets"
import { createConfig, http } from "wagmi"
import { botChainTestnet, botChainMainnet } from "@/lib/chains"

// Deliberately no WalletConnect connector. RainbowKit's getDefaultConfig
// requires a real WalletConnect Cloud project id even to boot; without one
// (and we don't have a registered project) its SDK throws a console error on
// every page load trying to fetch remote config for a fake id. Injected
// wallets (MetaMask, Coinbase extension, Rabby, Brave, etc.) need no project
// id and no remote fetch at all, and cover the entire demo flow.
const connectors = connectorsForWallets(
  [
    {
      groupName: "Installed",
      wallets: [injectedWallet, coinbaseWallet],
    },
  ],
  {
    appName: "Zoetra",
    projectId: "unused-no-walletconnect",
  }
)

export const config = createConfig({
  connectors,
  chains: [botChainTestnet, botChainMainnet],
  transports: {
    [botChainTestnet.id]: http(),
    [botChainMainnet.id]: http(),
  },
  ssr: true,
})
