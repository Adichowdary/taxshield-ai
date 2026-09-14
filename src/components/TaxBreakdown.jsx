import { PieChart, AlertCircle, ShieldCheck } from 'lucide-react'

export default function TaxBreakdown({ bill }) {
  const subtotal = Number(bill?.subtotal || 0)
  const cgst = Number(bill?.cgst || 0)
  const sgst = Number(bill?.sgst || 0)
  const igst = Number(bill?.igst || 0)
  const totalTax = Number(bill?.taxes ?? (cgst + sgst + igst))
  
  const effectiveRate = subtotal > 0 ? ((totalTax / subtotal) * 100) : 5.0
  const isLuxury = bill?.category === "LUXURY_HOTEL_RESTAURANT" || bill?.establishmentType === "LUXURY_HOTEL_RESTAURANT"
  const legalBracket = isLuxury ? "18% GST (Luxury / 5-Star Hotel)" : "5% GST (Standard Restaurant)"
  
  // Find tax discrepancy issue if any
  const taxIssue = bill?.issues?.find(i => i.type === 'TAX_DISCREPANCY')

  // Visual SVG calculation (clamp between 0 and 100)
  const visualPct = Math.min(100, Math.max(0, effectiveRate))
  const dashArray = `${visualPct} ${100 - visualPct}`

  return (
    <div className="vision-pro-card p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-500/30">
        <h3 className="font-poppins font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <PieChart size={18} className="text-lime-400" /> Tax Breakdown & Statutory Audit
        </h3>
        <span className="text-xs font-mono text-lime-400 font-bold">
          Effective Rate: {effectiveRate.toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Values Table */}
        <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
          <div className="flex justify-between py-1.5 border-b border-slate-500/20">
            <span style={{ color: 'var(--text-muted)' }}>Taxable Subtotal</span>
            <span className="font-semibold font-mono">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-500/20 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>CGST ({subtotal > 0 ? ((cgst / subtotal) * 100).toFixed(1) : '2.5'}%)</span>
            <span className="font-mono">₹{cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-500/20 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>SGST ({subtotal > 0 ? ((sgst / subtotal) * 100).toFixed(1) : '2.5'}%)</span>
            <span className="font-mono">₹{sgst.toFixed(2)}</span>
          </div>
          {igst > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-500/20 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>IGST ({subtotal > 0 ? ((igst / subtotal) * 100).toFixed(1) : '5.0'}%)</span>
              <span className="font-mono">₹{igst.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 font-bold border-t border-slate-500/30">
            <span>Total Calculated Tax</span>
            <span className="vision-pro-text-emerald font-mono text-base">₹{totalTax.toFixed(2)}</span>
          </div>
        </div>

        {/* Right: Visual Donut Representation */}
        <div className="vision-pro-pill p-4 flex flex-col items-center justify-center border-lime-400/20">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background ring (Subtotal) */}
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="transparent"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              {/* Tax segment */}
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="transparent"
                stroke={taxIssue ? "#f43f5e" : "#84cc16"}
                strokeWidth="4"
                strokeDasharray={dashArray}
                strokeDashoffset="0"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-poppins">
              <span className={`text-xs font-bold ${taxIssue ? 'text-rose-400' : 'text-lime-400'}`}>
                {effectiveRate.toFixed(1)}%
              </span>
              <span className="text-[10px] uppercase font-sans" style={{ color: 'var(--text-muted)' }}>
                Effective Tax
              </span>
            </div>
          </div>
          <p className="text-[11px] mt-2 text-center font-medium" style={{ color: 'var(--text-muted)' }}>
            {legalBracket}
          </p>
        </div>
      </div>

      {/* Discrepancy Alert vs Verified Banner */}
      {taxIssue ? (
        <div className="mt-5 p-3.5 bg-rose-500/15 border border-rose-400/30 rounded-xl text-xs text-rose-300 space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <AlertCircle size={16} /> Potential Tax Discrepancy Detected
          </div>
          <div className="flex items-center justify-between pt-1 font-mono">
            <span>Expected Tax ({isLuxury ? '18%' : '5%'}): ₹{taxIssue.expectedAmount?.toFixed(2) || (subtotal * (isLuxury ? 0.18 : 0.05)).toFixed(2)}</span>
            <span>Detected Tax: ₹{taxIssue.detectedAmount?.toFixed(2) || totalTax.toFixed(2)}</span>
            {taxIssue.amount > 0 && (
              <span className="text-rose-400 font-bold">Overcharge: +₹{taxIssue.amount.toFixed(2)}</span>
            )}
          </div>
          <p className="text-[11px] pt-1 font-sans text-rose-200">{taxIssue.description}</p>
        </div>
      ) : (
        <div className="mt-5 p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>
            Tax calculation verified: applied rate matches the statutory {isLuxury ? '18%' : '5%'} Indian GST threshold.
          </span>
        </div>
      )}
    </div>
  )
}
