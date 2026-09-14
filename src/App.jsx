import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/shared/PageTransition'
import ThreeDBackground from './components/shared/ThreeDBackground'
import MobileNav from './components/MobileNav'

const Landing = lazy(() => import('./pages/Landing'))

const LoginPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })))
const LoginSuccessSplash = lazy(() => import('./components/LoginSuccessSplash'))
const TestGemini = lazy(() => import('./pages/TestGemini'))
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV
const SecurityPage = lazy(() => import('./pages/SecurityPage'))
const DashboardHome = lazy(() => import('./pages/DashboardHome'))
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const ComplaintPage = lazy(() => import('./pages/ComplaintPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const SmartSpendingDashboard = lazy(() => import('./pages/SmartSpendingDashboard'))
const ScanPage = lazy(() => import('./pages/ScanPage'))

function SplashWrapper() {
  const navigate = useNavigate()
  return <LoginSuccessSplash onComplete={() => navigate('/dashboard')} />
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Universal 3D WebGL Animated Background across all application pages */}
          <ThreeDBackground />
          <Suspense fallback={<Loading />}>

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
              <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
              <Route path="/security" element={<PageTransition><SecurityPage /></PageTransition>} />
              <Route path="/splash" element={<PageTransition><SplashWrapper /></PageTransition>} />
              <Route path="/test-gemini" element={isDev ? <TestGemini /> : <PageTransition><Landing /></PageTransition>} />

              {/* Protected App Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><PageTransition><DashboardHome /></PageTransition></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute><PageTransition><ScanPage /></PageTransition></ProtectedRoute>} />
              <Route path="/analysis/:id" element={<ProtectedRoute><PageTransition><AnalysisPage /></PageTransition></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><PageTransition><HistoryPage /></PageTransition></ProtectedRoute>} />
              <Route path="/spending" element={<ProtectedRoute><PageTransition><SmartSpendingDashboard /></PageTransition></ProtectedRoute>} />
              <Route path="/how-it-works" element={<ProtectedRoute><PageTransition><HowItWorksPage /></PageTransition></ProtectedRoute>} />
              <Route path="/complaint/:id?" element={<ProtectedRoute><PageTransition><ComplaintPage /></PageTransition></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><PageTransition><SettingsPage /></PageTransition></ProtectedRoute>} />

              {/* Redirects for legacy routes */}
              <Route path="/insights" element={<Navigate to="/spending" replace />} />
              <Route path="/compare" element={<Navigate to="/dashboard" replace />} />

            </Routes>
          </Suspense>

          {/* Bottom Mobile Navigation Bar (PhonePe / Insta style, strictly after user login) */}
          <MobileNav />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
