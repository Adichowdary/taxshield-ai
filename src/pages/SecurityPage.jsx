import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Lock, EyeOff, Key } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden font-sans text-slate-100 flex flex-col selection:bg-lime-400 selection:text-slate-950">
      {/* Ambient background blur orbs */}
      <div className="bg-orb bg-orb-gold fixed -top-32 -left-32 w-[480px] h-[480px] animate-spatial-float z-0" />
      <div className="bg-orb bg-orb-emerald fixed top-1/3 -right-32 w-[440px] h-[440px] animate-spatial-float z-0" style={{ animationDelay: '2s' }} />

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto auth-stagger" style={{ animationDelay: '80ms' }}>
          <span className="bg-lime-400/15 text-lime-400 text-xs font-bold px-3.5 py-1 rounded-full border border-lime-400/30 uppercase tracking-wider inline-flex items-center gap-1">
            <Lock size={13} /> Trust & Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-poppins font-bold vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>
            Security & Data Protection
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            How TaxShield safeguards your uploaded bill receipts and financial metadata.
          </p>
        </div>

        {/* Security pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auth-stagger" style={{ animationDelay: '160ms' }}>
          <div className="vision-pro-card p-6 space-y-3 hover:border-lime-400/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-lime-400/15 text-lime-400 border border-lime-400/30 flex items-center justify-center font-bold">
              <Lock size={20} />
            </div>
            <h3 className="font-poppins font-bold text-base" style={{ color: 'var(--text-primary)' }}>Encrypted Processing</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-muted)' }}>
              All uploaded receipt images are transferred using TLS 1.3 encryption and processed strictly to extract line item metadata.
            </p>
          </div>

          <div className="vision-pro-card p-6 space-y-3 hover:border-emerald-400/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-bold">
              <EyeOff size={20} />
            </div>
            <h3 className="font-poppins font-bold text-base" style={{ color: 'var(--text-primary)' }}>Zero Data Monetization</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-muted)' }}>
              We never sell consumer spending habits or merchant records to third-party ad networks or brokers.
            </p>
          </div>

          <div className="vision-pro-card p-6 space-y-3 hover:border-amber-400/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold">
              <Key size={20} />
            </div>
            <h3 className="font-poppins font-bold text-base" style={{ color: 'var(--text-primary)' }}>User Data Control</h3>
            <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-muted)' }}>
              You retain full ownership of your receipt history. Delete your uploaded bills or export analysis reports anytime from Settings.
            </p>
          </div>
        </div>

        {/* Plain language section */}
        <div className="vision-pro-card p-6 md:p-8 space-y-4 auth-stagger" style={{ animationDelay: '240ms' }}>
          <h3 className="font-poppins font-bold text-lg vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>How we protect your data</h3>
          <div className="space-y-3 text-xs leading-relaxed font-sans" style={{ color: 'var(--text-muted)' }}>
            <p>
              1. <strong className="text-lime-400">Local & Encrypted Document Ingestion:</strong> Receipts uploaded to TaxShield are scanned using high-speed optical character recognition. Extracted line items are normalized into secure digital metadata under your private session.
            </p>
            <p>
              2. <strong className="text-lime-400">Rule Engine Isolation:</strong> Tax rules and CCPA guidelines are checked client-side and via secure microservices without exposing personal identity tags.
            </p>
            <p>
              3. <strong className="text-lime-400">Data Purging & Export:</strong> You can purge individual receipt files or export complete spending history in CSV/PDF formats directly from your user dashboard settings.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}
