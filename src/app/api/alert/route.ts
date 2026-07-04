import { NextRequest, NextResponse } from "next/server"

// The one exception to "no backend" in this project (see AGENTS.md and
// docs/ARCHITECTURE.md ADR-1). This is a stateless serverless function, not a
// server: it holds no data, the chain is still the only source of truth, this
// route only relays a notification the client already derived from on-chain
// reads to a webhook URL the user supplies and stores in their own browser.

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"])

function isPrivateHost(hostname: string): boolean {
  if (BLOCKED_HOSTS.has(hostname)) return true
  if (/^10\./.test(hostname)) return true
  if (/^192\.168\./.test(hostname)) return true
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return true
  if (/^169\.254\./.test(hostname)) return true
  return false
}

export async function POST(req: NextRequest) {
  let body: { webhookUrl?: string; deviceId?: string; deviceName?: string; score?: number; slaBps?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const { webhookUrl, deviceId, deviceName, score, slaBps } = body
  if (!webhookUrl) {
    return NextResponse.json({ ok: false, error: "webhookUrl is required" }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(webhookUrl)
  } catch {
    return NextResponse.json({ ok: false, error: "webhookUrl is not a valid URL" }, { status: 400 })
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ ok: false, error: "webhookUrl must be http(s)" }, { status: 400 })
  }
  if (isPrivateHost(target.hostname)) {
    return NextResponse.json({ ok: false, error: "webhookUrl host is not allowed" }, { status: 400 })
  }

  const scorePct = typeof score === "number" ? (score / 100).toFixed(1) : "?"
  const slaPct = typeof slaBps === "number" ? (slaBps / 100).toFixed(0) : "?"

  try {
    const upstream = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Zoetra: device "${deviceName ?? deviceId}" breached its SLA (score ${scorePct}%, threshold ${slaPct}%). It is now slashable.`,
        deviceId,
        deviceName,
        score,
        slaBps,
      }),
      signal: AbortSignal.timeout(8000),
    })
    return NextResponse.json({ ok: upstream.ok, status: upstream.status })
  } catch (err) {
    console.error("alert relay failed:", err)
    return NextResponse.json(
      { ok: false, error: "Could not reach that webhook URL. Check it's correct and try again." },
      { status: 502 }
    )
  }
}
