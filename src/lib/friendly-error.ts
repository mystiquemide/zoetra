import { BaseError } from "viem"

/** Wagmi/viem errors carry a full RPC payload and call stack in `.message`,
 * which is unreadable and can leak internal request details to a toast.
 * `BaseError.shortMessage` is viem's own user-facing summary; fall back to a
 * generic phrase for anything else so we never surface raw system output. */
export function friendlyError(err: unknown, fallback: string): string {
  if (err instanceof BaseError) return err.shortMessage
  if (err instanceof Error && err.message.length < 120) return err.message
  return fallback
}
