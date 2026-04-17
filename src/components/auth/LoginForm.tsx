import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../supabase/client'
import { Button } from '../shared/Button'

interface Props {
  onSwitch: () => void
}

export function LoginForm({ onSwitch }: Props) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [resetSent, setResetSent] = useState(false)

  function friendlyError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return t('auth.errorWrongCredentials')
    if (msg.includes('Email not confirmed')) return t('auth.errorEmailNotConfirmed')
    if (msg.includes('User already registered')) return t('auth.errorAlreadyRegistered')
    if (msg.includes('Password should be')) return t('auth.errorPasswordTooShort')
    return t('auth.errorGeneric')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(friendlyError(err.message))
    setLoading(false)
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    if (err) setError(friendlyError(err.message))
    else setResetSent(true)
    setLoading(false)
  }

  const field = 'w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent'

  if (mode === 'reset') {
    return (
      <div className="space-y-4">
        {resetSent ? (
          <div className="bg-success/10 border border-success/30 rounded-lg px-4 py-3 text-success text-sm">
            {t('auth.resetLinkSent', { email })}
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-muted text-sm">{t('auth.enterEmailForReset')}</p>
            <div>
              <label className="block text-muted text-xs uppercase tracking-widest mb-1">{t('auth.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('auth.sendingLink') : t('auth.sendResetLink')}
            </Button>
          </form>
        )}
        <p className="text-center text-muted text-sm">
          <button type="button" onClick={() => { setMode('login'); setResetSent(false); setError('') }} className="text-accent hover:underline">
            {t('auth.backToSignIn')}
          </button>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">{t('auth.email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-muted text-xs uppercase tracking-widest">{t('auth.password')}</label>
          <button type="button" onClick={() => setMode('reset')} className="text-muted text-xs hover:text-accent transition-colors">
            {t('auth.forgotPassword')}
          </button>
        </div>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={field + ' pe-9'}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('auth.signingIn') : t('auth.makeItSo')}
      </Button>
      <p className="text-center text-muted text-sm">
        {t('auth.noAccount')}{' '}
        <button type="button" onClick={onSwitch} className="text-accent hover:underline">
          {t('auth.signUp')}
        </button>
      </p>
    </form>
  )
}
