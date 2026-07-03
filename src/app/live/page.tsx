"use client"

import { useState } from "react"
import { Plus, ScrollText } from "lucide-react"
import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
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
import { useWebhookUrl } from "@/hooks/use-webhook-url"
import { useBreachAlerts } from "@/hooks/use-breach-alerts"
import { activeChain } from "@/lib/chains"

export default function LivePage() {
  const { devices, isLoading, isError } = useDevices()
  const { entries, counts } = useLiveFeed()
  const { chain, isConnected } = useAccount()
  const [registerOpen, setRegisterOpen] = useState(false)
  const { url: webhookUrl } = useWebhookUrl()
  useBreachAlerts(devices, webhookUrl)

  const activeDevices = devices.filter((d) => d.deregisteredAt === 0n).length
  const wrongNetwork = isConnected && chain?.id !== activeChain.id

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-z-text">Live devices</h1>
          <p className="mt-1 text-sm text-z-text-dim">
            Every card is a real on-chain SLA, verifiable independent of this page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ScrollText className="h-4 w-4" />
              Demo script
            </Button>
          </Link>
          <ConnectButton />
          <Button onClick={() => setRegisterOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Register device
          </Button>
        </div>
      </div>

      {wrongNetwork && (
        <div className="mt-4 rounded-lg border border-z-warn/40 bg-z-warn/10 px-4 py-3 text-sm text-z-warn">
          Your wallet is on the wrong network. Switch to {activeChain.name} to register or slash devices.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
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

      <div className="mt-8">
        {isError && (
          <div className="rounded-lg border border-z-bleed/40 bg-z-bleed/10 px-4 py-3 text-sm text-z-bleed">
            RPC unreachable, retrying...
          </div>
        )}
        {!isError && !isLoading && devices.length === 0 && (
          <Card className="border-z-border bg-z-surface py-12 text-center text-z-text-dim">
            No devices registered yet. Be the first.
          </Card>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <DeviceCard key={device.id.toString()} device={device} feedEntries={entries} />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Card className="border-z-border bg-z-surface">
          <CardHeader>
            <CardTitle>Live event feed</CardTitle>
          </CardHeader>
          <EventFeed entries={entries} />
        </Card>
      </div>

      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  )
}
