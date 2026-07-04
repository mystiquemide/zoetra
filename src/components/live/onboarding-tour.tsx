"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

export interface TourStep {
  target: string | null
  label: string
  title: string
  body: string
}

interface Spot {
  top: number
  left: number
  width: number
  height: number
}

interface CardPos {
  top: number
  left: number
}

export function OnboardingTour({
  step,
  steps,
  onNext,
  onPrev,
  onEnd,
}: {
  step: number
  steps: TourStep[]
  onNext: () => void
  onPrev: () => void
  onEnd: () => void
}) {
  const [spot, setSpot] = useState<Spot | null>(null)
  const [card, setCard] = useState<CardPos>({ top: 100, left: 100 })

  useEffect(() => {
    if (step < 0) return

    function position() {
      const current = steps[step]
      const el = current.target ? document.querySelector(current.target) : null
      if (!el) {
        setSpot(null)
        setCard({ top: Math.round(window.innerHeight / 2 - 100), left: Math.round(window.innerWidth / 2 - 160) })
        return
      }
      const rect = el.getBoundingClientRect()
      const pad = 8
      setSpot({ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 })
      const cardWidth = 320
      const cardLeft = Math.max(16, Math.min(rect.left, window.innerWidth - cardWidth - 16))
      const spaceBelow = window.innerHeight - rect.bottom
      const cardTop = spaceBelow > 260 ? rect.bottom + 20 : Math.max(16, rect.top - 240)
      setCard({ top: Math.round(cardTop), left: Math.round(cardLeft) })
    }

    const current = steps[step]
    const target = current.target ? document.querySelector(current.target) : null
    if (target) {
      const rect = target.getBoundingClientRect()
      window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - 140), behavior: "smooth" })
    }

    const t = setTimeout(position, 380)
    window.addEventListener("resize", position)
    window.addEventListener("scroll", position, true)
    return () => {
      clearTimeout(t)
      window.removeEventListener("resize", position)
      window.removeEventListener("scroll", position, true)
    }
  }, [step, steps])

  if (step < 0) return null
  const current = steps[step]

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <div
        className="fixed z-[201] rounded-xl transition-all duration-300 ease-out"
        style={
          spot
            ? {
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
                boxShadow: "0 0 0 9999px rgba(10,11,13,0.75), 0 0 0 3px #2DD4A7",
                opacity: 1,
              }
            : { top: -9999, left: -9999, width: 0, height: 0, opacity: 0 }
        }
      />

      <div
        className="fixed z-[202] w-80 rounded-2xl bg-z-surface p-[22px] shadow-[0_20px_48px_rgba(0,0,0,0.45)] pointer-events-auto transition-all duration-300 ease-out"
        style={{ top: card.top, left: card.left }}
      >
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold text-z-alive">
            {current.label} &middot; {step + 1} / {steps.length}
          </span>
          <button onClick={onEnd} className="flex text-z-text-dim hover:text-z-text">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="mb-2 text-base font-semibold tracking-tight text-z-alive">{current.title}</h3>
        <p className="mb-[18px] text-[13px] leading-relaxed text-z-text-dim">{current.body}</p>
        <div className="flex items-center justify-between">
          <button onClick={onEnd} className="text-[13px] text-z-text-dim hover:text-z-text">
            Skip
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={onPrev}
                className="rounded-lg bg-z-surface-2 px-3.5 py-2 text-[13px] font-semibold text-z-text"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="rounded-lg bg-z-alive px-3.5 py-2 text-[13px] font-semibold text-z-bg"
            >
              {step === steps.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
