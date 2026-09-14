export default function PageTransition({ children, className = '' }) {
  return (
    <div className={`animate-fade-in-up transition-all ${className}`}>
      {children}
    </div>
  )
}
