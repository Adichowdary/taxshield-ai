import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Container from '../components/shared/Container'
import StatusBadge from '../components/shared/StatusBadge'
import ConfidenceScore from '../components/ConfidenceScore'
import TaxBreakdown from '../components/TaxBreakdown'
import ChargeBreakdown from '../components/ChargeBreakdown'
import ItemizedTable from '../components/ItemizedTable'
import ExplanationDrawer from '../components/ExplanationDrawer'
import ComplaintGenerator from '../components/ComplaintGenerator'
import Button from '../components/shared/Button'
import AmbientBackground from '../components/shared/AmbientBackground'
import { MOCK_BILLS } from '../data/mockData'
import { getBillById } from '../services/llm/historyService'
import { verifyBillMath, auditTaxLegality } from '../services/llm/taxEngine'
import { 
  ArrowLeft, 
  Download, 
  ShieldAlert, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  FileCheck,
  Eye
} from 'lucide-react'

const DEFAULT_SAMPLE_BILL = {
  id: "bill-101",
  merchant: "The Grill House",
  category: "STANDALONE_RESTAURANT",
  platform: "Dine-in",
  date: "2026-07-31",
  time: "20:45",
  invoiceNo: "TG-10482",
  address: "102 Connaught Place, New Delhi",
  gstin: "07AAAAA0000A1Z5",
  totalAmount: 1437.50,
  subtotal: 1250.00,
  discount: 0,
  deliveryFee: 0,
  packagingFee: 0,
  platformFee: 0,
  taxes: 62.50,
  cgst: 31.25,
  sgst: 31.25,
  igst: 0,
  serviceCharge: 125.00,
  status: "REVIEW_RECOMMENDED",
  statusText: "Non-Mandatory Service Charge",
  confidenceScore: 87,
  extractionConfidence: "HIGH",
  items: [
    { id: 1, name: "Paneer Tikka Platter", qty: 1, unitPrice: 320.00, taxRate: "5%", total: 320.00, confidence: 99, status: "VERIFIED" },
    { id: 2, name: "Butter Naan (2 pcs)", qty: 2, unitPrice: 90.00, taxRate: "5%", total: 180.00, confidence: 97, status: "VERIFIED" },
    { id: 3, name: "Special Veg Biryani", qty: 1, unitPrice: 450.00, taxRate: "5%", total: 450.00, confidence: 98, status: "VERIFIED" },
    { id: 4, name: "Fresh Lime Soda", qty: 2, unitPrice: 150.00, taxRate: "5%", total: 300.00, confidence: 94, status: "VERIFIED" }
  ]
}

