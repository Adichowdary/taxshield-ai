import { useState } from 'react'
import Container from './shared/Container'
import SectionHeader from './shared/SectionHeader'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0)
  const [ref, visible] = useReveal()

  const faqItems = [
    {
      q: "How does TaxShield deterministically audit restaurant bills?",
      a: "TaxShield uses high-fidelity neural optical character recognition (OCR) paired with deterministic financial rule engines to parse line items, food and alcohol subtotals, and tax brackets. The extracted figures are cross-referenced against statutory GST schedules and gazetted CCPA directives."
    },
    {
      q: "How are 5% vs 18% restaurant GST rates verified?",
      a: "Under CBIC Notification No. 46/2017, standalone restaurants (both AC and non-AC) must levy flat 5% GST without Input Tax Credit. 18% GST is only lawful inside luxury hotels with room tariffs exceeding ₹7,500/night. TaxShield automatically checks merchant classification to ensure you are never overcharged at the 18% tier."
    },
    {
      q: "Why are service charges legally voluntary under CCPA 2022 guidelines?",
      a: "The Central Consumer Protection Authority (CCPA) guideline F. No. J-25/57/2022-CCPA explicitly states that no hotel or restaurant shall add service charges automatically or by default to the bill. Diners have the sovereign right to waive service charge, and establishments cannot deny service for refusing to pay."
    },
    {
      q: "Are my corporate receipts and financial data kept secure?",
      a: "Absolutely. All invoice images and extracted line items are processed in an ephemeral, end-to-end encrypted pipeline (TLS 1.3 + AES-256). We never broker, monetize, or track your dining data with third-party advertising networks."
    },
    {
      q: "Can I generate legal waiver letters and consumer forum complaints?",
      a: "Yes. In one click, you can generate formal CCPA dispute notices ready to present to restaurant general managers, corporate expense justification reports for finance teams, or pre-filled drafts for the National Consumer Helpline (NCH 1915)."
    }
  ]

  return (
    <section id="faq" ref={ref} className={`py-20 md:py-28 relative reveal ${visible ? 'is-visible' : ''}`}>
      <Container>
        <SectionHeader
          eyebrow="FREQUENTLY ASKED QUESTIONS"
          title="Authoritative Questions & Answers"
          description="Everything you need to know about receipt OCR scanning, GST brackets, CCPA rights, and enterprise privacy."
        />

        {/* Controlled Max-Width Accordion */}
        <div className={`max-w-3xl mx-auto space-y-3.5 reveal-group ${visible ? 'is-visible' : ''}`}>
          {faqItems.map((item, idx) => {
            const isOpen = openIdx === idx

            return (
              <div
                key={idx}
                className={`vault-glass rounded-2xl overflow-hidden transition-all duration-300 border ${
                  isOpen ? 'border-sky-500/50 dark:border-[#D4AF37]/50 shadow-xl shadow-sky-500/10 dark:shadow-[#D4AF37]/10' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-poppins font-bold text-base transition-colors cursor-pointer"
                >
                  <span className={isOpen ? 'text-sky-600 dark:text-[#FDE68A]' : 'text-slate-900 dark:text-white'}>{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-sky-600 dark:text-[#D4AF37]' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* CSS grid transition for smooth accordion expand/collapse */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-0 text-sm font-sans leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/[0.08]">
                      <div className="pt-3.5">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
