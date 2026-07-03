"use client"

import { useState } from "react"
import { Bell, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWebhookUrl } from "@/hooks/use-webhook-url"

export function AlertsSettings() {
  const { url, save } = useWebhookUrl()
  const [draft, setDraft] = useState(url)
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    save(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <Card className="border-z-border bg-z-surface">
      <div className="mb-3 flex items-center gap-2 text-z-text">
        <Bell className="h-4 w-4 text-z-accent" />
        <span className="font-medium">Breach alerts</span>
      </div>
      <p className="mb-3 text-xs text-z-text-dim">
        Paste a Discord/Slack-compatible webhook URL. When any device breaches its SLA, this
        browser posts a one-line alert to it via a stateless relay (<code>/api/alert</code>),
        stored only in your browser, never on a server.
      </p>
      <form onSubmit={handleSave} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          className="flex-1 rounded-lg border border-z-border bg-z-surface-2 px-3 py-2 font-mono text-xs text-z-text outline-none focus:border-z-accent"
        />
        <Button type="submit" size="sm" variant="outline" className="gap-1.5">
          {saved ? <Check className="h-3.5 w-3.5" /> : null}
          Save
        </Button>
      </form>
    </Card>
  )
}
