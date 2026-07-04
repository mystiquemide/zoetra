"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  // The landing page ships its own two-row footer (see components/landing/footer.tsx)
  // matching Landing.dc.html; every other screen shares this simple one-row footer.
  if (pathname === "/") return null

  const links = [
    { href: "/docs", label: "Docs" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ]

  return (
    <footer className="border-t border-z-alive">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-12 py-8">
        <div className="flex items-center gap-2.5">
          <Image src="/design/zoetra-logo.png" alt="Zoetra" width={20} height={20} className="h-5 w-5 object-contain" />
          <span className="text-[13px] text-z-alive">&copy; 2026 Zoetra. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                pathname === l.href
                  ? "text-[13px] font-semibold text-z-text"
                  : "text-[13px] text-z-alive"
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
