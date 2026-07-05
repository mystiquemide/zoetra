"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ArrowLeft, Code2 } from "lucide-react"
import { cn } from "@/lib/utils"

const SIMPLE_NAV_ROUTES = ["/docs", "/terms", "/privacy"]

export function Nav() {
  const pathname = usePathname()
  // The landing page ships its own transparent nav bar layered over its hero
  // image (see components/landing/hero.tsx) to match the sourced design.
  if (pathname === "/") return null

  const isSimple = SIMPLE_NAV_ROUTES.includes(pathname)
  const isDetailPage = pathname.startsWith("/address/") || pathname.startsWith("/tx/")

  const navLinkClass = (href: string) =>
    cn("text-sm", pathname === href ? "font-semibold text-z-text" : "font-medium text-z-alive")

  return (
    <header className="fixed top-0 z-40 w-full border-b border-z-border bg-z-bg/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <Image src="/design/zoetra-logo.png" alt="Zoetra" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="text-z-text"><span className="text-z-alive">Zoe</span>tra</span>
        </Link>

        {isSimple ? (
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-z-alive">
            <ArrowLeft className="h-[15px] w-[15px]" /> Back home
          </Link>
        ) : (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:gap-x-8">
            <Link href="/live" className={navLinkClass("/live")}>
              Live dashboard
            </Link>
            <Link href="/demo" className={navLinkClass("/demo")}>
              Demo
            </Link>
            {!isDetailPage && (
              <a
                href="https://github.com/mystiquemide/zoetra"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-z-alive"
              >
                <Code2 className="h-[15px] w-[15px]" />
                GitHub
              </a>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
