import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const MotionLink = motion(Link)
const MotionButton = motion.button

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  className = '',
  disabled = false,
  whileHover = { scale: 1.03, y: -2 },
  whileTap = { scale: 0.97 },
  ...props
}) {
  const baseStyles = 'font-poppins font-semibold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2'

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs min-h-[38px]',
    md: 'px-5 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  }

  const variantStyles = {
    primary: 'auth-cta font-bold text-white dark:text-slate-950',
    secondary: 'vault-glass text-slate-900 dark:text-white hover:border-sky-500/50 dark:hover:border-[#D4AF37]/50 hover:bg-black/5 dark:hover:bg-white/10',
    outline: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-sky-700 dark:text-[#FDE68A] border border-sky-500/50 dark:border-[#D4AF37]/50',
    ghost: 'text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-[#FDE68A] hover:bg-black/5 dark:hover:bg-white/5',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30',
  }

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'} ${className}`

  const motionProps = { whileHover: disabled ? {} : whileHover, whileTap: disabled ? {} : whileTap, transition: { type: 'spring', stiffness: 300, damping: 15 } }

  if (to) {
    return (
      <MotionLink to={to} className={combinedClasses} {...motionProps} {...props}>
        {children}
      </MotionLink>
    )
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={combinedClasses} {...props}>
        {children}
      </a>
    )
  }

  return (
    <MotionButton
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
      {...props}
    >
      {children}
    </MotionButton>
  )
}