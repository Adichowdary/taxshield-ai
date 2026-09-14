import { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function ConfidenceScore({ score = 87, breakdowns = [] }) {
  const [offset, setOffset] = useState(2 * Math.PI * 40)

  // Determine color theme based on score
  const getColor = (s) => {
    if (s >= 90) return { stroke: '#84cc16', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40', text: 'High Confidence' }
    if (s >= 75) return { stroke: '#f59e0b', bg: 'bg-amber-500/15 text-amber-300 border-amber-400/40', text: 'Moderate Risk' }
    return { stroke: '#ef4444', bg: 'bg-rose-500/15 text-rose-300 border-rose-400/40', text: 'Needs Attention' }
  }

  const theme = getColor(score)
  const circumference = 2 * Math.PI * 40
  const targetOffset = circumference - (score / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(targetOffset)
    }, 100)
    return () => clearTimeout(timer)
  }, [targetOffset])

  const defaultBreakdowns = breakdowns.length > 0 ? breakdowns : [
    { label: 'Tax Calculation', verified: true },
    { label: 'Arithmetic Consistency', verified: true },
    { label: 'Required Header Fields', verified: true },
    { label: 'Unusual Charge Check', verified: score >= 90 },
    { label: 'OCR Text Confidence', verified: true }
  ]

  return (
    <div className="vision-pro-card p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-500/30">
        <h3 className="font-poppins font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <ShieldCheck size={18} className="text-lime-400" /> Bill Confidence Score
        </h3>
        <span className={`text-xs font-semibold px-3 py-0.5 rounded-full border backdrop-blur-md ${theme.bg}`}>
          {theme.text}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Circular Progress Gauge */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center pop-3d tz-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={theme.stroke}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center font-poppins">
            <span className="text-2xl font-bold vision-pro-text-emerald">{score}</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Score</span>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="flex-1 space-y-2 w-full">
          {defaultBreakdowns.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-500/20 last:border-0">
              <span className="font-sans" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
              {item.verified ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 size={13} /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                  <AlertTriangle size={13} /> Review
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
