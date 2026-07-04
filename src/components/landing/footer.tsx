import Link from "next/link"
import Image from "next/image"
import { Code2, X, Mail } from "lucide-react"
import { REGISTRY_ADDRESS } from "@/lib/registry"

export function LandingFooter() {
  return (
    <footer className="border-t border-z-alive">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-12 py-10">
        <div className="flex items-center gap-2.5">
          <Image src="/design/zoetra-logo.png" alt="Zoetra" width={20} height={20} className="h-5 w-5 object-contain" />
          <span className="text-[13px] text-z-alive">Zoetra &middot; permissionless uptime SLAs for DePIN devices</span>
        </div>
        <div className="flex flex-wrap gap-7">
          <a
            href="https://github.com/mystiquemide/zoetra"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-z-alive"
          >
            <Code2 className="h-4 w-4" /> GitHub
          </a>
          <Link href={`/address/${REGISTRY_ADDRESS}`} className="text-[13px] text-z-alive">
            Contract on BOTScan
          </Link>
          <a
            href="https://dev-docs.botchain.ai/docs/Developers/quick-guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-z-alive"
          >
            BOT Chain docs
          </a>
          <a
            href="https://x.com/BOTChain_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-z-alive"
          >
            @BOTChain_ai
          </a>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-z-border px-12 py-4">
        <span className="text-xs text-z-alive">&copy; 2026 Zoetra. All rights reserved.</span>
        <div className="flex flex-wrap items-center gap-6">
          <a href="https://x.com/Zoetra_app" target="_blank" rel="noopener noreferrer" aria-label="X" className="flex items-center text-z-alive">
            <X className="h-[15px] w-[15px]" />
          </a>
          <a href="mailto:" aria-label="Email" className="flex items-center text-z-alive">
            <Mail className="h-[15px] w-[15px]" />
          </a>
          <Link href="/docs" className="text-xs text-z-alive">Docs</Link>
          <Link href="/terms" className="text-xs text-z-alive">Terms</Link>
          <Link href="/privacy" className="text-xs text-z-alive">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}
