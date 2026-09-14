import { useState } from 'react'
import Navbar from '../components/Navbar'
import MobileNav from '../components/MobileNav'
import Footer from '../components/Footer'
import Container from '../components/shared/Container'
import Button from '../components/shared/Button'
import SwiggyFieldMappingCard from '../components/SwiggyFieldMappingCard'
import { 
  Upload, 
  Zap, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  HelpCircle,
  Lock,
  Scale,
  ChevronDown,
  ChevronUp,
  MessageCircle
} from 'lucide-react'

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState(0)

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const steps = [
    {
      num: '01',
      title: 'Scan & Upload Receipt',
      description: 'Take a clear photo or upload a digital PDF/image receipt from any restaurant or cafe.',
      detail: 'Supports JPG, PNG, and PDF formats with automatic document cropping.',
      icon: Upload,
    },
    {
      num: '02',
      title: 'TaxShield AI OCR Text Extraction',
      description: 'Optical Character Recognition reads item names, quantities, unit prices, subtotals, and GSTIN metadata.',
      detail: 'Parses complex multi-item receipts with high accuracy.',
      icon: Zap,
    },
    {
      num: '03',
      title: 'Tax & Fee Audit',
      description: 'Automated rules cross-check 5% GST calculations and detect voluntary 10% service charges.',
      detail: 'Flags discrepancies against official restaurant GST brackets & CCPA rules.',
      icon: BarChart3,
    },
    {
      num: '04',
      title: 'Review & Action Report',
      description: 'Inspect line items, download PDF summaries, or generate CCPA-aligned grievance drafts.',
      detail: 'Empowers consumers to request fee removal before payment.',
      icon: ShieldCheck,
    },
  ]

  const benefits = [
    {
      title: "Consumer Financial Protection",
      description: "Detect forced or non-mandatory service charges added automatically to your bill before paying.",
      icon: ShieldCheck
    },
    {
      title: "GST Tax Calculation Transparency",
      description: "Ensure restaurants apply the standard 5% GST rate (2.5% CGST + 2.5% SGST) on subtotal values.",
      icon: Scale
    },
    {
      title: "CCPA Grievance Assistance",
      description: "Instantly draft formal grievance letters backed by Central Consumer Protection Authority guidelines.",
      icon: FileText
    },
    {
      title: "Organized Expense History",
      description: "Keep a digital history of all analyzed receipts for budget tracking and tax records.",
      icon: Lock
    }
  ]

  const faqItems = [
    {
      q: "What is TaxShield AI and how does it protect consumers?",
      a: "TaxShield AI is an AI-powered receipt audit platform designed to analyze restaurant and cafe bills in real time. It extracts itemized charges using Optical Character Recognition (OCR), verifies that GST taxes comply with official 5% brackets, and flags non-mandatory service charges so consumers don't overpay."
    },
    {
      q: "Are service charges in restaurants mandatory or voluntary in India?",
      a: "Service charges are 100% voluntary according to guidelines issued by the Central Consumer Protection Authority (CCPA). Restaurants cannot compel payment or automatically collect GST on service fees. If a service charge appears on your receipt, you have the right to request its removal before making payment."
    },
    {
      q: "What is the standard GST tax rate for restaurant dining bills?",
      a: "Standalone food and beverage dining establishments in India attract a 5% GST rate (comprising 2.5% CGST + 2.5% SGST) without Input Tax Credit (ITC). TaxShield AI automatically verifies if taxes billed on your receipt exceed this standard 5% threshold."
    },
    {
      q: "How does the TaxShield AI OCR bill scanning technology work?",
      a: "When you upload a receipt photo or PDF, TaxShield AI's OCR algorithm preprocesses the document image, identifies line items, itemized prices, food subtotals, GSTIN registration numbers, and tax lines. It then computes line-by-line totals to verify mathematical accuracy."
    },
    {
      q: "What can I do if TaxShield AI flags an overcharge or service fee?",
      a: "You can use TaxShield AI's built-in Complaint Generator to draft a formal, CCPA-aligned grievance letter in one click. You can present this draft directly to restaurant management before paying or use it to submit a formal consumer complaint."
    },
    {
      q: "Is my uploaded receipt data kept safe and private?",
      a: "Yes. All receipt uploads and OCR analyses are processed securely within your active session. TaxShield AI respects consumer privacy and does not sell or share your receipt data."
    }
  ]

  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden font-sans text-slate-100 flex flex-col selection:bg-lime-400 selection:text-slate-950">
      {/* Ambient background blur orbs */}
      <div className="bg-orb bg-orb-gold fixed -top-32 -left-32 w-[480px] h-[480px] animate-spatial-float z-0" />
      <div className="bg-orb bg-orb-emerald fixed top-1/3 -right-32 w-[440px] h-[440px] animate-spatial-float z-0" style={{ animationDelay: '2s' }} />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 space-y-16 relative z-10">
        <Container className="space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 auth-stagger" style={{ animationDelay: '80ms' }}>
            <span className="bg-lime-400/15 text-lime-400 text-xs font-bold px-3.5 py-1 rounded-full border border-lime-400/30 uppercase tracking-wider inline-flex items-center gap-1.5 font-poppins">
              <Sparkles size={14} className="text-lime-400" /> PRODUCT GUIDE & WORKFLOW
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold vision-pro-text-glow leading-tight" style={{ color: 'var(--text-primary)' }}>
              How TaxShield AI Works
            </h1>
            <p className="text-base leading-relaxed max-w-2xl mx-auto font-sans" style={{ color: 'var(--text-muted)' }}>
              TaxShield AI combines AI receipt scanning with consumer protection rules to help you inspect restaurant bills, verify taxes, and prevent unauthorized fees.
            </p>
          </div>

          {/* 4-Step Interactive Timeline */}
          <div className="space-y-6 auth-stagger" style={{ animationDelay: '160ms' }}>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-poppins font-bold vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>The 4-Step Analysis Workflow</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>From receipt photo to actionable consumer intelligence in seconds</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, idx) => {
                const Icon = step.icon
                return (
                  <div key={idx} className="vision-pro-card p-6 flex flex-col justify-between space-y-4 hover:border-lime-400/50 transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-poppins font-bold text-2xl vision-pro-text-emerald font-mono">
                          {step.num}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-lime-400/15 text-lime-400 border border-lime-400/30 flex items-center justify-center font-bold">
                          <Icon size={20} />
                        </div>
                      </div>

                      <h3 className="font-poppins font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {step.title}
                      </h3>

                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {step.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-500/30 text-[11px] flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span>{step.detail}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Swiggy App Screenshot AI Extraction Demonstration */}
          <div className="auth-stagger" style={{ animationDelay: '200ms' }}>
            <SwiggyFieldMappingCard />
          </div>

          {/* Purpose & Primary Benefits Grid */}
          <div className="vision-pro-card p-6 md:p-10 space-y-8 auth-stagger" style={{ animationDelay: '240ms' }}>
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-poppins font-bold vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>What is the Purpose of TaxShield?</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Designed to give consumers full transparency over dining bills</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((b, idx) => {
                const Icon = b.icon
                return (
                  <div key={idx} className="vision-pro-pill p-6 space-y-2 flex items-start gap-4 border-lime-400/20">
                    <div className="w-11 h-11 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-lime-400/20">
                      <Icon size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-poppins font-bold text-base" style={{ color: 'var(--text-primary)' }}>{b.title}</h4>
                      <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-muted)' }}>{b.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legal Guidelines Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auth-stagger" style={{ animationDelay: '300ms' }}>
            
            {/* GST Rules Panel */}
            <div className="vision-pro-card p-6 space-y-3 border-l-4 border-l-lime-400">
              <div className="flex items-center gap-2">
                <Scale size={20} className="text-lime-400" />
                <h3 className="font-poppins font-bold text-base" style={{ color: 'var(--text-primary)' }}>Standard 5% GST Framework</h3>
              </div>
              <p className="text-xs leading-relaxed font-sans" style={{ color: 'var(--text-muted)' }}>
                Standalone food & beverage dining establishments in India are taxed at 5% GST (2.5% CGST + 2.5% SGST) without Input Tax Credit (ITC). TaxShield automatically verifies that tax calculations match subtotal values.
              </p>
            </div>

            {/* CCPA Rules Panel */}
            <div className="vision-pro-card-glow-amber p-6 space-y-3 border-l-4 border-l-amber-400">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-400" />
                <h3 className="font-poppins font-bold text-base text-amber-300">CCPA Voluntary Service Fee Guidelines</h3>
              </div>
              <p className="text-xs leading-relaxed font-sans text-amber-200/90">
                Under Central Consumer Protection Authority guidelines, service charges levied by hotels or restaurants are voluntary. Customers can request service charge removal prior to payment.
              </p>
            </div>

          </div>

          {/* Project FAQ Section */}
          <div className="vision-pro-card p-6 md:p-10 space-y-8 auth-stagger" style={{ animationDelay: '360ms' }}>
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="bg-lime-400/15 text-lime-400 text-xs font-bold px-3 py-1 rounded-full border border-lime-400/30 uppercase tracking-wider inline-flex items-center gap-1.5 font-poppins">
                <HelpCircle size={14} className="text-lime-400" /> FREQUENTLY ASKED QUESTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-poppins font-bold vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>
                Project Knowledge & Questions
              </h2>
              <p className="text-xs sm:text-sm font-sans" style={{ color: 'var(--text-muted)' }}>
                Common questions about TaxShield, GST verification, service fee rights, and AI OCR auditing
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqItems.map((item, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div 
                    key={idx} 
                    className="vision-pro-pill rounded-2xl overflow-hidden transition-all border-lime-400/20"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-poppins font-bold text-sm sm:text-base hover:bg-lime-400/5 transition-colors cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span className="flex items-center gap-2.5">
                        <MessageCircle size={18} className="text-lime-400 shrink-0" />
                        {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-lime-400 shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed font-sans border-t border-slate-500/20" style={{ color: 'var(--text-muted)' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA Trigger Banner */}
          <div className="vision-pro-card p-8 md:p-10 text-center space-y-5 relative overflow-hidden auth-stagger" style={{ animationDelay: '420ms' }}>
            <h2 className="text-2xl sm:text-3xl font-poppins font-bold vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>Ready to analyze your bill?</h2>
            <p className="text-xs sm:text-sm max-w-xl mx-auto font-sans" style={{ color: 'var(--text-muted)' }}>
              Scan your receipt now to verify taxes and detect non-mandatory charges.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button variant="primary" size="lg" to="/dashboard" className="w-full sm:w-auto font-bold px-8">
                Go to Dashboard <ArrowRight size={16} />
              </Button>
            </div>

          </div>

        </Container>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
