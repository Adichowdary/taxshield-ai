import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Shield, Menu, X, LogOut, Settings, ChevronDown, Sun, Moon, Laptop } from 'lucide-react'
import { useState, useEffect } from 'react'
import Button from './shared/Button'
import Container from './shared/Container'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { activeTheme, themeMode, setTheme } = useTheme()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handleScrollEvent = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(scrollTop > 30)
      if (docHeight > 0) {
        setScrollProgress(scrollTop / docHeight)
      }
    }

    window.addEventListener('scroll', handleScrollEvent, { passive: true })
    handleScrollEvent()

    return () => window.removeEventListener('scroll', handleScrollEvent)
  }, [])

  const handleScroll = (id) => {
    if (!isLanding) {
      navigate('/#' + id)
      return
    }
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuOpen(false)
      navigate('/')
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300 tz-60 ${
      scrolled ? 'backdrop-blur-2xl elev-2 border-b border-[var(--border-strong)]' : ''
    }`}>
      {/* Top Scroll Depth Progress Indicator Bar */}
      <div 
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <Container>
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-[58px]' : 'h-[68px]'
        }`}>
          
          {/* Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 via-sky-500 to-sky-600 dark:from-[#FDE68A] dark:via-[#D4AF37] dark:to-[#B45309] text-white dark:text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-sky-500/20 dark:shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
              <Shield size={20} className="fill-white/25 dark:fill-slate-950/25 text-white dark:text-slate-950" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-poppins font-extrabold text-lg tracking-tight leading-none text-slate-900 dark:text-white">
                TaxShield
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono text-sky-700 dark:text-[#FDE68A] bg-sky-500/10 dark:bg-[#D4AF37]/10 border-sky-500/30 dark:border-[#D4AF37]/30">
                INSTITUTIONAL AUDIT
              </span>
            </div>
          </Link>

          {/* Desktop Center Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {isLanding ? (
              <>
                <button
                  onClick={() => handleScroll('how-it-works')}
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors rounded-lg hover:text-sky-600 dark:hover:text-[#FDE68A] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-[#D4AF37]"
                >
                  How It Works
                </button>
                <button
                  onClick={() => handleScroll('features')}
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors rounded-lg hover:text-sky-600 dark:hover:text-[#FDE68A] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-[#D4AF37]"
                >
                  Features
                </button>
                <button
                  onClick={() => handleScroll('bill-simulator')}
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors rounded-lg hover:text-sky-600 dark:hover:text-[#FDE68A] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-[#D4AF37]"
                >
                  Bill Simulator
                </button>
                <button
                  onClick={() => handleScroll('security')}
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors rounded-lg hover:text-sky-600 dark:hover:text-[#FDE68A] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-[#D4AF37]"
                >
                  Security
                </button>
                <button
                  onClick={() => handleScroll('faq')}
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors rounded-lg hover:text-sky-600 dark:hover:text-[#FDE68A] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-[#D4AF37]"
                >
                  FAQ
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-sky-500/15 dark:bg-[#D4AF37]/15 text-sky-600 dark:text-[#FDE68A] font-bold border border-sky-500/40 dark:border-[#D4AF37]/40 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/spending"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/spending') 
                      ? 'bg-sky-500/15 dark:bg-[#D4AF37]/15 text-sky-600 dark:text-[#FDE68A] font-bold border border-sky-500/40 dark:border-[#D4AF37]/40 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Spending
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/history') 
                      ? 'bg-sky-500/15 dark:bg-[#D4AF37]/15 text-sky-600 dark:text-[#FDE68A] font-bold border border-sky-500/40 dark:border-[#D4AF37]/40 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Bill History
                </Link>
                <Link
                  to="/complaint"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/complaint')
                      ? 'bg-sky-500/15 dark:bg-[#D4AF37]/15 text-sky-600 dark:text-[#FDE68A] font-bold border border-sky-500/40 dark:border-[#D4AF37]/40 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  Complaint
                </Link>
              </>
            )}
          </nav>

{/* Desktop Right CTAs & Theme Selector */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />

            {isLanding && !currentUser ? (
              <>
                <Button variant="ghost" size="sm" to="/login" className="text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-[#FDE68A]">
                  Sign In
                </Button>
                <Button variant="primary" size="sm" to="/register" className="auth-cta font-bold border-none px-4">
                  Open Terminal
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" size="sm" to="/dashboard" className="auth-cta font-bold border-none px-4 shadow-lg shadow-sky-500/20 dark:shadow-[#D4AF37]/20">
                  Audit Terminal
                </Button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-sky-600 dark:from-[#FDE68A] dark:via-[#D4AF37] dark:to-[#B45309] text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                      {currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : 'TS'}
                    </div>
                    <ChevronDown size={14} className="text-slate-500 dark:text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in border border-sky-100 dark:border-[#D4AF37]/25 bg-white/95 dark:bg-[#0A0E18]/95 text-slate-900 dark:text-white backdrop-blur-2xl">
                      <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10">
                        <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{currentUser?.displayName || 'Executive Auditor'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{currentUser?.email || ''}</p>
                      </div>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-[#FDE68A] rounded-xl transition-colors mt-1"
                      >
                        <Settings size={14} /> Profile & Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors mt-1 border-t border-slate-200 dark:border-white/10 cursor-pointer"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Drawer Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:focus-visible:ring-lime-400 ${activeTheme === 'dark' ? 'text-slate-200 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              aria-controls="mobile-nav-drawer"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div id="mobile-nav-drawer" className={`md:hidden py-4 border-t rounded-b-2xl shadow-xl px-3 space-y-3 animate-fade-in ${
            activeTheme === 'dark' 
              ? 'bg-[#0A0F1D]/95 border-white/15 text-white backdrop-blur-2xl' 
              : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-2xl'
          }`}>
            {/* Mobile 3-Way Theme Switcher */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Theme</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 transition-all ${
                    themeMode === 'dark' ? 'bg-[#D4AF37]/20 text-[#B45309] dark:text-[#FDE68A] font-bold' : 'text-slate-500'
                  }`}
                >
                  <Moon size={13} /> Dark
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 transition-all ${
                    themeMode === 'light' ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold' : 'text-slate-500'
                  }`}
                >
                  <Sun size={13} /> Light
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 transition-all ${
                    themeMode === 'system' ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <Laptop size={13} /> Auto
                </button>
              </div>
            </div>

            {isLanding ? (
              <>
                <button
                  onClick={() => handleScroll('how-it-works')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/10 rounded-xl"
                >
                  How It Works
                </button>
                <button
                  onClick={() => handleScroll('features')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/10 rounded-xl"
                >
                  Features
                </button>
                <button
                  onClick={() => handleScroll('transparency')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/10 rounded-xl"
                >
                  Tax Rules
                </button>
                <button
                  onClick={() => handleScroll('faq')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-white/10 rounded-xl"
                >
                  FAQ
                </button>
                <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                  <Button variant="secondary" size="md" to="/login" className="w-full">
                    Sign In
                  </Button>
                  <Button variant="primary" size="md" to="/register" className="w-full">
                    Get Started
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-white/10 rounded-xl"
                >
                  Dashboard
                </Link>
                <Link
                  to="/spending"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-white/10 rounded-xl"
                >
                  Spending
                </Link>
                <Link
                  to="/history"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-white/10 rounded-xl"
                >
                  Bill History
                </Link>
                <Link
                  to="/complaint"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium hover:bg-white/10 rounded-xl"
                >
                  Complaint
                </Link>
              </>
            )}
          </div>
        )}
      </Container>
    </header>
  )
}