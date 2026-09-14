import { useTilt } from '../../hooks/useTilt'

export default function TiltCard({ children, className = '', maxDeg = 7, style }) {
  const tilt = useTilt(maxDeg)
  return (
    <div ref={tilt.ref} onPointerMove={tilt.onMove} onPointerLeave={tilt.onLeave} style={style} className={`tilt-3d glare elev-2 preserve-3d ${className}`}>
      {children}
    </div>
  )
}
