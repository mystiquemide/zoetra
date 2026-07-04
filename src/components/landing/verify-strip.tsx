"use client"

import Image from "next/image"
import { FileCode2, Binary, Box, Cpu, ExternalLink } from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { Reveal } from "@/components/landing/reveal"
import { useVerification } from "@/hooks/use-verification"
import { useDevices } from "@/hooks/use-devices"
import { REGISTRY_ADDRESS } from "@/lib/registry"
import { explorerAddressUrl } from "@/lib/chains"

const VERIFY_SENTENCE =
  "Do not trust our words. Verify the contract, bytecode, devices, and events directly on BOT Chain."

const CHIP_CLASS =
  "zt-chip flex items-center gap-2 rounded-[10px] border border-z-border bg-z-surface-2 px-3.5 py-2.5 font-mono text-[13px] text-z-alive"

export function VerifyStrip() {
  const { hasBytecode, bytecodeSize, bytecodeLoading, blockNumber } = useVerification()
  const { devices } = useDevices()
  const short = `${REGISTRY_ADDRESS.slice(0, 8)}...${REGISTRY_ADDRESS.slice(-6)}`

  return (
    <section className="border-y border-z-border bg-z-surface">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-12">
        <Reveal as="p" className="mb-5 flex max-w-2xl flex-wrap text-sm leading-relaxed text-z-alive">
          {VERIFY_SENTENCE.split(" ").map((word, i) => (
            <span key={i} className="zt-word mr-1.5" style={{ animationDelay: `${i * 0.05}s` }}>
              {word}
            </span>
          ))}
        </Reveal>
        <div className="flex flex-wrap gap-3">
          <div className={CHIP_CLASS} style={{ animationDelay: "0s" }}>
            <Image src="/design/botchain-logo.jpg" alt="BOT Chain" width={14} height={14} className="h-3.5 w-3.5 rounded-[3px] object-contain" />
            BOT Chain
          </div>
          <div className={CHIP_CLASS} style={{ animationDelay: "1.5s" }}>
            <FileCode2 className="h-3.5 w-3.5" />
            {short}
            <CopyButton value={REGISTRY_ADDRESS} className="text-z-alive hover:text-z-alive" />
          </div>
          <div className={CHIP_CLASS} style={{ animationDelay: "3s" }}>
            <Binary className="h-3.5 w-3.5" />
            {bytecodeLoading ? "checking bytecode..." : hasBytecode ? `Bytecode detected, ${bytecodeSize.toLocaleString()}B` : "bytecode not found"}
          </div>
          <div className={CHIP_CLASS} style={{ animationDelay: "4.5s" }}>
            <Box className="h-3.5 w-3.5" />
            Block {blockNumber ? blockNumber.toLocaleString() : "--"}
          </div>
          <div className={CHIP_CLASS} style={{ animationDelay: "6s" }}>
            <Cpu className="h-3.5 w-3.5" />
            {devices.length} device{devices.length === 1 ? "" : "s"}
          </div>
          <a
            href={explorerAddressUrl(REGISTRY_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            className={CHIP_CLASS}
            style={{ animationDelay: "7.5s" }}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Explorer
          </a>
        </div>
      </div>
    </section>
  )
}
