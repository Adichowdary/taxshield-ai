export default function PageTransition({ children, className = '' }) {
  return (
    <div className={`transition-opacity duration-200 ${className}`}>
      {children}
    </div>
  )
}
