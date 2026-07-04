import Link from "next/link"
import { notFound } from "next/navigation"
import { createPublicClient, http, isAddress } from "viem"
import { ExternalLink, ArrowLeft, Activity, Scissors, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyButton } from "@/components/ui/copy-button"
import { fetchAddress, fetchAddressTransactions } from "@/lib/blockscout"
import { decodeMethodCall } from "@/lib/decode"
import { explorerAddressUrl, activeChain } from "@/lib/chains"
import { REGISTRY_ADDRESS, registryAbi, type RawDeviceTuple } from "@/lib/registry"

export const revalidate = 5

const client = createPublicClient({ chain: activeChain, transport: http() })

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
      <Link href="/live" className="inline-flex items-center gap-1.5 text-sm text-z-text-dim hover:text-z-text">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to live devices
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <h1 className="font-mono text-lg text-z-text">{addr.slice(0, 10)}...{addr.slice(-8)}</h1>
        <CopyButton value={addr} />
      </div>
      <p className="font-mono text-sm text-z-text-dim">
        {balance} BOT {addressInfo?.is_contract && "· contract"}
      </p>

      {operated && (
        <Card className="mt-6 border-z-accent/40 bg-z-surface">
          <CardHeader>
            <CardTitle>Operates device #{operated.id.toString()}</CardTitle>
          </CardHeader>
          <div className="grid gap-2.5 font-mono text-xs">
            <Row label="Name">{operated.device.name}</Row>
            <Row label="Score">{(operated.score / 100).toFixed(1)}%</Row>
            <Row label="Stake">{(Number(operated.device.stake) / 1e18).toFixed(3)} BOT</Row>
            <Row label="SLA">{(operated.device.slaBps / 100).toFixed(0)}%</Row>
            <Row label="Interval">every {operated.device.intervalSec}s</Row>
          </div>
        </Card>
      )}

      <Card className="mt-4 border-z-border bg-z-surface">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
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
                    <Icon className="h-3.5 w-3.5 text-z-accent" />
                    <span className="text-z-text">{decoded?.summary ?? "transaction"}</span>
                  </div>
                  <span className="font-mono text-xs text-z-accent">{tx.hash.slice(0, 8)}</span>
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
        className="mt-6 inline-flex items-center gap-1.5 text-xs text-z-text-dim hover:text-z-text"
      >
        View on {activeChain.blockExplorers.default.name} <ExternalLink className="h-3 w-3" />
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
