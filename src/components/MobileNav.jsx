import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wallet, History, User, Camera } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function MobileNav() {
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'

  const handleScanTap = () => {
    if (path === '/dashboard') {
      const el = document.getElementById('scanner-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      navigate('/dashboard')
      setTimeout(() => {
        const el = document.getElementById('scanner-section')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 350)
    }
  }

  const navItems = [
    { label: 'Terminal', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Spending', icon: Wallet, to: '/spending' },
    { label: 'Scan', icon: Camera, isScanBtn: true, onTap: handleScanTap },
    { label: 'History', icon: History, to: '/history' },
    { label: 'Profile', icon: User, to: '/settings' },
  ]

  // Don't display mobile nav on splash, login, or register
  if (path === '/splash' || path === '/login' || path === '/register') return null

  return (
    <nav
      aria-label="Sticky Top Mobile Navigation"
      className="md:hidden w-full border-t transition-all duration-300 px-2 py-1 select-none shadow-sm"
      style={{
        backgroundColor: isDark ? 'rgba(7, 10, 18, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(2, 132, 199, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between gap-1 max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = item.to && (path === item.to || (item.to === '/dashboard' && path === '/'))

          if (item.isScanBtn) {
            return (
              <button
                key={index}
                type="button"
                onClick={item.onTap}
                aria-label="Scan Bill Receipt"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-poppins transition-all active:scale-95 touch-manipulation cursor-pointer shrink-0 shadow-md min-h-[38px]"
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, #B45309 0%, #D4AF37 50%, #FDE68A 100%)'
                    : 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                  color: isDark ? '#050811' : '#FFFFFF',
                }}
              >
                <Icon size={15} className="stroke-[2.5]" />
                <span className="text-[11px] tracking-tight font-extrabold whitespace-nowrap">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation min-h-[38px] ${
                isActive
                  ? isDark
                    ? 'bg-white/10 text-[#FDE68A] font-bold border border-[#D4AF37]/35 shadow-sm'
                    : 'bg-sky-50 text-sky-700 font-bold border border-sky-300 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon
                size={16}
                className={`transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`}
              />
              <span
                className={`text-[10px] font-poppins tracking-tight leading-tight mt-0.5 whitespace-nowrap truncate max-w-[62px] text-center ${
                  isActive
                    ? isDark ? 'text-[#FDE68A] font-bold' : 'text-sky-700 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
