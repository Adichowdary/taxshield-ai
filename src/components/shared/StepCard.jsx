export default function StepCard({ number, title, description, icon: Icon, isLast = false }) {
  return (
    <div className="flex flex-col items-center text-center relative group p-4 vision-pro-card">
      {/* Number Badge & Icon Container */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-lime-400/15 border border-lime-400/30 text-lime-400 flex items-center justify-center group-hover:scale-105 group-hover:border-lime-400 transition-all shadow-[0_0_20px_rgba(132,204,22,0.2)]">
          <Icon size={28} />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 text-slate-950 font-poppins font-extrabold text-xs flex items-center justify-center shadow-md">
          {number}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-base font-poppins font-bold mb-2 group-hover:text-lime-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>

      {/* Connector lines on larger screens */}
      {!isLast && (
        <div className="hidden lg:block absolute top-12 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-[2px] bg-gradient-to-r from-lime-400/40 to-cyan-400/40" />
      )}
    </div>
  )
}