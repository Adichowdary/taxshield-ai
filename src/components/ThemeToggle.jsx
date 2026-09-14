import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Laptop } from 'lucide-react'

const modes = [
  { key: 'light', icon: Sun, label: 'Light' },
  { key: 'dark', icon: Moon, label: 'Dark' },
  { key: 'system', icon: Laptop, label: 'System' },
]

export default function ThemeToggle({ className = '' }) {
  const { themeMode, setTheme } = useTheme()

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] px-1.5 py-1 ${className}`}
      role="radiogroup"
      aria-label="Color theme"
    >
      {modes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          role="radio"
          aria-checked={themeMode === key}
          aria-label={`${label} theme`}
          title={`${label} mode`}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)] ${
            themeMode === key
              ? 'bg-sky-500/15 text-sky-600 dark:bg-[#D4AF37]/20 dark:text-[#FDE68A] font-bold shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
