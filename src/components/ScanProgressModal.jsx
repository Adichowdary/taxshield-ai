import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Loader2, Shield, Sparkles } from 'lucide-react'

const SCAN_STEPS = [
  { title: 'Checking image quality & clarity', duration: 700 },
  { title: 'Extracting text line items via OCR', duration: 800 },
  { title: 'Verifying arithmetic & subtotal values', duration: 700 },
  { title: 'Analyzing GST rules & service charges', duration: 900 },
  { title: 'Generating intelligence report', duration: 600 }
]

export default function ScanProgressModal({ isOpen, isDone = false, error = null, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      return
    }

    // Lock body scrolling so background cannot move up or down during scan loading
    document.body.style.overflow = 'hidden'

    // Progress through initial steps up to step 3 (waiting state)
    let timer
    if (currentStep < 3 && !isDone && !error) {
      timer = setTimeout(() => {
        setCurrentStep(prev => Math.min(3, prev + 1))
      }, SCAN_STEPS[currentStep].duration)
    } else if (isDone && currentStep < SCAN_STEPS.length) {
      // Once isDone is signaled, quickly finalize step 4 and trigger onComplete
      timer = setTimeout(() => {
        if (currentStep < SCAN_STEPS.length - 1) {
          setCurrentStep(SCAN_STEPS.length - 1)
        } else {
          if (onCompleteRef.current) onCompleteRef.current()
        }
      }, 400)
    }

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [isOpen, currentStep, isDone, error])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl select-none overflow-hidden persp-1200">
      <div className="vision-pro-card !rounded-[2rem] p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden elev-4 preserve-3d border-lime-400/40">
        
        {/* Top Scan Graphic */}
        <div className="w-16 h-16 rounded-2xl bg-lime-400/15 text-lime-400 border border-lime-400/30 flex items-center justify-center mx-auto relative shadow-[0_0_25px_rgba(132,204,22,0.4)]">
          <Shield size={32} />
          <Sparkles size={16} className="absolute -top-1 -right-1 text-lime-300" />
        </div>

        <div>
          <h3 className="font-poppins font-bold text-xl vision-pro-text-glow mb-1" style={{ color: 'var(--text-primary)' }}>
            Analyzing Your Bill...
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Applying TaxShield AI extraction & consumer rules engine
          </p>
        </div>

        {/* Step checklist */}
        <div className="space-y-3 text-left vision-pro-pill p-4 text-xs border-lime-400/20">
          {SCAN_STEPS.map((step, idx) => {
            const isDone = idx < currentStep
            const isCurrent = idx === currentStep

            return (
              <div key={idx} className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 size={16} className="text-lime-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-500/30 shrink-0" />
                )}
                <span className={`font-medium ${
                  isDone ? 'text-emerald-300 font-semibold' : isCurrent ? 'text-lime-400 font-bold' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full vision-pro-pill h-2.5 overflow-hidden p-0">
          <div 
            className="bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-emerald)] h-full transition-all duration-300 shadow-[0_0_15px_rgba(132,204,22,0.5)]"
            style={{ width: `${((currentStep + 1) / SCAN_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
