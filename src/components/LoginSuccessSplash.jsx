import { useEffect, useState, useRef } from 'react'
import { Volume2, VolumeX, ArrowRight, Sparkles, Bot, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginSuccessSplash({ userName = '', onComplete }) {
  const videoRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const { currentUser } = useAuth()

  const getResolvedName = () => {
    const storedName = typeof localStorage !== 'undefined' ? localStorage.getItem('taxshield_user_name') : null
    if (storedName && storedName.trim()) return storedName.trim()
    if (userName && userName !== 'Valued User' && userName !== 'Executive User') return userName
    if (currentUser?.displayName && currentUser.displayName.trim()) return currentUser.displayName.trim()
    if (currentUser?.email) return currentUser.email.split('@')[0]
    return 'Valued Member'
  }

  const displayNameToUse = getResolvedName()

  const handleFinish = () => {
    if (onComplete) {
      onComplete()
    }
  }

  useEffect(() => {
    // Lock body scrolling during splash video animation
    document.body.style.overflow = 'hidden'

    // Attempt instant autoplay with fast buffering
    if (videoRef.current) {
      videoRef.current.preload = 'auto'
      videoRef.current.playsInline = true
      videoRef.current.muted = true
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setHasStarted(true))
          .catch((err) => {
            console.warn('Autoplay restricted by browser, forcing muted play:', err)
            if (videoRef.current) {
              videoRef.current.muted = true
              setIsMuted(true)
              videoRef.current.play().then(() => setHasStarted(true)).catch(() => {})
            }
          })
      }
    }

    // Generous fallback safety timeout ONLY if video completely fails to load or play
    const safetyTimer = setTimeout(() => {
      handleFinish()
    }, 35000)

    return () => {
      clearTimeout(safetyTimer)
      document.body.style.overflow = ''
    }
  }, [])

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime
      const duration = videoRef.current.duration
      const pct = Math.min(100, Math.round((current / duration) * 100))
      setProgress(pct)
    }
  }

  const handleVideoEnded = () => {
    // Complete video finished playing in full
    setProgress(100)
    setTimeout(() => {
      handleFinish()
    }, 450)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted
      videoRef.current.muted = nextMuted
      setIsMuted(nextMuted)
    }
  }

  // Dynamic loading stage based on real-time video progress
  const getStageLabel = (pct) => {
    if (pct < 25) return 'Authenticating user session & security keys...'
    if (pct < 55) return 'Initializing TaxShield AI Engine & GST safeguards...'
    if (pct < 80) return 'Syncing bill receipts & deduction metrics...'
    if (pct < 98) return 'Building spatial intelligence terminal...'
    return 'Complete! Launching TaxShield Portal...'
  }

  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden bg-black text-white font-sans select-none flex flex-col justify-between">
      
      {/* 1. Ambient Background Glow Behind Video */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-sky-500/15 blur-[120px] animate-pulse z-0" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] rounded-full bg-amber-500/10 blur-[100px] z-0" />

      {/* 2. Top Navigation & Status HUD */}
      <div className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-between p-4 sm:p-6 pt-5 sm:pt-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-xl shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <Bot size={15} className="text-amber-400 shrink-0" />
            <span className="font-poppins">TaxShield AI Live</span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 backdrop-blur-md">
            <ShieldCheck size={13} className="text-emerald-400" /> Authenticated
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/20 hover:border-amber-400/50 text-slate-200 hover:text-amber-300 text-xs font-medium backdrop-blur-xl transition-all active:scale-95 cursor-pointer shadow-lg"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-amber-400" />}
            <span className="hidden sm:inline text-[11px]">{isMuted ? 'Muted' : 'Sound On'}</span>
          </button>

          {/* Quick Skip Button */}
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 to-amber-600/25 hover:from-amber-500/40 hover:to-amber-600/40 border border-amber-400/50 text-amber-200 hover:text-white text-xs font-semibold backdrop-blur-xl transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            <span>Skip</span>
            <span className="hidden sm:inline">to Dashboard</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 3. Centerpiece: Full-Size Seamless Complete Video Loading Animation */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-0 sm:px-6 my-auto overflow-hidden">
        <div className="relative w-full max-w-[480px] sm:max-w-xl md:max-w-2xl aspect-video flex items-center justify-center overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)]">
          
          <video
            ref={videoRef}
            src="/loading.mp4"
            autoPlay
            loop={false}
            muted={isMuted}
            playsInline
            preload="auto"
            onPlay={() => setHasStarted(true)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            className="w-full h-full object-contain scale-[1.28] sm:scale-100 transition-transform duration-300 relative z-10 drop-shadow-[0_0_50px_rgba(56,189,248,0.45)]"
          />
        </div>
      </div>

      {/* 4. Bottom Executive Progress Terminal */}
      <div className="relative z-20 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8 space-y-3">
        
        {/* Welcome Banner Card */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/85 border border-white/15 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 truncate">
            <Sparkles size={15} className="text-amber-400 animate-spin shrink-0" />
            <span className="text-xs text-slate-200 font-medium truncate">
              Welcome back, <strong className="text-amber-300 font-bold">{displayNameToUse}</strong>
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 shrink-0 ml-2">{progress}%</span>
        </div>

        {/* High-Tech Glowing Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="h-2.5 w-full bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-amber-400/30 backdrop-blur-xl shadow-[0_0_20px_rgba(212,175,55,0.25)] relative">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 rounded-full transition-all duration-150 shadow-[0_0_15px_rgba(212,175,55,0.9)]"
              style={{ width: `${Math.max(progress, 3)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1.5 uppercase font-medium truncate max-w-[280px] sm:max-w-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
              {getStageLabel(progress)}
            </span>
            <span className="text-slate-500 font-mono text-[10px] hidden sm:inline">TaxShield AI Engine</span>
          </div>
        </div>
      </div>

    </div>
  )
}
