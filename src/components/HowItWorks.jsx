import Container from './shared/Container'
import SectionHeader from './shared/SectionHeader'
import { Upload, Zap, BarChart3, ShieldCheck } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

export default function HowItWorks() {
  const [ref, visible] = useReveal()

  const steps = [
    {
      num: '01',
      title: 'Scan Invoice',
      description: 'Upload or capture a photo of any restaurant invoice, fine-dining bill, or catering receipt.',
      icon: Upload,
      iconClass: 'icon-glow-gold',
      accentColor: '#D4AF37',
      connectorColor: '#D4AF37',
    },
    {
      num: '02',
      title: 'Neural Extraction',
      description: 'High-precision OCR deterministic parser identifies items, subtotals, merchant GSTIN, and hidden levies.',
      icon: Zap,
      iconClass: 'icon-glow-sapphire',
      accentColor: '#38BDF8',
      connectorColor: '#38BDF8',
    },
    {
      num: '03',
      title: 'Statutory Verification',
      description: 'Calculates exact 5% standalone food GST vs unlawful cascading taxes on unauthorized service charges.',
      icon: BarChart3,
      iconClass: 'icon-glow-gold',
      accentColor: '#D4AF37',
      connectorColor: '#D4AF37',
    },
    {
      num: '04',
      title: 'Dispute & Recover',
      description: 'Generates instant CCPA 2022 legal waiver notices and formal consumer court dispute drafts in one click.',
      icon: ShieldCheck,
      iconClass: 'icon-glow-emerald',
      accentColor: '#10B981',
      connectorColor: '#10B981',
    },
  ]

  return (
    <section id="how-it-works" ref={ref} className={`py-24 md:py-32 relative section-alt-1 reveal ${visible ? 'is-visible' : ''}`}>
      {/* Glowing top divider */}
      <div className="absolute top-0 left-0 right-0 h-px glow-divider" />

      <Container>
        <SectionHeader
          eyebrow="INSTITUTIONAL PIPELINE"
          title="How TaxShield Works"
          description="From receipt capture to deterministic legal protection in four precision steps."
        />

        {/* Process Timeline Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 relative reveal-group ${visible ? 'is-visible' : ''}`}>
          {steps.map((step, idx) => {
            const Icon = step.icon

            return (
              <div 
                key={idx} 
                className="relative flex flex-col items-start neon-card-gold p-7 rounded-2xl group hover:-translate-y-2 transition-all duration-300"
              >
                {/* Connector arrow (except last) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-10 w-6 text-center z-10" 
                    style={{ color: step.connectorColor, opacity: 0.6 }}>
                    ›
                  </div>
                )}

                {/* Step Number & Glowing Icon Box */}
                <div className="flex items-center justify-between w-full mb-6">
                  <span
                    className="font-mono font-extrabold text-2xl transition-colors duration-300"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  >
                    {step.num}
                  </span>
                  <div className={`w-12 h-12 ${step.iconClass} flex items-center justify-center shadow-md`}>
                    <Icon size={22} />
                  </div>
                </div>

                <h3 className="font-poppins font-bold text-lg mb-2 tracking-tight" style={{ color: 'var(--text-primary, #FFFFFF)' }}>
                  {step.title}
                </h3>

                <p className="text-sm leading-relaxed font-sans" style={{ color: 'var(--text-muted, #94A3B8)' }}>
                  {step.description}
                </p>

                {/* Bottom animated progress bar */}
                <div className="w-full h-0.5 mt-6 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div 
                    className="h-full w-0 group-hover:w-full transition-all duration-700 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${step.accentColor}, transparent)` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Container>

      {/* Glowing bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px glow-divider" />
    </section>
  )
}