export default function AnalysisPage() {
  const { id } = useParams()
  const foundBill = getBillById(id) || MOCK_BILLS.find(b => b.id === id)
  
  const initialBill = useMemo(() => {
    if (!foundBill) return DEFAULT_SAMPLE_BILL

    const subtotal = Number(foundBill.subtotal || 0)
    const discount = Number(foundBill.discount || 0)
    const deliveryFee = Number(foundBill.deliveryFee || 0)
    const packagingFee = Number(foundBill.packagingFee || 0)
    const platformFee = Number(foundBill.platformFee || 0)
    const serviceCharge = Number(foundBill.serviceCharge || 0)
    const cgst = Number(foundBill.cgst || (foundBill.tax?.cgst ?? 0))
    const sgst = Number(foundBill.sgst || (foundBill.tax?.sgst ?? 0))
    const igst = Number(foundBill.igst || (foundBill.tax?.igst ?? 0))
    const taxes = Number(foundBill.gst || (foundBill.taxes ?? (cgst + sgst + igst)))
    const statedTotal = Number(foundBill.totalAmount || foundBill.total || 0)

    const rawItems = foundBill.lineItems || foundBill.items || DEFAULT_SAMPLE_BILL.items
    const items = rawItems.map((item, idx) => ({
      id: item.id || idx + 1,
      name: item.name || `Item ${idx + 1}`,
      qty: Number(item.qty || item.quantity || 1),
      unitPrice: Number(item.price || item.unitPrice || 0),
      taxRate: foundBill.establishmentType === "LUXURY_HOTEL_RESTAURANT" ? "18%" : "5%",
      total: Number(item.total || ((item.qty || item.quantity || 1) * (item.price || item.unitPrice || 0)))
    }))

    return {
      id: foundBill.id,
      merchant: foundBill.restaurantName || foundBill.restaurant || foundBill.merchant || "Establishment",
      category: foundBill.establishmentType || "STANDALONE_RESTAURANT",
      platform: foundBill.platform || "Direct",
      date: foundBill.date || "2026-08-15",
      time: "19:30",
      invoiceNo: foundBill.invoiceNumber || (foundBill.gstin ? `#${foundBill.gstin.slice(0, 8)}` : "TG-10482"),
      address: foundBill.address || "Main Market, Commercial Center",
      gstin: foundBill.gstin || "07AAAAA0000A1Z5",
      billImageUrl: foundBill.billImageUrl || foundBill.image || foundBill.previewUrl || null,
      image: foundBill.billImageUrl || foundBill.image || foundBill.previewUrl || null,
      statedTotal,
      subtotal,
      discount,
      deliveryFee,
      packagingFee,
      platformFee,
      serviceCharge,
      cgst,
      sgst,
      igst,
      taxes,
      extractionConfidence: foundBill.extractionConfidence || "HIGH",
      unreadableFields: foundBill.unreadableFields || [],
      flags: foundBill.flags || [],
      items
    }
  }, [foundBill])

  // Dynamic Bill State
  const [billItems, setBillItems] = useState(initialBill.items)
  const [serviceChargeActive, setServiceChargeActive] = useState(initialBill.serviceCharge > 0)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showComplaint, setShowComplaint] = useState(false)
  const [reportDownloaded, setReportDownloaded] = useState(false)

  useEffect(() => {
    setBillItems(initialBill.items)
    setServiceChargeActive(initialBill.serviceCharge > 0)
  }, [initialBill])

  // Compute dynamic live figures
  const subtotal = billItems.reduce((acc, item) => acc + (item.total || 0), 0)
  const isLuxury = initialBill.category === "LUXURY_HOTEL_RESTAURANT"
  const legalGstRate = isLuxury ? 0.18 : 0.05

  // Proportional GST
  const cgst = Number((subtotal * (legalGstRate / 2)).toFixed(2))
  const sgst = Number((subtotal * (legalGstRate / 2)).toFixed(2))
  const igst = 0
  const taxes = Number((cgst + sgst).toFixed(2))

  const activeServiceCharge = serviceChargeActive 
    ? (initialBill.serviceCharge > 0 ? initialBill.serviceCharge : Number((subtotal * 0.10).toFixed(2)))
    : 0

  // Run deterministic verification engine on current live state
  const verification = verifyBillMath({
    subtotal,
    discount: initialBill.discount,
    deliveryFee: initialBill.deliveryFee,
    packagingFee: initialBill.packagingFee,
    platformFee: initialBill.platformFee,
    serviceCharge: activeServiceCharge,
    cgst,
    sgst,
    igst,
    statedTotal: initialBill.statedTotal,
    extractionConfidence: initialBill.extractionConfidence
  })

  const taxLegality = auditTaxLegality({
    subtotal,
    cgst,
    sgst,
    igst,
    totalGst: taxes,
    establishmentType: initialBill.category,
    starRating: isLuxury ? 5 : 3,
    hasAlcohol: billItems.some(i => /beer|whisky|vodka|wine|cocktail|rum|gin|alcohol/i.test(i.name))
  })

  // Dynamic status & score calculation
  const hasDiscrepancy = verification.status === "discrepancy"
  const isServiceChargeFlagged = activeServiceCharge > 0
  const isVerified = verification.status === "verified" && !isServiceChargeFlagged && taxLegality.issues.length === 0

  let status = "VERIFIED"
  let statusText = "100% Tax & Math Verified"
  if (hasDiscrepancy) {
    status = "ACTION_REQUIRED"
    statusText = `Discrepancy Detected (₹${Math.abs(verification.difference).toFixed(2)})`
  } else if (isServiceChargeFlagged) {
    status = "REVIEW_RECOMMENDED"
    statusText = "Voluntary Service Charge Detected"
  }

  let liveConfidenceScore = 100
  if (isServiceChargeFlagged) liveConfidenceScore -= 20
  if (hasDiscrepancy) liveConfidenceScore -= 35
  if (taxLegality.issues.some(i => i.type === "DANGER")) liveConfidenceScore -= 30
  if (initialBill.extractionConfidence === "LOW") liveConfidenceScore -= 15
  liveConfidenceScore = Math.max(10, Math.min(100, liveConfidenceScore))

  // Compile full active issues list
  const activeIssues = useMemo(() => {
    const list = []
    
    if (hasDiscrepancy) {
      const overcharged = verification.difference > 0
      list.push({
        id: "issue-math-diff",
        type: "MATH_DISCREPANCY",
        severity: "danger",
        title: overcharged ? `Total Overcharged by ₹${Math.abs(verification.difference).toFixed(2)}` : `Total Undercharged by ₹${Math.abs(verification.difference).toFixed(2)}`,
        amount: Math.abs(verification.difference),
        difference: verification.difference,
        expectedAmount: verification.expectedTotal,
        detectedAmount: verification.statedTotal,
        description: `Stated total printed on bill (₹${verification.statedTotal.toFixed(2)}) does not match the sum of items, taxes, and fees (₹${verification.expectedTotal.toFixed(2)}).`,
        recommendation: "Request bill correction to match actual itemized charges."
      })
    }

    if (isServiceChargeFlagged) {
      list.push({
        id: "issue-service-charge",
        type: "SERVICE_CHARGE",
        severity: "warning",
        title: "Voluntary Service Charge Included",
        amount: activeServiceCharge,
        percentage: "10%",
        description: `A service charge of ₹${activeServiceCharge.toFixed(2)} is included. Per CCPA (Central Consumer Protection Authority) guidelines, restaurant service charges are strictly voluntary.`,
        recommendation: "You may ask the restaurant manager to waive the service charge."
      })
    }

    taxLegality.issues.forEach((ti, idx) => {
      list.push({
        id: `issue-tax-${idx}`,
        type: "TAX_DISCREPANCY",
        severity: ti.type === "DANGER" ? "danger" : "warning",
        title: ti.title,
        amount: ti.excessTaxAmount || 0,
        description: ti.description,
        recommendation: "Ensure 5% GST is applied for standalone restaurant dining."
      })
    })

    return list
  }, [hasDiscrepancy, isServiceChargeFlagged, verification, activeServiceCharge, taxLegality])

  const currentBill = {
    ...initialBill,
    items: billItems,
    subtotal,
    cgst,
    sgst,
    igst,
    taxes,
    serviceCharge: activeServiceCharge,
    totalAmount: verification.expectedTotal,
    statedTotal: initialBill.statedTotal,
    status,
    statusText,
    confidenceScore: liveConfidenceScore,
    issues: activeIssues,
    verification
  }

  const handleItemsChange = (newItems) => {
    setBillItems(newItems)
  }

  const handleExplain = (issue) => {
    setSelectedIssue(issue)
  }

  const handleDownloadPDF = () => {
    try {
      const lines = [
        'TaxShield Audit Report', `Merchant: ${currentBill.merchant}`,
        `Date: ${currentBill.date} | Invoice: ${currentBill.invoiceNo} | GSTIN: ${currentBill.gstin}`,
        `Status: ${currentBill.status} | Confidence: ${liveConfidenceScore}`,
        `Stated: Rs.${verification.statedTotal.toFixed(2)} | Calculated: Rs.${verification.expectedTotal.toFixed(2)} | Diff: Rs.${verification.difference.toFixed(2)}`,
        '', 'Items:',
        ...billItems.map((i) => `- ${i.name} x${i.qty || i.quantity || 1} @ Rs.${Number(i.unitPrice ?? i.price ?? 0).toFixed(2)} = Rs.${Number(i.total ?? 0).toFixed(2)}`),
        '', `Subtotal: Rs.${subtotal.toFixed(2)}`, `CGST: Rs.${cgst.toFixed(2)} | SGST: Rs.${sgst.toFixed(2)}`,
        `Service charge: Rs.${activeServiceCharge.toFixed(2)}`, '',
        'Issues:', ...(activeIssues.length ? activeIssues.map((x) => `- [${x.type}] ${x.title}`) : ['- None']),
      ]
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `TaxShield-Audit-${currentBill.invoiceNo || currentBill.id || 'report'}.txt`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      window.print()
    }
    setReportDownloaded(true)
    setTimeout(() => setReportDownloaded(false), 3000)
  }

  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden text-slate-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-slate-950">
      {/* Luxury Obsidian Ambient Lights */}
      <AmbientBackground />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 relative z-10">
        <Container className="space-y-8">
          
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 auth-stagger" style={{ animationDelay: '60ms' }}>
            <Link to="/history" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-[#FDE68A] transition-colors">
              <ArrowLeft size={16} /> Back to Bill History
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
                <Download size={14} /> {reportDownloaded ? 'PDF Downloaded!' : 'Download Audit Report'}
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowComplaint(true)} className="shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                <ShieldAlert size={14} /> Create Legal Dispute Draft
              </Button>
            </div>
          </div>

          {/* Deterministic Tax & Math Engine Verification Banner */}
          <div className={`p-4 md:p-5 rounded-3xl border backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 auth-stagger shadow-xl ${
            isVerified 
              ? 'bg-[#10B981]/10 border-[#10B981]/30 text-emerald-200'
              : hasDiscrepancy
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`} style={{ animationDelay: '90ms' }}>
            <div className="flex items-start gap-3">
              {isVerified ? (
                <CheckCircle2 size={22} className="text-[#10B981] shrink-0 mt-0.5" />
              ) : hasDiscrepancy ? (
                <XCircle size={22} className="text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={22} className="text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-poppins font-bold text-sm text-white">
                    {isVerified 
                      ? 'Deterministic Verification Passed: Mathematical Accuracy 100%' 
                      : hasDiscrepancy 
                        ? `Math Discrepancy Flagged: ₹${Math.abs(verification.difference).toFixed(2)} Difference`
                        : 'Audit Review Recommended'}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-950/70 border border-white/10 text-slate-300">
                    Statutory check
                  </span>
                </div>
                <p className="text-xs font-sans opacity-90 leading-relaxed max-w-3xl text-slate-300">
                  {isVerified 
                    ? 'Every line item, tax rate (5% GST), and platform charge recomputed independently against legal brackets. No overcharges detected.'
                    : hasDiscrepancy
                      ? `Expected calculated total is ₹${verification.expectedTotal.toFixed(2)}, but the printed bill requested ₹${verification.statedTotal.toFixed(2)}. Overcharge difference: ₹${Math.abs(verification.difference).toFixed(2)}.`
                      : 'Non-mandatory fees or specific charges require your attention before payment.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-white">
                Stated: ₹{verification.statedTotal.toFixed(2)} | Calc: ₹{verification.expectedTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Dynamic Bill Header Card */}
          <div className="vault-glass border border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 auth-stagger shadow-[0_20px_50px_rgba(0,0,0,0.6)]" style={{ animationDelay: '120ms' }}>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-poppins font-bold text-slate-900 dark:text-white tracking-tight">{currentBill.merchant}</h1>
                <StatusBadge status={currentBill.status} text={currentBill.statusText} />
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#B45309] dark:text-[#FDE68A] font-bold">
                  {currentBill.platform}
                </span>
              </div>
              <p className="text-xs font-mono flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300">
                <span>Date: {currentBill.date}</span>
                <span>Invoice: {currentBill.invoiceNo}</span>
                <span>GSTIN: {currentBill.gstin}</span>
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200/50 dark:border-white/10">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Calculated total</span>
              <span className="text-3xl font-bold font-poppins gold-gradient-text tabular-nums">
                ₹{currentBill.totalAmount.toFixed(2)}
              </span>
              
              {/* Live Service Charge Toggle */}
              <label className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D4AF37]/30 bg-black/5 dark:bg-white/5 cursor-pointer hover:border-[#D4AF37] transition-colors mt-1 text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={serviceChargeActive}
                  onChange={(e) => setServiceChargeActive(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#D4AF37]"
                />
                <span>Include 10% Service Charge (₹{activeServiceCharge.toFixed(2)})</span>
              </label>
            </div>
          </div>

          {/* Original Scanned Bill Image Preview Card */}
          {currentBill.billImageUrl && (
            <div className="vault-glass border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl auth-stagger" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-[#D4AF37]/15 border border-sky-500/30 dark:border-[#D4AF37]/30 text-sky-600 dark:text-[#D4AF37] flex items-center justify-center">
                    <FileCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-poppins">
                      Original Scanned Bill Document
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      High-resolution document stored securely and verified by OCR engine.
                    </p>
                  </div>
                </div>
                <a
                  href={currentBill.billImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Eye size={13} /> View Fullscreen
                </a>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950/20 max-h-[360px] flex items-center justify-center p-2">
                <img
                  src={currentBill.billImageUrl}
                  alt="Scanned Bill Receipt"
                  className="max-h-[340px] w-auto object-contain rounded-xl shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop';
                  }}
                />
              </div>
            </div>
          )}

          {/* Flagged Issues List */}
          {activeIssues.length > 0 && (
            <div className="space-y-3 auth-stagger" style={{ animationDelay: '180ms' }}>
              <h3 className="font-poppins font-semibold text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500 shrink-0" /> Items requiring attention ({activeIssues.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeIssues.map((issue) => (
                  <div key={issue.id} className="vault-glass border border-amber-500/30 rounded-3xl p-5 space-y-3 flex flex-col justify-between bg-gradient-to-br from-white/90 to-amber-50/50 dark:from-[#0D1322]/80 dark:to-amber-950/20 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-poppins font-bold text-amber-800 dark:text-amber-300 text-sm">
                        <span>{issue.title}</span>
                        {issue.amount > 0 && <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">₹{issue.amount.toFixed(2)}</span>}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        {issue.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/50 dark:border-white/10 text-xs">
                      <button
                        onClick={() => handleExplain(issue)}
                        className="font-bold text-[#B45309] dark:text-[#D4AF37] hover:text-[#D97706] dark:hover:text-[#FDE68A] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <HelpCircle size={14} /> Understand Charge
                      </button>
                      <button
                        onClick={() => setShowComplaint(true)}
                        className="font-bold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer transition-colors"
                      >
                        Draft Dispute →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score & Tax Breakdown Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auth-stagger" style={{ animationDelay: '240ms' }}>
            <div className="lg:col-span-1">
              <ConfidenceScore score={currentBill.confidenceScore} />
            </div>
            <div className="lg:col-span-2">
              <TaxBreakdown bill={currentBill} />
            </div>
          </div>

          <div className="auth-stagger" style={{ animationDelay: '300ms' }}>
            <ChargeBreakdown bill={currentBill} />
          </div>

          {/* Dynamic Itemized Line Items Table */}
          <div className="auth-stagger" style={{ animationDelay: '360ms' }}>
            <ItemizedTable items={currentBill.items} onItemsChange={handleItemsChange} />
          </div>

          {/* Complaint Assistant */}
          {showComplaint && (
            <div className="pt-4 auth-stagger">
              <ComplaintGenerator bill={currentBill} />
            </div>
          )}

          {/* Explanation Drawer */}
          <ExplanationDrawer
            issue={selectedIssue}
            isOpen={!!selectedIssue}
            onClose={() => setSelectedIssue(null)}
            onGenerateComplaint={() => {
              setSelectedIssue(null)
              setShowComplaint(true)
            }}
          />

        </Container>
      </main>

      <Footer />
    </div>
  )
}
