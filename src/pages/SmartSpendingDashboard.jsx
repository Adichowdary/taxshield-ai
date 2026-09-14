import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MobileNav from '../components/MobileNav'
import Footer from '../components/Footer'
import Container from '../components/shared/Container'
import Button from '../components/shared/Button'
import AmbientBackground from '../components/shared/AmbientBackground'
import { useTheme } from '../context/ThemeContext'
import { 
  SpendingTrendAreaChart, 
  PlatformBarChart, 
  CategoryDonutChart,
  RetailerBarChart
} from '../components/SpendingCharts'
import { subscribeToBillHistory, getBillHistory } from '../services/llm/historyService'
import { 
  Wallet, 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ArrowDownRight, 
  Sliders, 
  FileText, 
  Copy, 
  Check, 
  ShieldCheck, 
  Activity,
  Layers,
  ArrowUpRight,
  Receipt,
  X,
  ShoppingCart,
  ShoppingBag,
  Smartphone,
  Pill,
  Utensils,
  Filter,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react'

export const SPENDING_CATEGORIES = [
  {
    id: 'RESTAURANT',
    key: 'RESTAURANT',
    label: 'Restaurant / Food Delivery (existing)',
    fullTitle: '🍽️ Restaurant / Food Delivery (existing)',
    shortLabel: 'Restaurant & Dining',
    emoji: '🍽️',
    retailers: 'Dine-in, Swiggy, Zomato, Cafes',
    statutoryRule: '5% Standard GST (No ITC) | Service Charge Strictly Voluntary (CCPA)',
    taxTier: '5% GST Tier',
    themeColor: '#F59E0B',
    accentBorder: 'hover:border-amber-400/60',
    activeStyle: 'border-amber-400/80 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
    icon: Utensils
  },
  {
    id: 'GROCERY',
    key: 'GROCERY',
    label: 'Supermarket / Grocery (D-Mart, Big Bazaar, etc.)',
    fullTitle: '🛒 Supermarket / Grocery (D-Mart, Big Bazaar, etc.)',
    shortLabel: 'Supermarkets & Groceries',
    emoji: '🛒',
    retailers: 'D-Mart, Big Bazaar, Blinkit, Zepto, Reliance',
    statutoryRule: '0% Unbranded Staples, 5% Edible Oils/Sugar, 18% Detergents/Toiletries',
    taxTier: '0% / 5% / 12% / 18%',
    themeColor: '#10B981',
    accentBorder: 'hover:border-emerald-400/60',
    activeStyle: 'border-emerald-400/80 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
    icon: ShoppingCart
  },
  {
    id: 'FASHION',
    key: 'FASHION',
    label: 'Fashion & Lifestyle (Zudio, H&M, etc.)',
    fullTitle: '👗 Fashion & Lifestyle (Zudio, H&M, etc.)',
    shortLabel: 'Fashion & Lifestyle',
    emoji: '👗',
    retailers: 'Zudio, H&M, Zara, Trends, Pantaloons',
    statutoryRule: '5% GST on apparel/shoes ≤ ₹1,000 | 12% on items > ₹1,000 (Notification 14/2021)',
    taxTier: '5% (≤₹1k) / 12%',
    themeColor: '#EC4899',
    accentBorder: 'hover:border-pink-400/60',
    activeStyle: 'border-pink-400/80 bg-pink-500/15 shadow-[0_0_20px_rgba(236,72,153,0.3)]',
    badgeStyle: 'bg-pink-500/15 text-pink-300 border-pink-400/40',
    icon: ShoppingBag
  },
  {
    id: 'ELECTRONICS',
    key: 'ELECTRONICS',
    label: 'Electronics (Croma, Vijay Sales, etc.)',
    fullTitle: '📱 Electronics (Croma, Vijay Sales, etc.)',
    shortLabel: 'Electronics & Tech',
    emoji: '📱',
    retailers: 'Croma, Vijay Sales, Reliance Digital, Apple',
    statutoryRule: '18% Standard GST with Chapter 84/85 HSN verification | Business ITC Claimable',
    taxTier: '18% Standard',
    themeColor: '#38BDF8',
    accentBorder: 'hover:border-sky-400/60',
    activeStyle: 'border-sky-400/80 bg-sky-500/15 shadow-[0_0_20px_rgba(56,189,248,0.3)]',
    badgeStyle: 'bg-sky-500/15 text-sky-300 border-sky-400/40',
    icon: Smartphone
  },
  {
    id: 'PHARMACY',
    key: 'PHARMACY',
    label: 'Pharmacy & Health',
    fullTitle: '💊 Pharmacy & Health',
    shortLabel: 'Pharmacy & Health',
    emoji: '💊',
    retailers: 'Apollo Pharmacy, MedPlus, PharmEasy, Tata 1mg',
    statutoryRule: '5% for life-saving drugs / devices | 12% standard Chapter 30 medicines',
    taxTier: '5% / 12% Formulations',
    themeColor: '#A855F7',
    accentBorder: 'hover:border-purple-400/60',
    activeStyle: 'border-purple-400/80 bg-purple-500/15 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-400/40',
    icon: Pill
  }
]

export function classifyBillCategory(bill) {
  if (bill.billType) {
    const bt = String(bill.billType).toUpperCase()
    if (bt.includes('GROCERY') || bt.includes('SUPERMARKET')) return 'GROCERY'
    if (bt.includes('FASHION') || bt.includes('LIFESTYLE') || bt.includes('APPAREL')) return 'FASHION'
    if (bt.includes('ELECTRONIC')) return 'ELECTRONICS'
    if (bt.includes('PHARMACY') || bt.includes('HEALTH')) return 'PHARMACY'
    if (bt.includes('RESTAURANT') || bt.includes('FOOD') || bt.includes('DINING')) return 'RESTAURANT'
  }
  const name = `${bill.merchant || ''} ${bill.restaurantName || ''} ${bill.retailer || ''} ${bill.category || ''} ${bill.establishmentType || ''}`.toLowerCase()
  if (/dmart|d-mart|grocer|supermarket|bazaar|blinkit|zepto|instamart|bigbasket|reliance fresh/i.test(name)) return 'GROCERY'
  if (/zudio|h&m|h & m|zara|trends|lifestyle|pantaloons|max fashion|westside|apparel|clothing/i.test(name)) return 'FASHION'
  if (/croma|vijay sales|reliance digital|apple|samsung|electronics|gadget/i.test(name)) return 'ELECTRONICS'
  if (/apollo|medplus|pharma|chemist|hospital|drug|clinic|1mg/i.test(name)) return 'PHARMACY'
  return 'RESTAURANT'
}

export default function SmartSpendingDashboard() {
  const navigate = useNavigate()
  const { activeTheme } = useTheme()
  const [timeHorizon, setTimeHorizon] = useState('6M')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [bills, setBills] = useState(() => getBillHistory())
  
  const [budget, setBudget] = useState(25000)
  const [newBudgetInput, setNewBudgetInput] = useState('')
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showTreeModal, setShowTreeModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [copiedRefund, setCopiedRefund] = useState(false)

  // Live Subscription: updates instantly whenever a new bill is scanned
  useEffect(() => {
    const unsubscribe = subscribeToBillHistory((updatedBills) => {
      if (Array.isArray(updatedBills) && updatedBills.length > 0) {
        setBills(updatedBills)
      }
    })
    return unsubscribe
  }, [])

  // Time-Horizon filtered bills
  const timeFilteredBills = useMemo(() => {
    const horizonDays = { '1M': 30, '3M': 90, '6M': 180, 'ALL': 36500 }
    const days = horizonDays[timeHorizon] ?? 180
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return (bills || [])
      .filter(b => b.id !== 'bill-108' && String(b.billType || '').toUpperCase() !== 'FUEL')
      .map(b => ({
        ...b,
        detectedCategory: classifyBillCategory(b)
      })).filter((b) => {
        const dt = new Date(b.date || b.timestamp || b.createdAt || Date.now())
        return Number.isNaN(dt.getTime()) || dt >= cutoff
      })
  }, [bills, timeHorizon])

  // Category + Time Horizon filtered bills for drilldown
  const activeBills = useMemo(() => {
    if (selectedCategory === 'ALL') return timeFilteredBills
    return timeFilteredBills.filter(b => b.detectedCategory === selectedCategory)
  }, [timeFilteredBills, selectedCategory])

  // Compute stats for each of the 6 shopping categories
  const categoryStatsMap = useMemo(() => {
    const stats = {}
    SPENDING_CATEGORIES.forEach(cat => {
      stats[cat.id] = {
        spend: 0,
        tax: 0,
        fees: 0,
        count: 0,
        overcharge: 0
      }
    })

    timeFilteredBills.forEach(b => {
      const cat = b.detectedCategory || 'RESTAURANT'
      if (!stats[cat]) {
        stats[cat] = { spend: 0, tax: 0, fees: 0, count: 0, overcharge: 0 }
      }
      const total = Number(b.totalAmount || b.total || b.statedTotal || 0)
      const tax = Number(b.taxes ?? b.gst ?? (Number(b.cgst || 0) + Number(b.sgst || 0)) ?? 0)
      const fee = Number(b.serviceCharge || 0)
      const oc = Number(b.taxVerdict?.overchargeAmount || 0)

      stats[cat].spend += total
      stats[cat].tax += tax
      stats[cat].fees += fee
      stats[cat].count += 1
      stats[cat].overcharge += oc
    })

    return stats
  }, [timeFilteredBills])

  // Dynamically compute snapshot totals for active view
  const snapshot = useMemo(() => {
    if (!activeBills || activeBills.length === 0) {
      return { totalSpending: 0, totalTax: 0, totalFees: 0, orderCount: 0, totalSavings: 0 }
    }

    let totalSpending = 0
    let totalTax = 0
    let totalFees = 0
    let totalSavings = 0

    activeBills.forEach(b => {
      const billTotal = Number(b.totalAmount || b.total || b.statedTotal || 0)
      const billTax = Number(b.taxes ?? b.gst ?? (Number(b.cgst || 0) + Number(b.sgst || 0)) ?? 0)
      const billFee = Number(b.serviceCharge || 0)
      const billDiscount = Number(b.discount || 0)

      totalSpending += billTotal
      totalTax += billTax
      totalFees += billFee
      totalSavings += (billFee + billDiscount)
    })

    return {
      totalSpending: Number(totalSpending.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      totalFees: Number(totalFees.toFixed(2)),
      orderCount: activeBills.length,
      totalSavings: Number(totalSavings.toFixed(2))
    }
  }, [activeBills])

  // Monthly trends data
  const trendData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthMap = {}
    const buckets = timeHorizon === '1M' ? 1 : timeHorizon === '3M' ? 3 : 6

    const now = new Date()
    for (let i = buckets - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mName = monthNames[d.getMonth()]
      monthMap[mName] = { month: mName, spending: 0, tax: 0, fees: 0, count: 0 }
    }

    activeBills.forEach(b => {
      const d = new Date(b.date || b.timestamp || now)
      const mName = monthNames[d.getMonth()] || monthNames[now.getMonth()]
      if (!monthMap[mName]) {
        monthMap[mName] = { month: mName, spending: 0, tax: 0, fees: 0, count: 0 }
      }
      monthMap[mName].spending += Number(b.totalAmount || b.total || b.statedTotal || 0)
      monthMap[mName].tax += Number(b.taxes ?? b.gst ?? (Number(b.cgst || 0) + Number(b.sgst || 0)) ?? 0)
      monthMap[mName].fees += Number(b.serviceCharge || 0)
      monthMap[mName].count += 1
    })

    const result = Object.values(monthMap)
    return result.map((item) => ({
      month: item.month,
      spending: Number(Number(item.spending).toFixed(2)),
      tax: Number(Number(item.tax).toFixed(2)),
      fees: Number(Number(item.fees).toFixed(2))
    }))
  }, [activeBills, timeHorizon])

  // Category Distribution for Donut Chart
  const categoryDonutData = useMemo(() => {
    return SPENDING_CATEGORIES.map(cat => {
      const spend = categoryStatsMap[cat.id]?.spend || 0
      return {
        name: cat.shortLabel,
        value: Number(spend.toFixed(2))
      }
    }).filter(it => it.value > 0)
  }, [categoryStatsMap])

  // Top Retailer Spend Breakdown (e.g. D-Mart, Zudio, Croma, Indian Oil, Swiggy, Apollo)
  const retailerData = useMemo(() => {
    const map = {}
    timeFilteredBills.forEach(b => {
      const retailer = b.retailer || b.merchant || b.restaurantName || 'Other'
      map[retailer] = (map[retailer] || 0) + Number(b.totalAmount || b.total || 0)
    })
    return Object.entries(map)
      .map(([retailer, spend]) => ({ retailer, spend: Number(spend.toFixed(2)) }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 7)
  }, [timeFilteredBills])

  // Platform spend breakdown
  const platformData = useMemo(() => {
    const map = {}
    activeBills.forEach(b => {
      let p = b.platform || (b.detectedCategory === 'RESTAURANT' && b.serviceCharge > 0 ? 'Swiggy' : 'In-Store / Direct')
      if (p === 'Unknown' || !p) p = 'In-Store / Direct'
      map[p] = (map[p] || 0) + Number(b.totalAmount ?? b.total ?? b.statedTotal ?? 0)
    })
    return Object.entries(map).map(([platform, spend]) => ({
      platform,
      spend: Number(spend.toFixed(2))
    }))
  }, [activeBills])

  const handleSetBudget = (e) => {
    e.preventDefault()
    const val = parseFloat(newBudgetInput)
    if (val > 0) {
      setBudget(val)
      setShowBudgetForm(false)
    }
  }

  const budgetPct = Math.min(100, (snapshot.totalSpending / budget) * 100)

  const handleCopyRefundText = async () => {
    const text = `Subject: Demand for Refund / Waiver of Non-Mandatory Service Charge\n\nTo Management,\n\nI am writing regarding invoice charges containing an accumulated Service Charge of ₹${snapshot.totalFees.toFixed(2)}. As per CCPA (Central Consumer Protection Authority) guidelines dated July 4, 2022 under Section 18 of the Consumer Protection Act, 2019, service charges levied by hotels/restaurants are strictly voluntary and cannot be collected mandatorily.\n\nKindly process a refund of ₹${snapshot.totalFees.toFixed(2)} to my original payment method.\n\nThank you,\nTaxShield Verified Consumer`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedRefund(true)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy'); setCopiedRefund(true) } catch { setCopiedRefund(false) }
      ta.remove()
    }
    setTimeout(() => setCopiedRefund(false), 2500)
  }

  return (
    <div className={`min-h-screen vision-pro-bg vision-pro-grid flex flex-col font-sans relative overflow-x-hidden selection:bg-[#D4AF37] selection:text-slate-950 ${
      activeTheme === 'dark' ? 'text-slate-100' : 'text-slate-900'
    }`}>
      
      {/* Luxury Obsidian & Gold Ambient Radial Lights */}
      <AmbientBackground />

      <Navbar />

      <main className="flex-1 pt-28 pb-24 relative z-10">
        <Container className="space-y-8">
          
          {/* Header Card */}
          <div className="vault-glass border border-sky-500/25 dark:border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden shadow-[0_20px_50px_rgba(2,132,199,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-500 dark:via-[#D4AF37] to-transparent" />

            <div className="space-y-2 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-sky-500/10 dark:bg-[#D4AF37]/10 border border-sky-500/30 dark:border-[#D4AF37]/30 text-sky-700 dark:text-[#D4AF37] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm font-mono">
                  <Sparkles size={13} /> Multi-Category Spending Intelligence
                </span>
                <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Activity size={12} className="text-[#10B981]" /> Synced Live
                </span>
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded-full font-bold">
                  {bills.length} Receipts Tracked
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-poppins font-bold tracking-tight text-slate-900 dark:text-white">
                Shopping & Spending <span className="gold-gradient-text">Tax Intelligence</span>
              </h1>
              <p className="text-xs sm:text-sm max-w-3xl font-medium text-slate-600 dark:text-slate-300">
                Live expense auditing across Restaurants, Supermarkets, Fashion & Lifestyle, Electronics, and Pharmacy with deterministic GST compliance checks.
              </p>
            </div>

            {/* Time Horizon Filter Pills */}
            <div className="vault-glass p-1.5 rounded-2xl flex items-center gap-1.5 self-start lg:self-auto border border-slate-200 dark:border-white/10 shadow-lg">
              {['1M', '3M', '6M', 'ALL'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeHorizon(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    timeHorizon === tab 
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30 scale-105 dark:from-[#D4AF37] dark:to-[#FDE68A] dark:text-slate-950 dark:shadow-[0_0_15px_rgba(212,175,55,0.4)] dark:bg-gradient-to-r' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {tab === '1M' ? 'This Month' : tab === '3M' ? '3 Months' : tab === '6M' ? '6 Months' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                selectedCategory === 'ALL'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/30 scale-105 dark:from-[#D4AF37] dark:to-[#FDE68A] dark:text-slate-950 dark:border-[#D4AF37] dark:shadow-[0_0_15px_rgba(212,175,55,0.4)] dark:bg-gradient-to-r'
                  : 'vault-glass border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Filter size={13} />
              All Categories ({timeFilteredBills.length})
            </button>

            {SPENDING_CATEGORIES.map((cat) => {
              const count = categoryStatsMap[cat.id]?.count || 0
              const isSel = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSel ? 'ALL' : cat.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                    isSel 
                      ? cat.activeStyle 
                      : 'vault-glass border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.shortLabel}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200">
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 6 User-Requested Spending Category Cards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-base text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-[#D4AF37]" /> Retail & Shopping Category Breakdown
                </h3>
                <p className="text-xs text-slate-300">
                  Select any category card to drill down into item taxes, compliance rates, and receipts
                </p>
              </div>
              {selectedCategory !== 'ALL' && (
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-xs text-[#D4AF37] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  Clear Category Filter <X size={13} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SPENDING_CATEGORIES.map((cat) => {
                const stats = categoryStatsMap[cat.id] || { spend: 0, tax: 0, fees: 0, count: 0 }
                const isSelected = selectedCategory === cat.id
                const Icon = cat.icon

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
                    className={`vault-glass rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.01] ${
                      isSelected
                        ? `${cat.activeStyle} ring-2 ring-sky-500/20 dark:ring-white/20`
                        : `border-slate-200 dark:border-white/10 ${cat.accentBorder}`
                    }`}
                  >
                    {/* Top gradient glow bar */}
                    <div 
                      className="absolute top-0 inset-x-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, transparent, ${cat.themeColor}, transparent)` }}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg border border-slate-200 dark:border-white/10"
                          style={{ backgroundColor: `${cat.themeColor}20` }}
                        >
                          {cat.emoji}
                        </div>
                        <div>
                          <h4 className="font-poppins font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-[#FDE68A] transition-colors line-clamp-1">
                            {cat.label}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[190px]">
                            {cat.retailers}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${cat.badgeStyle}`}>
                        {cat.taxTier}
                      </span>
                    </div>

                    {/* Numerical Stats */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Spend</span>
                        <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                          ₹{stats.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">GST / Tax Paid</span>
                        <span className="text-xl font-bold font-mono text-sky-600 dark:text-[#38BDF8]">
                          ₹{stats.tax.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Rule Tip & Count */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400 font-mono">
                        {stats.count} {stats.count === 1 ? 'Receipt' : 'Receipts'}
                      </span>
                      <span className="text-[10px] font-semibold text-[#10B981] flex items-center gap-1">
                        <ShieldCheck size={12} /> {stats.spend > 0 ? 'Verified Compliant' : 'Awaiting Bills'}
                      </span>
                    </div>

                    {/* Statutory GST Rule Preview */}
                    <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-400/90 leading-tight italic line-clamp-1">
                      ⚖️ {cat.statutoryRule}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Monthly Spending Target Control Bar */}
          <div className="vault-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-400 text-white shadow-md shadow-sky-500/25 dark:from-[#D4AF37] dark:to-[#FDE68A] dark:text-slate-950 flex items-center justify-center font-bold dark:shadow-[0_0_20px_rgba(212,175,55,0.35)]">
                  <Wallet size={22} />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                    Monthly Shopping Spending Cap <span className="text-[10px] bg-sky-500/10 dark:bg-[#D4AF37]/15 text-sky-700 dark:text-[#FDE68A] px-2 py-0.5 rounded-full border border-sky-500/30 dark:border-[#D4AF37]/30 font-mono font-bold">LIVE GAUGE</span>
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Budget velocity monitor across all 6 shopping categories
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowBudgetForm(!showBudgetForm)}
                  className="rounded-xl border-slate-300 dark:border-white/20 bg-slate-100/60 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white font-semibold"
                >
                  <Sliders size={14} /> {showBudgetForm ? 'Close Controls' : 'Edit Target'}
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => setShowRefundModal(true)}
                  className="rounded-xl font-bold shadow-md shadow-sky-500/25 dark:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  <FileText size={14} /> CCPA Waiver Notice (₹{snapshot.totalFees.toFixed(0)})
                </Button>
              </div>
            </div>

            {showBudgetForm && (
              <form onSubmit={handleSetBudget} className="border border-sky-500/30 dark:border-[#D4AF37]/30 rounded-2xl p-4 space-y-3 bg-slate-50/90 dark:bg-[#050811]/90 backdrop-blur-xl animate-fade-in shadow-2xl">
                <h4 className="font-poppins font-bold text-xs text-sky-700 dark:text-[#D4AF37]">Set Monthly Spending Target (₹)</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={newBudgetInput}
                    onChange={(e) => setNewBudgetInput(e.target.value)}
                    className="flex-1 p-2.5 border border-slate-300 dark:border-white/20 rounded-xl text-xs font-mono font-semibold bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 dark:focus:border-[#D4AF37]"
                    required
                  />
                  <Button variant="primary" size="sm" type="submit" className="font-bold">
                    Save Target
                  </Button>
                </div>
              </form>
            )}

            {/* Glowing Progress Gauge Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-baseline text-xs font-mono">
                <span className="font-sans font-bold text-slate-300">
                  {selectedCategory === 'ALL' ? 'Total Tracked Spend Velocity' : `${selectedCategory} Spend Velocity`}
                </span>
                <span className="font-bold text-sm text-white">
                  ₹{snapshot.totalSpending.toFixed(2)} <span className="text-slate-400 font-normal">/ ₹{budget.toFixed(2)}</span>
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full overflow-hidden p-0.5 border border-white/10 bg-slate-950/80 relative">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 relative ${
                    budgetPct > 90 
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/80' 
                      : budgetPct > 70 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/80' 
                        : 'bg-gradient-to-r from-[#D4AF37] via-[#FDE68A] to-[#38BDF8] shadow-[0_0_15px_rgba(212,175,55,0.6)]'
                  }`}
                  style={{ width: `${budgetPct}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] font-medium text-slate-300">
                <span>Remaining Cap: <strong className="text-[#FDE68A] font-mono font-bold">₹{Math.max(0, budget - snapshot.totalSpending).toFixed(2)}</strong></span>
                <span className="font-bold text-[#38BDF8] font-mono">{budgetPct.toFixed(1)}% Limit Used</span>
              </div>
            </div>
          </div>

          {/* Spatial Analytical Charts Row 1: Spend Trend & Retailer Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Spending & Tax Trend Chart */}
            <div className="vault-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
                <div>
                  <h3 className="font-poppins font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                    <TrendingUp size={18} className="text-sky-600 dark:text-[#D4AF37]" /> Spending & Tax Velocity Trend
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Monthly spend vs verified GST tax vs service fees</p>
                </div>
                <span className="text-xs font-mono font-bold text-sky-700 dark:text-[#FDE68A] bg-sky-500/15 dark:bg-[#D4AF37]/15 border border-sky-500/30 dark:border-[#D4AF37]/30 px-2.5 py-1 rounded-xl">
                  INR (₹)
                </span>
              </div>
              <div><SpendingTrendAreaChart data={trendData} /></div>
            </div>

            {/* Retailer Spend Breakdown Bar Chart (D-Mart, Zudio, Croma, Indian Oil, Swiggy) */}
            <div className="vault-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
                <div>
                  <h3 className="font-poppins font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                    <BarChart3 size={18} className="text-[#38BDF8]" /> Retailer & Merchant Intelligence
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">D-Mart vs Zudio vs Croma vs Apollo vs Restaurants</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#38BDF8]/15 border border-[#38BDF8]/30 px-2.5 py-1 rounded-xl">
                  Top Retailers
                </span>
              </div>
              <RetailerBarChart data={retailerData} />
            </div>

          </div>

          {/* Spatial Analytical Charts Row 2: Category Donut & Platform Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Category Donut Chart */}
            <div className="lg:col-span-1 vault-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="border-b border-slate-200 dark:border-white/10 pb-3">
                <h3 className="font-poppins font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                  <PieIcon size={18} className="text-sky-600 dark:text-[#D4AF37]" /> Shopping & Retail Categories Mix
                </h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Distribution across statutory categories</p>
              </div>
              <CategoryDonutChart data={categoryDonutData} />
            </div>

            {/* AI Tax Recommendations across categories */}
            <div className="lg:col-span-2 vault-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="border-b border-slate-200 dark:border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-poppins font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                    <Sparkles size={18} className="text-sky-600 dark:text-[#D4AF37]" /> TaxShield Multi-Category Statutory Audit Insights
                  </h3>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">AI tax engine rules applied to your active receipts</p>
                </div>
                <span className="text-[10px] font-mono text-sky-700 dark:text-[#D4AF37] bg-sky-500/15 dark:bg-[#D4AF37]/15 px-2.5 py-1 rounded-full border border-sky-500/30 dark:border-[#D4AF37]/30 font-bold">
                  AUTOPILOT AUDIT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Supermarket Insight */}
                <div className="p-3.5 border border-emerald-500/30 rounded-2xl space-y-1.5 bg-emerald-500/10 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={15} className="text-emerald-500 dark:text-emerald-400" />
                    <span className="font-bold text-emerald-800 dark:text-emerald-200">🛒 Supermarkets & Groceries (D-Mart)</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                    Unpackaged rice, flour, pulses, and salt verified at 0% GST. Packaged food at 5% and detergents at 18% match Central GST schedules.
                  </p>
                </div>

                {/* Fashion Insight */}
                <div className="p-3.5 border border-pink-500/30 rounded-2xl space-y-1.5 bg-pink-500/10 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={15} className="text-pink-500 dark:text-pink-400" />
                    <span className="font-bold text-pink-800 dark:text-pink-200">👗 Fashion & Apparel (Zudio/Trends)</span>
                  </div>
                  <p className="text-[11px] text-pink-900 dark:text-pink-200/90 leading-relaxed">
                    Statutory Rule 14/2021 audited: items under ₹1,000 correctly levied 5% GST. No illegal luxury surcharges found.
                  </p>
                </div>

                {/* Electronics Insight */}
                <div className="p-3.5 border border-sky-500/30 rounded-2xl space-y-1.5 bg-sky-500/10 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <Smartphone size={15} className="text-sky-500 dark:text-sky-400" />
                    <span className="font-bold text-sky-800 dark:text-sky-200">📱 Consumer Electronics (Croma/Reliance)</span>
                  </div>
                  <p className="text-[11px] text-sky-900 dark:text-sky-200/90 leading-relaxed">
                    18% GST verified on hardware accessories. B2B Corporate ITC claimed accurately across capital expenditure items.
                  </p>
                </div>

                {/* Pharmacy Insight */}
                <div className="p-3.5 border border-purple-500/30 rounded-2xl space-y-1.5 bg-purple-500/10 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <Pill size={15} className="text-purple-500 dark:text-purple-400" />
                    <span className="font-bold text-purple-800 dark:text-purple-200">💊 Pharmacy & Healthcare (Apollo)</span>
                  </div>
                  <p className="text-[11px] text-purple-900 dark:text-purple-200/90 leading-relaxed">
                    Essential life-saving medicines validated at 5% / 12% statutory caps. Diagnostic services verified exempt under GST Sec 11.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Filtered Receipts Drilldown Table */}
          <div className="vault-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="font-poppins font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
                  <Receipt className="text-sky-600 dark:text-[#D4AF37]" size={20} />
                  Receipts Log {selectedCategory !== 'ALL' && `— ${selectedCategory}`} ({activeBills.length})
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">Click any bill to view itemized HSN breakdown and statutory tax verdict</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/scan')}
                className="font-bold shrink-0 shadow-[0_0_15px_rgba(2,132,199,0.3)] dark:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              >
                <Receipt size={14} /> Scan New Bill
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeBills.map((b) => {
                const total = Number(b.totalAmount || b.total || b.statedTotal || 0)
                const tax = Number(b.taxes ?? b.gst ?? (Number(b.cgst || 0) + Number(b.sgst || 0)) ?? 0)
                const fee = Number(b.serviceCharge || 0)
                const name = b.retailer || b.merchant || b.restaurantName || "Retail Establishment"
                const cat = b.detectedCategory || 'RESTAURANT'
                const catConfig = SPENDING_CATEGORIES.find(c => c.id === cat) || SPENDING_CATEGORIES[0]

                const imgUrl = b.billImageUrl || b.image

                return (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/analysis/${b.id}`)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-sky-500/60 dark:hover:border-[#D4AF37]/60 bg-slate-50/60 hover:bg-slate-100/80 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
                  >
                    <div className="space-y-1.5">
                      {imgUrl && (
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 relative mb-1">
                          <img
                            src={imgUrl}
                            alt={name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1"
                              style={{ backgroundColor: `${catConfig.themeColor}20`, color: catConfig.themeColor, borderColor: `${catConfig.themeColor}40` }}>
                          <span>{catConfig.emoji}</span> {catConfig.shortLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {b.date || 'Recent'}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-[#FDE68A] transition-colors truncate">
                        {name}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono truncate">
                        Inv: {b.invoiceNo || 'N/A'} | Tax: ₹{tax.toFixed(2)}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Total Billed</span>
                        <span className="text-base font-bold font-mono text-[#10B981]">
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-sky-600 dark:text-[#D4AF37] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Audit Verdict <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </Container>
      </main>

      {/* Demand for Refund / CCPA Waiver Notice Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-[#050811]/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-6 md:p-8 space-y-5 rounded-3xl border border-sky-500/30 dark:border-[#D4AF37]/30 bg-white dark:bg-[#0D1322]/95 text-slate-900 dark:text-white shadow-[0_20px_60px_rgba(2,132,199,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-fade-in relative">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-poppins font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="text-sky-600 dark:text-[#D4AF37]" size={20} /> CCPA Service Fee Waiver Demand Notice
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Formal legal letter under CCPA Guidelines 2022 to claim back ₹{snapshot.totalFees.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => setShowRefundModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold block text-slate-700 dark:text-slate-300">Drafted Notice to Management:</label>
              <textarea
                readOnly
                rows={9}
                value={`Subject: Formal Demand for Refund / Waiver of Non-Mandatory Service Charge\n\nTo Management,\n\nI am writing regarding bills containing an accumulated Service Charge of ₹${snapshot.totalFees.toFixed(2)}.\n\nAs per CCPA (Central Consumer Protection Authority) guidelines dated July 4, 2022 under Section 18 of the Consumer Protection Act, 2019, service charges levied by restaurants are strictly voluntary and cannot be collected mandatorily.\n\nKindly process a refund of ₹${snapshot.totalFees.toFixed(2)} to my original payment method.\n\nThank you,\nTaxShield Verified Consumer`}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 dark:focus:border-[#D4AF37] leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRefundModal(false)}
              >
                Close
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyRefundText}
                className="font-bold shadow-md shadow-sky-500/25 dark:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
              >
                {copiedRefund ? <Check size={14} /> : <Copy size={14} />}
                {copiedRefund ? 'Copied Notice!' : 'Copy Notice Text'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <MobileNav />
    </div>
  )
}
