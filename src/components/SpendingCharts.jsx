import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { useTheme } from '../context/ThemeContext'

const COLORS = ['#D4AF37', '#38BDF8', '#10B981', '#A855F7', '#F43F5E']

/**
 * TaxShield Spending & Tax Trend Area Chart (Imperial Obsidian & Gold Theme)
 */
export function SpendingTrendAreaChart({ data = [] }) {
  const { activeTheme } = useTheme()
  
  const sampleTrend = [
    { month: 'Mar', spending: 3400, tax: 170, fees: 120 },
    { month: 'Apr', spending: 4200, tax: 210, fees: 180 },
    { month: 'May', spending: 3800, tax: 190, fees: 140 },
    { month: 'Jun', spending: 5100, tax: 255, fees: 210 },
    { month: 'Jul', spending: 4900, tax: 245, fees: 190 },
    { month: 'Aug', spending: 5600, tax: 280, fees: 230 }
  ]

  const chartData = data.length > 0 ? data : sampleTrend
  const isDark = activeTheme === 'dark'

  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="spendingVisionGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.5}/>
              <stop offset="50%" stopColor="#D4AF37" stopOpacity={0.15}/>
              <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="taxVisionGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="feesVisionGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.1)"} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(5, 8, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
              borderColor: isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(203, 213, 225, 0.9)', 
              borderRadius: '16px', 
              color: isDark ? '#fff' : '#0f172a', 
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
            }}
            formatter={(val) => [`₹${val}`, '']}
          />
          <Area 
            type="monotone" 
            dataKey="spending" 
            name="Total Spend" 
            stroke="#D4AF37" 
            fillOpacity={1} 
            fill="url(#spendingVisionGlow)" 
            strokeWidth={3.5}
            isAnimationActive={true}
            animationDuration={800}
            activeDot={{ r: 7, fill: '#FDE68A', stroke: '#050811', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="tax" 
            name="GST Paid" 
            stroke="#38BDF8" 
            fillOpacity={1} 
            fill="url(#taxVisionGlow)" 
            strokeWidth={2.5} 
            isAnimationActive={true}
            animationDuration={800}
          />
          <Area 
            type="monotone" 
            dataKey="fees" 
            name="Service Fees" 
            stroke="#F43F5E" 
            fillOpacity={1} 
            fill="url(#feesVisionGlow)" 
            strokeWidth={2} 
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * TaxShield Platform Spend Comparison Bar Chart (Swiggy vs Zomato vs Dineout vs Direct)
 */
export function PlatformBarChart({ data = [] }) {
  const { activeTheme } = useTheme()

  const samplePlatforms = [
    { platform: 'Swiggy', spend: 4850 },
    { platform: 'Zomato', spend: 3900 },
    { platform: 'Dineout', spend: 1600 },
    { platform: 'Direct Dining', spend: 2100 }
  ]

  const chartData = data.length > 0 ? data : samplePlatforms
  const isDark = activeTheme === 'dark'

  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="platformVisionBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37"/>
              <stop offset="60%" stopColor="#F59E0B"/>
              <stop offset="100%" stopColor="#78350F"/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.1)"} vertical={false} />
          <XAxis dataKey="platform" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(5, 8, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
              borderColor: isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(203, 213, 225, 0.9)', 
              borderRadius: '16px', 
              color: isDark ? '#fff' : '#0f172a', 
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
            }}
            formatter={(val) => [`₹${val}`, 'Spend']}
          />
          <Bar dataKey="spend" fill="url(#platformVisionBar)" radius={[12, 12, 0, 0]} barSize={36} isAnimationActive={true} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * TaxShield Food Category Mix Donut Chart (VisionPro Ring)
 */
export function CategoryDonutChart({ data = [] }) {
  const { activeTheme } = useTheme()

  const sampleCategory = [
    { name: 'Biryani & Main Course', value: 4800 },
    { name: 'Starters & Tandoor', value: 3400 },
    { name: 'Beverages & Drinks', value: 2450 },
    { name: 'Desserts & Sweets', value: 1800 }
  ]

  const chartData = data.length > 0 ? data : sampleCategory
  const isDark = activeTheme === 'dark'

  return (
    <div className="h-72 w-full pt-2 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="42%"
            innerRadius={60}
            outerRadius={88}
            paddingAngle={6}
            dataKey="value"
            isAnimationActive={true}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke={isDark ? "rgba(5, 8, 17, 0.9)" : "#ffffff"} 
                strokeWidth={3} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(5, 8, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
              borderColor: isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(203, 213, 225, 0.9)', 
              borderRadius: '16px', 
              color: isDark ? '#fff' : '#0f172a', 
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(20px)'
            }}
            formatter={(val) => [`₹${val}`, 'Total']}
          />
          <Legend 
            formatter={(value) => <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{value}</span>} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * 3D Isometric Segmented Donut Widget for Tree Breakdown
 */
export function VisionPro3DDonutWidget({ onExplore }) {
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'

  const data = [
    { name: 'Food Spend', value: 50, color: '#D4AF37' },
    { name: 'GST Legal Tax', value: 25, color: '#38BDF8' },
    { name: 'Service Fees', value: 25, color: '#F43F5E' }
  ]

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <div className="w-36 h-36 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={58}
              paddingAngle={5}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              isAnimationActive={true}
              animationDuration={800}
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} stroke={isDark ? "rgba(5, 8, 17, 0.9)" : "#ffffff"} strokeWidth={3} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tree</span>
          <span className={`text-sm font-bold font-mono ${isDark ? 'text-[#FDE68A]' : 'text-slate-900'}`}>100%</span>
        </div>
      </div>

      {onExplore && (
        <button
          onClick={onExplore}
          className="mt-2 w-full py-2 px-3 bg-gradient-to-r from-[#D4AF37] to-[#FDE68A] hover:brightness-110 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-1.5"
        >
          Explore Tree details →
        </button>
      )}
    </div>
  )
}

/**
 * TaxShield Retailer Breakdown Bar Chart (D-Mart, Zudio, Croma, Apollo, Dining)
 */
export function RetailerBarChart({ data = [] }) {
  const { activeTheme } = useTheme()
  const isDark = activeTheme === 'dark'

  const sampleRetailers = [
    { retailer: 'Croma', spend: 4118 },
    { retailer: 'D-Mart', spend: 2480 },
    { retailer: 'Dining', spend: 2330 },
    { retailer: 'Zudio', spend: 1888 },
    { retailer: 'Swiggy', spend: 1450 },
    { retailer: 'Apollo', spend: 683 }
  ]

  const chartData = data.length > 0 ? data : sampleRetailers

  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 35, bottom: 0 }}>
          <defs>
            <linearGradient id="retailerVisionBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4AF37"/>
              <stop offset="100%" stopColor="#38BDF8"/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.1)"} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="retailer" type="category" tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(5, 8, 17, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
              borderColor: isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(203, 213, 225, 0.9)', 
              borderRadius: '16px', 
              color: isDark ? '#fff' : '#0f172a', 
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
            }}
            formatter={(val) => [`₹${val}`, 'Spend']}
          />
          <Bar dataKey="spend" fill="url(#retailerVisionBar)" radius={[0, 10, 10, 0]} barSize={20} isAnimationActive={true} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
