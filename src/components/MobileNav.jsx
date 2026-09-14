import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wallet, History, User, Camera } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function MobileNav() {
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()
  const { activeTheme } = useTheme()
  const { currentUser } = useAuth()
  const isDark = activeTheme === 'dark'

  // ONLY show after user login, and not on landing or auth/splash pages
  if (!currentUser) return null
  if (path === '/' || path === '/login' || path === '/register' || path === '/splash') return null

  const handleScanTap = () => {
    if (path === '/dashboard') {
      window.dispatchEvent(new CustomEvent('taxshield:open-camera'))
      const el = document.getElementById('scanner-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      navigate('/dashboard')
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('taxshield:open-camera'))
        const el = document.getElementById('scanner-section')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 350)
    }
  }

  const navItems = [
    { label: 'Home', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Spending', icon: Wallet, to: '/spending' },
    { label: 'Scan', icon: Camera, isScanBtn: true, onTap: handleScanTap },
    { label: 'History', icon: History, to: '/history' },
    { label: 'Profile', icon: User, to: '/settings' },
  ]

  return (
    <nav
      aria-label="Bottom Mobile App Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 select-none pb-[calc(0.4rem+env(safe-area-inset-bottom))]"
    >
      {/* Curved / Floating Glass Dock */}
      <div 
        className="w-full px-3 pt-2 pb-1 border-t backdrop-blur-2xl transition-colors duration-300"
        style={{
          backgroundColor: isDark ? 'rgba(7, 10, 18, 0.94)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(2, 132, 199, 0.18)',
          boxShadow: isDark ? '0 -8px 30px rgba(0, 0, 0, 0.75)' : '0 -8px 30px rgba(2, 132, 199, 0.12)',
        }}
      >
        <div className="flex items-end justify-between max-w-md mx-auto relative px-1">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = item.to && (path === item.to || (item.to === '/dashboard' && path === '/'))

            // PhonePe / Instagram Elevated Center Action Button
            if (item.isScanBtn) {
              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end -mt-6 relative z-20">
                  <button
                    type="button"
                    onClick={item.onTap}
                    aria-label="Scan Bill Receipt"
                    className="relative flex items-center justify-center w-13 h-13 rounded-full transition-all duration-200 active:scale-95 touch-manipulation cursor-pointer group shadow-xl"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, #B45309 0%, #D4AF37 50%, #FDE68A 100%)'
                        : 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                      boxShadow: isDark
                        ? '0 0 22px rgba(212, 175, 55, 0.55), 0 6px 16px rgba(0,0,0,0.6)'
                        : '0 0 22px rgba(2, 132, 199, 0.45), 0 6px 16px rgba(2,132,199,0.3)',
                    }}
                  >
                    {/* Ring cutout effect */}
                    <div 
                      className="absolute inset-[-4px] rounded-full -z-10 border-2"
                      style={{
                        borderColor: isDark ? 'rgba(7, 10, 18, 0.94)' : 'rgba(255, 255, 255, 0.95)',
                      }}
                    />
                    <Icon size={24} className={`stroke-[2.4] ${isDark ? 'text-slate-950' : 'text-white'}`} />
                  </button>
                  <span 
                    className="text-[10px] font-poppins font-bold tracking-tight mt-1 whitespace-nowrap"
                    style={{
                      color: isDark ? '#FDE68A' : '#0284C7'
                    }}
                  >
                    Scan
                  </span>
                </div>
              )
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation min-h-[46px] ${
                  isActive
                    ? isDark
                      ? 'text-[#FDE68A]'
                      : 'text-sky-700'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={20}
                    className={`transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`}
                  />
                  {isActive && (
                    <span 
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: isDark ? '#FDE68A' : '#0284C7',
                        boxShadow: isDark ? '0 0 8px #FDE68A' : '0 0 8px #0284C7'
                      }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-poppins tracking-tight mt-1 leading-tight whitespace-nowrap truncate max-w-[62px] text-center ${
                    isActive ? 'font-bold' : 'font-medium'
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
