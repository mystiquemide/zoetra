import { Hero } from "@/components/landing/hero"
import { VerifyStrip } from "@/components/landing/verify-strip"
import { ChainStatement, BountyStatement } from "@/components/landing/statement"
import { HowItWorks } from "@/components/landing/how-it-works"
import { LiveProofCta } from "@/components/landing/live-proof-cta"
import { LandingFooter } from "@/components/landing/footer"

export default function Home() {
  return (
    <>
      <Hero />
      <VerifyStrip />
      <ChainStatement />
      <HowItWorks />
      <BountyStatement />
      <LiveProofCta />
      <LandingFooter />
    </>
  )
}
