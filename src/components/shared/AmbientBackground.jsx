export default function AmbientBackground() {
  return (
    <>
      <div className="pointer-events-none fixed -top-40 -left-40 w-[550px] h-[550px] rounded-full blur-[140px] opacity-25 z-0 bg-orb bg-orb-gold animate-spatial-float hidden dark:block" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 z-0 bg-orb bg-orb-brand animate-spatial-float hidden dark:block" style={{ animationDelay: '2s' }} />
    </>
  )
}
