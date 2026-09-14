import { X, HelpCircle, ShieldCheck, Scale, FileText } from 'lucide-react'
import Button from './shared/Button'

export default function ExplanationDrawer({ issue, isOpen, onClose, onGenerateComplaint }) {
  if (!isOpen || !issue) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in font-sans">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 persp-1200">
        <div className="w-screen max-w-md bg-slate-950/95 text-slate-100 elev-4 border-l-2 border-lime-400/40 flex flex-col backdrop-blur-2xl preserve-3d tz-60">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-500/30 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-base vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>Charge Analysis</h3>
                <p className="text-xs font-sans" style={{ color: 'var(--text-muted)' }}>Consumer Protection Guide</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body content */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6 text-sm">
            
            {/* Title & Badge */}
            <div className="vision-pro-card-glow-amber p-4 space-y-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Flagged Item
              </span>
              <h4 className="font-poppins font-bold text-lg text-amber-200">
                {issue.title}
              </h4>
              {issue.amount && (
                <div className="text-2xl font-bold font-poppins text-amber-300 font-mono">
                  ₹{issue.amount.toFixed(2)} {issue.percentage ? `(${issue.percentage})` : ''}
                </div>
              )}
            </div>

            {/* What is this charge? */}
            <div className="space-y-2">
              <h5 className="font-poppins font-bold text-xs uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                <FileText size={14} className="text-lime-400" /> What is this charge?
              </h5>
              <p className="text-xs leading-relaxed vision-pro-pill p-3.5 border-lime-400/20 font-sans" style={{ color: 'var(--text-muted)' }}>
                {issue.description}
              </p>
            </div>

            {/* Legal Framework / Rules */}
            <div className="space-y-2">
              <h5 className="font-poppins font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Scale size={14} className="text-cyan-400" /> Consumer Rights Guidelines
              </h5>
              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-2xl p-4 space-y-2 text-cyan-200 text-xs leading-relaxed">
                <p className="font-bold text-cyan-300">Central Consumer Protection Authority (CCPA)</p>
                <p>
                  1. No hotel or restaurant shall add service charge automatically or by default in the bill.
                </p>
                <p>
                  2. Service charge shall not be collected under any other name.
                </p>
                <p>
                  3. A customer may request the establishment to remove the service charge prior to payment.
                </p>
              </div>
            </div>

            {/* What can you do next? */}
            <div className="space-y-2">
              <h5 className="font-poppins font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" /> Recommended Action
              </h5>
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl text-xs leading-relaxed text-emerald-300 font-medium">
                {issue.recommendation}
              </div>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="p-5 border-t border-slate-500/30 bg-slate-900/60 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose()
                if (onGenerateComplaint) onGenerateComplaint()
              }}
              className="w-full font-bold"
            >
              Draft Formal Consumer Complaint
            </Button>
            <Button variant="outline" size="md" onClick={onClose} className="w-full">
              Close Explanation
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
