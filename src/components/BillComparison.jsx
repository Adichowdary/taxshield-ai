import { useState, useMemo } from 'react'
import { MOCK_BILLS } from '../data/mockData'
import { getBillHistory } from '../services/llm/historyService'
import { ArrowRightLeft, UploadCloud, Camera } from 'lucide-react'
import Button from './shared/Button'

export default function BillComparison() {
  const allAvailableBills = useMemo(() => {
    const userHistory = getBillHistory()
    const historyFormatted = userHistory.map(b => ({
      id: b.id,
      merchant: b.restaurantName || b.merchant || 'Establishment',
      date: b.date || '2026-08-15',
      totalAmount: Number(b.totalAmount || b.total || 0),
      subtotal: Number(b.subtotal || 0),
      taxes: Number(b.gst || b.taxes || (b.cgst + b.sgst) || 0),
      serviceCharge: Number(b.serviceCharge || 0)
    }))

    // Combine user history with mock bills (deduping by ID)
    const combined = [...historyFormatted]
    MOCK_BILLS.forEach(mb => {
      if (!combined.some(c => c.id === mb.id)) {
        combined.push(mb)
      }
    })
    return combined
  }, [])

  const hasEnoughBills = allAvailableBills.length >= 2
  const [billAId, setBillAId] = useState(allAvailableBills[0]?.id || '')
  const [billBId, setBillBId] = useState(allAvailableBills[1]?.id || '')

  if (!hasEnoughBills) {
    return (
      <div className="vision-pro-card p-12 text-center space-y-4 max-w-xl mx-auto">
        <UploadCloud size={40} className="text-lime-400 mx-auto animate-spatial-float" />
        <div className="space-y-1">
          <h3 className="font-poppins font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Need at least 2 bills to compare</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Scan and save at least two restaurant receipts to unlock side-by-side tax, fee, and price comparison analytics.
          </p>
        </div>
        <Button variant="primary" size="md" to="/scan" className="mt-2 font-bold">
          <Camera size={16} /> Scan A Bill
        </Button>
      </div>
    )
  }

  const billA = allAvailableBills.find(b => b.id === billAId) || allAvailableBills[0]
  const billB = allAvailableBills.find(b => b.id === billBId) || allAvailableBills[1]

  const totalDiff = (billB?.totalAmount || 0) - (billA?.totalAmount || 0)
  const taxDiff = (billB?.taxes || 0) - (billA?.taxes || 0)
  const serviceDiff = (billB?.serviceCharge || 0) - (billA?.serviceCharge || 0)

  return (
    <div className="vision-pro-card p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-500/30">
        <div>
          <h3 className="font-poppins font-bold text-xl flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ArrowRightLeft size={22} className="text-lime-400" /> Compare Bills Side-by-Side
          </h3>
          <p className="text-xs font-sans mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Analyze price variations, tax rates, and extra fees between establishments
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bill A selector */}
        <div className="vision-pro-pill p-4 space-y-2 border-lime-400/30">
          <label className="text-xs font-bold uppercase tracking-wider text-lime-400 block">Select Bill A</label>
          <select
            value={billAId}
            onChange={(e) => setBillAId(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 vision-pro-pill border-lime-400/30 text-slate-100 focus:outline-none bg-slate-950"
          >
            {allAvailableBills.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                {b.merchant} ({b.date}) — ₹{b.totalAmount.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {/* Bill B selector */}
        <div className="vision-pro-pill p-4 space-y-2 border-cyan-400/30">
          <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">Select Bill B</label>
          <select
            value={billBId}
            onChange={(e) => setBillBId(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 vision-pro-pill border-cyan-400/30 text-slate-100 focus:outline-none bg-slate-950"
          >
            {allAvailableBills.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                {b.merchant} ({b.date}) — ₹{b.totalAmount.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metric Comparison Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="vision-pro-pill p-4 text-center border-lime-400/20">
          <span className="text-xs font-medium uppercase font-sans" style={{ color: 'var(--text-muted)' }}>Total Amount Variance</span>
          <div className={`text-xl font-bold font-poppins mt-1 ${totalDiff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {totalDiff > 0 ? `+₹${totalDiff.toFixed(2)}` : `-₹${Math.abs(totalDiff).toFixed(2)}`}
          </div>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Bill B vs Bill A</span>
        </div>

        <div className="vision-pro-pill p-4 text-center border-lime-400/20">
          <span className="text-xs font-medium uppercase font-sans" style={{ color: 'var(--text-muted)' }}>Tax Paid Difference</span>
          <div className={`text-xl font-bold font-poppins mt-1 ${taxDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {taxDiff > 0 ? `+₹${taxDiff.toFixed(2)}` : `-₹${Math.abs(taxDiff).toFixed(2)}`}
          </div>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>GST Variance</span>
        </div>

        <div className="vision-pro-pill p-4 text-center border-lime-400/20">
          <span className="text-xs font-medium uppercase font-sans" style={{ color: 'var(--text-muted)' }}>Service Fees Variance</span>
          <div className={`text-xl font-bold font-poppins mt-1 ${serviceDiff > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {serviceDiff > 0 ? `+₹${serviceDiff.toFixed(2)}` : `-₹${Math.abs(serviceDiff).toFixed(2)}`}
          </div>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Fee Discrepancy</span>
        </div>
      </div>

      {/* Side by side detailed table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Bill A Card */}
        <div className="vision-pro-pill p-5 space-y-4 border-lime-400/30">
          <div className="pb-3 border-b border-slate-500/30 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400">Bill A</span>
              <h4 className="font-poppins font-bold text-base" style={{ color: 'var(--text-primary)' }}>{billA.merchant}</h4>
            </div>
            <span className="font-mono text-sm font-bold text-emerald-400">₹{billA.totalAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
              <span>Food Subtotal</span>
              <span className="font-mono font-semibold text-slate-200">₹{billA.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
              <span>Taxes (GST)</span>
              <span className="font-mono font-semibold text-slate-200">₹{billA.taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
              <span>Service Charge</span>
              <span className="font-mono font-semibold text-slate-200">₹{billA.serviceCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bill B Card */}
        <div className="vision-pro-pill p-5 space-y-4 border-cyan-400/30">
          <div className="pb-3 border-b border-slate-500/30 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Bill B</span>
              <h4 className="font-poppins font-bold text-base" style={{ color: 'var(--text-primary)' }}>{billB.merchant}</h4>
            </div>
            <span className="font-mono text-sm font-bold text-emerald-400">₹{billB.totalAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
              <span>Food Subtotal</span>
              <span className="font-mono font-semibold text-slate-200">₹{billB.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
              <span>Taxes (GST)</span>
              <span className="font-mono font-semibold text-slate-200">₹{billB.taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
              <span>Service Charge</span>
              <span className="font-mono font-semibold text-slate-200">₹{billB.serviceCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
