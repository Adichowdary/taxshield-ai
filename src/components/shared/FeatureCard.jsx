export default function FeatureCard({ icon: Icon, title, description, badge, className = '' }) {
  return (
    <div className={`vision-pro-card relative group ${className}`}>
      {badge && (
        <span className="absolute top-4 right-4 bg-lime-400/10 text-lime-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-lime-400/30 uppercase tracking-wider font-poppins">
          {badge}
        </span>
      )}
      <div className="w-12 h-12 rounded-2xl bg-lime-400/15 text-lime-400 flex items-center justify-center mb-5 group-hover:bg-lime-400 group-hover:text-slate-950 transition-all duration-300 shadow-[0_0_15px_rgba(132,204,22,0.2)]">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-poppins font-bold mb-2 group-hover:text-lime-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </div>
  )
}