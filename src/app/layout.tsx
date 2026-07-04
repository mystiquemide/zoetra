import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Nav } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"
import { ToastProvider } from "@/components/ui/toast"
import { Web3Provider } from "@/components/web3/web3-provider"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Zoetra — Uptime you can slash",
  description:
    "A permissionless, on-chain heartbeat SLA registry for DePIN devices. Open to any device from any network, only possible on BOT Chain.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-z-bg text-z-text flex flex-col">
        <Web3Provider>
          <ToastProvider>
            <Nav />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </ToastProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
