import React, { useRef, useEffect, useState } from 'react'
import { Shield } from 'lucide-react'

/**
 * Premium Complete Video Loading Animation Component
 * Renders the full, untrimmed TaxShield loading MP4 with instant cybernetic fallback,
 * ensuring the UI never displays an empty or stalled black rectangle.
 * 
 * - Instant feedback: active glowing cybernetic loader while video buffers or decodes.
 * - Hardware-accelerated smooth playback: video fades in once canplay triggers.
 * - Fault tolerant: falls back gracefully to CSS animation if video fails or is blocked.
 */
export default function LoadingAnimation({
  size = 'md',
  className = '',
  label = '',
  loop = true,
  onComplete = null,
}) {
  const videoRef = useRef(null)
  const [videoReady, setVideoReady] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = 1.0

    const handleCanPlay = () => {
      setVideoReady(true)
    }

    const handleError = () => {
      setVideoError(true)
      setVideoReady(false)
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('playing', handleCanPlay)
    video.addEventListener('error', handleError)

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setVideoReady(true))
        .catch(() => {
          if (video) {
            video.muted = true
            video.play()
              .then(() => setVideoReady(true))
              .catch(() => setVideoError(true))
          }
        })
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('playing', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [])

  const sizeClasses = {
    sm: 'w-40 sm:w-48 aspect-video',
    md: 'w-64 sm:w-80 md:w-96 aspect-video',
    lg: 'w-80 sm:w-[28rem] md:w-[34rem] aspect-video',
    fullscreen: 'w-full max-w-2xl sm:max-w-3xl md:max-w-4xl max-h-[75vh] aspect-video px-2 sm:px-6',
  }

  const containerClass = sizeClasses[size] || sizeClasses.md

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 select-none ${className}`}>
      {/* Complete Video Frame with Seamless Fallback HUD */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-slate-950 border border-sky-500/20 dark:border-[#D4AF37]/30 shadow-2xl flex items-center justify-center [transform:translateZ(0)] ${containerClass}`}
      >
        {/* Cybernetic HUD Loading Placeholder (Always active until video is fully playing) */}
        {(!videoReady || videoError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none p-4">
            {/* Ambient pulsing background gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-amber-500/10 to-emerald-500/10 animate-pulse" />

            {/* Rotating Tech Scanner Rings */}
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-[#D4AF37]/40 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-sky-400/50 animate-ping" style={{ animationDuration: '2.5s' }} />
              <div className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#FDE68A] flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.6)]">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-slate-950" />
              </div>
            </div>

            {/* Subtle scanning HUD line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-bounce opacity-50" style={{ animationDuration: '2s' }} />
          </div>
        )}

        {/* The Native MP4 Loading Video */}
        {!videoError && (
          <video
            ref={videoRef}
            src="/loading.mp4"
            autoPlay
            loop={loop}
            muted
            playsInline
            preload="auto"
            onEnded={() => {
              if (onComplete) onComplete()
            }}
            className={`w-full h-full object-contain [transform:translateZ(0)] pointer-events-none transition-opacity duration-300 relative z-10 ${
              videoReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Crisp subtle outer border ring */}
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10 pointer-events-none z-20" />
      </div>

      {label && (
        <div className="flex items-center gap-2 text-xs sm:text-sm font-poppins font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping shrink-0" />
          <span className="truncate">{label}</span>
        </div>
      )}
    </div>
  )
}
