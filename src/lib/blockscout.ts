import { activeChain } from "@/lib/chains"

// Thin client over Blockscout's public v2 REST API (no auth, same API already
// used for the bytecode check). Used to power our own tx/address detail
// pages so users never have to leave the app to verify a hash, the external
// BOTScan link stays available on every page as the ultimate cross-check.

const BASE_URL = activeChain.blockExplorers.default.url

export interface BlockscoutAccount {
  hash: string
  is_contract: boolean
}

export interface BlockscoutTx {
  hash: string
  status: "ok" | "error" | null
  result: string
  block: number
  block_number: number
  timestamp: string
  from: BlockscoutAccount
  to: BlockscoutAccount | null
  method: string | null
  raw_input: string
  value: string
  gas_used: string
  gas_price: string
  fee: { value: string }
  confirmations: number
  revert_reason: string | null
}

export interface BlockscoutLog {
  address: BlockscoutAccount
  data: string
  topics: (string | null)[]
  index: number
  transaction_hash: string
}

export interface BlockscoutAddress {
  hash: string
  coin_balance: string | null
  is_contract: boolean
}

async function blockscoutFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v2${path}`, { next: { revalidate: 5 } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export function fetchTransaction(hash: string) {
  return blockscoutFetch<BlockscoutTx>(`/transactions/${hash}`)
}

export async function fetchTransactionLogs(hash: string): Promise<BlockscoutLog[]> {
  const data = await blockscoutFetch<{ items: BlockscoutLog[] }>(`/transactions/${hash}/logs`)
  return data?.items ?? []
}

export function fetchAddress(address: string) {
  return blockscoutFetch<BlockscoutAddress>(`/addresses/${address}`)
}

export async function fetchAddressTransactions(address: string, limit = 15): Promise<BlockscoutTx[]> {
  const data = await blockscoutFetch<{ items: BlockscoutTx[] }>(
    `/addresses/${address}/transactions?filter=to%20%7C%20from`
  )
  return (data?.items ?? []).slice(0, limit)
}
