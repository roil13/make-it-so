import { useState } from 'react'
import { Zap } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'
import { useAuth } from '../contexts/AuthContext'

export function AuthPage() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  if (!loading && user) return <Navigate to="/today" replace />

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="text-accent" size={28} />
          </div>
          <h1 className="text-foreground font-black text-2xl uppercase tracking-widest">Make it So</h1>
          <p className="text-muted text-sm mt-1">{t('auth.appTagline')}</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-foreground font-bold text-sm uppercase tracking-widest mb-5">
            {mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
          </h2>
          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('signup')} />
          ) : (
            <SignupForm onSwitch={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  )
}
