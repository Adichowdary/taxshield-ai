import { useState, useEffect } from 'react'

export function useCountUp(targetValue = 0, duration = 800, start = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return

    const num = Number(targetValue) || 0
    if (num === 0) {
      setCount(0)
      return
    }

    let startTime = null
    let animationFrameId = null

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(num * easeOut)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      }
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [targetValue, duration, start])

  return count
}
