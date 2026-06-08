import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen" style={{ background: '#060C18' }}>
      <main className="pb-nav max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
