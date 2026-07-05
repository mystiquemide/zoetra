import Link from "next/link"
import { SearchX, ArrowLeft } from "lucide-react"
import { activeChain } from "@/lib/chains"

export default function AddressNotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <SearchX className="mb-4 h-10 w-10 text-z-text-dim" />
      <h1 className="mb-2 text-xl font-semibold text-z-text">Address not found on {activeChain.name}</h1>
      <p className="mb-6 max-w-md text-sm text-z-text-dim">
        That address isn&apos;t a valid EVM address, or hasn&apos;t sent or received a transaction on this
        chain yet.
      </p>
      <Link href="/live" className="inline-flex items-center gap-1.5 text-sm text-z-alive hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to live dashboard
      </Link>
    </div>
  )
}
