"use client"

import { useEffect, useState } from "react"

/** Current unix seconds, re-rendering once per second. Drives live countdowns
 * without any extra chain reads. */
export function useClockTick(): number {
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const id = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  return nowSec
}
