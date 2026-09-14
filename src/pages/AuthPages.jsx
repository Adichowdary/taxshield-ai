import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, ArrowRight, CheckCircle2, AlertCircle, Mail, Lock, User as UserIcon, Sparkles, ScanLine, TrendingDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoginSuccessSplash from '../components/LoginSuccessSplash'
import AmbientBackground from '../components/shared/AmbientBackground'

/* ---------------------------------------------------------------------- */
/*  Shared visual pieces for Login / Register                             */
/* ---------------------------------------------------------------------- */

function AuthShell({ children, panel }) {
  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid relative overflow-hidden flex items-center justify-center px-4 py-10 font-sans selection:bg-[#D4AF37] selection:text-slate-950">
      {/* Luxury Obsidian Ambient Lights */}
      <AmbientBackground />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-stretch">
        {panel}
        {children}
      </div>
    </div>
  )
}

function BrandPanel({ mode }) {
  return (
    <div className="hidden lg:flex flex-col justify-between vault-glass border border-[#D4AF37]/30 rounded-3xl p-10 auth-stagger shadow-[0_20px_50px_rgba(0,0,0,0.6)]" style={{ animationDelay: '80ms' }}>
      <div>
        <Link to="/" className="inline-flex items-center gap-2.5 group">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#FDE68A] flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(212,175,55,0.4)] group-hover:scale-105 transition-transform html-light:from-sky-500 html-light:to-sky-300">
            <Shield size={22} strokeWidth={2.5} />
          </div>
          <span className="font-poppins font-bold text-xl tracking-tight gold-gradient-text">
            TaxShield AI
          </span>
        </Link>

        <h1 className="mt-10 font-poppins font-bold text-4xl leading-[1.15] tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {mode === 'login' ? (
            <>Welcome back to <span className="gold-gradient-text">smarter</span> tax tracking.</>
          ) : (
            <>Catch every deduction, <span className="gold-gradient-text">automatically</span>.</>
          )}
        </h1>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Scan bills, detect hidden charges, and see your real tax savings in one spatial dashboard.
        </p>
      </div>

      <div className="space-y-3 mt-10">
        <div className="vault-glass border border-white/10 flex items-center gap-3 px-4 py-3.5 rounded-2xl auth-stagger shadow-sm" style={{ animationDelay: '220ms' }}>
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#FDE68A] shrink-0">
            <ScanLine size={18} />
          </div>
          <div className="text-xs">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Instant bill OCR</p>
            <p style={{ color: 'var(--text-muted)' }}>Snap a receipt, get it categorized in seconds</p>
          </div>
        </div>
        <div className="vault-glass border border-white/10 flex items-center gap-3 px-4 py-3.5 rounded-2xl auth-stagger shadow-sm" style={{ animationDelay: '320ms' }}>
          <div className="w-9 h-9 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
            <TrendingDown size={18} />
          </div>
          <div className="text-xs">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Spending intelligence</p>
            <p style={{ color: 'var(--text-muted)' }}>Spot overcharges before they cost you</p>
          </div>
        </div>
        <div className="vault-glass border border-white/10 flex items-center gap-3 px-4 py-3.5 rounded-2xl auth-stagger shadow-sm" style={{ animationDelay: '420ms' }}>
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="text-xs">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>TaxShield AI tax analysis</p>
            <p style={{ color: 'var(--text-muted)' }}>Personalized deduction insights, explained plainly</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldShell({ icon: Icon, children }) {
  return (
    <div className="relative auth-input-glow rounded-xl">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
      {children}
    </div>
  )
}

const inputClasses =
  'w-full pl-10 pr-3.5 py-3 rounded-xl bg-transparent text-sm font-sans outline-none transition-colors placeholder:text-slate-400/60'

function GoogleButton({ onClick, loading, label }) {
  return (
    <button
      onClick={onClick}
      type="button"
      disabled={loading}
      className="w-full py-3 px-4 vision-pro-pill hover:border-lime-400/50 rounded-xl font-poppins text-xs font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-50"
      style={{ color: 'var(--text-primary)' }}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
      {label}
    </button>
  )
}

function Divider({ label }) {
  return (
    <div className="relative flex py-1 items-center">
      <div className="flex-grow border-t" style={{ borderColor: 'var(--border-subtle)' }}></div>
      <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div className="flex-grow border-t" style={{ borderColor: 'var(--border-subtle)' }}></div>
    </div>
  )
}

