import Container from './shared/Container'
import SectionHeader from './shared/SectionHeader'
import { PieChart, ShieldCheck, Info, CheckCircle2, Sparkles } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import Holographic3DReceipt from './shared/Holographic3DReceipt'

export default function TaxAnalysisPreview() {
  const [ref, visible] = useReveal()

  return (
    <section id="transparency" ref={ref} className={`py-24 md:py-32 relative reveal ${visible ? 'is-visible' : ''}`}>
      <Container>
        <SectionHeader
          eyebrow="TAX FIDELITY BENCHMARK"
          title="Automated 5% GST Statutory Verification"
          description="TaxShield deterministically cross-checks line item subtotals against official restaurant GST brackets and detects compounded taxation."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
          
          {/* Left: 3D Holographic Perspective Receipt */}
          <div className="lg:col-span-6 auth-stagger" style={{ animationDelay: '100ms' }}>
            <Holographic3DReceipt />
          </div>

          {/* Right: Institutional Rule Intelligence Panel */}
          <div className="lg:col-span-6 space-y-6 auth-stagger" style={{ animationDelay: '250ms' }}>
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold text-sky-700 dark:text-[#FDE68A] bg-sky-500/10 dark:bg-[#D4AF37]/10 border border-sky-500/30 dark:border-[#D4AF37]/30">
                <Sparkles size={12} /> CBIC NOTIFICATION NO. 46/2017
              </span>
              <h3 className="font-poppins font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
                Deterministic 5% Restaurant GST Framework
              </h3>
              <p className="text-sm sm:text-base leading-relaxed font-sans text-slate-700 dark:text-slate-300">
                Standalone food and beverage dining establishments in India are taxed strictly under the 5% GST bracket (2.5% CGST + 2.5% SGST) without Input Tax Credit (ITC).
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 gap-3.5">
              <div className="p-4 rounded-xl vault-glass border border-slate-200 dark:border-white/10 hover:border-sky-500/35 dark:hover:border-[#D4AF37]/35 transition-all">
                <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-sm mb-1">
                  <CheckCircle2 size={16} className="text-sky-600 dark:text-[#D4AF37]" />
                  <span>No Tax-on-Tax Compounding</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                  When restaurants levy service charge, calculating GST on the inflated subtotal is unlawful compounding. TaxShield strips unauthorized levies before tax computation.
                </p>
              </div>

              <div className="p-4 rounded-xl vault-glass border border-slate-200 dark:border-white/10 hover:border-[#38BDF8]/35 transition-all">
                <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-sm mb-1">
                  <CheckCircle2 size={16} className="text-[#38BDF8]" />
                  <span>Alcohol vs Food Split Verification</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                  Alcoholic beverages attract State VAT (not GST). TaxShield parses mixed orders and isolates VAT-governed items from 5% GST goods.
                </p>
              </div>

              <div className="p-4 rounded-xl vault-glass border border-slate-200 dark:border-white/10 hover:border-emerald-500/35 transition-all">
                <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-sm mb-1">
                  <ShieldCheck size={16} className="text-emerald-500 dark:text-emerald-400" />
                  <span>CCPA Section 2(47) Enforceability</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                  Unfair trade practice protections enable immediate automated removal of compulsory table levies.
                </p>
              </div>
            </div>

          </div>

        </div>
      </Container>
    </section>
  )
}
