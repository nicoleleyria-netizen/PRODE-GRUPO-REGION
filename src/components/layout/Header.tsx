import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  showBack?: boolean
  rightElement?: React.ReactNode
}

export function Header({ title, showBack, rightElement }: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-40 px-4"
      style={{
        background: 'rgba(6,12,24,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1A3050',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex items-center h-14 gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors -ml-1"
            style={{ color: '#74ACDF', background: 'rgba(116,172,223,0.1)' }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1
          className="flex-1 font-black text-sm uppercase tracking-[0.15em] truncate"
          style={{ color: '#74ACDF' }}
        >
          {title}
        </h1>
        {rightElement}
      </div>
    </header>
  )
}
