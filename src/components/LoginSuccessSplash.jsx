import { useEffect, useState } from 'react'
import { Shield, Sparkles, CheckCircle2, Lock, Cpu, Database, LayoutDashboard, Hand } from 'lucide-react'
import MaskedHeading from './MaskedHeading'
import { useAuth } from '../context/AuthContext'

const STAGES = [
  { threshold: 0, label: 'Authenticating user session & security keys...', icon: Lock, color: 'text-amber-400' },
  { threshold: 25, label: 'Initializing TaxShield AI Engine & GST safeguards...', icon: Cpu, color: 'text-emerald-400' },
  { threshold: 55, label: 'Syncing bill receipts & deduction metrics...', icon: Database, color: 'text-cyan-400' },
  { threshold: 82, label: 'Building spatial executive dashboard...', icon: LayoutDashboard, color: 'text-indigo-400' },
  { threshold: 100, label: 'Welcome! Launching TaxShield AI Portal...', icon: CheckCircle2, color: 'text-emerald-400' },
]

export default function LoginSuccessSplash({ userName = '', onComplete }) {
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState(STAGES[0])
  const { currentUser } = useAuth()

  const getResolvedName = () => {
    const storedName = typeof localStorage !== 'undefined' ? localStorage.getItem('taxshield_user_name') : null
    if (storedName && storedName.trim()) return storedName.trim()
    if (userName && userName !== 'Valued User' && userName !== 'Executive User') return userName
    if (currentUser?.displayName && currentUser.displayName.trim()) return currentUser.displayName.trim()
    if (currentUser?.email) return currentUser.email.split('@')[0]
    return 'User'
  }

  const displayNameToUse = getResolvedName()

  useEffect(() => {
    // Lock body scrolling completely so full page stays locked and stationary
    document.body.style.overflow = 'hidden'

    // 5.2s smooth full-page loading launch sequence
    const startTime = Date.now()
    const duration = 5200

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)

      // Find active stage
      for (let i = STAGES.length - 1; i >= 0; i--) {
        if (pct >= STAGES[i].threshold) {
          setCurrentStage(STAGES[i])
          break
        }
      }

      if (pct >= 100) {
        clearInterval(interval)
        if (onComplete) {
          setTimeout(onComplete, 400)
        }
      }
    }, 20)

    return () => {
      clearInterval(interval)
      document.body.style.overflow = ''
    }
  }, [onComplete])

  const StageIcon = currentStage.icon

  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-8 text-white font-sans select-none overflow-hidden">
      
      {/* Background ambient glowing spatial light orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full bg-amber-500/20 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full bg-emerald-500/20 blur-[160px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[140px]" />

      {/* Main Full-Page Container */}
      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center space-y-7">
        
        {/* Top: Glowing TaxShield Logo Badge */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-emerald-400 to-indigo-500 p-0.5 shadow-[0_0_60px_rgba(212,175,55,0.5)]">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
              <Shield size={48} strokeWidth={2.2} className="fill-amber-400/20" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg border-2 border-slate-950">
            <CheckCircle2 size={18} />
          </span>
        </div>

        {/* Center: MaskedHeading with GSAP Wipe Reveal */}
        <div className="w-full py-1">
          <MaskedHeading
            text="WELCOME TO TAXSHIELD"
            tag="h1"
            reveal="wipe"
            trigger="mount"
            duration={2.6}
            fillScale={1.15}
            parallax={0}
            drift={0}
            align="center"
            weight={800}
            className="font-poppins uppercase tracking-wider"
          />
        </div>

        {/* Welcome Greeting Symbol "Hi" & User Banner */}
        <div className="space-y-2.5 max-w-md mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="animate-spin text-amber-400" /> Executive Portal Authenticated
          </div>

          <h2 className="text-2xl sm:text-3xl font-poppins font-bold text-slate-100 flex items-center justify-center gap-2">
            Hi, <span className="text-amber-300 font-extrabold">{displayNameToUse}</span> <Hand size={24} className="text-amber-400 animate-bounce inline-block" />
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Initializing your spatial tax intelligence workspace and deduction safeguards...
          </p>
        </div>

        {/* Step Indicator & Progress Bar */}
        <div className="w-full max-w-md space-y-3 pt-3">
          
          {/* Dynamic Stage Banner */}
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-medium backdrop-blur-md transition-all duration-300">
            <StageIcon size={16} className={`${currentStage.color}`} />
            <span className="text-slate-200">{currentStage.label}</span>
          </div>

          {/* Gold & Emerald Animated Progress Bar */}
          <div className="h-3 w-full bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-amber-400/40 shadow-[0_0_25px_rgba(212,175,55,0.25)] relative">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-500 rounded-full transition-all duration-100 shadow-[0_0_20px_rgba(212,175,55,0.8)] relative"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5 uppercase font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> LOADING PORTAL
            </span>
            <span className="text-amber-400 font-bold text-xs">{progress}%</span>
          </div>
        </div>

      </div>
    </div>
  )
}
