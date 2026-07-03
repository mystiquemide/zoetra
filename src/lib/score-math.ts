// Mirrors ZoetraRegistry.scoreOf exactly (same integer division), so the UI
// can show live countdowns and beat counts without any extra RPC calls.
// See contracts/contracts/ZoetraRegistry.sol and docs/ARCHITECTURE.md for the
// authoritative version; this is a read-only projection, never a source of truth.

export const WINDOW_BEATS = 20

export interface ScoreInputs {
  intervalSec: number
  registeredAt: number
  windowStart: number
  beatsPrev: number
  beatsCurr: number
}

export interface ScoreDetail {
  bps: number
  received: number
  expected: number
}

export function computeScoreDetail(inputs: ScoreInputs, nowSec: number): ScoreDetail {
  const { intervalSec, registeredAt, windowStart, beatsPrev, beatsCurr } = inputs
  const L = intervalSec * WINDOW_BEATS
  const elapsed = nowSec - windowStart
  const hasPrevBucket = windowStart > registeredAt

  let received: number
  let expected: number

  if (elapsed < L) {
    received = beatsPrev + beatsCurr
    expected = (hasPrevBucket ? WINDOW_BEATS : 0) + Math.floor(elapsed / intervalSec)
  } else if (elapsed < 2 * L) {
    received = beatsCurr
    expected = WINDOW_BEATS + Math.floor((elapsed - L) / intervalSec)
  } else {
    received = 0
    const elapsedInCurr = elapsed - Math.floor(elapsed / L) * L
    expected = WINDOW_BEATS + Math.floor(elapsedInCurr / intervalSec)
  }

  if (expected === 0) return { bps: 10000, received, expected }
  const bps = Math.min(10000, Math.floor((received * 10000) / expected))
  return { bps, received, expected }
}

/**
 * Assuming no further heartbeats arrive, how many seconds until the score
 * drops below `slaBps`? Returns 0 if already breached, null if it won't
 * breach within `horizonSec` (e.g. the device is early in its history and
 * has slack before the rolling window demands more beats).
 */
export function secondsUntilBreach(
  inputs: ScoreInputs,
  slaBps: number,
  nowSec: number,
  horizonSec = 900
): number | null {
  if (computeScoreDetail(inputs, nowSec).bps < slaBps) return 0
  for (let t = 1; t <= horizonSec; t++) {
    if (computeScoreDetail(inputs, nowSec + t).bps < slaBps) return t
  }
  return null
}

export function secondsUntilNextHeartbeatDue(intervalSec: number, lastBeat: number, nowSec: number): number {
  if (lastBeat === 0) return 0
  return Math.max(0, intervalSec - (nowSec - lastBeat))
}

export function secondsSinceLastBeat(lastBeat: number, nowSec: number): number | null {
  if (lastBeat === 0) return null
  return Math.max(0, nowSec - lastBeat)
}
