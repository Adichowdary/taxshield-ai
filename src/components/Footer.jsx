import Container from './shared/Container'
import { Shield, Code2, Globe, MessageSquare, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from './shared/Button'

export default function Footer() {
  return (
    <footer className="relative text-xs" style={{ background: 'var(--bg-footer, #030508)', borderTop: '1px solid var(--border-gold, rgba(212,175,55,0.2))' }}>
      {/* Ambient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--accent-gold, #D4AF37) 50%, transparent 100%)', boxShadow: '0 0 30px 5px rgba(212,175,55,0.2)' }} />
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 100%)' }} />

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-16 border-b" style={{ borderColor: 'var(--border-subtle, rgba(255,255,255,0.06))' }}>
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#FDE68A] text-slate-950 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all duration-300">
                <Shield size={20} />
              </div>
              <span className="font-poppins font-bold text-xl gold-gradient-text tracking-wide">TaxShield</span>
            </Link>
            <p className="leading-relaxed font-sans max-w-sm" style={{ color: 'var(--text-secondary, #CBD5E1)' }}>
              AI-powered bill intelligence platform helping consumers verify taxes, statutory fees, and eradicate illicit overcharges across India.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              {[MessageSquare, Code2, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-muted, #64748B)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)'
                    e.currentTarget.style.color = 'var(--accent-gold, #D4AF37)'
                    e.currentTarget.style.background = 'rgba(212,175,55,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = 'var(--text-muted, #64748B)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="font-poppins font-bold text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--accent-gold, #D4AF37)' }}>Product</h4>
            <ul className="space-y-2.5 font-sans">
              <li><Link to="/#how-it-works" className="link-gold text-xs">How It Works</Link></li>
              <li><Link to="/#features" className="link-gold text-xs">Features</Link></li>
              <li><Link to="/#transparency" className="link-gold text-xs">Tax Rules</Link></li>
              <li><Link to="/#security" className="link-gold text-xs">Security</Link></li>
              <li><Link to="/#bill-simulator" className="link-gold text-xs">Bill Simulator</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="font-poppins font-bold text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--accent-gold, #D4AF37)' }}>Resources</h4>
            <ul className="space-y-2.5 font-sans">
              <li><Link to="/#faq" className="link-gold text-xs">FAQ</Link></li>
              <li><Link to="/spending" className="link-gold text-xs">Spending Dashboard</Link></li>
              <li><Link to="/history" className="link-gold text-xs">Bill History</Link></li>
              <li><Link to="/complaint" className="link-gold text-xs">File Complaint</Link></li>
              <li><Link to="/how-it-works" className="link-gold text-xs">How It Works</Link></li>
            </ul>
          </div>

          {/* Quick CTA Column */}
          <div className="space-y-4">
            <h4 className="font-poppins font-bold text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--accent-gold, #D4AF37)' }}>Audit Terminal</h4>
            <p className="leading-relaxed font-sans" style={{ color: 'var(--text-secondary, #CBD5E1)' }}>Ready to audit and track your dining expenses with precision?</p>
            <Button variant="primary" size="sm" to="/dashboard" className="w-full font-bold auth-cta text-slate-950">
              Open Dashboard
            </Button>
            <Button variant="outline" size="sm" to="/register" className="w-full font-semibold">
              Create Free Account
            </Button>
          </div>

        </div>

        {/* Compliance badges row */}
        <div className="py-5 flex flex-wrap items-center justify-center gap-4 border-b" style={{ borderColor: 'var(--border-subtle, rgba(255,255,255,0.06))' }}>
          {['GST Compliant', 'CCPA 2022', '256-bit AES', 'Client-Side Privacy', 'No Data Storage'].map((badge) => (
            <span
              key={badge}
              className="px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider"
              style={{
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.2)',
                color: 'var(--accent-gold-light, #FDE68A)',
              }}
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans" style={{ color: 'var(--text-muted, #475569)' }}>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} TaxShield &mdash; statutory intelligence, kept private by design.
          </p>
          <div className="flex items-center gap-5 text-xs">
            <Link to="/security" className="link-gold">Privacy Policy</Link>
            <span style={{ color: 'var(--border-subtle)' }}>&bull;</span>
            <Link to="/security" className="link-gold">Terms of Service</Link>
            <span style={{ color: 'var(--border-subtle)' }}>&bull;</span>
            <Link to="/security" className="link-gold">Security Overview</Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
