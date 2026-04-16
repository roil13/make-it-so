export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div
      className={`${dims} border-2 border-border border-t-accent rounded-full animate-spin`}
    />
  )
}
