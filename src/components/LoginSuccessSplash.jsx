import { useEffect, useState, useRef } from 'react'
import { Volume2, VolumeX, ArrowRight, Sparkles, Bot, ShieldCheck, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * LoginSuccessSplash Component
 * Features the complete, untrimmed TaxShield loading video with synchronous progress telemetry.
 * 
 * - Zero lag & zero freeze: Dual-telemetry ticker ensures progress bar moves smoothly
 *   from 0% to 100% even if the video buffers, stalls, or drops frames.
 * - Fault tolerant: Cybernetic HUD active immediately so user never sees a black box.
 * - Graceful completion: Automatically transitions to Dashboard upon 100% or video completion.
 */
export default function LoginSuccessSplash({ userName = '', onComplete }) {
  const videoRef = useRef(null)
  const finishedRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const [videoError, setVideoError] = useState(false)
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
    if (finishedRef.current) return
    finishedRef.current = true
    setProgress(100)
    if (onComplete) {
      setTimeout(() => {
        onComplete()
      }, 200)
    }
  }

  useEffect(() => {
    // Lock body scrolling during splash video animation
    document.body.style.overflow = 'hidden'

    // Configure video for optimal, lag-free playback
    const video = videoRef.current
    if (video) {
      video.playbackRate = 1.0
      video.preload = 'auto'
      video.playsInline = true
      video.muted = true

      const handleReady = () => setVideoReady(true)
      const handleError = () => {
        setVideoError(true)
        setVideoReady(false)
      }

      video.addEventListener('canplay', handleReady)
      video.addEventListener('playing', handleReady)
      video.addEventListener('error', handleError)

      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setVideoReady(true))
          .catch(() => {
            if (video) {
              video.muted = true
              setIsMuted(true)
              video.play()
                .then(() => setVideoReady(true))
                .catch(() => setVideoError(true))
            }
          })
      }
    }

    // Steady telemetry ticker: guarantees progress smoothly advances over ~4.2 seconds
    // even on slow cellular networks or if video hardware decoder is warming up
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          return prev
        }
        const step = prev < 50 ? 3 : 2
        return Math.min(98, prev + step)
      })
    }, 90)

    // Safety fallback timer: guarantees user reaches dashboard within 5.5 seconds max
    const safetyTimer = setTimeout(() => {
      handleFinish()
    }, 5500)

    return () => {
      clearInterval(interval)
      clearTimeout(safetyTimer)
      document.body.style.overflow = ''
    }
  }, [])

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (video && video.duration && !isNaN(video.duration) && isFinite(video.duration) && video.duration > 0) {
      const current = video.currentTime || 0
      const duration = video.duration
      const pct = Math.max(0, Math.min(100, Math.round((current / duration) * 100)))
      if (!isNaN(pct)) {
        setProgress((prev) => Math.max(prev, pct))
      }

      // Finish cleanly near the end of video
      if (current >= duration - 0.25 || pct >= 99) {
        handleFinish()
      }
    }
  }

  const handleVideoEnded = () => {
    handleFinish()
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted
      videoRef.current.muted = nextMuted
      setIsMuted(nextMuted)
    }
  }

  const getStageLabel = (pct) => {
    const safePct = isNaN(pct) ? 0 : pct
    if (safePct < 25) return 'Authenticating user session & security keys...'
    if (safePct < 55) return 'Initializing TaxShield AI Engine & GST safeguards...'
    if (safePct < 80) return 'Syncing bill receipts & deduction metrics...'
    if (safePct < 98) return 'Building spatial intelligence terminal...'
    return 'Complete! Launching TaxShield Portal...'
  }

  const displayProgress = isNaN(progress) ? 0 : Math.min(100, Math.max(0, progress))

  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden bg-[#030712] text-white font-sans select-none flex flex-col justify-between">
      
      {/* 1. Subtle Ambient Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[650px] h-[400px] sm:h-[650px] rounded-full bg-sky-500/10 blur-[140px] z-0" />

      {/* 2. Top Navigation & Status HUD */}
      <div className="relative z-20 w-full max-w-5xl mx-auto flex items-center justify-between p-4 sm:p-6 pt-5 sm:pt-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <Bot size={15} className="text-amber-400 shrink-0" />
            <span className="font-poppins">TaxShield AI Live</span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
            <ShieldCheck size={13} className="text-emerald-400" /> Authenticated
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/20 hover:border-amber-400/50 text-slate-200 hover:text-amber-300 text-xs font-medium backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-amber-400" />}
            <span className="hidden sm:inline text-[11px]">{isMuted ? 'Muted' : 'Sound On'}</span>
          </button>

          {/* Quick Skip Button */}
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 to-amber-600/25 hover:from-amber-500/40 hover:to-amber-600/40 border border-amber-400/50 text-amber-200 hover:text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <span>Skip to Dashboard</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 3. Centerpiece: Full Video Loading Animation with Instant Fallback HUD */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-2 sm:px-6 my-auto overflow-hidden">
        <div className="relative w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl max-h-[65vh] aspect-video flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950 border border-sky-500/20 shadow-2xl [transform:translateZ(0)]">
          
          {/* Cybernetic HUD Loading Placeholder (active while video buffers) */}
          {(!videoReady || videoError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none p-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-amber-500/10 to-emerald-500/10 animate-pulse" />
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-[#D4AF37]/50 animate-spin" style={{ animationDuration: '6s' }} />
                <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-sky-400/50 animate-ping" style={{ animationDuration: '2.5s' }} />
                <div className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#FDE68A] flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(212,175,55,0.7)]">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse text-slate-950" />
                </div>
              </div>
              <div className="mt-4 text-xs font-mono font-medium text-slate-400 tracking-wider">
                SYNCHRONIZING TAX ENGINE...
              </div>
            </div>
          )}

          {!videoError && (
            <video
              ref={videoRef}
              src="/loading.mp4"
              autoPlay
              loop={false}
              muted={isMuted}
              playsInline
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              className={`w-full h-full object-contain [transform:translateZ(0)] pointer-events-none transition-opacity duration-300 relative z-10 ${
                videoReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10 pointer-events-none z-20" />
        </div>
      </div>

      {/* 4. Bottom Executive Progress Terminal */}
      <div className="relative z-20 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8 space-y-3">
        
        {/* Welcome Banner Card */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 truncate">
            <Sparkles size={15} className="text-amber-400 animate-spin shrink-0" />
            <span className="text-xs text-slate-200 font-medium truncate">
              Welcome, <strong className="text-amber-300 font-bold">{displayNameToUse}</strong>
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 shrink-0 ml-2">{displayProgress}%</span>
        </div>

        {/* Real-time Video Sync Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="h-2.5 w-full bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-amber-400/30 backdrop-blur-md relative">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-[#D4AF37] rounded-full transition-all duration-150 shadow-[0_0_15px_rgba(212,175,55,0.6)]"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 px-1">
            <span className="truncate pr-2 text-slate-300">
              {getStageLabel(displayProgress)}
            </span>
            <span className="text-amber-400 font-bold shrink-0">
              {displayProgress}%
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
