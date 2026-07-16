import { connectorsForWallets } from "@rainbow-me/rainbowkit"
import { injectedWallet, coinbaseWallet, metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets"
import { createConfig, http } from "wagmi"
import { botChainMainnet } from "@/lib/chains"

// Real WalletConnect Cloud project (cloud.reown.com), registered specifically
// to support BO Wallet, the mobile-only wallet BOT Chain's own dev docs list
// alongside MetaMask. BO Wallet has no browser extension, so it can only
// connect via WalletConnect QR pairing, not injection. Previously this app
// shipped a fake placeholder project id, which threw a console error on every
// load trying to fetch remote config; a real registered id has no such issue.
const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "59c1f24b65c637cdc0c8f94240b74bd6"

const connectors = connectorsForWallets(
  [
    {
      groupName: "Installed",
      wallets: [injectedWallet, metaMaskWallet, coinbaseWallet],
    },
    {
      groupName: "Mobile",
      wallets: [walletConnectWallet], // scan-to-connect: BO Wallet, Trust Wallet, Rainbow mobile, etc.
    },
  ],
  {
    appName: "Zoetra",
    projectId: WALLETCONNECT_PROJECT_ID,
  }
)

export const config = createConfig({
  connectors,
  chains: [botChainMainnet],
  transports: {
    [botChainMainnet.id]: http(),
  },
  ssr: true,
})
