import { useState } from 'react'
import { Sparkles, ArrowRight, CheckCircle2, Shield, Layers, FileCode } from 'lucide-react'

export default function SwiggyFieldMappingCard({ className = "" }) {
  const [activeItemIndex, setActiveItemIndex] = useState(0)

  const mappings = [
    {
      sourceText: "Rolls On Wheels - Shawarma & Wraps",
      label: "Merchant / Restaurant",
      schemaKey: "restaurant",
      parsedValue: '"Rolls On Wheels - Shawarma & Wraps"',
      badge: "MERCHANT",
      color: "border-lime-400/40 text-lime-400 bg-lime-400/10"
    },
    {
      sourceText: "ORDER #242663855077314",
      label: "Order Identifier",
      schemaKey: "orderId",
      parsedValue: '"242663855077314"',
      badge: "ID",
      color: "border-cyan-400/40 text-cyan-400 bg-cyan-400/10"
    },
    {
      sourceText: "Egg Roll (2 Eggs) x 1 - ₹169",
      label: "Line Items Array",
      schemaKey: "items",
      parsedValue: '[{ name: "Egg Roll (2 Eggs)", qty: 1, unitPrice: 169.00, total: 169.00 }]',
      badge: "ITEMS",
      color: "border-emerald-400/40 text-emerald-400 bg-emerald-400/10"
    },
    {
      sourceText: "Restaurant Packaging: ₹10",
      label: "Packaging Charge",
      schemaKey: "packagingFee",
      parsedValue: "10.00",
      badge: "FEE",
      color: "border-amber-400/40 text-amber-400 bg-amber-400/10"
    },
    {
      sourceText: "Platform fee with GST: ₹17.58",
      label: "App Convenience Platform Fee",
      schemaKey: "platformFee",
      parsedValue: "17.58",
      badge: "FEE",
      color: "border-purple-400/40 text-purple-400 bg-purple-400/10"
    },
    {
      sourceText: "Discount Applied: -₹70",
      label: "Promo Offer / Coupon",
      schemaKey: "discount",
      parsedValue: "70.00",
      badge: "DISCOUNT",
      color: "border-emerald-400/40 text-emerald-300 bg-emerald-500/15"
    },
    {
      sourceText: "Delivery Fee (FREE with Swiggy One)",
      label: "Delivery Partner Charge",
      schemaKey: "deliveryFee",
      parsedValue: "0.00",
      badge: "DELIVERY",
      color: "border-slate-400/40 text-slate-300 bg-slate-400/10"
    },
    {
      sourceText: "Taxes: ₹5.45",
      label: "GST Tax Breakdown",
      schemaKey: "tax",
      parsedValue: '{ cgst: 2.73, sgst: 2.72, igst: 0.00 }',
      badge: "TAX (5%)",
      color: "border-lime-400/40 text-lime-300 bg-lime-500/15"
    },
    {
      sourceText: "Paid Via Bank / Bill Total: ₹132",
      label: "Final Paid Total",
      schemaKey: "total",
      parsedValue: "132.00",
      badge: "TOTAL",
      color: "border-lime-400 text-lime-400 bg-lime-400/20 font-bold"
    }
  ]

  return (
    <div className={`vision-pro-card !rounded-3xl p-6 md:p-8 space-y-6 border-lime-400/30 ${className}`}>
      
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-lime-400/20 text-lime-400 font-extrabold px-3 py-0.5 rounded-full text-xs border border-lime-400/40 uppercase tracking-wider inline-flex items-center gap-1.5 font-poppins">
              <Sparkles size={13} /> FEW-SHOT EXAMPLE 4
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              Swiggy App Vision Parsing
            </span>
          </div>
          <h3 className="font-poppins font-bold text-xl vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>
            Swiggy App Screenshot AI Extraction
          </h3>
          <p className="text-xs font-sans" style={{ color: 'var(--text-muted)' }}>
            Demonstrating how TaxShield AI converts raw Swiggy digital bill screenshot elements into structured JSON schema
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-2xl border border-lime-400/20 shrink-0">
          <Shield size={16} className="text-lime-400" />
          <span className="text-lime-400 font-bold">100% Tax Verified</span>
        </div>
      </div>

      {/* Side by Side Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Swiggy UI Receipt Preview Box (Cols 5) */}
        <div className="lg:col-span-5 vision-pro-pill p-5 space-y-3 border-lime-400/30 bg-slate-950/80 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="text-xs font-bold font-poppins text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} /> Swiggy Order Screenshot UI
              </span>
              <span className="text-[10px] font-mono text-slate-400">Order #242663855077314</span>
            </div>

            <div className="space-y-2 text-xs font-sans">
              {mappings.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveItemIndex(idx)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    idx === activeItemIndex
                      ? 'border-lime-400 bg-lime-400/15 shadow-[0_0_15px_rgba(132,204,22,0.3)] scale-[1.02]'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <span className="font-medium text-slate-200 truncate">{item.sourceText}</span>
                  <ArrowRight size={13} className={idx === activeItemIndex ? "text-lime-400" : "text-slate-600"} />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 text-center font-mono border-t border-slate-800">
            Click any row to inspect LLM JSON target mapping
          </div>
        </div>

        {/* Right: AI JSON Target Mapping Display (Cols 7) */}
        <div className="lg:col-span-7 vision-pro-pill p-5 space-y-4 border-lime-400/30 bg-slate-950/90 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="text-xs font-bold font-poppins text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode size={14} /> TaxShield JSON Schema Output
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 border border-lime-400/30">
                {mappings[activeItemIndex].badge}
              </span>
            </div>

            {/* Active Extraction Card */}
            <div className="p-4 rounded-2xl border bg-slate-900/80 space-y-3 border-lime-400/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{mappings[activeItemIndex].label}</span>
                <span className="font-mono text-lime-400 font-bold">{mappings[activeItemIndex].schemaKey}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-lime-300 break-all">
                <span className="text-slate-500">"{mappings[activeItemIndex].schemaKey}": </span>
                <span className="font-bold">{mappings[activeItemIndex].parsedValue}</span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-sans pt-1">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Extracted from raw line: <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">{mappings[activeItemIndex].sourceText}</code></span>
              </div>
            </div>

            {/* Full JSON Snippet */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="text-slate-500">// Standardized TaxShield Swiggy Receipt Payload</div>
              <div className="text-lime-400">&#123;</div>
              <div className="pl-3 text-cyan-300">"platform": <span className="text-slate-200">"Swiggy"</span>,</div>
              <div className="pl-3 text-cyan-300">"restaurant": <span className="text-lime-300">"Rolls On Wheels - Shawarma & Wraps"</span>,</div>
              <div className="pl-3 text-cyan-300">"orderId": <span className="text-slate-200">"242663855077314"</span>,</div>
              <div className="pl-3 text-cyan-300">"packagingFee": <span className="text-amber-300">10.00</span>,</div>
              <div className="pl-3 text-cyan-300">"platformFee": <span className="text-purple-300">17.58</span>,</div>
              <div className="pl-3 text-cyan-300">"discount": <span className="text-emerald-300">70.00</span>,</div>
              <div className="pl-3 text-cyan-300">"deliveryFee": <span className="text-slate-300">0.00</span>,</div>
              <div className="pl-3 text-cyan-300">"tax": <span className="text-lime-300">&#123; "cgst": 2.73, "sgst": 2.72 &#125;</span>,</div>
              <div className="pl-3 text-cyan-300">"total": <span className="text-lime-400 font-bold">132.00</span></div>
              <div className="text-lime-400">&#125;</div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-lime-400 font-semibold flex items-center justify-center gap-1">
            <CheckCircle2 size={13} /> Verified against CCPA & Food GST Rules
          </div>
        </div>

      </div>

    </div>
  )
}
