import React from 'react'

/**
 * Premium Video-based Loading Animation Component
 * Renders the custom TaxShield loading MP4 with ambient glow and rounded aesthetics.
 */
export default function LoadingAnimation({ size = 'md', className = '', label = '' }) {
  const sizeStyles = {
    sm: 'w-16 h-16 rounded-xl',
    md: 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl',
    lg: 'w-36 h-36 sm:w-44 sm:h-44 rounded-3xl',
    fullscreen: 'w-40 h-40 sm:w-52 sm:h-52 rounded-3xl'
  }

  const containerStyle = sizeStyles[size] || sizeStyles.md

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 select-none ${className}`}>
      <div className={`relative overflow-hidden shadow-[0_0_35px_rgba(212,175,55,0.35)] dark:shadow-[0_0_45px_rgba(212,175,55,0.45)] border border-sky-400/30 dark:border-[#D4AF37]/40 bg-black/60 backdrop-blur-xl flex items-center justify-center ${containerStyle}`}>
        {/* Ambient background pulsing aura */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-transparent to-amber-500/20 animate-pulse pointer-events-none" />

        <video
          src="/loading.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover relative z-10"
        />

        {/* Outer specular glow border ring */}
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20 pointer-events-none z-20" />
      </div>

      {label && (
        <p className="text-xs sm:text-sm font-poppins font-semibold text-slate-700 dark:text-slate-300 animate-pulse text-center">
          {label}
        </p>
      )}
    </div>
  )
}
