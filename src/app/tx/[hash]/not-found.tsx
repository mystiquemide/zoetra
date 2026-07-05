import Link from "next/link"
import { SearchX, ArrowLeft } from "lucide-react"
import { activeChain } from "@/lib/chains"

export default function TxNotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <SearchX className="mb-4 h-10 w-10 text-z-text-dim" />
      <h1 className="mb-2 text-xl font-semibold text-z-text">Transaction not found on {activeChain.name}</h1>
      <p className="mb-6 max-w-md text-sm text-z-text-dim">
        That hash doesn&apos;t match a transaction on this chain. Double check you copied it in full, or
        that it was sent on the right network.
      </p>
      <Link href="/live" className="inline-flex items-center gap-1.5 text-sm text-z-alive hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to live dashboard
      </Link>
    </div>
  )
}
