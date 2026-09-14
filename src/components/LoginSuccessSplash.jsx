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

    // Fallback timer: in case video ends or browser prevents playback, advance after 10.5s
    const fallbackTimer = setTimeout(() => {
      handleFinish()
    }, 10500)

    return () => {
      clearTimeout(fallbackTimer)
      document.body.style.overflow = ''
    }
  }, [])

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = Math.min(100, Math.round((videoRef.current.currentTime / videoRef.current.duration) * 100))
      setProgress(pct)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted
      videoRef.current.muted = nextMuted
      setIsMuted(nextMuted)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-black text-white font-sans select-none">
      
      {/* 100% Full-Screen Video Background */}
      <video
        ref={videoRef}
        src="/loading.mp4"
        autoPlay
        loop={false}
        muted={isMuted}
        playsInline
        onPlay={() => setHasStarted(true)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleFinish}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Cinematic Edge-to-Edge Gradient Vignettes */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-52 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />

      {/* Top Floating HUD Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-xl shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <Bot size={15} className="text-amber-400" />
            <span>TaxShield AI Live Assistant</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] text-slate-300 backdrop-blur-md">
            <ShieldCheck size={13} className="text-emerald-400" /> Session Authenticated
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-amber-400/50 text-slate-200 hover:text-amber-300 text-xs font-medium backdrop-blur-xl transition-all active:scale-95 cursor-pointer shadow-lg"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-amber-400" />}
            <span className="hidden xs:inline text-[11px]">{isMuted ? 'Muted' : 'Sound On'}</span>
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 to-amber-600/30 hover:from-amber-500/50 hover:to-amber-600/50 border border-amber-400/60 text-amber-200 hover:text-white text-xs font-semibold backdrop-blur-xl transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.35)]"
          >
            <span>Skip to Dashboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Floating HUD & Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col items-center text-center space-y-3">
        
        {/* Welcome Text Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/15 text-slate-200 text-xs sm:text-sm font-medium backdrop-blur-xl shadow-lg">
          <Sparkles size={14} className="text-amber-400 animate-spin" />
          <span>Welcome, <strong className="text-amber-300 font-bold">{displayNameToUse}</strong></span>
        </div>

        {/* High-Tech Glowing Progress Bar */}
        <div className="w-full space-y-2">
          <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/20 backdrop-blur-xl shadow-[0_0_25px_rgba(212,175,55,0.3)] relative">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 rounded-full transition-all duration-150 shadow-[0_0_20px_rgba(212,175,55,0.9)]"
              style={{ width: `${Math.max(progress, 3)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] sm:text-xs font-mono text-slate-300 px-1">
            <span className="flex items-center gap-1.5 uppercase font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Launching TaxShield Intelligence Portal...
            </span>
            <span className="text-amber-300 font-bold">{progress}%</span>
          </div>
        </div>
      </div>

    </div>
  )
}
