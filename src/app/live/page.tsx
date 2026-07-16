"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Plus, Wallet } from "lucide-react"
import { WalletConnectButton } from "@/components/web3/wallet-connect-button"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useDevices } from "@/hooks/use-devices"
import { useLiveFeed } from "@/hooks/use-live-feed"
import { DeviceCard } from "@/components/live/device-card"
import { EventFeed } from "@/components/live/event-feed"
import { StatsStrip } from "@/components/live/stats-strip"
import { RegisterModal } from "@/components/live/register-modal"
import { VerificationPanel } from "@/components/live/verification-panel"
import { AlertsSettings } from "@/components/live/alerts-settings"
import { OnboardingTour, type TourStep } from "@/components/live/onboarding-tour"
import { BOT_CHAIN_BRIDGE_URL, FundingBar } from "@/components/live/funding-bar"
import { useWebhookUrl } from "@/hooks/use-webhook-url"
import { useBreachAlerts } from "@/hooks/use-breach-alerts"
import { activeChain } from "@/lib/chains"

const TOUR_STEPS: TourStep[] = [
  {
    target: null,
    label: "Welcome",
    title: "A quick tour of the live dashboard",
    body: "This dashboard reads directly from BOT Chain. Nothing here is a claim, it is all verifiable. Let's walk through the pieces.",
  },
  {
    target: "#tour-verify-panel",
    label: "Verification",
    title: "Do not trust this dashboard",
    body: "The contract address, bytecode, and block number are shown so you can check every claim yourself on the explorer, not take our word for it.",
  },
  {
    target: "#tour-device-card",
    label: "Device status",
    title: "Status colors and score",
    body: "Green is healthy, amber is at risk, red is breached. The big number is the live on-chain uptime score for that device, recomputed on every read.",
  },
  {
    target: "#tour-device-card",
    label: "Heartbeats",
    title: "Heartbeats and decay",
    body: "Each device's own heartbeat daemon sends a transaction on its declared interval. If that process stops, the score decays in real time, computed live from block.timestamp, not cached.",
  },
  {
    target: "#tour-slash-btn",
    label: "Slashing",
    title: "Anyone can slash a breach",
    body: "Once a device's score falls below its declared SLA, this button becomes active for any connected wallet, not just the operator. A successful slash pays the caller a bounty.",
  },
  {
    target: "#tour-register-btn",
    label: "Register",
    title: "Register your own device",
    body: "Set a name, heartbeat interval, SLA threshold, and stake, then put a heartbeat promise on-chain. Your stake is at risk automatically from that point on. You'll need real BOT on BOT Chain mainnet in your wallet first.",
    link: { href: BOT_CHAIN_BRIDGE_URL, label: "bridge funds to BOT Chain" },
  },
]

const TOUR_SEEN_KEY = "zoetra_tour_seen"

export default function LivePage() {
  const { devices, isLoading, isError } = useDevices()
  const { entries, counts } = useLiveFeed()
  const { chain, isConnected } = useAccount()
  const [registerOpen, setRegisterOpen] = useState(false)
  const { url: webhookUrl } = useWebhookUrl()
  useBreachAlerts(devices, webhookUrl)

  const [tourStep, setTourStep] = useState(-1)

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(TOUR_SEEN_KEY)) {
        const t = setTimeout(() => setTourStep(0), 900)
        return () => clearTimeout(t)
      }
    } catch {
      // localStorage unavailable, skip auto-tour
    }
  }, [])

  function endTour() {
    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, "1")
    } catch {
      // ignore
    }
    setTourStep(-1)
  }

  function nextTourStep() {
    if (tourStep >= TOUR_STEPS.length - 1) {
      endTour()
      return
    }
    setTourStep((s) => s + 1)
  }

  const liveDevices = devices.filter((d) => d.deregisteredAt === 0n)
  const activeDevices = liveDevices.length
  const wrongNetwork = isConnected && chain?.id !== activeChain.id

  return (
    <div className="mx-auto max-w-[1400px] px-12 pt-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="mb-2 text-[34px] font-semibold tracking-tight text-z-alive">Live devices</h1>
          <p className="max-w-[520px] text-[15px] leading-relaxed text-z-text-dim">
            Registered devices, heartbeat proofs, and slashable SLA state from the active chain.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/proof"
            className="flex items-center gap-2 rounded-[10px] border border-z-border bg-z-surface px-[18px] py-[11px] text-sm font-semibold text-z-text"
          >
            <Image src="/design/zoetra-logo.png" alt="" width={15} height={15} className="h-[15px] w-[15px] object-contain" />
            Verification
          </a>
          <WalletConnectButton />
          <Button
            id="tour-register-btn"
            onClick={() => setRegisterOpen(true)}
            className="gap-2 rounded-[10px] px-[18px] py-[11px] text-sm font-semibold"
          >
            <Plus className="h-[15px] w-[15px]" />
            Register device
          </Button>
          <button
            onClick={() => setTourStep(0)}
            className="flex items-center gap-2 rounded-[10px] border border-z-border bg-z-surface px-[18px] py-[11px] text-sm font-semibold text-z-text"
          >
            <Image src="/design/zoetra-logo.png" alt="" width={15} height={15} className="h-[15px] w-[15px] object-contain" />
            Take a tour
          </button>
        </div>
      </div>

      {wrongNetwork && (
        <div className="mb-4 rounded-lg border border-z-warn/40 bg-z-warn/10 px-4 py-3 text-sm text-z-warn">
          <Wallet className="mr-1.5 inline h-3.5 w-3.5" />
          Your wallet is on the wrong network. Switch to {activeChain.name} to register or slash devices.
        </div>
      )}

      <FundingBar />

      <div className="mb-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_340px]">
        <StatsStrip
          activeDevices={activeDevices}
          totalDevices={devices.length}
          beats={counts.beat}
          slashes={counts.slashed}
        />
        <div className="flex flex-col gap-4">
          <VerificationPanel deviceCount={devices.length} />
          <AlertsSettings />
        </div>
      </div>

      <div className="mb-8">
        {isError && (
          <div className="mb-4 rounded-lg border border-z-bleed/40 bg-z-bleed/10 px-4 py-3 text-sm text-z-bleed">
            RPC unreachable, retrying...
          </div>
        )}
        {!isError && !isLoading && liveDevices.length === 0 && (
          <Card className="border-z-border bg-z-surface py-12 text-center text-z-text-dim">
            No devices registered yet. Be the first.
          </Card>
        )}
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
          {liveDevices.map((device, i) => (
            <DeviceCard
              key={device.id.toString()}
              device={device}
              feedEntries={entries}
              tourCardId={i === 0 ? "tour-device-card" : undefined}
              tourSlashId={i === 0 ? "tour-slash-btn" : undefined}
            />
          ))}
        </div>
      </div>

      <Card className="border-z-border bg-z-surface p-6">
        <CardHeader>
          <CardTitle>Live event feed</CardTitle>
        </CardHeader>
        <EventFeed entries={entries} />
      </Card>

      <div className="h-20" />

      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />

      <OnboardingTour
        step={tourStep}
        steps={TOUR_STEPS}
        onNext={nextTourStep}
        onPrev={() => setTourStep((s) => Math.max(0, s - 1))}
        onEnd={endTour}
      />
    </div>
  )
}
