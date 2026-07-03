"use client"

import { useRef, useEffect } from "react"
import type { DeviceView } from "@/lib/registry"

/** Fires one webhook call per breach episode per device (not once per poll
 * tick), and resets so a device that recovers and breaches again alerts
 * again. Pure client-side detection off the same reads the dashboard already
 * shows; the API route is a stateless relay, not a source of truth. */
export function useBreachAlerts(devices: DeviceView[], webhookUrl: string) {
  const alerted = useRef(new Set<string>())

  useEffect(() => {
    if (!webhookUrl) return

    for (const device of devices) {
      const id = device.id.toString()
      const breached = device.deregisteredAt === 0n && device.score < device.slaBps

      if (breached && !alerted.current.has(id)) {
        alerted.current.add(id)
        fetch("/api/alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl,
            deviceId: id,
            deviceName: device.name,
            score: device.score,
            slaBps: device.slaBps,
          }),
        }).catch(() => {
          // Best-effort notification; the dashboard itself remains the source of truth.
        })
      } else if (!breached) {
        alerted.current.delete(id)
      }
    }
  }, [devices, webhookUrl])
}
