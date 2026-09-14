import Container from './shared/Container'
import SectionHeader from './shared/SectionHeader'
import { ShieldCheck, Brain, History, PieChart, FileText, ArrowRight, Scan, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import { useTilt } from '../hooks/useTilt'

function TiltCard({ children, className = '', delay = '200ms' }) {
  const tilt = useTilt(8)
  return (
    <div 
      ref={tilt.ref} 
      onPointerMove={tilt.onMove} 
      onPointerLeave={tilt.onLeave} 
      className={`neon-card-gold p-7 space-y-4 auth-stagger rounded-2xl transition-all duration-300 group ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  )
}

export default function Features() {
  const [ref, visible] = useReveal()

  const secondaryFeatures = [
    {
      icon: ShieldCheck,
      title: 'GST Bracket Verification',
      description: 'Verify 5% vs 18% GST calculation brackets against official restaurant tax guidelines in real time.',
      iconClass: 'icon-glow-gold',
    },
    {
      icon: Brain,
      title: 'Levy Anomaly Detection',
      description: 'Automatically identify voluntary 10% service charges, packaging fees, or disguised gratuities.',
      iconClass: 'icon-glow-rose',
    },
    {
      icon: History,
      title: 'Immutable Audit Vault',
      description: 'Keep your previous receipt analyses organized, indexed, and accessible anytime from your account.',
      iconClass: 'icon-glow-sapphire',
    },
    {
      icon: PieChart,
      title: 'Executive Spend Analytics',
      description: 'Track cumulative dining spending, total GST taxes paid, and monthly fee trends with high-res charts.',
      accentColor: '#818CF8',
      accentBg: 'bg-indigo-500/15',
      accentBorder: 'border-indigo-500/40',
      accentText: 'text-indigo-300',
      iconClass: null,
    },
    {
      icon: FileText,
      title: 'Statutory Dispute Memos',
      description: 'Generate legally structured analysis summaries and CCPA grievance notices ready for management review.',
      iconClass: 'icon-glow-emerald',
    },
    {
      icon: Scan,
      title: 'Multi-Format Receipt OCR',
      description: 'Process paper till receipts, thermal printouts, POS terminal slips, and digital PDF invoices instantly.',
      iconClass: 'icon-glow-gold',
    },
  ]

  return (
    <section id="features" ref={ref} className={`py-24 md:py-32 relative section-alt-2 reveal ${visible ? 'is-visible' : ''}`}>
      {/* Gold top-border glow line */}
      <div className="absolute top-0 left-0 right-0 h-px glow-divider" />

      <Container>
        <SectionHeader
          eyebrow="ENTERPRISE CAPABILITIES"
          title="Engineered for Bill Intelligence & Precision"
          description="Comprehensive statutory audit suite built to give executive consumers and corporate finance teams 100% clarity."
        />

        {/* Primary Feature Showcase */}
        <div className="mb-12 auth-stagger gradient-border" style={{ animationDelay: '100ms' }}>
          <div
            className="p-8 md:p-12 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 10, 2, 0.97) 0%, rgba(20, 14, 5, 0.9) 40%, rgba(10, 14, 25, 0.97) 100%)',
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            {/* Ambient glow blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#D4AF37]/8 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#38BDF8]/6 blur-[80px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              
              <div className="lg:col-span-6 space-y-5">
                <span className="badge-gold">
                  <Sparkles size={12} />
                  FLAGSHIP AUDIT ENGINE
                </span>
                <h3 className="text-2xl sm:text-4xl font-poppins font-extrabold leading-tight tracking-tight text-shimmer">
                  TaxShield AI Optical Bill Scanning
                </h3>
                <p className="text-sm sm:text-base leading-relaxed font-sans" style={{ color: 'var(--text-secondary, #CBD5E1)' }}>
                  Upload or capture any dining invoice. Our deterministic OCR engine extracts every line item, validates merchant GSTIN legality, and runs real-time bracket math in milliseconds.
                </p>
                <div className="pt-2">
                  <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold link-gold group">
                    <span>Launch Audit Terminal</span> 
                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 terminal-block">
                <div className="flex justify-between font-bold pb-2.5 border-b border-white/10">
                  <span className="text-white text-xs font-mono">OCR Extracted Invoice Stream</span>
                  <span className="text-emerald-400 text-xs font-bold font-mono">99.8% FIDELITY</span>
                </div>
                <div className="space-y-2.5 mt-3 text-slate-300 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Merchant:</span>
                    <span className="font-bold text-white">The Royal Obsidian Dining Club</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Invoice:</span>
                    <span className="text-slate-200">31 Jul 2026 (#RO-10482)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal:</span>
                    <span className="text-white font-bold">₹12,450.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Verified Food GST (5%):</span>
                    <span>₹622.50</span>
                  </div>
                  <div className="flex justify-between text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 mt-1">
                    <span>Disputed Voluntary Charge (10%):</span>
                    <span>₹1,245.00 <span className="text-rose-300">(FLAGGED)</span></span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-white/10">
                    <span>Total Recoverable:</span>
                    <span className="animate-pulse-gold rounded px-2 py-0.5">₹1,245.00</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Secondary Features Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-group ${visible ? 'is-visible' : ''}`}>
          {secondaryFeatures.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <TiltCard key={idx} delay={`${idx * 100 + 200}ms`}>
                {/* Icon box */}
                {feat.iconClass ? (
                  <div className={`w-12 h-12 ${feat.iconClass} flex items-center justify-center shadow-md`}>
                    <Icon size={22} />
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-[14px] ${feat.accentBg} border ${feat.accentBorder} ${feat.accentText} flex items-center justify-center font-bold shadow-md`}>
                    <Icon size={22} />
                  </div>
                )}
                <h4 className="font-poppins font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary, #FFFFFF)' }}>
                  {feat.title}
                </h4>
                <p className="text-sm leading-relaxed font-sans" style={{ color: 'var(--text-muted, #94A3B8)' }}>
                  {feat.description}
                </p>
                {/* Bottom progress indicator */}
                <div className="w-full h-px mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, var(--accent-gold, #D4AF37), transparent)' }}
                />
              </TiltCard>
            )
          })}
        </div>

      </Container>
      {/* Gold bottom-border glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px glow-divider" />
    </section>
  )
}