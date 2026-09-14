import { CheckCircle2, AlertTriangle, AlertCircle, Info, HelpCircle } from 'lucide-react'

export default function StatusBadge({ status, text, size = 'md' }) {
  const configs = {
    VERIFIED: {
      bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/40 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      icon: CheckCircle2,
      label: 'Verified & Accurate',
    },
    REVIEW_RECOMMENDED: {
      bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/40 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      icon: AlertTriangle,
      label: 'Review Recommended',
    },
    POTENTIAL_OVERCHARGE: {
      bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-400/40 backdrop-blur-md shadow-[0_0_12px_rgba(244,63,94,0.2)]',
      icon: AlertCircle,
      label: 'Potential Overcharge',
    },
    INFO: {
      bg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-400/40 backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.2)]',
      icon: Info,
      label: 'Information',
    },
    INCOMPLETE: {
      bg: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-400/30 backdrop-blur-md',
      icon: HelpCircle,
      label: 'Analysis Incomplete',
    }
  }

  const current = configs[status] || configs.INCOMPLETE
  const Icon = current.icon

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs font-medium gap-1.5',
    lg: 'px-4 py-1.5 text-sm font-semibold gap-2',
  }

  return (
    <span className={`inline-flex items-center border rounded-full font-medium pop-3d ${current.bg} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-[18px] h-[18px]' : 'w-4 h-4'} />
      {text || current.label}
    </span>
  )
}
