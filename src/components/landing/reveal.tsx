"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Tag = "div" | "h2" | "h3" | "p"

/** Plays a bounce-in animation the first time this element scrolls into
 * view, matching the sourced Claude Design landing mockup's reveal effect. */
export function Reveal({
  as = "div",
  className,
  children,
}: {
  as?: Tag
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement | HTMLHeadingElement | HTMLParagraphElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const revealClass = cn("zt-reveal", inView && "zt-in-view", className)

  if (as === "h2") return <h2 ref={ref} className={revealClass}>{children}</h2>
  if (as === "h3") return <h3 ref={ref} className={revealClass}>{children}</h3>
  if (as === "p") return <p ref={ref} className={revealClass}>{children}</p>
  return <div ref={ref} className={revealClass}>{children}</div>
}
