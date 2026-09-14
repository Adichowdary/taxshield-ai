import { useState } from 'react'
import Container from './shared/Container'
import SectionHeader from './shared/SectionHeader'
import { ShieldCheck, CheckCircle2, Building2, Utensils, ReceiptText } from 'lucide-react'

const BILL_SCENARIOS = [
  {
    id: 'fine-dining',
    name: 'The Table, Colaba',
    type: 'Executive Client Dinner',
    icon: Building2,
    date: 'Yesterday, 9:45 PM',
    items: [
      { name: 'Truffle Tagliatelle (x2)', price: 3600 },
      { name: 'New Zealand Lamb Chops', price: 4200 },
      { name: 'Charred Sourdough & Herb Butter', price: 950 },
      { name: 'Imported San Pellegrino (750ml x2)', price: 1100 },
      { name: 'Valrhona Chocolate Fondant', price: 1400 },
    ],
    subtotal: 11250,
    serviceChargeRate: 0.10, // 10%
    gstRate: 0.05, // 5%
    merchantGstReg: '27AABCT9981Q1Z4',
  },
  {
    id: 'business-lunch',
    name: "Taj Land's End — Vista",
    type: 'Corporate Board Lunch',
    icon: Utensils,
    date: 'Sep 2, 1:15 PM',
    items: [
      { name: 'Executive Seafood Buffet (x3)', price: 7800 },
      { name: 'Artisanal Green Tea Flight', price: 1250 },
      { name: 'Sparkling Mineral Water', price: 650 },
    ],
    subtotal: 9700,
    serviceChargeRate: 0.08, // 8%
    gstRate: 0.05,
    merchantGstReg: '27AAACT2727C1ZX',
  },
  {
    id: 'corporate-catering',
    name: 'Blue Tokai Roasters',
    type: 'Quarterly Team Breakfast',
    icon: ReceiptText,
    date: 'Aug 29, 10:30 AM',
    items: [
      { name: 'Cold Brew Bulk Growlers (x4)', price: 2400 },
      { name: 'Smoked Salmon Bagel Box (x6)', price: 2880 },
      { name: 'Almond Croissant Platter', price: 1560 },
    ],
    subtotal: 6840,
    serviceChargeRate: 0.075, // 7.5%
    gstRate: 0.05,
    merchantGstReg: '07AABCB8819L1Z2',
  },
]

