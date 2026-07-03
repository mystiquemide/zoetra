import Link from "next/link"
import { HeartPulse } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Nav() {
  return (
    <nav className="fixed top-0 z-40 w-full border-b border-z-border bg-z-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-z-text tracking-tight">
          <HeartPulse className="h-5 w-5 text-z-accent" />
          Zoetra
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/live">
            <Button variant="ghost" size="sm">Live dashboard</Button>
          </Link>
          <a href="https://github.com/mystiquemide/zoetra" target="_blank" rel="noopener noreferrer">
            <Button size="sm">GitHub</Button>
          </a>
        </div>
      </div>
    </nav>
  )
}
