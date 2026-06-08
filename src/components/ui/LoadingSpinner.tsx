interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const s = size === 'sm' ? 16 : size === 'lg' ? 40 : 28
  const border = size === 'sm' ? 2 : 2
  return (
    <div
      className="rounded-full animate-spin flex-shrink-0"
      style={{
        width: s,
        height: s,
        border: `${border}px solid #1A3050`,
        borderTopColor: '#74ACDF',
        boxShadow: '0 0 8px rgba(116,172,223,0.3)',
      }}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#3D5A7A' }}>
        CARGANDO...
      </p>
    </div>
  )
}
