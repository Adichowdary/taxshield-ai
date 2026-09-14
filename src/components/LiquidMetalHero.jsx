import { Suspense, lazy, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { cn } from '../lib/utils'
import Button from './shared/Button'
import { useTheme } from '../context/ThemeContext'

const LiquidMetal = lazy(() => import('@paper-design/shaders-react').then(m => ({ default: m.LiquidMetal })))

/* 
  Senior Designer: Enhanced fade-up variants with calibrated delays & cubic-out easing.
  Accessibility: reduced-motion gate at the useEffect level (no animation mount).
*/
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.85,
      ease: [0.25, 0.46, 0.45, 0.94], // cubic-out for natural feel
    },
  }),
}

/* 
  Senior Designer: Theme-tuned liquid metal parameters.
  - Night: less dense repetition, softer contour for warmth
  - Dark: moderate repetition, medium contour
  - Light: slightly higher repetition for subtle gleam
*/
function metalColors(themeMode, activeTheme) {
  if (themeMode === 'night') {
    return { 
      tint: '#E8C974', back: '#020305',
      repetition: 2, softness: 0.7, distortion: 0.2,
      contour: 0.35, shiftRed: 0.1, shiftBlue: -0.1, angle: 120,
    }
  }
  if (activeTheme === 'dark') {
    return { 
      tint: '#EAB308', back: '#07090E',
      repetition: 3, softness: 0.55, distortion: 0.3,
      contour: 0.45, shiftRed: 0.15, shiftBlue: -0.15, angle: 135,
    }
  }
  return { 
    tint: '#0284C7', back: '#E8F4FD',
    repetition: 4, softness: 0.5, distortion: 0.35,
    contour: 0.5, shiftRed: -0.1, shiftBlue: 0.25, angle: 150,
  }
}

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export default function LiquidMetalHero({
  badge, title, subtitle,
  primaryCtaLabel, secondaryCtaLabel,
  onPrimaryCtaClick, onSecondaryCtaClick,
  features = [], className,
}) {
  const { themeMode, activeTheme } = useTheme()
  const [canAnimate, setCanAnimate] = useState(false)
  const [shaderReady, setShaderReady] = useState(false)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShaderReady(true)
      return
    }
    setCanAnimate(true)
    // Give the lazy-loaded shader component time to hydrate before mounting
    const t = setTimeout(() => setShaderReady(true), 120)
    return () => clearTimeout(t)
  }, [])

  const colors = metalColors(themeMode, activeTheme)
  const shaderScale = isMobile ? 0.85 : 1

  return (
    <section
      className={cn(
        'relative min-h-[92vh] flex items-center overflow-hidden',
        className
      )}
    >
      {/* ========================
          WebGL Liquid Metal Background
          ======================== */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          {shaderReady && (
            <LiquidMetal
              shape="metaballs"
              colorTint={colors.tint}
              colorBack={colors.back}
              speed={0.75}
              repetition={colors.repetition}
              softness={colors.softness}
              distortion={colors.distortion}
              contour={colors.contour}
              shiftRed={colors.shiftRed}
              shiftBlue={colors.shiftBlue}
              angle={colors.angle}
              scale={shaderScale}
              fit="cover"
              className="h-full w-full"
              aria-hidden="true"
            />
          )}
        </Suspense>

        {/* Paper-grain texture overlay */}
        <div className="absolute inset-0 pointer-events-none paper-grain" />

        {/* Multi-layer vignette for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(212,175,55,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(138,109,27,0.05)_0%,_transparent_50%),_radial-gradient(ellipse_at_70%_80%,_rgba(13,148,136,0.04)_0%,_transparent_50%)]" />

        {/* Bottom fade to page background */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--background, #050811))' }}
        />
      </div>

      {/* ========================
          Content Layer — max-w-3xl for comfortable reading width
          ======================== */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 md:py-36">
        <div className="max-w-3xl mx-auto text-center">

          {/* Animated badge */}
          {badge && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={canAnimate ? 'visible' : 'hidden'}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md mb-8"
              style={{
                background: 'color-mix(in srgb, var(--bg-card, rgba(13,19,34,0.85)) 60%, transparent)',
                borderColor: 'var(--border-gold, rgba(212,175,55,0.45))',
                boxShadow: '0 0 24px rgba(212,175,55,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <Sparkles size={13} style={{ color: 'var(--accent-gold, #D4AF37)' }} />
              <span className="text-xs font-bold uppercase tracking-widest font-poppins vision-pro-text-gold">{badge}</span>
            </motion.div>
          )}

          {/* Mega display title */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate={canAnimate ? 'visible' : 'hidden'}
            custom={1}
            className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-extrabold font-poppins leading-[1.05] tracking-tight mb-6"
            style={{ color: 'var(--text-primary, #FFFFFF)' }}
          >
            {title}
          </motion.h1>

          {/* Glowing accent divider */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={canAnimate ? 'visible' : 'hidden'}
            custom={1.5}
            className="w-20 h-[3px] mx-auto mb-8 rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--accent-gold, #D4AF37) 0%, var(--accent-emerald, #10B981) 100%)',
              boxShadow: '0 0 20px rgba(212,175,55,0.5)',
            }}
          />

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={canAnimate ? 'visible' : 'hidden'}
              custom={2}
              className="text-lg sm:text-xl md:text-2xl font-sans leading-relaxed max-w-2xl mx-auto mb-12"
              style={{ color: 'var(--text-muted, #94A3B8)' }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={canAnimate ? 'visible' : 'hidden'}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            {primaryCtaLabel && (
              <Button
                variant="primary"
                size="lg"
                onClick={onPrimaryCtaClick}
                className="w-full sm:w-auto font-bold btn-3d elev-3 px-10 py-4 text-base shadow-[0_0_35px_rgba(212,175,55,0.45)]"
              >
                {primaryCtaLabel} <ArrowRight size={20} />
              </Button>
            )}
            {secondaryCtaLabel && (
              <Button
                variant="secondary"
                size="lg"
                onClick={onSecondaryCtaClick}
                className="w-full sm:w-auto font-semibold btn-3d px-10 py-4 text-base"
              >
                {secondaryCtaLabel}
              </Button>
            )}
          </motion.div>

          {/* Feature trust tokens */}
          {features.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={canAnimate ? 'visible' : 'hidden'}
              custom={4}
              className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold font-sans"
            >
              {features.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--text-muted, #94A3B8)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <CheckCircle2 size={14} style={{ color: 'var(--success, #10B981)' }} />
                  {f}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Subtle animated scroll cue */}
      {canAnimate && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Scroll</span>
          <div
            className="w-px h-8 rounded-full"
            style={{ background: 'linear-gradient(to bottom, var(--accent-gold, #D4AF37), transparent)' }}
          />
        </div>
      )}
    </section>
  )
}