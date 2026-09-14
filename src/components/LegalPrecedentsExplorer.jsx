import { useState } from 'react'
import Container from './shared/Container'
import SectionHeader from './shared/SectionHeader'
import { Scale, BookOpen, FileCheck, ChevronRight, CheckCircle2, Shield } from 'lucide-react'

const PRECEDENTS = [
  {
    id: 'ccpa-guidelines',
    title: 'CCPA Guidelines on Service Charge (2022)',
    citation: 'F. No. J-25/57/2022-CCPA • July 4, 2022',
    icon: Scale,
    summary: 'The Central Consumer Protection Authority issued binding guidelines prohibiting hotels and restaurants from levying service charges automatically or by default on the food bill.',
    keyPoints: [
      'No hotel or restaurant shall add service charge automatically or by default in the bill.',
      'No collection of service charge by any other name shall be permitted.',
      'A consumer cannot be forced to pay service charge; it is strictly voluntary and at discretion.',
      'Consumers have the right to file grievances via National Consumer Helpline (NCH) 1915 or with the District Collector.',
    ],
  },
  {
    id: 'gst-circular-178',
    title: 'CBIC Circular 178/10/2022-GST on Restaurant Services',
    citation: 'Ministry of Finance, Department of Revenue • Aug 3, 2022',
    icon: FileCheck,
    summary: 'Stand-alone restaurants (both AC and non-AC) are mandated to charge flat 5% GST (2.5% CGST + 2.5% SGST) with zero input tax credit (ITC).',
    keyPoints: [
      'Standard standalone dining establishments cannot charge 18% GST unless located inside a hotel premises with declared room tariff exceeding ₹7,500/night.',
      'Compounding tax (charging GST on top of service charge) without explicit legal basis is subject to anti-profiteering scrutiny.',
      'Input tax credit cannot be factored in to artificially inflate consumer subtotals.',
    ],
  },
  {
    id: 'cpa-section-2-47',
    title: 'Consumer Protection Act 2019 — Section 2(47)',
    citation: 'Act No. 35 of 2019 • Unfair Trade Practice',
    icon: BookOpen,
    summary: 'Defines deceptive and restrictive trade practices, specifically imposing unjustified costs or restrictive conditions on consumers before providing services.',
    keyPoints: [
      'Adopting any deceptive practice to promote sales, supply or use of any service constitutes an Unfair Trade Practice.',
      'Falsely representing that services have sponsorship, approval, or statutory character which they lack.',
      'Withholding essential information or denying services for refusing voluntary contributions.',
    ],
  },
]

export default function LegalPrecedentsExplorer() {
  const [activeTab, setActiveTab] = useState('ccpa-guidelines')
  const activePrecedent = PRECEDENTS.find(p => p.id === activeTab) || PRECEDENTS[0]

  return (
    <section id="legal-framework" className="py-20 md:py-28 relative border-t border-white/[0.08] bg-[#060912]/80 backdrop-blur-xl">
      <Container>
        <SectionHeader
          eyebrow="STATUTORY LEGAL BENCHMARKS"
          title="Authoritative Precedents & Indian Consumer Law"
          description="TaxShield audits are directly mapped against gazetted statutory guidelines, consumer protection acts, and GST Council circulars."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-start">
          
          {/* Left: Tab Selectors */}
          <div className="lg:col-span-5 space-y-3">
            {PRECEDENTS.map((p) => {
              const Icon = p.icon
              const isSelected = p.id === activeTab
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'vault-glass border-[#D4AF37]/50 shadow-xl shadow-[#D4AF37]/10'
                      : 'bg-black/30 border-white/[0.06] hover:bg-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'bg-[#D4AF37]/20 text-[#FDE68A] border border-[#D4AF37]/40' 
                          : 'bg-white/5 text-slate-400'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold font-poppins ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {p.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.citation}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`mt-2 shrink-0 ${isSelected ? 'text-[#D4AF37]' : 'text-slate-600'}`} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Detailed Legal Summary Box */}
          <div className="lg:col-span-7 vault-glass border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            
            <div className="space-y-5">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] font-bold block">
                  STATUTORY JURISPRUDENCE SUMMARY
                </span>
                <h3 className="text-xl font-bold text-white font-poppins mt-1">{activePrecedent.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{activePrecedent.citation}</p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {activePrecedent.summary}
              </p>

              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#FDE68A] font-semibold block">
                  Core Legal Mandates:
                </span>
                <ul className="space-y-2.5">
                  {activePrecedent.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Verified against official gazette</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Shield size={13} /> Active CCPA Authority
                </span>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </section>
  )
}