export default function InteractiveBillSimulator() {
  const [selectedId, setSelectedId] = useState('fine-dining')
  const [waiveServiceCharge, setWaiveServiceCharge] = useState(true)

  const scenario = BILL_SCENARIOS.find(s => s.id === selectedId) || BILL_SCENARIOS[0]
  const serviceChargeAmount = scenario.subtotal * scenario.serviceChargeRate
  
  // Under standard law, GST applies to food. If service charge is forced, restaurants unlawfully tax service charge too.
  const taxWithoutWaiver = (scenario.subtotal + serviceChargeAmount) * scenario.gstRate
  const totalWithoutWaiver = scenario.subtotal + serviceChargeAmount + taxWithoutWaiver

  const taxWithWaiver = scenario.subtotal * scenario.gstRate
  const totalWithWaiver = scenario.subtotal + taxWithWaiver
  const netSavings = totalWithoutWaiver - totalWithWaiver

  const activeTotal = waiveServiceCharge ? totalWithWaiver : totalWithoutWaiver
  const activeTax = waiveServiceCharge ? taxWithWaiver : taxWithoutWaiver

  return (
    <section id="bill-simulator" className="py-20 md:py-28 relative border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#060912]/80 backdrop-blur-xl">
      <Container>
        <SectionHeader
          eyebrow="EXECUTIVE BILL AUDIT TERMINAL"
          title="Inspect Real High-Value Corporate Dining Receipts"
          description="Toggle the CCPA voluntary surcharge waiver below to observe instantaneous statutory recalculations in real time."
        />

        {/* Bill Scenario Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto mb-10">
          {BILL_SCENARIOS.map((s) => {
            const Icon = s.icon
            const isSelected = s.id === selectedId
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 dark:bg-[#D4AF37] text-white dark:text-slate-950 shadow-lg shadow-sky-500/25 dark:shadow-[#D4AF37]/25 font-bold border border-sky-400/60 dark:border-[#FDE68A]/60'
                    : 'vault-glass text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-sky-500/35 dark:hover:border-[#D4AF37]/35 border border-slate-200 dark:border-white/[0.08]'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-white dark:text-slate-950' : 'text-sky-600 dark:text-[#D4AF37]'} />
                <span>{s.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-white/80 dark:text-slate-800' : 'text-slate-500 dark:text-slate-400'}`}>({s.type})</span>
              </button>
            )
          })}
        </div>

        {/* Main Interactive Audit Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
          
          {/* Left Column: Authentic Executive Receipt Card */}
          <div className="lg:col-span-7 vault-glass border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Specular gold accent line */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-500 dark:via-[#D4AF37] to-transparent" />

            {/* Receipt Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight font-poppins">{scenario.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    GST Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">GSTIN: {scenario.merchantGstReg} • {scenario.date}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 block">Bill Audit ID</span>
                <span className="text-xs font-mono font-bold text-sky-700 dark:text-[#FDE68A]">#TX-2026-{scenario.id.toUpperCase().slice(0, 4)}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-5 space-y-2.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">Audited Line Items</span>
              <div className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
                {scenario.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{item.name}</span>
                    <span className="font-mono text-slate-900 dark:text-white font-semibold">₹{item.price.toLocaleString('en-IN')}.00</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal & Taxes Breakdown */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Food & Beverage Subtotal</span>
                <span className="text-slate-900 dark:text-white font-semibold">₹{scenario.subtotal.toLocaleString('en-IN')}.00</span>
              </div>

              {/* Service Charge Line with Discrepancy Highlight */}
              <div className={`flex justify-between items-center py-2 px-3 rounded-xl transition-colors ${
                waiveServiceCharge
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/25'
                  : 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/35'
              }`}>
                <div className="flex items-center gap-2 font-sans">
                  <span className="font-semibold">Service Charge ({(scenario.serviceChargeRate * 100).toFixed(1)}%)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    waiveServiceCharge ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  }`}>
                    {waiveServiceCharge ? 'WAIVED PER CCPA 2022' : 'LEVIED BY DEFAULT'}
                  </span>
                </div>
                <span className="font-bold">
                  {waiveServiceCharge ? '₹0.00' : `₹${serviceChargeAmount.toLocaleString('en-IN')}.00`}
                </span>
              </div>

              {/* Statutory GST Line */}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="font-sans">Statutory Restaurant GST (5% CGST+SGST)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ₹{activeTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Final Corrected Total */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.12] flex justify-between items-baseline font-bold text-sm">
                <span className="text-slate-900 dark:text-white font-sans text-base">Authorized Net Payable</span>
                <span className="text-2xl font-mono text-sky-600 dark:text-[#FDE68A] tracking-tight font-extrabold">
                  ₹{activeTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Executive Compliance Control Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Interactive Toggle Card */}
            <div className="vault-glass border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-[#D4AF37] font-mono">Statutory Control</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">CCPA 2022 Guidelines</span>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white font-poppins">Voluntary Service Charge Waiver</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  Hotels and restaurants are legally prohibited from levying service charges automatically by default or disguised under any other name.
                </p>
              </div>

              {/* Interactive Toggle Switch */}
              <div 
                onClick={() => setWaiveServiceCharge(!waiveServiceCharge)}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 cursor-pointer hover:border-sky-500/50 dark:hover:border-[#D4AF37]/50 transition-all"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Enforce CCPA Zero-Levy</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Exclude non-statutory service charge</span>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${waiveServiceCharge ? 'bg-sky-500 dark:bg-[#D4AF37]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-950 transition-transform ${waiveServiceCharge ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Real-time Savings Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 via-sky-500/10 dark:via-[#D4AF37]/10 to-transparent border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-700 dark:text-emerald-300 font-bold block">
                      {waiveServiceCharge ? 'Verified Statutory Savings' : 'Potential Recovery Amount'}
                    </span>
                    <span className="text-2xl font-mono font-extrabold text-sky-700 dark:text-[#FDE68A] mt-1 block">
                      ₹{netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 dark:bg-[#D4AF37]/20 border border-sky-500/30 dark:border-[#D4AF37]/40 flex items-center justify-center text-sky-600 dark:text-[#FDE68A]">
                    <ShieldCheck size={20} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Includes waived service charge and avoided GST compounding on non-statutory fees.
                </p>
              </div>
            </div>

            {/* Corporate Compliance Note */}
            <div className="p-5 rounded-2xl vault-glass border border-slate-200/80 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                <CheckCircle2 size={16} className="text-sky-600 dark:text-[#D4AF37]" />
                <span>Executive Expense Justification</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-300">
                Corporate expense policies at Fortune 500 enterprises strictly disallow non-statutory gratuities without employee opt-in. TaxShield provides automated audit trails for finance reconciliation.
              </p>
            </div>

          </div>

        </div>
      </Container>
    </section>
  )
}
