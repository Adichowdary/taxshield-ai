import { useState } from 'react'
import { AlertCircle, CheckCircle2, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react'

export default function Holographic3DReceipt() {
  const [waiveServiceCharge, setWaiveServiceCharge] = useState(true)
  const [rotateX, setRotateX] = useState(6)
  const [rotateY, setRotateY] = useState(-8)

  const subtotal = 14200
  const serviceCharge = 1420 // 10%
  const gstRate = 0.05 // 5%

  const taxUnwaived = (subtotal + serviceCharge) * gstRate
  const totalUnwaived = subtotal + serviceCharge + taxUnwaived

  const taxWaived = subtotal * gstRate
  const totalWaived = subtotal + taxWaived
  const totalSavings = totalUnwaived - totalWaived

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotateX(((y - centerY) / centerY) * -10)
    setRotateY(((x - centerX) / centerX) * 12)
  }

  const handleMouseLeave = () => {
    setRotateX(6)
    setRotateY(-8)
  }

  return (
    <div 
      className="perspective-1000 w-full max-w-md mx-auto select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative rounded-2xl p-6 transition-transform duration-200 ease-out preserve-3d vault-glass border border-white/15 shadow-2xl overflow-hidden"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Animated Laser Scanning Beam */}
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_15px_#38BDF8] animate-[bounce_3s_infinite] pointer-events-none z-30 opacity-75" />

        {/* Specular Edge Sheen */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none" />

        {/* Receipt Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4 mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-sky-700 dark:text-[#D4AF37] font-bold flex items-center gap-1.5">
              <Sparkles size={12} /> HOLOGRAPHIC RECEIPT AUDIT
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">The Obsidian Grill</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">GSTIN: 27AABCT9981Q1Z4 • Invoice #8841</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-400/30 text-amber-700 dark:text-amber-300">
            AUDIT IN PROGRESS
          </span>
        </div>

        {/* Line Items */}
        <div className="space-y-2.5 text-xs font-mono mb-4">
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>2x Black Truffle Risotto</span>
            <span className="text-slate-900 dark:text-white font-bold">₹4,800.00</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>1x Australian Wagyu M9</span>
            <span className="text-slate-900 dark:text-white font-bold">₹7,600.00</span>
          </div>
          <div className="flex justify-between text-slate-700 dark:text-slate-300">
            <span>2x San Pellegrino (750ml)</span>
            <span className="text-slate-900 dark:text-white font-bold">₹1,800.00</span>
          </div>
        </div>

        {/* Breakdown Box */}
        <div className="rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 p-3.5 space-y-2 mb-4 font-mono text-xs">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Subtotal (Food & Drinks)</span>
            <span className="text-slate-900 dark:text-white font-semibold">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Service Charge Line with Discrepancy Highlight */}
          <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
            waiveServiceCharge ? 'bg-rose-500/10 border border-rose-500/30' : 'bg-black/5 dark:bg-white/5'
          }`}>
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} className={waiveServiceCharge ? 'text-rose-500' : 'text-slate-400'} />
              <div>
                <span className={waiveServiceCharge ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                  Service Charge (10%)
                </span>
                <div className="text-[9px] text-rose-600/80 dark:text-rose-400/80 font-sans">
                  CCPA 2022: Strictly voluntary
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`font-bold ${waiveServiceCharge ? 'text-rose-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                ₹{serviceCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              {waiveServiceCharge && (
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">WAIVED (₹0.00)</div>
              )}
            </div>
          </div>

          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>CGST + SGST (5% Statutory)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ₹{(waiveServiceCharge ? taxWaived : taxUnwaived).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900 dark:text-white font-poppins">Total Net Payable</span>
            <span className="text-base font-extrabold font-mono text-sky-600 dark:text-[#FDE68A]">
              ₹{(waiveServiceCharge ? totalWaived : totalUnwaived).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Interactive Waiver Control */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setWaiveServiceCharge(!waiveServiceCharge)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              waiveServiceCharge 
                ? 'bg-sky-500 hover:bg-sky-600 text-white dark:bg-[#D4AF37] dark:text-slate-950 dark:hover:bg-[#FDE68A] shadow-md font-bold'
                : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'
            }`}
          >
            <ShieldCheck size={14} />
            {waiveServiceCharge ? 'Service Charge Waived' : 'Apply Legal Waiver'}
          </button>

          {waiveServiceCharge && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Direct Savings</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                +₹{totalSavings.toFixed(2)} Saved
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
