import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Nav } from "@/components/layout/nav"
import { Footer } from "@/components/layout/footer"
import { MainOffset } from "@/components/layout/main-offset"
import { ToastProvider } from "@/components/ui/toast"
import { Web3Provider } from "@/components/web3/web3-provider"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

const title = "Zoetra — Uptime you can slash"
const description =
  "A permissionless, on-chain heartbeat SLA registry for DePIN devices. Open to any device from any network, only possible on BOT Chain."

export const metadata: Metadata = {
  metadataBase: new URL("https://zoetra.xyz"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://zoetra.xyz",
    siteName: "Zoetra",
    images: [{ url: "/design/zoetra-logo.png", width: 512, height: 512, alt: "Zoetra" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/design/zoetra-logo.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-z-bg text-z-text flex flex-col">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-16 rounded-lg bg-z-alive px-4 py-2 text-sm font-semibold text-z-bg transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Web3Provider>
          <ToastProvider>
            <Nav />
            <MainOffset>{children}</MainOffset>
            <Footer />
          </ToastProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
