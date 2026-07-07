"use client"

import { useSyncExternalStore } from "react"

const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

/** Tracks a one-time dismissal flag in localStorage, keyed by `key`. Mirrors
 * useWebhookUrl's useSyncExternalStore pattern so localStorage reads never
 * need an effect + setState. */
export function useDismissed(key: string) {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key) === "1",
    () => false
  )

  function dismiss() {
    localStorage.setItem(key, "1")
    listeners.forEach((l) => l())
  }

  return { dismissed, dismiss }
}