function AlertBanner({ tone, icon: Icon, children }) {
  const tones = {
    warning: 'bg-amber-400/10 border-amber-400/30 text-amber-300',
    danger: 'bg-rose-500/10 border-rose-400/30 text-rose-300',
    success: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300',
  }
  return (
    <div className={`p-3.5 rounded-2xl text-xs border flex items-start gap-2 ${tones[tone]}`}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <div className="space-y-1.5 leading-relaxed">{children}</div>
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/*  Login                                                                  */
/* ---------------------------------------------------------------------- */

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

  const { login, loginAsDemo, loginWithGoogle, loginWithGoogleRedirect, resetPassword, sendVerification, currentUser } = useAuth()
  const navigate = useNavigate()

  const handleDemoSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await loginAsDemo()
      setShowSplash(true)
    } catch (err) {
      setError('Demo sign-in note: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      setShowSplash(true)
    } catch (err) {
      console.error("Firebase Login Error:", err)
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please check your credentials or register a new account.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please reset your password or try again later.')
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      setShowSplash(true)
    } catch (err) {
      console.error("Firebase Google Auth Error:", err)
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await loginWithGoogleRedirect()
        } catch (redirectErr) {
          console.error("Google redirect error:", redirectErr)
          setError('Browser blocked the popup window. Please allow popups or use email sign-in below.')
        }
      } else {
        setError(err.message || 'Google Sign-In failed. Please check your network or try email sign-in.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address to reset password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (err) {
      console.error(err)
      setError('Failed to send password reset email. Please verify your email address.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      await sendVerification()
      setVerificationSent(true)
      setTimeout(() => setVerificationSent(false), 4000)
    } catch (err) {
      console.error(err)
    }
  }

  if (showSplash) {
    return (
      <LoginSuccessSplash
        userName={currentUser?.displayName || email.split('@')[0] || 'Executive User'}
        onComplete={() => navigate('/dashboard')}
      />
    )
  }

  return (
    <AuthShell panel={<BrandPanel mode="login" />}>
      <div className="vault-glass border border-[#D4AF37]/30 rounded-3xl p-8 sm:p-9 w-full space-y-6 auth-stagger shadow-[0_20px_50px_rgba(0,0,0,0.6)]" style={{ animationDelay: '140ms' }}>

        <div className="text-center space-y-1.5 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#FDE68A] flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <span className="font-poppins font-bold text-xl tracking-tight gold-gradient-text">TaxShield AI</span>
          </Link>
        </div>

        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-poppins font-bold" style={{ color: 'var(--text-primary)' }}>
            {showForgot ? 'Reset your password' : 'Sign in to TaxShield AI'}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {showForgot ? "We'll email you a secure reset link" : 'Sign in with Google or your email'}
          </p>
        </div>

        {currentUser && !currentUser.emailVerified && (
          <AlertBanner tone="warning" icon={AlertCircle}>
            <p className="font-bold">Verify your email</p>
            <p className="text-[11px] font-sans">Verification email sent to <strong>{currentUser.email}</strong>. Please check your inbox.</p>
            <button onClick={handleResendVerification} className="text-xs font-bold text-[#D4AF37] hover:underline block">
              {verificationSent ? '✓ Verification link sent!' : 'Resend verification link'}
            </button>
          </AlertBanner>
        )}

        {error && (
          <AlertBanner tone="danger" icon={AlertCircle}>
            <span>{error}</span>
          </AlertBanner>
        )}

        {resetSent && (
          <AlertBanner tone="success" icon={CheckCircle2}>
            <span>Password reset link sent! Check your inbox for instructions.</span>
          </AlertBanner>
        )}

        {!showForgot ? (
          <>
            <GoogleButton onClick={handleGoogleSignIn} loading={loading} label="Continue with Google" />
            <Divider label="Or sign in with email" />

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                <FieldShell icon={Mail}>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    style={{ color: 'var(--text-primary)' }}
                  />
                </FieldShell>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Password</label>
                  <button type="button" onClick={() => setShowForgot(true)} className="text-[11px] font-semibold hover:underline transition-colors" style={{ color: 'var(--accent-gold)' }}>
                    Forgot password?
                  </button>
                </div>
                <FieldShell icon={Lock}>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClasses}
                    style={{ color: 'var(--text-primary)' }}
                  />
                </FieldShell>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-cta w-full py-3.5 rounded-xl font-poppins font-bold text-sm text-slate-950 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'Authenticating…' : 'Sign in'} <ArrowRight size={16} />
                </span>
              </button>

              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300/80 dark:border-white/20 bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles size={14} className="text-amber-500" /> Instant Demo Sign-in
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Account email address</label>
              <FieldShell icon={Mail}>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  style={{ color: 'var(--text-primary)' }}
                />
              </FieldShell>
            </div>

            <button type="submit" disabled={loading} className="auth-cta w-full py-3.5 rounded-xl font-poppins font-bold text-sm text-slate-950 disabled:opacity-60 disabled:pointer-events-none">
              <span className="relative z-10">{loading ? 'Sending link…' : 'Send password reset email'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="w-full text-center text-xs font-bold pt-1 block hover:underline transition-colors" style={{ color: 'var(--text-muted)' }}
            >
              ← Back to sign in
            </button>
          </form>
        )}

        <div className="pt-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-bold hover:underline" style={{ color: 'var(--accent-gold)' }}>
            Create an account
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}

/* ---------------------------------------------------------------------- */
/*  Register                                                               */
/* ---------------------------------------------------------------------- */

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registeredSuccess, setRegisteredSuccess] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

  const { register, loginWithGoogle, loginWithGoogleRedirect } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, displayName)
      setRegisteredSuccess(true)
      setShowSplash(true)
    } catch (err) {
      console.error("Firebase Registration Error:", err)
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists. Please sign in.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.')
      } else {
        setError(err.message || 'Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      setShowSplash(true)
    } catch (err) {
      console.error("Firebase Google Registration Error:", err)
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await loginWithGoogleRedirect()
        } catch (redirectErr) {
          console.error("Google redirect error:", redirectErr)
          setError('Browser blocked popup window. Please allow popups or use email registration below.')
        }
      } else {
        setError(err.message || 'Google Sign-Up failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (showSplash) {
    return (
      <LoginSuccessSplash
        userName={displayName || email.split('@')[0] || 'Executive User'}
        onComplete={() => navigate('/dashboard')}
      />
    )
  }

  return (
    <AuthShell panel={<BrandPanel mode="register" />}>
      <div className="vault-glass border border-[#D4AF37]/30 rounded-3xl p-8 sm:p-9 w-full space-y-6 auth-stagger shadow-[0_20px_50px_rgba(0,0,0,0.6)]" style={{ animationDelay: '140ms' }}>

        <div className="text-center space-y-1.5 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#FDE68A] flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <span className="font-poppins font-bold text-xl tracking-tight gold-gradient-text">TaxShield AI</span>
          </Link>
        </div>

        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-poppins font-bold" style={{ color: 'var(--text-primary)' }}>Create your account</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Get started with automated bill OCR and tax intelligence</p>
        </div>

        {error && (
          <AlertBanner tone="danger" icon={AlertCircle}>
            <span>{error}</span>
          </AlertBanner>
        )}

        {registeredSuccess && (
          <AlertBanner tone="success" icon={CheckCircle2}>
            <p className="font-bold">Account created successfully!</p>
            <p className="text-[11px] font-sans">Verification email sent to <strong>{email}</strong>. Redirecting to dashboard…</p>
          </AlertBanner>
        )}

        <GoogleButton onClick={handleGoogleSignUp} loading={loading} label="Sign up with Google" />
        <Divider label="Or register with email" />

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full name</label>
            <FieldShell icon={UserIcon}>
              <input
                type="text"
                required
                placeholder="Aditya Kumar"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClasses}
                style={{ color: 'var(--text-primary)' }}
              />
            </FieldShell>
          </div>

          <div>
            <label className="font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email address</label>
            <FieldShell icon={Mail}>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                style={{ color: 'var(--text-primary)' }}
              />
            </FieldShell>
          </div>

          <div>
            <label className="font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <FieldShell icon={Lock}>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                style={{ color: 'var(--text-primary)' }}
              />
            </FieldShell>
          </div>

          <button
            type="submit"
            disabled={loading || registeredSuccess}
            className="auth-cta w-full py-3.5 rounded-xl font-poppins font-bold text-sm text-slate-950 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'Creating account…' : 'Register account'} <ArrowRight size={16} />
            </span>
          </button>
        </form>

        <div className="pt-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: 'var(--accent-gold)' }}>
            Sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
