"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainOffset({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <main id="main-content" tabIndex={-1} className={cn("flex-1 outline-none", pathname !== "/" && "pt-16")}>
      {children}
    </main>
  )
}
