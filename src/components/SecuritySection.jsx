import Container from './shared/Container'
import { Lock, ShieldCheck, Key, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

export default function SecuritySection() {
  const [ref, visible] = useReveal()

  return (
    <section id="security" ref={ref} className={`py-20 md:py-28 relative reveal ${visible ? 'is-visible' : ''}`}>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Interface / Security graphic preview */}
          <div className="lg:col-span-6 vault-glass border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-500 dark:via-[#D4AF37] to-transparent" />

            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-[#D4AF37]/15 border border-sky-500/30 dark:border-[#D4AF37]/35 flex items-center justify-center text-sky-600 dark:text-[#FDE68A]">
                  <Lock size={16} />
                </div>
                <span className="font-poppins font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Enterprise Security Controls
                </span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                TLS 1.3 End-to-End
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Receipt Metadata Processing</span>
                <span className="font-bold text-sky-700 dark:text-[#FDE68A] font-mono">In-Memory Ephemeral</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Third-Party Data Monetization</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">STRICTLY FORBIDDEN</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">OCR Vector Store Encryption</span>
                <span className="font-bold text-[#38BDF8] font-mono">AES-256 GCM</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Audit Trail Export Fidelity</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">ISO 27001 Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Trust Principles */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-sky-700 dark:text-[#FDE68A] bg-sky-500/10 dark:bg-[#D4AF37]/10 border border-sky-500/30 dark:border-[#D4AF37]/30 uppercase tracking-widest">
              <Sparkles size={12} /> SOVEREIGN FINANCIAL PRIVACY
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-poppins font-extrabold leading-tight text-slate-900 dark:text-white tracking-tight">
              Your Executive Bills Deserve Sovereign Privacy.
            </h2>

            <p className="text-base leading-relaxed font-sans text-slate-700 dark:text-slate-300">
              TaxShield processes sensitive dining and corporate entertainment invoices inside sandboxed, encrypted pipelines. Your financial transaction habits and merchant receipts belong exclusively to you.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 dark:bg-[#D4AF37]/15 border border-sky-500/30 dark:border-[#D4AF37]/30 flex items-center justify-center text-sky-600 dark:text-[#FDE68A] shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong className="block font-bold text-sm text-slate-900 dark:text-white font-poppins">Controlled Optical Parsing</strong>
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Receipts are scanned solely to verify 5% GST brackets and identify non-statutory service levies.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5">
                  <EyeOff size={18} />
                </div>
                <div>
                  <strong className="block font-bold text-sm text-slate-900 dark:text-white font-poppins">Zero Telemetry Ad Tracking</strong>
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Your consumer expenditure data is never monetized, cross-sold, or brokered to marketing networks.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0 mt-0.5">
                  <Key size={18} />
                </div>
                <div>
                  <strong className="block font-bold text-sm text-slate-900 dark:text-white font-poppins">Total Erasure & Export Control</strong>
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Download complete encrypted ledger archives or purge your invoice history instantly with one click.
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </Container>
    </section>
  )
}
