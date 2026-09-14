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
    <div className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-[#030712] text-white font-sans select-none flex flex-col justify-between p-4 sm:p-6 md:p-8">
      
      {/* Full-Screen Ambient Video Glow Layer (fills entire mobile & desktop viewport with motion lighting) */}
      <video
        src="/loading.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-125 pointer-events-none z-0"
      />

      {/* Atmospheric Spatial Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/80 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,7,18,0.85)_100%)] pointer-events-none z-0" />

      {/* Top Floating HUD Bar */}
      <div className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-xl shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <Bot size={14} className="text-amber-400 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-none">TaxShield AI Live</span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] text-slate-300 backdrop-blur-md">
            <ShieldCheck size={13} className="text-emerald-400" /> Authenticated
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 hover:border-amber-400/50 text-slate-200 hover:text-amber-300 text-xs font-medium backdrop-blur-xl transition-all active:scale-95 cursor-pointer shadow-lg"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-amber-400" />}
            <span className="hidden sm:inline text-[11px]">{isMuted ? 'Muted' : 'Sound On'}</span>
          </button>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 to-amber-600/30 hover:from-amber-500/50 hover:to-amber-600/50 border border-amber-400/60 text-amber-200 hover:text-white text-xs font-semibold backdrop-blur-xl transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.35)]"
          >
            <span>Skip</span>
            <span className="hidden sm:inline">to Dashboard</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Centerpiece: Properly Framed Video Animation (No Over-Zoom on Mobile!) */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto my-auto flex flex-col items-center justify-center px-1 sm:px-4">
        <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.35)] sm:shadow-[0_0_70px_rgba(212,175,55,0.4)] border border-amber-400/40 bg-black/85 backdrop-blur-2xl group">
          
          {/* Crisp, Un-Cropped Video Animation */}
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
            className="w-full h-full object-contain sm:object-cover relative z-10"
          />

          {/* Inner Gloss Ring */}
          <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15 pointer-events-none z-20" />
        </div>
      </div>

      {/* Bottom Floating HUD & Progress Bar */}
      <div className="relative z-20 w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto flex flex-col items-center text-center space-y-2.5 pb-2 sm:pb-4">
        
        {/* Welcome Text Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/70 border border-white/15 text-slate-200 text-xs sm:text-sm font-medium backdrop-blur-xl shadow-lg">
          <Sparkles size={13} className="text-amber-400 animate-spin" />
          <span>Welcome, <strong className="text-amber-300 font-bold">{displayNameToUse}</strong></span>
        </div>

        {/* High-Tech Glowing Progress Bar */}
        <div className="w-full space-y-1.5 px-2">
          <div className="h-2 sm:h-2.5 w-full bg-black/70 rounded-full overflow-hidden p-0.5 border border-white/20 backdrop-blur-xl shadow-[0_0_20px_rgba(212,175,55,0.25)] relative">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 rounded-full transition-all duration-150 shadow-[0_0_15px_rgba(212,175,55,0.9)]"
              style={{ width: `${Math.max(progress, 3)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-slate-300 px-1">
            <span className="flex items-center gap-1.5 uppercase font-medium truncate max-w-[240px] sm:max-w-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" /> Launching TaxShield Intelligence Portal...
            </span>
            <span className="text-amber-300 font-bold">{progress}%</span>
          </div>
        </div>
      </div>

    </div>
  )
}
