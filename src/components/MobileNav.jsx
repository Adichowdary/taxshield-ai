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
      // Scroll to the scanner section smoothly
      const el = document.getElementById('scanner-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      navigate('/dashboard')
      // After navigation, attempt scroll after a short delay
      setTimeout(() => {
        const el = document.getElementById('scanner-section')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 400)
    }
  }

  const navItems = [
    { label: 'Terminal', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Spending', icon: Wallet, to: '/spending' },
    { label: 'Scan', icon: Camera, isFab: true, onTap: handleScanTap },
    { label: 'History', icon: History, to: '/history' },
    { label: 'Profile', icon: User, to: '/settings' },
  ]

  // Don't display bottom nav on public landing or splash screens
  if (path === '/' || path === '/splash') return null

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-auto"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
    >
      {/* Glassmorphic bottom bar */}
      <div className={`mx-3 mb-2 rounded-[28px] border shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
        isDark
          ? 'bg-[#050811]/92 border-[#D4AF37]/20 shadow-[0_-4px_40px_rgba(0,0,0,0.75)]'
          : 'bg-white/97 border-sky-200/70 shadow-[0_-4px_30px_rgba(2,132,199,0.12)]'
      }`}>
        <div className="flex items-center justify-around px-3 py-2 relative">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = item.to && (path === item.to || (item.to === '/dashboard' && path === '/'))

            // Center FAB for scanning
            if (item.isFab) {
              return (
                <button
                  key={index}
                  onClick={item.onTap}
                  aria-label="Scan Bill Receipt"
                  className="relative -top-6 flex flex-col items-center group touch-manipulation focus:outline-none"
                >
                  {/* Outer ring glow for premium effect */}
                  <div className={`absolute -inset-1 rounded-full blur-md opacity-60 group-hover:opacity-90 transition-opacity ${
                    isDark ? 'bg-gradient-to-tr from-[#D4AF37] to-[#FDE68A]' : 'bg-gradient-to-tr from-sky-500 to-sky-400'
                  }`} />
                  <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 transform group-active:scale-90 shadow-xl ${
                    isDark
                      ? 'bg-gradient-to-br from-[#B45309] via-[#D4AF37] to-[#FDE68A] text-slate-950 ring-4 ring-[#050811]'
                      : 'bg-gradient-to-br from-sky-500 via-sky-500 to-sky-400 text-white ring-4 ring-white'
                  }`}>
                    <Icon size={26} className="stroke-[2.2]" />
                  </div>
                  <span className={`text-[10px] mt-1.5 font-bold font-poppins ${
                    isDark ? 'text-[#FDE68A]' : 'text-sky-600'
                  }`}>
                    {item.label}
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex-1 flex flex-col items-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 touch-manipulation focus:outline-none min-h-[44px] justify-center"
              >
                {/* Active indicator dot on top */}
                {isActive && (
                  <span
                    className={`absolute -top-0.5 w-4 h-[3px] rounded-full ${
                      isDark
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#FDE68A] shadow-[0_0_6px_rgba(212,175,55,0.9)]'
                        : 'bg-gradient-to-r from-sky-500 to-sky-400 shadow-[0_0_6px_rgba(2,132,199,0.8)]'
                    }`}
                  />
                )}

                <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? 'text-[#FDE68A]'
                      : 'text-sky-600'
                    : isDark
                      ? 'text-slate-400 group-hover:text-slate-200'
                      : 'text-slate-500'
                }`}>
                  <Icon
                    size={22}
                    className={`transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`}
                  />
                </div>

                <span
                  className={`text-[9px] font-poppins tracking-tight transition-all duration-200 ${
                    isActive
                      ? isDark ? 'text-[#FDE68A] font-bold' : 'text-sky-600 font-bold'
                      : isDark ? 'text-slate-500 font-medium' : 'text-slate-400 font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
