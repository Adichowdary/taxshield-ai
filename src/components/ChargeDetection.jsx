import Container from './shared/Container'
import SectionHeader from './shared/SectionHeader'
import Button from './shared/Button'
import { AlertTriangle, HelpCircle, Info, ShieldAlert, ArrowRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

export default function ChargeDetection() {
  const [ref, visible] = useReveal()

  return (
    <section ref={ref} className={`py-16 md:py-24 relative reveal ${visible ? 'is-visible' : ''}`}>
      <Container>
        <SectionHeader
          eyebrow="ANOMALY DETECTION ENGINE"
          title="Unlawful Voluntary Charge Identification"
          description="Identify optional gratuities, disguised table fees, and service charges before corporate expense authorization."
        />

        <div className="max-w-3xl mx-auto vault-glass border border-sky-500/25 dark:border-[#D4AF37]/35 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden group">
          {/* Specular Top Accent */}
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-500 dark:via-[#D4AF37] to-transparent" />
          
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3.5">
              <span className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-rose-950/20">
                <ShieldAlert size={24} />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1">
                  <Info size={11} /> CCPA STATUTORY INFRACTION FLAGGED
                </span>
                <h3 className="font-poppins font-bold text-xl text-slate-900 dark:text-white">Voluntary Service Charge Identified</h3>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-[#FDE68A] font-mono">
                ₹125.00
              </div>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-medium">(10.0% Non-Mandatory Levy)</span>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="space-y-3.5 text-sm font-sans text-slate-700 dark:text-slate-300">
            <p className="leading-relaxed">
              TaxShield detected an automated service levy of <strong className="text-slate-900 dark:text-[#FDE68A] font-mono font-bold">₹125.00</strong> appended to the invoice prior to customer consent or agreement.
            </p>
            <div className="text-xs leading-relaxed bg-slate-100/80 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 space-y-1.5 font-mono">
              <span className="text-sky-700 dark:text-[#D4AF37] font-bold block uppercase tracking-wide">CCPA Guideline Mandate (F. No. J-25/57/2022-CCPA):</span>
              <p className="font-sans text-slate-700 dark:text-slate-300">
                Hotels and restaurants are strictly prohibited from levying service charge automatically or disguised under any other name. Any such collection without explicit prior consent constitutes an unfair trade practice.
              </p>
            </div>
          </div>

          {/* CTA Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Statutory review recommended prior to executive invoice settlement</span>
            <Button variant="primary" size="sm" to="/dashboard">
              <HelpCircle size={15} /> <span>Open in Audit Terminal</span> <ArrowRight size={14} />
            </Button>
          </div>

        </div>

      </Container>
    </section>
  )
}
