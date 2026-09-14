import Navbar from '../components/Navbar'
import AmbientBackground from '../components/shared/AmbientBackground'
import LiquidMetalHero from '../components/LiquidMetalHero'
import HowItWorks from '../components/HowItWorks'
import InteractiveBillSimulator from '../components/InteractiveBillSimulator'
import TaxAnalysisPreview from '../components/TaxAnalysisPreview'
import ChargeDetection from '../components/ChargeDetection'
import LegalPrecedentsExplorer from '../components/LegalPrecedentsExplorer'
import InstantWaiverBuilder from '../components/InstantWaiverBuilder'
import Features from '../components/Features'
import SecuritySection from '../components/SecuritySection'
import FAQSection from '../components/FAQSection'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import MobileNav from '../components/MobileNav'

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Subtle executive titanium ambient highlights (understated, no garish orbs) */}
      <AmbientBackground />

      <Navbar />

      <main className="flex-1 relative z-10">
        <LiquidMetalHero
          badge="TAXSHIELD AI BILL INTELLIGENCE"
          title="Know Your Bill"
          subtitle="Drop in a bill photo. We will read every line, circle anything odd in the margin, and tell you what is worth questioning — in plain words."
          primaryCtaLabel="Open Dashboard"
          secondaryCtaLabel="See How It Works"
          onPrimaryCtaClick={() => (window.location.href = '/dashboard')}
          onSecondaryCtaClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          features={[
            'TaxShield AI analysis',
            'OCR extraction',
            'Transparent breakdown',
          ]}
        />
        <HowItWorks />
        <InteractiveBillSimulator />
        <TaxAnalysisPreview />
        <ChargeDetection />
        <LegalPrecedentsExplorer />
        <InstantWaiverBuilder />
        <Features />
        <SecuritySection />
        <FAQSection />
        <CTA />
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}