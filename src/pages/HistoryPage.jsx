import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StatusBadge from '../components/shared/StatusBadge'
import Button from '../components/shared/Button'
import Container from '../components/shared/Container'
import AmbientBackground from '../components/shared/AmbientBackground'
import { MOCK_BILLS } from '../data/mockData'
import { Link } from 'react-router-dom'
import { Search, ArrowUpRight, UploadCloud, Wallet, Eye, AlertTriangle, ShieldCheck, X, FileText, Scale } from 'lucide-react'
import { subscribeToBillHistory } from '../services/llm/historyService'
import { api } from '../services/api'

export default function HistoryPage() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [bills, setBills] = useState([])
  const [previewBill, setPreviewBill] = useState(null)

  useEffect(() => {
    const unsub = subscribeToBillHistory((res) => {
      if (res && res.length > 0) {
        setBills(res)
      } else {
        setBills(MOCK_BILLS)
      }
    })

    // Also sync from MongoDB backend if available
    api.getBills().then((dbBills) => {
      if (Array.isArray(dbBills) && dbBills.length > 0) {
        setBills((prev) => {
          const merged = [...dbBills]
          prev.forEach((p) => {
            if (!merged.some(m => m.id === p.id || m._id === p.id)) {
              merged.push(p)
            }
          })
          return merged
        })
      }
    }).catch((err) => console.log('MongoDB history sync:', err.message))

    return unsub
  }, [])

  const getStatusType = (b) => b.status || (b.serviceChargeIllegal ? 'REVIEW_RECOMMENDED' : (b.consumerScore >= 90 ? 'VERIFIED' : 'VERIFIED'))

  const filteredBills = bills.filter((bill) => {
    const merchantName = bill.restaurantName || bill.merchant || ''
    const categoryName = bill.establishmentType || bill.category || ''
    const invoiceNo = bill.invoiceNo || (bill.gstin ? bill.gstin.slice(0, 8) : '')

    const matchesSearch = merchantName.toLowerCase().includes(query.toLowerCase()) ||
                          categoryName.toLowerCase().includes(query.toLowerCase()) ||
                          invoiceNo.toLowerCase().includes(query.toLowerCase())

    const statusType = getStatusType(bill)

    if (activeTab === 'ALL') return matchesSearch
    if (activeTab === 'VERIFIED') return matchesSearch && statusType === 'VERIFIED'
    if (activeTab === 'REVIEW') return matchesSearch && statusType === 'REVIEW_RECOMMENDED'
    if (activeTab === 'OVERCHARGE') return matchesSearch && statusType === 'POTENTIAL_OVERCHARGE'
    return matchesSearch
  })

  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden font-sans text-slate-900 dark:text-slate-100 flex flex-col selection:bg-[#D4AF37] selection:text-slate-950">
      {/* Luxury Obsidian Ambient Lights */}
      <AmbientBackground />

      <Navbar />

      <main className="flex-1 pt-28 pb-28 sm:pb-20 relative z-10">
        <Container className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 auth-stagger" style={{ animationDelay: '80ms' }}>
            <div>
              <h1 className="text-3xl font-poppins font-bold text-slate-900 dark:text-white tracking-tight">Bill History</h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Manage and search all your analyzed restaurant receipts and reports
              </p>
            </div>

            <Button variant="primary" size="md" to="/spending" className="shadow-md shadow-sky-500/25 dark:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <Wallet size={16} /> View Spending
            </Button>
          </div>

          {bills.length > 0 ? (
            <>
              {/* Filter Controls Bar */}
              <div className="vault-glass border border-slate-200/50 dark:border-white/10 rounded-3xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 auth-stagger shadow-xl" style={{ animationDelay: '140ms' }}>
                
                {/* Tab Filter Buttons - Clean, mobile scrollable */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      activeTab === 'ALL' ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-500/30 dark:from-[#D4AF37] dark:to-[#FDE68A] dark:text-slate-950 dark:shadow-[0_0_15px_rgba(212,175,55,0.4)] dark:bg-gradient-to-r' : 'bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    All ({bills.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('VERIFIED')}
                    className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      activeTab === 'VERIFIED' ? 'bg-[#10B981] text-white font-bold shadow-md shadow-emerald-500/25' : 'bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    Verified ({bills.filter(b => getStatusType(b) === 'VERIFIED').length})
                  </button>
                  <button
                    onClick={() => setActiveTab('REVIEW')}
                    className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      activeTab === 'REVIEW' ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/25' : 'bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    Needs Review ({bills.filter(b => getStatusType(b) === 'REVIEW_RECOMMENDED').length})
                  </button>
                  <button
                    onClick={() => setActiveTab('OVERCHARGE')}
                    className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      activeTab === 'OVERCHARGE' ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/25' : 'bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    Overcharge ({bills.filter(b => getStatusType(b) === 'POTENTIAL_OVERCHARGE').length})
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative w-full md:w-72">
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by merchant or invoice..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/80 dark:bg-slate-950/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

              </div>

              {/* Bill Cards Grid */}
              {filteredBills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auth-stagger" style={{ animationDelay: '200ms' }}>
                {filteredBills.map((bill) => {
                  const merchantName = bill.restaurantName || bill.merchant || 'Establishment'
                  const categoryName = bill.establishmentType || bill.category || 'Restaurant'
                  const totalVal = Number(bill.totalAmount || 0)
                  const subtotalVal = Number(bill.subtotal || 0)
                  const taxVal = Number(bill.gst || bill.taxes || (bill.cgst + bill.sgst) || 0)
                  const scVal = Number(bill.serviceCharge || 0)
                  const isRedFlag = scVal > 0 || bill.serviceChargeIllegal || bill.status === 'REVIEW_RECOMMENDED' || bill.status === 'POTENTIAL_OVERCHARGE'
                  const statusType = bill.status || (isRedFlag ? 'REVIEW_RECOMMENDED' : 'VERIFIED')
                  const statusText = bill.statusText || (isRedFlag ? 'Voluntary Service Fee' : '100% Tax Verified')
                  const imgUrl = bill.billImageUrl || bill.image

                  return (
                    <div key={bill.id} className="vault-glass border border-slate-200/60 dark:border-white/10 hover:border-sky-500/50 dark:hover:border-[#D4AF37]/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-xl group">
                      <div className="space-y-3">
                        {imgUrl && (
                          <div 
                            onClick={() => setPreviewBill(bill)}
                            className="w-full h-36 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 relative cursor-pointer group/img"
                            title="Click to inspect original bill receipt"
                          >
                            <img
                              src={imgUrl}
                              alt={merchantName}
                              className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs">
                              <Eye size={16} /> View Receipt Image
                            </div>
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1">
                              <Eye size={10} /> Inspect
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-[#D4AF37] font-mono tracking-wider block truncate">{categoryName}</span>
                            <h3 className="font-poppins font-bold text-base text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-[#FDE68A] transition-colors truncate">{merchantName}</h3>
                          </div>
                          <div className="shrink-0">
                            <StatusBadge status={statusType} text={statusText} size="sm" />
                          </div>
                        </div>

                        {/* Red Flag vs Green Flag Statutory Banner */}
                        <div>
                          {isRedFlag ? (
                            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <span>Red Flag: Heavy / Illegal Levy</span>
                              </div>
                              <span className="font-mono text-rose-700 dark:text-rose-300 font-bold">
                                +₹{scVal.toFixed(0)}
                              </span>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Green Flag: 100% Compliant</span>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
                                NO SC
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-baseline py-2 border-y border-slate-200/50 dark:border-white/10 font-mono">
                          <span className="text-xs text-slate-600 dark:text-slate-400">Date: {bill.date || 'Recent'}</span>
                          <span className="text-lg font-bold gold-gradient-text">₹{totalVal.toFixed(2)}</span>
                        </div>

                        <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                          <div className="flex justify-between">
                            <span>Base Subtotal:</span>
                            <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">₹{subtotalVal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxes Paid:</span>
                            <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">₹{taxVal.toFixed(2)}</span>
                          </div>
                          {scVal > 0 && (
                            <div className="flex justify-between text-rose-700 dark:text-rose-400 font-medium">
                              <span>Service Charge (Voluntary):</span>
                              <span className="font-mono text-rose-700 dark:text-rose-400 font-bold">₹{scVal.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col gap-2">
                        {isRedFlag && (
                          <Link
                            to={`/complaint/${bill.id}`}
                            className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-poppins font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
                          >
                            <Scale size={13} /> Auto-Draft CCPA Complaint
                          </Link>
                        )}
                        <Link
                          to={`/analysis/${bill.id}`}
                          className="w-full py-2.5 rounded-xl border border-sky-500/30 dark:border-[#D4AF37]/30 bg-sky-500/10 dark:bg-[#D4AF37]/10 hover:bg-sky-500/20 dark:hover:bg-[#D4AF37]/20 text-sky-700 dark:text-[#FDE68A] text-xs font-poppins font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          Inspect Audit Report <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
              ) : (
                <div className="vault-glass border border-slate-200/50 dark:border-white/10 rounded-3xl p-10 text-center space-y-3 max-w-xl mx-auto shadow-xl">
                  <p className="text-xs text-slate-600 dark:text-slate-400">No bills match “{query}” in {activeTab}.</p>
                  <Button variant="outline" size="sm" onClick={() => { setQuery(''); setActiveTab('ALL') }}>Clear filters</Button>
                </div>
              )}
            </>
          ) : (
            /* Clean Empty State */
            <div className="vault-glass border border-white/10 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto auth-stagger shadow-2xl">
              <UploadCloud size={40} className="text-[#D4AF37] mx-auto animate-spatial-float" />
              <div className="space-y-1">
                <h3 className="font-poppins font-bold text-lg text-white">No bill history yet</h3>
                <p className="text-xs text-slate-400">
                  Upload a bill receipt to begin extracting charges and verifying tax calculations.
                </p>
              </div>
              <Button variant="primary" size="md" to="/spending" className="mt-2 font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                <Wallet size={16} /> View Spending
              </Button>
            </div>
          )}

        </Container>
      </main>

      {/* Bill Receipt Image Lightbox Modal */}
      {previewBill && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-white/15 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-base text-slate-900 dark:text-white">
                  {previewBill.restaurantName || previewBill.merchant || 'Scanned Receipt'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Invoice: {previewBill.invoiceNo || 'N/A'} • {previewBill.date || 'Recent'}
                </p>
              </div>
              <button
                onClick={() => setPreviewBill(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 flex items-center justify-center max-h-[50vh]">
                <img
                  src={previewBill.billImageUrl || previewBill.image}
                  alt="Scanned Bill Receipt"
                  className="max-h-[50vh] w-auto object-contain"
                />
              </div>

              {/* Quick Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Subtotal</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">₹{Number(previewBill.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">GST Tax</span>
                  <span className="text-sm font-bold text-sky-600 dark:text-[#38BDF8]">₹{Number(previewBill.gst || previewBill.taxes || 0).toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Service Charge</span>
                  <span className={`text-sm font-bold ${previewBill.serviceCharge > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                    ₹{Number(previewBill.serviceCharge || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-bold">Total Stated</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{Number(previewBill.totalAmount || previewBill.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.01]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewBill(null)}
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                {previewBill.serviceCharge > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    to={`/complaint/${previewBill.id}`}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    <Scale size={13} /> File Complaint
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  to={`/analysis/${previewBill.id}`}
                  className="font-bold"
                >
                  Full Audit Breakdown <ArrowUpRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
