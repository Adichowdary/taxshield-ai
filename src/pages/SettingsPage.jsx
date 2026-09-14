import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MobileNav from '../components/MobileNav'
import Footer from '../components/Footer'
import Button from '../components/shared/Button'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { 
  User, 
  Sun, 
  Moon, 
  Laptop, 
  Bell, 
  Shield, 
  Key, 
  Cpu, 
  Check, 
  Activity, 
  RefreshCw, 
  Download,
  HelpCircle,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  Smartphone,
  Pill,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Scale,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { checkCustomLlmHealth } from '../services/llm/customLlmAdapter'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account')
  const [saved, setSaved] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const { themeMode, setTheme } = useTheme()
  const { currentUser, updateUserProfile, changePassword } = useAuth()
  const [exportMsg, setExportMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  const handleExportCsv = () => {
    try {
      const raw = localStorage.getItem('taxshield_bill_history')
      const bills = raw ? JSON.parse(raw) : []
      const rows = [['id', 'merchant', 'date', 'invoiceNo', 'platform', 'subtotal', 'tax', 'serviceCharge', 'total']]
      bills.forEach((b) => {
        rows.push([
          b.id || '', b.merchant || b.restaurantName || '',
          b.date || '', b.invoiceNo || '',
          b.platform || '',
          Number(b.subtotal || 0), Number(b.taxes ?? b.gst ?? 0),
          Number(b.serviceCharge || 0), Number(b.totalAmount ?? b.total ?? 0),
        ])
      })
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `taxshield-bills-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setExportMsg('CSV exported!')
      setTimeout(() => setExportMsg(''), 2500)
    } catch {
      setExportMsg('Export failed')
      setTimeout(() => setExportMsg(''), 2500)
    }
  }

  const handleChangePassword = async () => {
    setPwMsg('')
    setPwError('')
    if (!newPassword || newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }
    try {
      await changePassword(newPassword)
      setPwMsg('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwMsg(''), 3000)
    } catch (err) {
      setPwError(err?.code === 'auth/requires-recent-login' ? 'Please sign in again, then retry.' : (err?.message || 'Password update failed.'))
    }
  }

  // User Profile State
  const [fullName, setFullName] = useState(() => 
    currentUser?.displayName || (typeof localStorage !== 'undefined' ? localStorage.getItem('taxshield_user_name') : '') || 'Executive User'
  )
  const [emailAddress, setEmailAddress] = useState(() => currentUser?.email || 'user@taxshield.ai')

  useEffect(() => {
    if (currentUser?.displayName) {
      setFullName(currentUser.displayName)
    }
    if (currentUser?.email) {
      setEmailAddress(currentUser.email)
    }
  }, [currentUser])

  // LLM Settings State
  const [llmProvider, setLlmProvider] = useState(() => 
    localStorage.getItem('taxshield_llm_provider') || import.meta.env.VITE_ACTIVE_LLM_PROVIDER || 'custom'
  )
  const [customEndpoint, setCustomEndpoint] = useState(() => 
    localStorage.getItem('taxshield_custom_endpoint') || import.meta.env.VITE_CUSTOM_LLM_ENDPOINT || 'http://localhost:11434/v1'
  )
  const [customModel, setCustomModel] = useState(() => 
    localStorage.getItem('taxshield_custom_model') || import.meta.env.VITE_CUSTOM_LLM_MODEL || 'taxshield-1b'
  )
  const [gpuHealth, setGpuHealth] = useState({ checking: false, checked: false, online: false })

  const handleSave = async () => {
    localStorage.setItem('taxshield_llm_provider', llmProvider)
    localStorage.setItem('taxshield_custom_endpoint', customEndpoint)
    localStorage.setItem('taxshield_custom_model', customModel)
    
    if (fullName && updateUserProfile) {
      await updateUserProfile(fullName)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const runGpuHealthCheck = useCallback(async () => {
    setGpuHealth({ checking: true, checked: false, online: false })
    const res = await checkCustomLlmHealth(customEndpoint)
    setGpuHealth({ checking: false, checked: true, online: res.online, models: res.models || [] })
  }, [customEndpoint])

  useEffect(() => {
    if (activeTab === 'ai-llm') {
      runGpuHealthCheck()
    }
  }, [activeTab, runGpuHealthCheck])

  return (
    <div className="min-h-screen vision-pro-bg vision-pro-grid bg-vignette relative overflow-hidden font-sans text-slate-100 flex flex-col selection:bg-lime-400 selection:text-slate-950">
      {/* Ambient background blur orbs */}
      <div className="bg-orb bg-orb-gold fixed -top-32 -left-32 w-[480px] h-[480px] animate-spatial-float z-0" />
      <div className="bg-orb bg-orb-emerald fixed top-1/3 -right-32 w-[440px] h-[440px] animate-spatial-float z-0" style={{ animationDelay: '2s' }} />

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-6 relative z-10">
        <div className="auth-stagger" style={{ animationDelay: '80ms' }}>
          <h1 className="text-3xl font-poppins font-bold vision-pro-text-glow" style={{ color: 'var(--text-primary)' }}>Account & Settings</h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage your personal profile, AI model selection, theme appearance, and privacy controls
          </p>
        </div>

        {/* Settings Shell */}
        <div className="vision-pro-card overflow-hidden grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-500/30 auth-stagger" style={{ animationDelay: '160ms' }}>
          
          {/* Left Nav */}
          <div className="p-4 space-y-1 bg-slate-950/40">
            {[
              { id: 'account', label: 'Account Profile', icon: User },
              { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
              { id: 'ai-llm', label: 'AI & GPU Engine', icon: Cpu },
              { id: 'appearance', label: 'Theme & Appearance', icon: Sun },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'privacy', label: 'Privacy & Data', icon: Shield },
              { id: 'security', label: 'Security & Auth', icon: Key },
            ].map((tab) => {
              const Icon = tab.icon
              const isCurrent = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    isCurrent 
                      ? 'bg-lime-400 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(132,204,22,0.4)]' 
                      : 'text-slate-300 hover:bg-lime-400/10'
                  }`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              )
            })}
          </div>

          {/* Right Content View */}
          <div className="md:col-span-3 p-6 md:p-8 space-y-6">
            
            {activeTab === 'account' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-poppins font-bold text-base border-b border-slate-500/30 pb-2" style={{ color: 'var(--text-primary)' }}>
                  User Profile Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold block" style={{ color: 'var(--text-primary)' }}>Full Legal / Display Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jane Doe" 
                      className="w-full p-2.5 vision-pro-pill border-lime-400/30 text-slate-100 focus:outline-none auth-input-glow text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold block" style={{ color: 'var(--text-primary)' }}>Registered Email Address</label>
                    <input 
                      type="email" 
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="jane@taxshield.ai" 
                      className="w-full p-2.5 vision-pro-pill border-lime-400/30 text-slate-100 focus:outline-none auth-input-glow text-xs"
                    />
                  </div>
                </div>

                <Button variant="primary" size="sm" onClick={handleSave} className="mt-2 font-bold">
                  {saved ? <Check size={14} /> : null} {saved ? 'Profile Updated!' : 'Update Profile'}
                </Button>
              </div>
            )}

            {activeTab === 'how-it-works' && (
              <div className="space-y-6 text-xs animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-500/30 pb-3">
                  <div>
                    <h3 className="font-poppins font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <HelpCircle size={18} className="text-lime-400" /> How TaxShield Works
                    </h3>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      Multi-category receipt OCR, deterministic GST tariff auditing, and automated consumer legal rights.
                    </p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => navigate('/scan')}
                    className="font-bold shrink-0 shadow-[0_0_15px_rgba(132,204,22,0.3)]"
                  >
                    <Receipt size={14} /> Scan a Bill Now
                  </Button>
                </div>

                {/* 4 Pipeline Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      step: '01',
                      title: 'Upload Any Bill',
                      icon: Receipt,
                      desc: 'Scan offline paper receipts or upload digital invoices from restaurants, supermarkets, fashion stores, pharmacies, or electronics.',
                      badge: 'JPG, PNG, PDF'
                    },
                    {
                      step: '02',
                      title: 'AI OCR Extraction',
                      icon: Zap,
                      desc: 'TaxShield Vision extracts item names, unit prices, HSN codes, printed GST rates, and service fees with high character fidelity.',
                      badge: 'Multimodal AI'
                    },
                    {
                      step: '03',
                      title: 'Deterministic GST Audit',
                      icon: Scale,
                      desc: 'Our deterministic tax engine cross-references items against Indian GST tariff schedules and flags illegal overcharges or wrong brackets.',
                      badge: 'Zero Hallucinations'
                    },
                    {
                      step: '04',
                      title: 'Tax Verdict & Refund Notice',
                      icon: Shield,
                      desc: 'Get an instant Tax Health Score, potential refund amounts, and generate 1-click legal dispute drafts under CCPA guidelines.',
                      badge: 'Consumer Protection'
                    }
                  ].map((s) => {
                    const Icon = s.icon
                    return (
                      <div key={s.step} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 hover:border-lime-400/40 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-lime-400">{s.step}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30">
                            {s.badge}
                          </span>
                        </div>
                        <h4 className="font-poppins font-bold text-sm flex items-center gap-1.5 text-white">
                          <Icon size={15} className="text-lime-400" /> {s.title}
                        </h4>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {s.desc}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Supported Shopping Categories */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-500/30 space-y-3">
                  <h4 className="font-poppins font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sparkles size={14} className="text-lime-400" /> Supported Retail & Spending Categories
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {[
                      { emoji: '🍽️', title: 'Restaurant / Food Delivery', rate: '5% Standard GST (No ITC)', tip: 'Flags voluntary 10% service charges under CCPA order.' },
                      { emoji: '🛒', title: 'Supermarket / Grocery', rate: '0% / 5% / 12% / 18%', tip: 'D-Mart, Big Bazaar staples at 0%, packaged food 5%.' },
                      { emoji: '👗', title: 'Fashion & Lifestyle', rate: '5% for ≤₹1,000 | 12% >₹1k', tip: 'Zudio & H&M garments under ₹1,000 strictly capped at 5%.' },
                      { emoji: '📱', title: 'Electronics & Appliances', rate: '18% Standard GST', tip: 'Croma, Vijay Sales validated with HSN codes & ITC readiness.' },
                      { emoji: '💊', title: 'Pharmacy & Health', rate: '5% Critical / 12% Standard', tip: 'Life-saving drugs at 5%, formulations at 12%.' }
                    ].map((cat) => (
                      <div key={cat.title} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{cat.emoji}</span> {cat.title}
                        </div>
                        <div className="text-[10px] font-mono text-lime-400 font-semibold">{cat.rate}</div>
                        <div className="text-[10px] text-slate-400 leading-snug">{cat.tip}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Frequently Asked Questions Accordion */}
                <div className="space-y-2">
                  <h4 className="font-poppins font-bold text-xs text-slate-300 uppercase tracking-wider">
                    Frequently Asked Questions
                  </h4>
                  {[
                    {
                      q: 'How does TaxShield analyze my bills without errors?',
                      a: 'TaxShield uses a dual-engine architecture: an AI vision OCR model extracts the raw bill data verbatim without math calculation, and a deterministic code-based tax engine validates numbers against the official Indian GST tariff schedules.'
                    },
                    {
                      q: 'Can I claim back service charges charged by restaurants?',
                      a: 'Yes! Under CCPA guidelines (July 4, 2022), service charges in hotels and restaurants are strictly voluntary. TaxShield detects them automatically and provides a 1-click drafted Demand for Refund notice to send to management.'
                    },
                    {
                      q: 'How does TaxShield verify clothes bought at Zudio or H&M?',
                      a: 'Under Notification No. 14/2021-CT(Rate), apparel items priced up to ₹1,000 per piece attract strictly 5% GST. Items exceeding ₹1,000 attract 12% GST. TaxShield evaluates item-level prices to ensure budget clothing is not taxed at the higher bracket.'
                    }
                  ].map((faq, idx) => (
                    <div 
                      key={idx} 
                      className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full p-3 text-left font-semibold text-xs flex items-center justify-between text-white hover:text-lime-300 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {openFaq === idx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {openFaq === idx && (
                        <div className="p-3 pt-0 text-[11px] leading-relaxed text-slate-300 border-t border-white/5 bg-black/20">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai-llm' && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="font-poppins font-bold text-base border-b border-slate-500/30 pb-2" style={{ color: 'var(--text-primary)' }}>
                    Active AI Model & Processing Engine
                  </h3>
                  <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                    Choose the Large Language Model that processes invoices and audit calculations.
                  </p>
                </div>

                {/* Engine Selector Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLlmProvider('custom')}
                    className={`p-4 vision-pro-pill text-left transition-all space-y-2 cursor-pointer ${
                      llmProvider === 'custom' 
                        ? 'border-lime-400 bg-lime-400/15 shadow-[0_0_20px_rgba(132,204,22,0.3)]' 
                        : 'border-slate-500/30 hover:border-lime-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>TaxShield AI (Fine-Tuned 1B Local)</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">100% Private</span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Specialized 1B parameter QLoRA fine-tuned model running locally in Ollama. Ultra-fast, zero costs, 100% private.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLlmProvider('gemini')}
                    className={`p-4 vision-pro-pill text-left transition-all space-y-2 cursor-pointer ${
                      llmProvider === 'gemini' 
                        ? 'border-lime-400 bg-lime-400/15 shadow-[0_0_20px_rgba(132,204,22,0.3)]' 
                        : 'border-slate-500/30 hover:border-lime-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Google Gemini</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">Cloud Free</span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Gemini 2.0 Flash cloud model with high-speed multimodal extraction.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLlmProvider('nemotron')}
                    className={`p-4 vision-pro-pill text-left transition-all space-y-2 cursor-pointer ${
                      llmProvider === 'nemotron' 
                        ? 'border-lime-400 bg-lime-400/15 shadow-[0_0_20px_rgba(132,204,22,0.3)]' 
                        : 'border-slate-500/30 hover:border-lime-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>NVIDIA Nemotron</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-lime-400/20 text-lime-400 px-1.5 py-0.5 rounded">Ultra 70B/550B</span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>NVIDIA Nemotron cloud API for deep legal & compliance reasoning.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLlmProvider('claude')}
                    className={`p-4 vision-pro-pill text-left transition-all space-y-2 cursor-pointer ${
                      llmProvider === 'claude' 
                        ? 'border-lime-400 bg-lime-400/15 shadow-[0_0_20px_rgba(132,204,22,0.3)]' 
                        : 'border-slate-500/30 hover:border-lime-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Anthropic Claude</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Paid API</span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Claude 3.5 Haiku / Sonnet API for maximum reasoning accuracy.</p>
                  </button>
                </div>

                {/* Custom GPU Endpoint Form */}
                {llmProvider === 'custom' && (
                  <div className="vision-pro-pill p-4 space-y-3.5 border-lime-400/30">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                        <Activity size={15} className="text-lime-400" /> Local Ollama Server & Model Configuration
                      </h4>
                      <button
                        type="button"
                        onClick={runGpuHealthCheck}
                        disabled={gpuHealth.checking}
                        className="text-[11px] text-lime-400 font-semibold flex items-center gap-1 hover:underline disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw size={12} className={gpuHealth.checking ? "animate-spin" : ""} /> Check Status
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>Ollama REST Endpoint</label>
                        <input
                          type="text"
                          value={customEndpoint}
                          onChange={(e) => setCustomEndpoint(e.target.value)}
                          placeholder="http://localhost:11434/v1"
                          className="w-full p-2.5 vision-pro-pill border-lime-400/30 text-slate-100 font-mono text-xs focus:outline-none auth-input-glow"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>Model Tag / Name</label>
                        <input
                          type="text"
                          value={customModel}
                          onChange={(e) => setCustomModel(e.target.value)}
                          placeholder="llama3:8b"
                          className="w-full p-2.5 vision-pro-pill border-lime-400/30 text-slate-100 font-mono text-xs focus:outline-none auth-input-glow"
                        />
                      </div>
                    </div>

                    {/* Quick Model Selector Presets */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-semibold block" style={{ color: 'var(--text-muted)' }}>
                        Quick Select Model Preset:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { tag: 'llama3.2:1b', label: 'llama3.2:1b (1B)', note: '1B Ultra-Fast' },
                          { tag: 'taxshield-1b', label: 'taxshield-1b (1B)', note: 'Fine-Tuned SOTA' },
                          { tag: 'llama3:8b', label: 'llama3:8b (8B)', note: '8B Standard' },
                          { tag: 'llama3.1:8b', label: 'llama3.1:8b (8B)', note: 'Latest Llama' },
                          { tag: 'qwen2.5:14b', label: 'qwen2.5:14b (14B)', note: 'High Precision' },
                          { tag: 'qwen2.5:7b', label: 'qwen2.5:7b (7B)', note: 'Balanced' },
                          { tag: 'mistral:7b', label: 'mistral:7b (7B)', note: 'Standard' },
                        ].map((m) => (
                          <button
                            key={m.tag}
                            type="button"
                            onClick={() => setCustomModel(m.tag)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                              customModel === m.tag
                                ? 'bg-lime-400/25 border-lime-400 text-lime-300 font-bold shadow-[0_0_10px_rgba(132,204,22,0.3)]'
                                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-lime-400/50'
                            }`}
                          >
                            <span>{m.tag}</span>
                            <span className="text-[9px] opacity-70">({m.note})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Detected Ollama Models if online */}
                    {gpuHealth.online && gpuHealth.models && gpuHealth.models.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-semibold block text-emerald-400">
                          Detected Installed Models in Ollama:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {gpuHealth.models.map((installedModel) => (
                            <button
                              key={installedModel}
                              type="button"
                              onClick={() => setCustomModel(installedModel)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
                                customModel === installedModel
                                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold'
                                  : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200 hover:border-emerald-400'
                              }`}
                            >
                              ⚡ {installedModel}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Health Status Indicator */}
                    {gpuHealth.checked && (
                      <div className={`p-3 rounded-xl border flex items-center gap-2 font-medium ${
                        gpuHealth.online 
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' 
                          : 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                      }`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${gpuHealth.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                        <span>
                          {gpuHealth.online 
                            ? `Ollama Server Online! Active model: ${customModel} (${gpuHealth.models.length} installed model(s) detected).`
                            : `Ollama server not detected at ${customEndpoint}. Please run 'ollama run ${customModel}' in your terminal.`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Button variant="primary" size="sm" onClick={handleSave} className="mt-2 font-bold">
                  {saved ? <Check size={14} /> : null} {saved ? 'Settings Saved!' : 'Save AI Configuration'}
                </Button>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-poppins font-bold text-base border-b border-slate-500/30 pb-2" style={{ color: 'var(--text-primary)' }}>
                  Theme & Appearance Options
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Select your preferred color theme or automatically adjust based on your device system settings.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  
                  {/* Dark Mode */}
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`p-5 vision-pro-pill text-center font-bold space-y-3 transition-all cursor-pointer ${
                      themeMode === 'dark'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_0_25px_rgba(212,175,55,0.3)] text-[#FDE68A]'
                        : 'border-slate-500/30 hover:border-[#D4AF37]/40 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 text-[#FDE68A] flex items-center justify-center mx-auto border border-[#D4AF37]/40 shadow-inner">
                      <Moon size={22} className="fill-[#FDE68A]/30" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold">Dark Mode</span>
                      <span className="text-[11px] font-normal block mt-1 text-slate-400">Imperial Obsidian & Champagne Gold</span>
                    </div>
                  </button>

                  {/* Light Mode */}
                  <button 
                    onClick={() => setTheme('light')}
                    className={`p-5 vision-pro-pill text-center font-bold space-y-3 transition-all cursor-pointer ${
                      themeMode === 'light'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-[0_0_25px_rgba(212,175,55,0.3)] text-[#FDE68A]'
                        : 'border-slate-500/30 hover:border-[#D4AF37]/40 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-400/40 shadow-inner">
                      <Sun size={22} className="fill-amber-300/30" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold">Light Mode</span>
                      <span className="text-[11px] font-normal block mt-1 text-slate-400">Platinum Pearl & Warm Gold</span>
                    </div>
                  </button>

                  {/* System Default Option */}
                  <button 
                    onClick={() => setTheme('system')}
                    className={`p-5 vision-pro-pill text-center font-bold space-y-3 transition-all cursor-pointer ${
                      themeMode === 'system'
                        ? 'border-[#38BDF8] bg-[#38BDF8]/15 shadow-[0_0_25px_rgba(56,189,248,0.3)] text-[#38BDF8]'
                        : 'border-slate-500/30 hover:border-[#38BDF8]/40 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center mx-auto border border-sky-400/40 shadow-inner">
                      <Laptop size={22} />
                    </div>
                    <div>
                      <span className="block text-sm font-bold">System Default</span>
                      <span className="text-[11px] font-normal block mt-1 text-slate-400">Sync with Operating System</span>
                    </div>
                  </button>

                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-poppins font-bold text-base border-b border-slate-500/30 pb-2" style={{ color: 'var(--text-primary)' }}>
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 vision-pro-pill border-lime-400/20">
                    <div>
                      <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Analysis Completion Alerts</span>
                      <span style={{ color: 'var(--text-muted)' }}>Notify when bill OCR & tax rules finish processing</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-lime-400 accent-lime-400" />
                  </label>
                  <label className="flex items-center justify-between p-3.5 vision-pro-pill border-lime-400/20">
                    <div>
                      <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Potential Overcharge Alerts</span>
                      <span style={{ color: 'var(--text-muted)' }}>Instant alert when a service fee or tax mismatch is flagged</span>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-lime-400 accent-lime-400" />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-poppins font-bold text-base border-b border-slate-500/30 pb-2" style={{ color: 'var(--text-primary)' }}>
                  Privacy & Data Management
                </h3>
                <div className="space-y-3">
                  <div className="p-4 vision-pro-pill border-lime-400/20 flex items-center justify-between">
                    <div>
                      <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>Export History Data</span>
                      <span style={{ color: 'var(--text-muted)' }}>Download your full bill receipts & tax breakdown log in CSV format</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleExportCsv}>
                      <Download size={14} /> {exportMsg || 'Export CSV'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4 text-xs">
                <h3 className="font-poppins font-bold text-base border-b border-slate-500/30 pb-2" style={{ color: 'var(--text-primary)' }}>
                  Security Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full p-2.5 vision-pro-pill border-lime-400/30 text-slate-100 focus:outline-none auth-input-glow"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full p-2.5 vision-pro-pill border-lime-400/30 text-slate-100 focus:outline-none auth-input-glow"
                    />
                  </div>
                  {pwError && <p className="text-rose-400 text-[11px] font-semibold">{pwError}</p>}
                  {pwMsg && <p className="text-emerald-400 text-[11px] font-semibold">{pwMsg}</p>}
                  <Button variant="primary" size="sm" onClick={handleChangePassword}>Update Password</Button>
                  <p style={{ color: 'var(--text-muted)' }}>Google sign-in accounts manage passwords via Google. Signed-out users can use “Forgot password” on the login page.</p>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
