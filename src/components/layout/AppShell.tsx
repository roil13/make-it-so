import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'
import { OnboardingTour } from '../onboarding/OnboardingTour'

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [tourOpen, setTourOpen] = useState(() => !localStorage.getItem('mis_onboarding_done'))

  function handleCloseTour() {
    localStorage.setItem('mis_onboarding_done', '1')
    setTourOpen(false)
  }

  function handleStartGoal() {
    handleCloseTour()
    navigate('/goals?wizard=1')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar onOpenTour={() => setTourOpen(true)} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        {/* Extra bottom padding on mobile so content clears the bottom nav */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>
      {/* Mobile bottom nav */}
      <BottomNav />

      <OnboardingTour
        open={tourOpen}
        onClose={handleCloseTour}
        onStartGoal={handleStartGoal}
      />
    </div>
  )
}
