import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        {/* Extra bottom padding on mobile so content clears the bottom nav */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>
      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
