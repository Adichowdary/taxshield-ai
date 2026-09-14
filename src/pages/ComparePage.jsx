import Navbar from '../components/Navbar'
import MobileNav from '../components/MobileNav'
import Footer from '../components/Footer'
import BillComparison from '../components/BillComparison'

export default function ComparePage() {
  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden font-sans text-slate-100 flex flex-col selection:bg-lime-400 selection:text-slate-950">
      {/* Ambient background blur orb */}
      <div className="bg-orb bg-orb-gold fixed -top-32 -left-32 w-[480px] h-[480px] animate-spatial-float z-0" />
      <div className="bg-orb bg-orb-emerald fixed top-1/3 -right-32 w-[440px] h-[440px] animate-spatial-float z-0" style={{ animationDelay: '2s' }} />

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-6 relative z-10">
        <div className="auth-stagger" style={{ animationDelay: '80ms' }}>
          <h1 className="text-3xl font-poppins font-bold vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>Bill Comparison</h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
            Compare prices, taxes, and service charges side-by-side across receipts
          </p>
        </div>

        <div className="auth-stagger" style={{ animationDelay: '160ms' }}>
          <BillComparison />
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
