import { useState } from 'react'
import Container from './shared/Container'
import SectionHeader from './shared/SectionHeader'
import { Copy, Check, FileSignature, ShieldCheck, Download } from 'lucide-react'

export default function InstantWaiverBuilder() {
  const [restaurantName, setRestaurantName] = useState('The Obsidian Club, Mumbai')
  const [serviceChargeAmount, setServiceChargeAmount] = useState('1450')
  const [copied, setCopied] = useState(false)

  const letterText = `Subject: Formal Notice: Request for Removal of Non-Statutory Service Charge — Invocation of CCPA Guidelines (2022)

To: The Management / General Manager, ${restaurantName}

Dear Management,

Upon reviewing the itemized bill presented for our dining service today, I observed a levied Service Charge of ₹${serviceChargeAmount}.00 added automatically to the subtotal.

As per the binding guidelines issued by the Central Consumer Protection Authority (CCPA) under F. No. J-25/57/2022-CCPA dated July 4, 2022, and confirmed under the Consumer Protection Act, 2019:
1. No hotel or restaurant shall add service charge automatically or by default in the bill.
2. The levy of service charge is strictly voluntary and discretionary upon the consumer.

I hereby formally exercise my statutory right as a consumer to decline this voluntary levy. Please reissue an amended invoice reflecting:
- Total food and beverage items consumed
- Statutory applicable 5% Goods and Services Tax (GST)
- Complete exclusion of the non-statutory Service Charge (₹${serviceChargeAmount}.00)

We appreciate your prompt cooperation in settling this invoice in compliance with prevailing consumer protection regulations.

Sincerely,
Executive Consumer & TaxShield Member`

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section id="waiver-builder" className="py-20 md:py-28 relative border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#050811]/90 backdrop-blur-xl">
      <Container>
        <SectionHeader
          eyebrow="ACTIONABLE DISPUTE GENERATOR"
          title="Executive 1-Click Surcharge Waiver Notice"
          description="Generate a legally backed, authoritative dispute memorandum to present to venue managers or enterprise finance audit teams."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-start">
          
          {/* Controls Form */}
          <div className="lg:col-span-4 vault-glass border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
              <FileSignature size={18} className="text-sky-600 dark:text-[#D4AF37]" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-poppins">Notice Parameters</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium">Establishment / Venue</label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500 dark:focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-medium">Disputed Service Charge (₹)</label>
                <input
                  type="number"
                  value={serviceChargeAmount}
                  onChange={(e) => setServiceChargeAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-sky-500 dark:focus:border-[#D4AF37] font-mono transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl auth-cta text-white dark:text-slate-950 text-xs font-bold tracking-wide transition-all shadow-lg shadow-sky-500/20 dark:shadow-[#D4AF37]/20 cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Formal Notice'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-100/60 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/[0.06] text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <ShieldCheck size={15} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Prepared in accordance with CCPA July 2022 Statutory Directives.</span>
            </div>
          </div>

          {/* Letter Preview Window */}
          <div className="lg:col-span-8 vault-glass border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-500 dark:via-[#D4AF37] to-transparent" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-slate-700 dark:text-slate-200 font-bold">ccpa_statutory_dispute_memo.txt</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-sky-700 dark:text-[#FDE68A] tracking-wider font-bold">
                Format: Executive Notice
              </span>
            </div>

            <pre className="text-xs font-mono text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap select-all bg-slate-100/80 dark:bg-black/60 p-5 rounded-xl border border-slate-200 dark:border-white/[0.06] max-h-[380px] overflow-y-auto">
              {letterText}
            </pre>
          </div>

        </div>
      </Container>
    </section>
  )
}
