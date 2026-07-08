import { useRef } from 'react'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import SocialProofSection from '@/components/home/SocialProofSection'
import CtaBand from '@/components/home/CtaBand'
import LandingFooter from '@/components/home/LandingFooter'

/**
 * Home / landing page — public, no Layout wrapper (App.tsx wraps it inside Layout).
 * The Layout renders the shared Header; this page owns every section below that.
 */
export default function Home() {
  const featuresRef = useRef<HTMLElement>(null)

  return (
    <div className="flex flex-col">
      <HeroSection featuresRef={featuresRef} />
      <FeaturesSection ref={featuresRef} />
      <HowItWorksSection />
      <SocialProofSection />
      <CtaBand />
      <LandingFooter />
    </div>
  )
}
