import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Container from '../components/shared/Container'
import Button from '../components/shared/Button'
import { MOCK_BILLS } from '../data/mockData'
import { PieChart, UploadCloud, Camera, TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react'
import { subscribeToBillHistory } from '../services/llm/historyService'

export default function InsightsPage() {
  const [timeframe, setTimeframe] = useState('6m')
  const [bills, setBills] = useState([])

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

  const timeframeDays = { '7d': 7, '30d': 30, '3m': 90, '6m': 180, '1y': 365 }
  const cutoff = (() => {
    const d = new Date()
    d.setDate(d.getDate() - (timeframeDays[timeframe] || 180))
    return d
  })()
  const visibleBills = bills.filter((b) => {
    const dt = new Date(b.date || b.timestamp || b.createdAt || Date.now())
    return Number.isNaN(dt.getTime()) || dt >= cutoff
  })
  const hasData = bills.length > 0
  const hasVisible = visibleBills.length > 0
  const totalSpend = visibleBills.reduce((sum, b) => sum + Number(b.totalAmount || b.total || 0), 0)
  const totalTaxes = visibleBills.reduce((sum, b) => sum + Number(b.gst || b.taxes || (b.cgst + b.sgst) || 0), 0)
  const totalFees = visibleBills.reduce((sum, b) => sum + Number(b.serviceCharge || 0), 0)
  const avgBill = hasVisible ? totalSpend / visibleBills.length : 0
  const flaggedCount = visibleBills.filter(b => (b.status && b.status !== 'VERIFIED') || b.serviceChargeIllegal || (b.flags && b.flags.length > 0)).length

  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden font-sans text-slate-100 flex flex-col selection:bg-lime-400 selection:text-slate-950">
      {/* Ambient background blur orbs */}
      <div className="bg-orb bg-orb-gold fixed -top-32 -left-32 w-[480px] h-[480px] animate-spatial-float z-0" />
      <div className="bg-orb bg-orb-emerald fixed top-1/3 -right-32 w-[440px] h-[440px] animate-spatial-float z-0" style={{ animationDelay: '2s' }} />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 relative z-10">
        <Container className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 auth-stagger" style={{ animationDelay: '80ms' }}>
            <div>
              <h1 className="text-3xl font-poppins font-bold vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>Spending & Tax Insights</h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                Visual analytics tracking cumulative dining spend, GST paid, and service fees
              </p>
            </div>

            {hasData && (
              <div className="vision-pro-pill p-1.5 flex items-center gap-1 text-xs font-semibold self-start sm:self-auto border-lime-400/30">
                {['7d', '30d', '3m', '6m', '1y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-xl uppercase transition-colors cursor-pointer ${
                      timeframe === tf ? 'bg-lime-400 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(132,204,22,0.4)]' : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasData ? (
            hasVisible ? (
            <>
              {/* Analytics Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="vision-pro-card p-5 space-y-2 auth-stagger" style={{ animationDelay: '140ms' }}>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    <span>Total Dining Spend</span>
                    <TrendingUp size={18} className="text-lime-400" />
                  </div>
                  <div className="text-2xl font-bold font-poppins vision-pro-text-emerald">₹{totalSpend.toFixed(2)}</div>
                  <p className="text-xs text-lime-400 font-medium">Avg ₹{avgBill.toFixed(2)} across {visibleBills.length} bills ({timeframe})</p>
                </div>

                <div className="vision-pro-card p-5 space-y-2 auth-stagger" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    <span>GST Taxes Paid</span>
                    <ShieldCheck size={18} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-poppins vision-pro-text-cyan">₹{totalTaxes.toFixed(2)}</div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Standard 5% food GST tier</p>
                </div>

                <div className="vision-pro-card-glow-amber p-5 space-y-2 auth-stagger" style={{ animationDelay: '260ms' }}>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400">
                    <span>Service Fees Paid</span>
                    <AlertTriangle size={18} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-poppins vision-pro-text-amber">₹{totalFees.toFixed(2)}</div>
                  <p className="text-xs text-amber-300 font-medium">CCPA removable fees sum</p>
                </div>

                <div className="vision-pro-card p-5 space-y-2 auth-stagger" style={{ animationDelay: '320ms' }}>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    <span>Flagged Bills</span>
                    <AlertTriangle size={18} className="text-rose-400" />
                  </div>
                  <div className="text-2xl font-bold font-poppins text-rose-400">{flaggedCount} Bills</div>
                  <p className="text-xs text-rose-400 font-medium">Discrepancies / fees detected</p>
                </div>
              </div>

              {/* Dynamic Session Breakdown Chart */}
              <div className="vision-pro-card p-6 md:p-8 space-y-6 auth-stagger" style={{ animationDelay: '380ms' }}>
                <div className="flex items-center justify-between pb-4 border-b border-slate-500/30">
                  <div>
                    <h3 className="font-poppins font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <PieChart size={20} className="text-lime-400" /> Scanned Receipts Analytics
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calculated live from your uploaded bill history session</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-center">
                  <div className="p-6 vision-pro-pill space-y-1 border-lime-400/30">
                    <span className="text-xs font-semibold text-lime-400 uppercase">Subtotal Share</span>
                    <div className="text-2xl font-bold vision-pro-text-emerald font-mono">₹{(totalSpend - totalTaxes - totalFees).toFixed(2)}</div>
                  </div>
                  <div className="p-6 vision-pro-pill space-y-1 border-cyan-400/30">
                    <span className="text-xs font-semibold text-cyan-400 uppercase">GST Tax Share</span>
                    <div className="text-2xl font-bold vision-pro-text-cyan font-mono">₹{totalTaxes.toFixed(2)}</div>
                  </div>
                  <div className="p-6 vision-pro-pill space-y-1 border-amber-400/30">
                    <span className="text-xs font-semibold text-amber-400 uppercase">Service Fee Share</span>
                    <div className="text-2xl font-bold vision-pro-text-amber font-mono">₹{totalFees.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </>
            ) : (
              <div className="vision-pro-card p-12 text-center space-y-4 max-w-xl mx-auto auth-stagger">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No bills in “{timeframe}” range.</p>
                <Button variant="outline" size="sm" onClick={() => setTimeframe('1y')}>Show last year</Button>
              </div>
            )
          ) : (
            /* Clean Empty State */
            <div className="vision-pro-card p-12 text-center space-y-4 max-w-xl mx-auto auth-stagger">
              <UploadCloud size={40} className="text-lime-400 mx-auto animate-spatial-float" />
              <div className="space-y-1">
                <h3 className="font-poppins font-bold text-lg" style={{ color: 'var(--text-primary)' }}>No spending data available yet</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Scan a bill receipt to start building your dining tax and spending analytics.
                </p>
              </div>
              <Button variant="primary" size="md" to="/scan" className="mt-2 font-bold">
                <Camera size={16} /> Scan Your First Bill
              </Button>
            </div>
          )}

        </Container>
      </main>

      <Footer />
    </div>
  )
}
