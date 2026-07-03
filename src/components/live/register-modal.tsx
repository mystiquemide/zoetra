"use client"

import { useState } from "react"
import { parseEther } from "viem"
import { useAccount, useWriteContract } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { FileSignature } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { activeChain } from "@/lib/chains"
import { REGISTRY_ADDRESS, registryAbi, MIN_STAKE_BOT } from "@/lib/registry"

export function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isConnected, chain } = useAccount()
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
      toast(err instanceof Error ? err.message : "Registration failed", "error")
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Register a device">
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
          <label className="flex flex-col gap-1 text-sm text-z-text-dim">
            Device name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-z-border bg-z-surface-2 px-3 py-2 font-mono text-sm text-z-text outline-none focus:border-z-accent"
              placeholder="warehouse-sensor-04"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-z-text-dim">
            Heartbeat interval: <span className="font-mono text-z-text">{interval}s</span>
            <input
              type="range"
              min={5}
              max={300}
              value={interval}
              onChange={(e) => setInterval_(Number(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-z-text-dim">
            SLA threshold: <span className="font-mono text-z-text">{sla}%</span>
            <input
              type="range"
              min={50}
              max={99}
              value={sla}
              onChange={(e) => setSla(Number(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-z-text-dim">
            Stake (BOT, min {MIN_STAKE_BOT})
            <input
              required
              type="number"
              step="0.01"
              min={MIN_STAKE_BOT}
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="rounded-lg border border-z-border bg-z-surface-2 px-3 py-2 font-mono text-sm text-z-text outline-none focus:border-z-accent"
            />
          </label>

          <Button type="submit" disabled={isPending} className="gap-2">
            <FileSignature className="h-4 w-4" />
            {isPending ? "Registering..." : "Register on-chain"}
          </Button>
        </form>
      )}
    </Modal>
  )
}
