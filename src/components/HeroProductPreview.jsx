import { AlertTriangle, CheckCircle2, FileText, ArrowRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HeroProductPreview() {
  return (
    <div className="vision-pro-card !p-0 overflow-hidden elev-3 preserve-3d paper-grain">
      
      {/* Top Application Browser & Demo Badge Bar */}
      <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          <span className="ml-2 text-xs font-mono font-medium" style={{ color: 'var(--text-muted)' }}>taxshield.ai/demo</span>
        </div>
        
        {/* Explicit Demo Label */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-lime-400 bg-lime-400/10 px-3 py-1 rounded-full border border-lime-400/30">
          <Info size={13} /> INTERACTIVE DEMO PREVIEW
        </div>
      </div>

      {/* Split Screen Application Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-500/20 text-sm">
        
        {/* Left: Sample Receipt Preview */}
        <div className="p-5 space-y-3 tz-20" style={{ background: 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center justify-between uppercase tracking-wider text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5"><FileText size={14} className="text-lime-400" /> Sample Receipt</span>
            <span className="font-mono text-xs">#DEMO-101</span>
          </div>

          <div className="vision-pro-pill p-4 font-mono text-xs space-y-2 receipt-edge" style={{ color: 'var(--text-primary)' }}>
            <div className="text-center pb-2.5 border-b border-dashed border-slate-500/30 font-sans">
              <h4 className="font-bold text-sm vision-pro-text-emerald">THE GRILL HOUSE</h4>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>102 Connaught Place, ND</p>
            </div>

            <div className="space-y-1.5 py-1 font-sans">
              <div className="flex justify-between">
                <span>Food Items Subtotal</span>
                <span className="font-mono font-bold">₹1,250.00</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>CGST (2.5%)</span>
                <span className="font-mono">₹31.25</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>SGST (2.5%)</span>
                <span className="font-mono">₹31.25</span>
              </div>
              <div className="flex justify-between bg-amber-500/15 text-amber-300 px-2 py-1 rounded-lg font-bold border border-amber-400/30">
                <span>Service Charge (10%)</span>
                <span className="font-mono">₹125.00</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-500/30 flex justify-between font-bold text-sm font-sans">
              <span>TOTAL PAID</span>
              <span className="font-mono text-base vision-pro-text-emerald">₹1,437.50</span>
            </div>
          </div>
        </div>

        {/* Right: AI Analysis Report Card */}
        <div className="p-5 space-y-4 font-sans tz-40">
          <div className="flex items-center justify-between">
            <span className="font-poppins font-bold text-xs uppercase tracking-wider text-lime-400">
              Demo Analysis Result
            </span>
            <span className="bg-amber-500/15 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
              <AlertTriangle size={13} /> Worth a look
            </span>
          </div>

          {/* Confidence Score Ring */}
          <div className="vision-pro-pill p-3.5 flex items-center gap-3.5 border-amber-400/40 tz-60 pop-3d">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center font-poppins font-extrabold text-amber-400 text-sm shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              87
            </div>
            <div>
              <h5 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Bill Confidence Score</h5>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>87 / 100 • 1 issue flagged</p>
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-start gap-2 text-emerald-300">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>GST calculation verified (5% rate)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-start gap-2 text-emerald-300">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Line item arithmetic verified</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2 text-amber-300">
              <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <span>10% service charge — circled in the margin</span>
            </div>
          </div>
          <p className="margin-note">— checked by hand, 87/100</p>

          <Link
            to="/dashboard"
            className="auth-cta w-full py-2.5 text-slate-950 rounded-xl font-poppins text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            Inspect Live Dashboard <ArrowRight size={14} />
          </Link>

        </div>

      </div>

    </div>
  )
}
