"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "zoetra-webhook-url"
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? ""
}

function getServerSnapshot() {
  return ""
}

/** Stored only in the visitor's own browser via useSyncExternalStore (the
 * React-recommended way to read an external store like localStorage). No
 * database, no server-side persistence, consistent with the rest of the
 * app's "chain is the only backend" stance. */
export function useWebhookUrl() {
  const url = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function save(next: string) {
    if (next) localStorage.setItem(STORAGE_KEY, next)
    else localStorage.removeItem(STORAGE_KEY)
    listeners.forEach((l) => l())
  }

  return { url, save }
}
