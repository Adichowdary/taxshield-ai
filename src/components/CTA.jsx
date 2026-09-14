import Container from './shared/Container'
import Button from './shared/Button'
import { ArrowRight, ShieldCheck, Sparkles, Lock, Zap, Star } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useTilt } from '../hooks/useTilt'

const trustPillars = [
  { icon: Lock, label: '100% Client-Side Privacy' },
  { icon: Zap, label: 'Instant AI Analysis' },
  { icon: Star, label: 'CCPA 2022 Compliant' },
  { icon: ShieldCheck, label: 'Enterprise-Grade Security' },
]

export default function CTA() {
  const [ref, visible] = useReveal()
  const tilt = useTilt(6)

  return (
    <section className="py-20 md:py-28 relative cta-section-bg">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px glow-divider" />

      <Container>
        <div 
          ref={(el) => { ref.current = el; tilt.ref.current = el }} 
          onPointerMove={tilt.onMove} 
          onPointerLeave={tilt.onLeave}
          className={`gradient-border reveal ${visible ? 'is-visible' : ''}`}
        >
          <div
            className="p-10 md:p-16 text-center relative overflow-hidden rounded-3xl"
            style={{
              background: 'linear-gradient(145deg, rgba(18, 12, 3, 0.96) 0%, rgba(8, 5, 1, 0.98) 50%, rgba(12, 18, 32, 0.96) 100%)',
            }}
          >
            {/* Specular top accent */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

            {/* Ambient glow layers */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#38BDF8]/8 blur-[100px] pointer-events-none" />

            {/* Floating particles */}
            <div className="ambient-particle" style={{ left: '15%', top: '20%', '--duration': '7s', '--delay': '0s' }} />
            <div className="ambient-particle" style={{ left: '75%', top: '30%', '--duration': '5s', '--delay': '1.5s', background: '#38BDF8' }} />
            <div className="ambient-particle" style={{ left: '85%', top: '70%', '--duration': '9s', '--delay': '0.5s' }} />
            <div className="ambient-particle" style={{ left: '25%', top: '80%', '--duration': '6s', '--delay': '2s', background: '#10B981' }} />

            <div className="relative z-10 space-y-6">
              <span className="badge-gold">
                <Sparkles size={13} />
                STATUTORY CONSUMER FIDELITY PLATFORM
              </span>

              <h2 className="text-3xl sm:text-5xl md:text-6xl font-poppins font-extrabold leading-[1.1] tracking-tight text-white">
                Hand us the invoice.{' '}
                <span className="text-shimmer block mt-2">
                  We audit the fine print.
                </span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-sans" style={{ color: 'var(--text-secondary, #CBD5E1)' }}>
                One receipt photo is all it takes — TaxShield extracts every line item, recalculates 5% GST brackets, and drafts authoritative CCPA dispute notices in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  to="/dashboard" 
                  className="w-full sm:w-auto px-10 auth-cta text-slate-950 font-bold shadow-[0_0_40px_rgba(212,175,55,0.4)] border-glow-animated"
                >
                  <span>Open Audit Terminal</span> <ArrowRight size={20} />
                </Button>

                <Button 
                  variant="secondary" 
                  size="lg" 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto font-semibold px-10 vault-glass border border-white/15 hover:border-[#D4AF37]/50"
                  style={{ color: 'var(--text-primary, #FFFFFF)' }}
                >
                  Learn How It Works
                </Button>
              </div>

              {/* Trust pillars */}
              <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
                {trustPillars.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted, #94A3B8)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
                      <Icon size={12} style={{ color: 'var(--accent-gold, #D4AF37)' }} />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
