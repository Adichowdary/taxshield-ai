import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Camera, QrCode, Wallet, History, ShieldAlert, Sparkles, 
  FileText, ArrowUpRight, CheckCircle2, TrendingUp, User, 
  Percent, FileSpreadsheet, AlertCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function MobileHomeQuickHub({ bills = [], onTriggerScan }) {
  const { currentUser } = useAuth()
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'
  const navigate = useNavigate()

  // Calculate quick stats
  const totalBills = bills.length
  const totalSpend = bills.reduce((sum, b) => sum + Number(b.totalAmount || b.total || 0), 0)
  const illegalFees = bills.reduce((sum, b) => sum + Number(b.serviceCharge || 0), 0)
  const verifiedCount = bills.filter(b => b.status === 'VERIFIED' || b.consumerScore >= 90).length

  // Instagram-style circular story highlights / feature badges
  const stories = [
    {
      id: 'scan',
      label: 'Scan & Audit',
      badge: 'LIVE',
      icon: Camera,
      gradient: 'from-amber-500 via-rose-500 to-purple-600',
      action: () => {
        if (onTriggerScan) {
          onTriggerScan()
        } else {
          const el = document.getElementById('scanner-section')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    },
    {
      id: 'spending',
      label: 'Spending',
      badge: '₹ Analytics',
      icon: Wallet,
      gradient: 'from-sky-400 via-blue-500 to-indigo-600',
      action: () => navigate('/spending')
    },
    {
      id: 'history',
      label: 'Receipts',
      badge: `${totalBills}`,
      icon: History,
      gradient: 'from-emerald-400 to-teal-600',
      action: () => navigate('/history')
    },
    {
      id: 'complaints',
      label: 'Legal Notice',
      badge: 'CCPA',
      icon: FileText,
      gradient: 'from-rose-500 to-amber-600',
      action: () => navigate('/complaint')
    },
    {
      id: 'simulator',
      label: 'Simulator',
      badge: 'HSN',
      icon: Percent,
      gradient: 'from-violet-500 to-fuchsia-600',
      action: () => {
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById('bill-simulator')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      }
    },
  ]

  // PhonePe-style Quick Actions 4-Grid
  const phonePeActions = [
    {
      title: 'Scan Receipt',
      sub: 'OCR & CCPA',
      icon: Camera,
      badge: 'Fast',
      color: 'text-amber-600 dark:text-[#FDE68A] bg-amber-500/10 border-amber-500/30',
      onTap: () => {
        if (onTriggerScan) {
          onTriggerScan()
        } else {
          const el = document.getElementById('scanner-section')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    },
    {
      title: 'View Spending',
      sub: '6 Categories',
      icon: Wallet,
      badge: `₹${Math.round(totalSpend)}`,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/30',
      onTap: () => navigate('/spending')
    },
    {
      title: 'Audit Vault',
      sub: 'All Receipts',
      icon: History,
      badge: `${totalBills} bills`,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      onTap: () => navigate('/history')
    },
    {
      title: 'CCPA Notice',
      sub: 'Demand Refund',
      icon: ShieldAlert,
      badge: illegalFees > 0 ? `₹${illegalFees.toFixed(0)}` : 'Safe',
      color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30',
      onTap: () => navigate('/complaint')
    }
  ]

  return (
    <section className="md:hidden space-y-4 mb-2 animate-fade-in">
      
      {/* 1. PhonePe / UPI Style Quick Balance & Scan Header Banner */}
      <div className={`p-4 rounded-3xl border shadow-xl relative overflow-hidden transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-[#0B1120] via-[#050811] to-[#111827] border-[#D4AF37]/30 shadow-[0_10px_35px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-br from-white via-sky-50/70 to-white border-sky-200/80 shadow-[0_10px_30px_rgba(2,132,199,0.12)]'
      }`}>
        {/* Specular ambient top glow */}
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
          isDark ? 'from-transparent via-[#D4AF37] to-transparent' : 'from-transparent via-sky-500 to-transparent'
        }`} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-md">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-white text-sm uppercase">
                  {currentUser?.displayName ? currentUser.displayName.substring(0, 2) : 'TS'}
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-poppins font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {currentUser?.displayName || 'TaxShield Member'}
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-sky-500/10 dark:bg-[#D4AF37]/15 text-sky-700 dark:text-[#FDE68A] text-[9px] font-mono font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                {verifiedCount} of {totalBills} Invoices Compliant
              </p>
            </div>
          </div>

          {/* Quick Scan QR / Camera Button (PhonePe Style) */}
          <button
            onClick={() => {
              if (onTriggerScan) {
                onTriggerScan()
              } else {
                const el = document.getElementById('scanner-section')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[#D4AF37] dark:to-[#FDE68A] text-white dark:text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 dark:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all touch-manipulation cursor-pointer"
          >
            <QrCode size={18} className="stroke-[2.5]" />
            <span>Scan Bill</span>
          </button>
        </div>

        {/* Quick Micro-Ticker */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-500 dark:text-slate-400">Total Billed:</span>
          <span className="font-bold text-slate-900 dark:text-white text-xs">
            ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400">Recoverable SC:</span>
          <span className={`font-bold text-xs ${illegalFees > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            ₹{illegalFees.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 2. Instagram-Style Story Avatars for 1-Tap Navigation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sparkles size={12} className="text-sky-500 dark:text-[#D4AF37]" /> Quick Access Hub
          </span>
          <Link to="/history" className="text-[11px] text-sky-600 dark:text-[#FDE68A] font-semibold hover:underline">
            View All →
          </Link>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none px-1">
          {stories.map((story) => {
            const Icon = story.icon
            return (
              <button
                key={story.id}
                onClick={story.action}
                className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-transform touch-manipulation cursor-pointer focus:outline-none"
              >
                {/* Gradient ring */}
                <div className={`p-[2.5px] rounded-full bg-gradient-to-tr ${story.gradient} shadow-md group-hover:shadow-lg transition-shadow`}>
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-[#070A12] border-2 border-white dark:border-slate-950 flex items-center justify-center relative overflow-hidden">
                    <Icon size={22} className="text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform stroke-[2]" />
                    {story.badge && (
                      <span className="absolute -bottom-0.5 inset-x-0 text-[8px] font-mono font-extrabold bg-slate-900/90 text-white dark:bg-[#D4AF37] dark:text-slate-950 py-0.5 text-center truncate">
                        {story.badge}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-poppins font-medium text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-[#FDE68A] transition-colors">
                  {story.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. PhonePe-Style 4-Card Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {phonePeActions.map((action, i) => {
          const Icon = action.icon
          return (
            <button
              key={i}
              onClick={action.onTap}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all active:scale-95 touch-manipulation cursor-pointer ${
                isDark
                  ? 'bg-[#0D1322]/85 hover:bg-[#131A2E] border-white/10 shadow-lg'
                  : 'bg-white/90 hover:bg-slate-50 border-slate-200/80 shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${action.color}`}>
                <Icon size={19} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-poppins font-bold text-xs text-slate-900 dark:text-white truncate">
                    {action.title}
                  </h4>
                  <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0">
                    {action.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {action.sub}
                </p>
              </div>
            </button>
          )
        })}
      </div>

    </section>
  )
}
