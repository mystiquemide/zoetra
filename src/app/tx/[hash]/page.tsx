import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2, XCircle, ExternalLink, ArrowLeft, Activity, Scissors, Plus, PowerOff, Wallet } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "@/components/ui/copy-button"
import { fetchTransaction, fetchTransactionLogs } from "@/lib/blockscout"
import { decodeMethodCall, decodeLog } from "@/lib/decode"
import { explorerTxUrl, activeChain } from "@/lib/chains"

export const revalidate = 5

const EVENT_ICON = {
  Registered: Plus,
  Beat: Activity,
  Slashed: Scissors,
  Deregistered: PowerOff,
  Withdrawn: Wallet,
} as const

function formatBot(wei: string): string {
  return (Number(wei) / 1e18).toFixed(6).replace(/\.?0+$/, "") || "0"
}

export default async function TxPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params
  const tx = await fetchTransaction(hash)
  if (!tx) notFound()

  const logs = await fetchTransactionLogs(hash)
  const decodedCall = decodeMethodCall(tx.raw_input)
  const decodedLogs = logs.map((log) => ({ log, decoded: decodeLog(log) })).filter((l) => l.decoded)

  const success = tx.status === "ok"

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/live" className="inline-flex items-center gap-1.5 text-sm text-z-alive hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to live dashboard
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3.5">
        <span
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold ${
            success ? "bg-z-alive/[0.14] text-z-alive" : "bg-z-bleed/[0.14] text-z-bleed"
          }`}
        >
          {success ? <CheckCircle2 className="h-[15px] w-[15px]" /> : <XCircle className="h-[15px] w-[15px]" />}
          {success ? "Success" : `Failed${tx.revert_reason ? `: ${tx.revert_reason}` : ""}`}
        </span>
        <span className="font-mono text-sm text-z-text-dim">{hash.slice(0, 8)}...{hash.slice(-6)}</span>
        <CopyButton value={hash} />
      </div>

      <Card className="mt-6 border-z-border bg-z-surface">
        <div className="grid gap-3 font-mono text-xs">
          <Row label="Block">{tx.block_number.toLocaleString()}</Row>
          <Row label="Timestamp">{new Date(tx.timestamp).toLocaleString()}</Row>
          <Row label="From">
            <Link href={`/address/${tx.from.hash}`} className="text-z-alive hover:underline">
              {tx.from.hash.slice(0, 10)}...{tx.from.hash.slice(-6)}
            </Link>
          </Row>
          {tx.to && (
            <Row label="To">
              <Link href={`/address/${tx.to.hash}`} className="text-z-alive hover:underline">
                {tx.to.hash.slice(0, 10)}...{tx.to.hash.slice(-6)}
              </Link>
              {tx.to.is_contract && <span className="ml-2 text-z-text-dim">(contract)</span>}
            </Row>
          )}
          <Row label="Value">{formatBot(tx.value)} BOT</Row>
          <Row label="Gas used">{Number(tx.gas_used).toLocaleString()}</Row>
          <Row label="Gas price">{(Number(tx.gas_price) / 1e9).toFixed(2)} gwei</Row>
          <Row label="Fee">{formatBot(tx.fee.value)} BOT</Row>
        </div>
      </Card>

      <Card className="mt-4 border-z-border bg-z-surface">
        <CardHeader>
          <CardTitle>What happened</CardTitle>
        </CardHeader>
        {decodedCall ? (
          <p className="font-mono text-sm text-z-text">{decodedCall.summary}</p>
        ) : (
          <p className="text-sm text-z-text-dim">
            {tx.raw_input === "0x" ? "Plain BOT transfer, no contract call." : "Not a Zoetra registry call."}
          </p>
        )}

        {decodedLogs.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 border-t border-z-border pt-4">
            {decodedLogs.map(({ log, decoded }) => {
              const Icon = EVENT_ICON[decoded!.eventName as keyof typeof EVENT_ICON] ?? Activity
              return (
                <div key={log.index} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-z-alive" />
                  <span className="font-mono text-z-text">{decoded!.summary}</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <a
        href={explorerTxUrl(hash)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-z-text-dim hover:text-z-text"
      >
        View on {activeChain.blockExplorers.default.name} <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-z-text-dim">{label}</span>
      <span className="text-z-text">{children}</span>
    </div>
  )
}
