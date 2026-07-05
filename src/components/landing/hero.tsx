import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Code2 } from "lucide-react"

export function Hero() {
  return (
    <div
      className="relative bg-cover bg-[position:center_30%] rounded-b-3xl overflow-hidden"
      style={{ backgroundImage: "url('/design/hero-network.jpg')" }}
    >
      <header className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-4 sm:px-12">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/design/zoetra-logo.png" alt="Zoetra" width={28} height={28} className="h-7 w-7 object-contain" />
            <span className="text-[17px] font-semibold tracking-tighter text-z-text">
              <span className="text-z-alive">Zoe</span>tra
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/live" className="flex items-center py-2.5 text-sm font-medium text-z-alive">
              Live dashboard
            </Link>
            <Link href="/demo" className="flex items-center py-2.5 text-sm font-medium text-z-alive">
              Demo
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-6 text-center sm:px-12">
        <h1 className="mb-7 text-[15vw] font-semibold leading-[0.94] tracking-tighter text-z-text drop-shadow-[0_2px_32px_rgba(0,0,0,0.6)] sm:text-7xl md:text-8xl">
          <span className="text-z-alive">Uptime</span> you
          <br />
          can <span className="text-z-alive">slash</span>.
        </h1>
        <p className="mb-9 max-w-md rounded-xl bg-z-bg/45 px-4 py-3 text-[17px] leading-relaxed tracking-tight text-z-text backdrop-blur-sm">
          A permissionless, on-chain heartbeat SLA registry for DePIN devices.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link
            href="/live"
            className="flex items-center gap-2 rounded-xl bg-z-alive px-6 py-3.5 text-[15px] font-semibold text-z-bg"
          >
            Live dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/mystiquemide/zoetra"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-z-text/30 bg-z-text/10 px-6 py-3.5 text-[15px] font-semibold text-z-text backdrop-blur-sm"
          >
            <Code2 className="h-4 w-4" /> Source code
          </a>
        </div>
      </section>
    </div>
  )
}
