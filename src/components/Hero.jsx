import { useNavigate } from 'react-router-dom'
import Button from './shared/Button'
import Container from './shared/Container'
import Hero3DQuantumVault from './shared/Hero3DQuantumVault'
import { ArrowRight, FileText, CheckCircle2 } from 'lucide-react'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen pt-28 pb-16 lg:pt-36 lg:pb-24 flex items-center overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Institutional Value Proposition */}
          <div className="lg:col-span-7 space-y-8 z-10 text-left">

            {/* Executive Gold Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 dark:bg-[#D4AF37]/10 border border-sky-500/30 dark:border-[#D4AF37]/35 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-[#FDE68A] animate-pulse" />
              <span className="text-xs font-bold font-mono tracking-widest text-sky-700 dark:text-[#FDE68A] uppercase">
                INSTITUTIONAL BILL AUDIT & STATUTORY FIDELITY
              </span>
            </div>

            {/* Display Title with 3D Gold Gradient */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-poppins leading-[1.12] text-slate-900 dark:text-white">
                Precision Financial Audit{' '}
                <span className="text-sky-600 dark:gold-gradient-text block">
                  For Executive Expenses.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-sans">
                Identify unauthorized service levies, inaccurate GST brackets, and non-statutory charges on executive dining and corporate expense receipts with mathematical certitude.
              </p>
            </div>

            {/* CTA Action Cluster */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="auth-cta px-7 py-3.5 font-poppins text-base flex items-center justify-center gap-2.5"
              >
                <span>Open Audit Terminal</span>
                <ArrowRight size={18} />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => document.getElementById('bill-simulator')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3.5 font-poppins font-semibold text-sm text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2"
              >
                <FileText size={16} className="text-sky-600 dark:text-[#D4AF37]" />
                <span>Inspect Bill Simulator</span>
              </Button>
            </div>

            {/* Statutory Trust Chips */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">CCPA 2022 Statutory Protection</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-sky-600 dark:text-[#D4AF37] shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Deterministic 5% GST Verification</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-sky-500 dark:text-[#38BDF8] shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Automated Legal Dispute Memos</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Quantum Vault */}
          <div className="lg:col-span-5 relative z-10 flex items-center justify-center">
            <Hero3DQuantumVault />
          </div>

        </div>
      </Container>
    </section>
  )
}