export default function SectionHeader({ 
  eyebrow, 
  title, 
  description, 
  align = 'center', 
  className = '' 
}) {
  const alignClasses = align === 'left' ? 'text-left' : 'text-center mx-auto'

  return (
    <div className={`max-w-3xl space-y-5 mb-14 md:mb-20 ${alignClasses} ${className}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 dark:bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-xs font-bold font-mono uppercase tracking-widest shadow-sm"
          style={{ color: 'var(--accent-gold-light, #FDE68A)' }}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          {eyebrow}
        </span>
      )}
      {title && (
        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-poppins font-extrabold leading-[1.1] tracking-tight section-title-gradient">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-base sm:text-lg leading-relaxed font-sans max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
