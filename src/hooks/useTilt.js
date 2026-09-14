import { useRef, useCallback } from 'react'

export function usePrefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useTilt(maxDeg = 7) {
  const ref = useRef(null)
  const raf = useRef(0)
  const reduced = usePrefersReducedMotion()

  const onMove = useCallback((e) => {
    const el = ref.current
    if (!el || reduced) return
    if (e.pointerType === 'touch') return
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `rotateX(${(-py * maxDeg).toFixed(2)}deg) rotateY(${(px * maxDeg).toFixed(2)}deg) translateZ(8px)`
      el.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`)
    })
  }, [maxDeg, reduced])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.style.transform = ''
  }, [])

  return { ref, onMove, onLeave }
}
