import { BarChart2 } from 'lucide-react'

export default function ChargeBreakdown({ bill }) {
  const total = Number(bill?.totalAmount ?? bill?.total ?? 1437.50)
  const subtotal = Number(bill?.subtotal ?? 1250.00)
  const tax = Number(bill?.taxes ?? bill?.gst ?? 62.50)
  const serviceCharge = Number(bill?.serviceCharge ?? 0)
  const packaging = Number(bill?.packagingFee ?? 0)
  const platformFee = Number(bill?.platformFee ?? 0)
  const delivery = Number(bill?.deliveryFee ?? 0)
  const discount = Number(bill?.discount ?? 0)

  const foodPct = total > 0 ? Math.round((subtotal / total) * 100) : 0
  const taxPct = total > 0 ? Math.round((tax / total) * 100) : 0
  const servicePct = total > 0 ? Math.round((serviceCharge / total) * 100) : 0
  const platformPct = total > 0 ? Math.round((platformFee / total) * 100) : 0

  const categories = [
    { name: 'Food & Line Items', amount: subtotal, pct: foodPct, color: 'bg-lime-400', textColor: 'text-lime-400' },
    { name: 'Government GST', amount: tax, pct: taxPct, color: 'bg-emerald-400', textColor: 'text-emerald-400' },
    ...(serviceCharge > 0 ? [{ name: 'Service Charge (Flagged)', amount: serviceCharge, pct: servicePct, color: 'bg-amber-400', textColor: 'text-amber-400' }] : []),
    ...(platformFee > 0 ? [{ name: 'App Platform Fee', amount: platformFee, pct: platformPct || 1, color: 'bg-purple-400', textColor: 'text-purple-400' }] : []),
    ...(packaging > 0 ? [{ name: 'Packaging Fee', amount: packaging, pct: 2, color: 'bg-cyan-400', textColor: 'text-cyan-400' }] : []),
    ...(delivery > 0 ? [{ name: 'Delivery Fee', amount: delivery, pct: 3, color: 'bg-indigo-400', textColor: 'text-indigo-400' }] : []),
    ...(discount > 0 ? [{ name: 'Discount Applied', amount: -discount, pct: 0, color: 'bg-emerald-300', textColor: 'text-emerald-300 font-bold' }] : []),
  ]

  return (
    <div className="vision-pro-card p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-500/30">
        <h3 className="font-poppins font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart2 size={18} className="text-lime-400" /> Charge Distribution
        </h3>
        <span className="text-xs font-semibold font-mono vision-pro-text-emerald">
          Total: ₹{total.toFixed(2)}
        </span>
      </div>

      {/* Horizontal Stacked Bar Chart */}
      <div className="w-full h-4 rounded-full vision-pro-pill overflow-hidden flex mb-6 p-0 border-lime-400/20">
        <div className="bg-lime-400 h-full transition-all duration-500 shadow-[0_0_10px_rgba(132,204,22,0.4)]" style={{ width: `${foodPct}%` }} title={`Food: ${foodPct}%`} />
        <div className="bg-emerald-400 h-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${taxPct}%` }} title={`Tax: ${taxPct}%`} />
        {serviceCharge > 0 && (
          <div className="bg-amber-400 h-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" style={{ width: `${servicePct}%` }} title={`Service Charge: ${servicePct}%`} />
        )}
      </div>

      {/* Category breakdown grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {categories.map((cat, idx) => (
          <div key={idx} className="vision-pro-pill p-3 space-y-1 border-lime-400/20">
            <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-primary)' }}>
              <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
              <span className="truncate">{cat.name}</span>
            </div>
            <div className="flex items-baseline justify-between font-poppins pt-0.5">
              <span className={`font-bold ${cat.textColor}`}>₹{cat.amount.toFixed(2)}</span>
              <span className="text-[11px] font-sans" style={{ color: 'var(--text-muted)' }}>{cat.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
