import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Sparkles, TrendingDown, ArrowUpRight, HelpCircle, CheckCircle } from 'lucide-react';
import { getTaxVerdict } from '../services/llm/taxEngine';

export default function TaxVerdictCard({ verdict: initialVerdict, bill = {} }) {
  // If verdict wasn't passed directly, compute it deterministically
  const verdict = initialVerdict || getTaxVerdict({
    billType: bill.billType || bill.category || 'RESTAURANT',
    items: bill.items || bill.lineItems || [],
    cgst: bill.cgst || 0,
    sgst: bill.sgst || 0,
    igst: bill.igst || 0,
    totalGst: bill.gst || bill.taxes || bill.gstAmount,
    subtotal: bill.subtotal || 0,
    statedTotal: bill.total || bill.totalAmount || 0,
    verification: bill.verification,
    legalAudit: { issues: bill.flags || bill.issues || [] },
  });

  const isOvercharged = verdict.status === 'OVERCHARGED';
  const isSuspicious = verdict.status === 'SUSPICIOUS';
  const isExempt = verdict.status === 'EXEMPT';
  const isCorrect = verdict.status === 'CORRECT';

  // Palette selection based on verdict status
  const theme = isOvercharged
    ? {
        border: 'border-rose-500/40',
        glow: 'shadow-[0_0_35px_rgba(244,63,94,0.25)]',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        scoreColor: 'text-rose-400',
        scoreBg: 'bg-rose-500/10 border-rose-500/30',
        icon: AlertOctagon,
        iconColor: 'text-rose-400',
        accentBg: 'bg-rose-500/10',
      }
    : isSuspicious
    ? {
        border: 'border-amber-500/40',
        glow: 'shadow-[0_0_35px_rgba(245,158,11,0.2)]',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        scoreColor: 'text-amber-400',
        scoreBg: 'bg-amber-500/10 border-amber-500/30',
        icon: AlertTriangle,
        iconColor: 'text-amber-400',
        accentBg: 'bg-amber-500/10',
      }
    : isExempt
    ? {
        border: 'border-sky-500/40',
        glow: 'shadow-[0_0_35px_rgba(14,165,233,0.25)]',
        badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        scoreColor: 'text-sky-400',
        scoreBg: 'bg-sky-500/10 border-sky-500/30',
        icon: Sparkles,
        iconColor: 'text-sky-400',
        accentBg: 'bg-sky-500/10',
      }
    : {
        border: 'border-emerald-500/40',
        glow: 'shadow-[0_0_35px_rgba(16,185,129,0.25)]',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        scoreColor: 'text-emerald-400',
        scoreBg: 'bg-emerald-500/10 border-emerald-500/30',
        icon: ShieldCheck,
        iconColor: 'text-emerald-400',
        accentBg: 'bg-emerald-500/10',
      };

  const StatusIcon = theme.icon;

  return (
    <div className={`vision-pro-card p-6 rounded-3xl border ${theme.border} ${theme.glow} relative overflow-hidden transition-all duration-300 space-y-5 backdrop-blur-xl`}>
      {/* Ambient decorative gradient orb */}
      <div
        className={`absolute -right-20 -top-20 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isOvercharged ? 'bg-rose-500' : isSuspicious ? 'bg-amber-500' : isExempt ? 'bg-sky-500' : 'bg-emerald-500'
        }`}
      />

      {/* Header Row: Badge, Title, Score */}
      <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
        <div className="space-y-1.5 flex-1 min-w-[240px]">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${theme.badgeBg}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {verdict.badgeText || 'Tax Analysis Complete'}
            </span>
            <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50">
              {verdict.categoryLabel || bill.category || 'Retail Receipt'}
            </span>
          </div>

          <h3 className="text-xl font-poppins font-bold flex items-center gap-2 pt-1 text-slate-100">
            <StatusIcon size={24} className={`${theme.iconColor} shrink-0`} />
            <span>{isOvercharged ? 'Tax Overcharge Detected' : isSuspicious ? 'Tax Discrepancy Flagged' : isExempt ? 'Zero-Tax Statutory Exemption' : 'Statutory Tax Compliance Verified'}</span>
          </h3>
        </div>

        {/* Tax Health Score Gauge */}
        <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl border ${theme.scoreBg} min-w-[90px]`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tax Health</span>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-2xl font-black font-mono ${theme.scoreColor}`}>{verdict.score ?? 95}</span>
            <span className="text-[11px] text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Headline & Explanation */}
      <div className="space-y-2 relative z-10">
        <p className="text-sm font-semibold text-slate-200 leading-snug">
          {verdict.headline}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          {verdict.summary}
        </p>
      </div>

      {/* Overcharge Refund Callout if applicable */}
      {isOvercharged && verdict.overchargeAmount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-rose-300 flex items-center gap-1">
              <TrendingDown size={14} /> Potential Recoverable Excess
            </span>
            <div className="text-2xl font-black font-mono text-rose-400">
              ₹{Number(verdict.overchargeAmount).toFixed(2)}
            </div>
          </div>
          <div className="text-xs text-rose-200 max-w-xs leading-tight">
            You may be entitled to a refund or invoice amendment per Indian Consumer Protection guidelines.
          </div>
        </div>
      )}

      {/* Breakdown Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 relative z-10">
        {(verdict.breakdown || []).map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/40 text-left space-y-0.5"
          >
            <span className="text-[10px] uppercase tracking-wider block text-slate-400 font-medium truncate">
              {item.label}
            </span>
            <span className="text-xs font-mono font-bold text-slate-100 block truncate">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Action Recommendation Banner */}
      {verdict.actionRecommended && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 relative z-10">
          <CheckCircle size={15} className={`${theme.iconColor} shrink-0 mt-0.5`} />
          <div className="leading-normal">
            <strong className="text-slate-100">Next Step: </strong>
            {verdict.actionRecommended}
          </div>
        </div>
      )}
    </div>
  );
}
