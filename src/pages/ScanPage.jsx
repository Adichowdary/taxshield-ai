import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MobileNav from '../components/MobileNav'
import Footer from '../components/Footer'
import Container from '../components/shared/Container'
import BillUploader from '../components/BillUploader'
import ScanProgressModal from '../components/ScanProgressModal'
import { analyzeBill } from '../services/llm/llmGateway'
import { Sparkles, AlertCircle } from 'lucide-react'

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
      if (msg.includes("FOOD_IMAGE_DETECTED") || msg.includes("INVALID_IMAGE_FOOD")) {
        setScanError("Food Dish Photo Detected: The uploaded image appears to be a picture of food/dishes rather than a payment bill or receipt. Please upload a clear restaurant receipt or tax invoice.")
      } else if (msg.includes("INVALID_DOCUMENT")) {
        setScanError("Invalid Document: No billing or financial transaction details found. Please upload a restaurant receipt or payment invoice.")
      } else {
        setScanError(msg)
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
          <div className="text-center space-y-2 auth-stagger" style={{ animationDelay: '80ms' }}>
            <span className="bg-lime-400/10 text-lime-400 text-xs font-bold px-3.5 py-1 rounded-full border border-lime-400/30 uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles size={13} /> TaxShield AI Receipt Intelligence
            </span>
            <h1 className="text-3xl sm:text-4xl font-poppins font-bold vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>
              Scan Your Bill
            </h1>
            <p className="text-sm sm:text-base max-w-xl mx-auto font-sans" style={{ color: 'var(--text-muted)' }}>
              Upload a clear photo or digital PDF receipt. TaxShield AI will extract every line item, verify GST rules, and highlight potential overcharges.
            </p>
          </div>

          {/* Error Banner */}
          {scanError && (
            <div className="p-4 rounded-2xl text-xs flex items-start gap-2.5 border bg-rose-500/15 border-rose-400/30 text-rose-300 backdrop-blur-md">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Analysis Error</span>
                <span>{scanError}</span>
              </div>
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
      <MobileNav />
    </div>
  )
}
