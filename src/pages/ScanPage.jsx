import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Container from '../components/shared/Container'
import BillUploader from '../components/BillUploader'
import ScanProgressModal from '../components/ScanProgressModal'
import { analyzeBill } from '../services/llm/llmGateway'
import { Sparkles, AlertCircle, X } from 'lucide-react'

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [isAnalysisDone, setIsAnalysisDone] = useState(false)
  const [scanError, setScanError] = useState(null)
  const scannedBillIdRef = useRef(null)
  const navigate = useNavigate()

  const [scanProgress, setScanProgress] = useState('')
  const handleStartScan = async (fileData, scanOptions = {}) => {
    setIsScanning(true)
    setIsAnalysisDone(false)
    setScanError(null)
    setScanProgress('')
    scannedBillIdRef.current = null

    try {
      const sampleText = `Grand Paradise Restaurant
GSTIN: 36AABCT3518Q1ZX
Date: ${new Date().toISOString().split('T')[0]}

1x Special Paneer Tikka - ₹340.00
2x Butter Naan - ₹180.00
1x Fresh Lime Soda - ₹120.00

Subtotal: ₹640.00
CGST (2.5%): ₹16.00
SGST (2.5%): ₹16.00
Service Charge (10%): ₹64.00
Total Amount: ₹736.00`

      let payloads = []
      if (Array.isArray(fileData)) {
        payloads = fileData.filter((x) => typeof x === 'string' && x.trim().length > 0)
      } else if (typeof fileData === 'string' && fileData.trim().length > 0) {
        payloads = [fileData]
      } else {
        payloads = [sampleText]
      }

      const ids = []
      for (let i = 0; i < payloads.length; i++) {
        setScanProgress(payloads.length > 1 ? `Analyzing bill ${i + 1} of ${payloads.length}…` : '')
        const result = await analyzeBill(payloads[i], scanOptions)
        if (result && result.id) ids.push(result.id)
      }
      if (ids.length === 0) {
        throw new Error("Could not extract valid bill ID from result.")
      }
      scannedBillIdRef.current = ids.length === 1 ? ids[0] : ids
      setIsAnalysisDone(true)
    } catch (err) {
      console.error("Scan analysis failed:", err)
      setIsScanning(false)
      setIsAnalysisDone(false)
      const msg = err.message || "Failed to process bill receipt with AI."
      const isNonBill = err.isNonBill || 
        msg.includes("NON_BILL") || 
        msg.includes("FOOD_IMAGE") || 
        msg.includes("INVALID_IMAGE_FOOD") || 
        msg.includes("INVALID_DOCUMENT") || 
        msg.includes("not appear") || 
        msg.includes("No payment") || 
        msg.includes("No billing")

      if (isNonBill) {
        setScanError("The uploaded image does not appear to be a valid bill, receipt, or invoice. Please upload a clear photo of an authentic physical or digital bill.")
      } else {
        setScanError(msg.replace(/^[A-Z_]+:\s*/, ''))
      }
    }
  }

  const handleScanComplete = useCallback(() => {
    setIsScanning(false)
    setIsAnalysisDone(false)
    setScanProgress('')
    const ids = scannedBillIdRef.current
    if (Array.isArray(ids)) {
      navigate('/history')
    } else if (ids) {
      navigate(`/analysis/${ids}`)
    }
  }, [navigate])

  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden font-sans flex flex-col selection:bg-lime-400 selection:text-slate-950">
      {/* Ambient background blur orb */}
      <div className="bg-orb bg-orb-gold fixed -top-32 -left-32 w-[480px] h-[480px] animate-spatial-float z-0" />
      <div className="bg-orb bg-orb-emerald fixed top-1/3 -right-32 w-[440px] h-[440px] animate-spatial-float z-0" style={{ animationDelay: '2s' }} />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 relative z-10">
        <Container className="max-w-4xl space-y-6">
          
          {/* Title Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Audit an Invoice or Receipt
            </h1>
            <p className="text-xs sm:text-sm max-w-xl mx-auto text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload a receipt photo or PDF bill. TaxShield audits GST rate compliance, highlights recoverable CCPA service fees, and checks arithmetic.
            </p>
          </div>

          {/* Error Banner */}
          {scanError && (
            <div className="p-4 sm:p-5 rounded-2xl border border-rose-500/35 bg-rose-500/10 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 flex items-start justify-between gap-4 shadow-lg backdrop-blur-md animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400 mt-0.5 shadow-sm">
                  <AlertCircle size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-poppins text-rose-900 dark:text-white flex items-center gap-2">
                    Image Not Recognized as a Bill
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/30">
                      Rejected
                    </span>
                  </h4>
                  <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed font-sans max-w-2xl">
                    {scanError}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setScanError(null)}
                className="p-1.5 rounded-xl hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 transition-colors shrink-0 cursor-pointer"
                aria-label="Dismiss alert"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Uploader Component */}
          <div className="auth-stagger" style={{ animationDelay: '160ms' }}>
            <BillUploader onStartScan={handleStartScan} />
          </div>

          {/* Scanning Animation Progress Modal */}
          {scanProgress && (
            <p className="text-center text-xs text-lime-400 font-semibold">{scanProgress}</p>
          )}
          <ScanProgressModal
            isOpen={isScanning}
            isDone={isAnalysisDone}
            error={scanError}
            onComplete={handleScanComplete}
          />

        </Container>
      </main>

      <Footer />
    </div>
  )
}
