import Link from "next/link"
import { notFound } from "next/navigation"
import { createPublicClient, http, isAddress } from "viem"
import {
  ExternalLink,
  ArrowLeft,
  Activity,
  Scissors,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  PowerOff,
} from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "@/components/ui/copy-button"
import { fetchAddress, fetchAddressTransactions } from "@/lib/blockscout"
import { decodeMethodCall } from "@/lib/decode"
import { explorerAddressUrl, activeChain } from "@/lib/chains"
import { REGISTRY_ADDRESS, registryAbi, type RawDeviceTuple } from "@/lib/registry"

export const revalidate = 5

const client = createPublicClient({ chain: activeChain, transport: http() })

type Status = "healthy" | "at-risk" | "breached" | "deregistered"

const STATUS_META: Record<Status, { label: string; icon: typeof CheckCircle2; color: string; border: string }> = {
  healthy: { label: "Healthy", icon: CheckCircle2, color: "text-z-alive", border: "border-z-border" },
  "at-risk": { label: "At risk", icon: AlertTriangle, color: "text-z-warn", border: "border-z-border" },
  breached: { label: "Breached", icon: ShieldAlert, color: "text-z-bleed", border: "border-[#8C3A35]" },
  deregistered: { label: "Deregistered", icon: PowerOff, color: "text-z-text-dim", border: "border-z-border" },
}

function statusOf(score: number, slaBps: number, dead: boolean): Status {
  if (dead) return "deregistered"
  if (score < slaBps) return "breached"
  if (score < 9700) return "at-risk"
  return "healthy"
}

async function findOperatedDevice(address: string) {
  try {
    const [ids, list, scores] = (await client.readContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: "getDevices",
      args: [0n, 50n],
    })) as [readonly bigint[], readonly RawDeviceTuple[], readonly number[]]

    const index = list.findIndex((d) => d.operator.toLowerCase() === address.toLowerCase())
    if (index === -1) return null
    return { id: ids[index], device: list[index], score: scores[index] }
  } catch {
    return null
  }
}

export default async function AddressPage({ params }: { params: Promise<{ addr: string }> }) {
  const { addr } = await params
  if (!isAddress(addr)) notFound()

  const [addressInfo, txs, operated] = await Promise.all([
    fetchAddress(addr),
    fetchAddressTransactions(addr),
    findOperatedDevice(addr),
  ])

  const balance = addressInfo?.coin_balance ? (Number(addressInfo.coin_balance) / 1e18).toFixed(4) : "0"

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/live" className="inline-flex items-center gap-1.5 text-sm text-z-alive hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to live dashboard
      </Link>

      <Card className="mt-5 flex flex-wrap items-center justify-between gap-4 border-z-border bg-z-surface">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-z-alive">Address</div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-lg font-semibold text-z-alive">
              {addr.slice(0, 8)}...{addr.slice(-6)}
            </span>
            <CopyButton value={addr} className="text-z-text-dim hover:text-z-text" />
          </div>
        </div>
        <div className="text-right">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-z-text-dim">Balance</div>
          <div className="font-mono text-xl font-semibold text-z-alive">
            {balance} BOT {addressInfo?.is_contract && <span className="text-sm text-z-text-dim">· contract</span>}
          </div>
        </div>
      </Card>

      {operated && (
        <div className="mt-6">
          <div className="mb-2.5 text-[13px] font-semibold text-z-text-dim">Operates 1 registered device</div>
          {(() => {
            const dead = operated.device.deregisteredAt !== 0n
            const status = statusOf(operated.score, operated.device.slaBps, dead)
            const meta = STATUS_META[status]
            const StatusIcon = meta.icon
            return (
              <Card className={`flex flex-col gap-3.5 bg-z-surface ${meta.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-[9px] w-[9px] rounded-full ${meta.color}`} style={{ backgroundColor: "currentColor" }} />
                    <div>
                      <div className="text-[15px] font-semibold text-z-text">{operated.device.name}</div>
                      <div className="font-mono text-xs text-z-text-dim">device #{operated.id.toString()}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${meta.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" /> {meta.label}
                  </div>
                </div>

                <div className={`font-mono text-[34px] font-semibold tracking-tight ${meta.color}`}>
                  {(operated.score / 100).toFixed(1)}%
                </div>

                <div className="grid grid-cols-3 gap-2.5 border-y border-z-surface-2 py-3 text-xs">
                  <div>
                    <div className="mb-0.5 text-z-text-dim">Stake</div>
                    <div className="font-mono font-semibold text-z-text">{(Number(operated.device.stake) / 1e18).toFixed(3)} BOT</div>
                  </div>
                  <div>
                    <div className="mb-0.5 text-z-text-dim">SLA</div>
                    <div className="font-mono font-semibold text-z-text">{(operated.device.slaBps / 100).toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="mb-0.5 text-z-text-dim">Interval</div>
                    <div className="font-mono font-semibold text-z-text">{operated.device.intervalSec}s</div>
                  </div>
                </div>

                <Link href="/live" className="text-xs text-z-alive hover:underline">
                  View on live dashboard &rarr;
                </Link>
              </Card>
            )
          })()}
        </div>
      )}

      <Card className="mt-4 border-z-border bg-z-surface">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        {txs.length === 0 ? (
          <p className="text-sm text-z-text-dim">No transactions observed yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-z-border">
            {txs.map((tx) => {
              const decoded = decodeMethodCall(tx.raw_input)
              const Icon = decoded?.functionName === "slash" ? Scissors : decoded?.functionName === "register" ? Plus : Activity
              return (
                <Link
                  key={tx.hash}
                  href={`/tx/${tx.hash}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-z-surface-2"
                >
                  <div className="flex items-center gap-2 text-z-text-dim">
                    <Icon className="h-3.5 w-3.5 text-z-alive" />
                    <span className="text-z-text">{decoded?.summary ?? "transaction"}</span>
                  </div>
                  <span className="font-mono text-xs text-z-alive">{tx.hash.slice(0, 8)}</span>
                </Link>
              )
            })}
          </div>
        )}
      </Card>

      <a
        href={explorerAddressUrl(addr)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-z-text-dim hover:text-z-text"
      >
        View on {activeChain.blockExplorers.default.name} <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
