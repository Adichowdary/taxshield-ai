import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Wallet, History, ShieldAlert, User, Camera } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function MobileNav() {
  const location = useLocation()
  const path = location.pathname
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'

  const navItems = [
    { label: 'Terminal', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Spending', icon: Wallet, to: '/spending' },
    { label: 'Scan', icon: Camera, to: '/scan', isFab: true },
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
      {/* Glossy translucent background container with Instagram-style boundary */}
      <div className={`mx-3 mb-2 rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
        isDark
          ? 'bg-[#050811]/90 border-[#D4AF37]/25 shadow-[0_10px_35px_rgba(0,0,0,0.85)]'
          : 'bg-white/95 border-sky-200/80 shadow-[0_12px_36px_rgba(2,132,199,0.18)]'
      }`}>
        <div className="flex items-center justify-around px-2 py-1.5 relative">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = path === item.to || (item.to === '/dashboard' && path === '/')

            // Instagram-style floating action button in center (Scan bill)
            if (item.isFab) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label="Scan Bill Receipt"
                  className="relative -top-5 flex flex-col items-center group touch-manipulation focus:outline-none"
                >
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 active:scale-90 shadow-xl ${
                    isDark
                      ? 'bg-gradient-to-tr from-[#B45309] via-[#D4AF37] to-[#FDE68A] text-slate-950 shadow-[#D4AF37]/35 ring-4 ring-[#050811]'
                      : 'bg-gradient-to-tr from-sky-600 via-sky-500 to-sky-400 text-white shadow-sky-500/40 ring-4 ring-white'
                  }`}>
                    <Icon size={24} className="stroke-[2.2]" />
                  </div>
                  <span className={`text-[10px] mt-1 font-bold font-poppins transition-colors ${
                    isDark
                      ? 'text-[#FDE68A]'
                      : 'text-sky-600'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              )
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex-1 flex flex-col items-center py-1.5 px-2 rounded-2xl transition-all duration-200 active:scale-95 touch-manipulation focus:outline-none group"
              >
                {/* Active tab top pill indicator - Instagram style micro indicator */}
                {isActive && (
                  <span
                    className={`absolute -top-1 w-5 h-1 rounded-full animate-fade-in ${
                      isDark
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#FDE68A] shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                        : 'bg-gradient-to-r from-sky-600 to-sky-400 shadow-[0_0_8px_rgba(2,132,199,0.7)]'
                    }`}
                  />
                )}

                {/* Icon wrapper with subtle glow pill on active */}
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? 'bg-[#D4AF37]/15 text-[#FDE68A]'
                      : 'bg-sky-500/15 text-sky-600'
                    : isDark
                      ? 'text-slate-400 group-hover:text-slate-200'
                      : 'text-slate-500 group-hover:text-slate-800'
                }`}>
                  <Icon
                    size={21}
                    className={`transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`}
                  />
                </div>

                <span
                  className={`text-[10px] mt-0.5 font-poppins tracking-tight transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? 'text-[#FDE68A] font-bold scale-105'
                        : 'text-sky-600 font-bold scale-105'
                      : isDark
                        ? 'text-slate-400 font-medium'
                        : 'text-slate-500 font-medium'
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
