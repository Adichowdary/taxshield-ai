/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    return { themeMode: 'dark', activeTheme: 'dark', setTheme: () => {} }
  }
  return context
}


export function ThemeProvider({ children }) {
  // Theme option: strictly 'dark' | 'light' | 'system'
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('taxshield_theme_mode')
      if (saved && ['dark', 'light', 'system'].includes(saved)) return saved
    }
    return 'dark' // Luxury default
  })

  const [activeTheme, setActiveTheme] = useState('dark')

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (mode) => {
      let resolved = mode
      if (mode === 'system') {
        const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        resolved = isSystemDark ? 'dark' : 'light'
      }

      setActiveTheme(resolved)

      // Clean up previous theme classes
      root.classList.remove('dark', 'light', 'theme-dark', 'theme-night', 'theme-light')

      if (resolved === 'dark') {
        root.classList.add('dark', 'theme-dark')
      } else {
        root.classList.add('light', 'theme-light')
      }
    }

    applyTheme(themeMode)

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('taxshield_theme_mode', themeMode)
    }

    // Listen for system theme changes if mode is 'system'
    if (themeMode === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [themeMode])

  const setTheme = (mode) => {
    if (['dark', 'light', 'system'].includes(mode)) {
      setThemeMode(mode)
    }
  }

  return (
    <ThemeContext.Provider value={{ themeMode, activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
