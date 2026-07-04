"use client"

import { useState } from "react"
import { parseEther } from "viem"
import { useAccount, useWriteContract } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { friendlyError } from "@/lib/friendly-error"
import { activeChain } from "@/lib/chains"
import { REGISTRY_ADDRESS, registryAbi, MIN_STAKE_BOT } from "@/lib/registry"
import { cn } from "@/lib/utils"

const PRESETS = [
  { label: "Critical sensor", interval: 5, sla: 99 },
  { label: "Standard node", interval: 15, sla: 95 },
  { label: "Low-power device", interval: 60, sla: 90 },
] as const

export function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { address, isConnected, chain } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [interval, setInterval_] = useState(15)
  const [sla, setSla] = useState(90)
  const [stake, setStake] = useState(String(MIN_STAKE_BOT * 4))

  const wrongNetwork = isConnected && chain?.id !== activeChain.id

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const hash = await writeContractAsync({
        address: REGISTRY_ADDRESS,
        abi: registryAbi,
        functionName: "register",
        args: [name, interval, sla * 100],
        value: parseEther(stake || "0"),
        chainId: activeChain.id,
      })
      toast(`Registered: ${hash.slice(0, 10)}...`, "success")
      onClose()
    } catch (err) {
      toast(friendlyError(err, "Registration failed. Check your stake covers the minimum and try again."), "error")
    }
  }

  const labelClass = "flex flex-col gap-1.5 text-xs font-semibold text-z-text-dim"

  return (
    <Modal open={open} onClose={onClose} title="Register device">
      <p className="mb-5 text-[13px] text-z-text-dim">Put stake behind a heartbeat promise.</p>
      {!isConnected ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-sm text-z-text-dim">Connect a wallet to register a device.</p>
          <ConnectButton />
        </div>
      ) : wrongNetwork ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-sm text-z-text-dim">Switch to {activeChain.name} to continue.</p>
          <ConnectButton />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className={labelClass}>
            Presets
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    setInterval_(preset.interval)
                    setSla(preset.sla)
                  }}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-left text-xs font-normal transition-colors",
                    interval === preset.interval && sla === preset.sla
                      ? "border-z-alive bg-z-alive/10 text-z-text"
                      : "border-z-border text-z-text-dim hover:border-z-alive/50"
                  )}
                >
                  <div className="font-medium">{preset.label}</div>
                  <div className="mt-0.5 font-mono">{preset.interval}s / {preset.sla}%</div>
                </button>
              ))}
            </div>
          </div>

          <label className={labelClass}>
            Device name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-z-border bg-z-surface-2 px-3 py-2.5 font-mono text-sm font-normal text-z-text outline-none focus:border-z-alive"
              placeholder="Cloud Node A"
            />
          </label>

          <label className={labelClass}>
            Heartbeat interval, selected <span className="font-mono text-z-text">{interval}s</span>
            <input
              type="range"
              min={5}
              max={300}
              value={interval}
              onChange={(e) => setInterval_(Number(e.target.value))}
              className="accent-z-alive"
            />
          </label>

          <label className={labelClass}>
            SLA, selected <span className="font-mono text-z-text">{sla}%</span>
            <input
              type="range"
              min={50}
              max={99}
              value={sla}
              onChange={(e) => setSla(Number(e.target.value))}
              className="accent-z-alive"
            />
          </label>

          <label className={labelClass}>
            Stake (BOT, min {MIN_STAKE_BOT})
            <input
              required
              type="number"
              step="0.01"
              min={MIN_STAKE_BOT}
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="rounded-lg border border-z-border bg-z-surface-2 px-3 py-2.5 font-mono text-sm font-normal text-z-text outline-none focus:border-z-alive"
            />
          </label>

          {address && (
            <p className="text-xs text-z-text-dim">
              Connected to {activeChain.name} as {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Registering..." : "Register device"}
          </Button>
        </form>
      )}
    </Modal>
  )
}
