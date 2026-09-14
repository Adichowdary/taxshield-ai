import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StatusBadge from '../components/shared/StatusBadge'
import Button from '../components/shared/Button'
import Container from '../components/shared/Container'
import { MOCK_BILLS } from '../data/mockData'
import { Link } from 'react-router-dom'
import { FileText, ShieldCheck, AlertTriangle, TrendingUp, Calendar, Camera, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { subscribeToBillHistory } from '../services/llm/historyService'
import { useReveal } from '../hooks/useReveal'
import { useCountUp } from '../hooks/useCountUp'
import TiltCard from '../components/shared/TiltCard'
import AmbientBackground from '../components/shared/AmbientBackground'
import Realistic3DBillPlinth from '../components/Realistic3DBillPlinth'

export default function DashboardHome() {
  const { currentUser } = useAuth()
  const [bills, setBills] = useState([])
  const [cardsRef, cardsVisible] = useReveal()
  const scannerRef = useRef(null)

  const scrollToScanner = () => {
    const el = document.getElementById('scanner-section') || scannerRef.current
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  useEffect(() => {
    const unsub = subscribeToBillHistory((res) => {
      if (res && res.length > 0) {
        setBills(res)
      } else {
        setBills(MOCK_BILLS)
      }
    })
    return unsub
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    let timeGreeting = 'Good evening'
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning'
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon'
    }

    const firstName = currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''
    return `${timeGreeting}${firstName}`
  }

  const totalScanned = bills.length
  const verifiedBills = bills.filter(b => b.status === 'VERIFIED' || b.consumerScore >= 90).length
  const issuesDetected = bills.filter(b => (b.status && b.status !== 'VERIFIED') || b.serviceChargeIllegal || (b.flags && b.flags.length > 0)).length
  const totalPotentialDifferences = bills.reduce((sum, b) => sum + Number(b.serviceCharge || 0), 0)

  const animatedScanned = useCountUp(totalScanned, 800, cardsVisible)
  const animatedVerified = useCountUp(verifiedBills, 800, cardsVisible)
  const animatedIssues = useCountUp(issuesDetected, 800, cardsVisible)
  const animatedDiffs = useCountUp(totalPotentialDifferences, 800, cardsVisible)

  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden font-sans flex flex-col selection:bg-[#D4AF37] selection:text-slate-950">
      {/* Luxury Obsidian Ambient Lights */}
      <AmbientBackground />

      <Navbar />

      <main className="flex-1 pt-32 sm:pt-28 pb-16 sm:pb-20 relative z-10">
        <Container className="space-y-6 sm:space-y-8">
          
          {/* Header Greeting Card */}
          <div className="vault-glass border border-sky-500/25 dark:border-[#D4AF37]/30 rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden shadow-[0_20px_50px_rgba(2,132,199,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Top specular accent */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-500 dark:via-[#D4AF37] to-transparent" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 dark:bg-[#D4AF37]/15 border border-sky-500/30 dark:border-[#D4AF37]/35 text-sky-700 dark:text-[#FDE68A] text-xs font-mono font-bold tracking-wider uppercase">
                <ShieldCheck size={14} className="text-sky-600 dark:text-[#D4AF37]" />
                Institutional Financial Terminal
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white font-poppins">
                {getGreeting()}
              </h1>
              <p className="text-xs sm:text-sm max-w-xl text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                Welcome to your TaxShield intelligence terminal. Review statutory GST fidelity, voluntary surcharge waivers, and corporate expense recovery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
              <Button 
                variant="primary" 
                size="md" 
                onClick={scrollToScanner} 
                className="w-full sm:w-auto font-bold shadow-[0_0_25px_rgba(2,132,199,0.35)] dark:shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Camera size={18} className="text-white dark:text-slate-950 group-hover:scale-110 transition-transform" />
                Scan Bill Receipt
              </Button>
            </div>
          </div>

          {/* Top 3D Photorealistic Bill Scanner Master-Detail Section */}
          <div ref={scannerRef} id="scanner-section" className="reveal-group is-visible">
            <Realistic3DBillPlinth />
          </div>

          {/* Metric Cards - 2-col on mobile, 4-col on desktop */}
          <div ref={cardsRef} className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 reveal-group persp-1000 ${cardsVisible ? 'is-visible' : ''}`}>
            
            {/* Metric 1 */}
            <TiltCard className="vault-glass border border-slate-200/50 dark:border-white/10 hover:border-[#38BDF8]/40 rounded-2xl p-3.5 sm:p-5 space-y-2 sm:space-y-3 shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <span className="truncate">Audited Invoices</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform shrink-0">
                  <FileText size={15} className="tz-30" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tz-30 tracking-tight truncate">
                {Math.round(animatedScanned)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">Total sessions monitored</p>
            </TiltCard>

            {/* Metric 2 */}
            <TiltCard className="vault-glass border border-slate-200/50 dark:border-white/10 hover:border-[#10B981]/40 rounded-2xl p-3.5 sm:p-5 space-y-2 sm:space-y-3 shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <span className="truncate">Statutory Compliant</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform shrink-0">
                  <ShieldCheck size={15} className="tz-30" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-bold font-mono text-[#10B981] tz-30 tracking-tight truncate">
                {Math.round(animatedVerified)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">100% Tax & Math Verified</p>
            </TiltCard>

            {/* Metric 3 */}
            <TiltCard className="vault-glass border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-3.5 sm:p-5 space-y-2 sm:space-y-3 shadow-xl transition-all duration-300 group bg-gradient-to-br from-white/90 to-amber-50/50 dark:from-[#0D1322]/80 dark:to-amber-950/20">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <span className="truncate">Discrepancies Flagged</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                  <AlertTriangle size={15} className="tz-30" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 tz-30 tracking-tight truncate">
                {Math.round(animatedIssues)}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">Non-mandatory charges</p>
            </TiltCard>

            {/* Metric 4 */}
            <TiltCard className="vault-glass border border-sky-500/20 dark:border-[#D4AF37]/30 hover:border-sky-500/50 dark:hover:border-[#D4AF37]/60 rounded-2xl p-3.5 sm:p-5 space-y-2 sm:space-y-3 shadow-xl transition-all duration-300 group bg-gradient-to-br from-white/90 to-sky-50/50 dark:from-[#0D1322]/80 dark:to-[#D4AF37]/10">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-[#D4AF37]">
                <span className="truncate">Recoverable Surcharges</span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-500/10 dark:bg-[#D4AF37]/15 border border-sky-500/30 dark:border-[#D4AF37]/40 flex items-center justify-center text-sky-600 dark:text-[#FDE68A] group-hover:scale-110 transition-transform shrink-0 shadow-[0_0_12px_rgba(2,132,199,0.2)] dark:shadow-[0_0_12px_rgba(212,175,55,0.3)]">
                  <TrendingUp size={15} className="tz-30" />
                </div>
              </div>
              <div className="text-xl sm:text-3xl font-bold font-mono text-sky-600 dark:text-[#FDE68A] tz-30 tracking-tight truncate">
                ₹{animatedDiffs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">Total voluntary fees</p>
            </TiltCard>
          </div>

          {/* Bills List / Findings Grid */}
          {totalScanned > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Bills List (2 cols) */}
              <div className="lg:col-span-2 vault-glass border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 md:p-7 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-white/10">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white tracking-tight font-poppins">Recently Audited Invoices</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Statutory line itemization & tax bracket verification</p>
                  </div>
                  <Link to="/history" className="text-xs font-semibold text-sky-600 dark:text-[#D4AF37] hover:text-sky-700 dark:hover:text-[#FDE68A] transition-colors flex items-center gap-1">
                    View Complete History →
                  </Link>
                </div>

                <div className="divide-y divide-slate-200/50 dark:divide-white/[0.06] text-xs">
                  {bills.slice(0, 5).map((bill) => {
                    const merchantName = bill.restaurantName || bill.merchant || "Establishment"
                    const invoiceNo = bill.invoiceNo || (bill.gstin ? bill.gstin.slice(0, 8) : "TG-100")
                    const totalVal = Number(bill.totalAmount || 0)
                    const statusText = bill.statusText || (bill.serviceChargeIllegal ? "Voluntary Levy Flagged" : "100% Tax Verified")
                    const statusType = bill.status || (bill.serviceChargeIllegal ? "REVIEW_RECOMMENDED" : "VERIFIED")

                    return (
                      <div key={bill.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl px-3 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04] group">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#050811] dark:to-[#0D1322] border border-sky-500/20 dark:border-[#D4AF37]/30 text-sky-700 dark:text-[#D4AF37] flex items-center justify-center font-bold shrink-0 shadow-md group-hover:border-sky-500/40 dark:group-hover:border-[#D4AF37]/50 transition-colors">
                            <FileText size={18} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-[#FDE68A] transition-colors">{merchantName}</h4>
                            <p className="text-[11px] font-mono flex items-center gap-2 text-slate-600 dark:text-slate-300 mt-0.5">
                              <span><Calendar size={12} className="inline mr-1 text-sky-600 dark:text-[#D4AF37]" />{bill.date || "2026-08-15"}</span>
                              <span>#{invoiceNo}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-5">
                          <StatusBadge status={statusType} text={statusText} />
                          <div className="text-right">
                            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                              ₹{totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <Link to={`/analysis/${bill.id}`} className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-semibold hover:underline transition-colors">
                              Inspect Audit →
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Active Findings (1 col) */}
              <div className="vault-glass border border-slate-200/50 dark:border-white/10 rounded-3xl p-6 md:p-7 space-y-4 shadow-xl">
                <div className="pb-4 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white flex items-center gap-2 font-poppins">
                    <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" /> Statutory Findings
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {bills.filter(b => b.serviceChargeIllegal || (b.status && b.status !== 'VERIFIED')).length > 0 ? (
                    bills.filter(b => b.serviceChargeIllegal || (b.status && b.status !== 'VERIFIED')).slice(0, 4).map((bill) => {
                      const merchantName = bill.restaurantName || bill.merchant || "Establishment"
                      const scAmount = Number(bill.serviceCharge || 0)
                      const statusText = bill.statusText || "Voluntary Service Fee Detected"
                      return (
                        <div 
                          key={bill.id} 
                          className="p-4 border border-amber-500/30 rounded-2xl space-y-1.5 bg-amber-500/10 text-amber-900 dark:text-amber-200 transition-all hover:border-amber-500/50"
                        >
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-slate-900 dark:text-white font-medium">{merchantName}</span>
                            <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">₹{scAmount.toFixed(2)}</span>
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300">{statusText}</p>
                          <Link to={`/analysis/${bill.id}`} className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200 transition-colors block pt-1">
                            Inspect Full Audit →
                          </Link>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-6 border border-emerald-500/30 bg-emerald-500/10 rounded-2xl text-center space-y-2">
                      <CheckCircle2 size={28} className="text-emerald-500 dark:text-emerald-400 mx-auto" />
                      <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">No Discrepancies Identified</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">All scanned receipts passed statutory GST and CCPA verification.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="vault-glass border border-slate-200/50 dark:border-white/10 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 dark:bg-[#D4AF37]/10 border border-sky-500/30 dark:border-[#D4AF37]/30 text-sky-600 dark:text-[#D4AF37] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(2,132,199,0.15)] dark:shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <FileText size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-poppins">No Invoices Currently Monitored</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">Access your historical receipts or review spending analytics.</p>
              </div>
              <div className="pt-2">
                <Button variant="primary" size="md" to="/history">
                  View Bill History
                </Button>
              </div>
            </div>
          )}

        </Container>
      </main>

      <Footer />
    </div>
  )
}
