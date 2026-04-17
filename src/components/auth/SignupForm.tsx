import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../supabase/client'
import { Button } from '../shared/Button'

interface Props {
  onSwitch: () => void
}

function passwordStrength(pw: string): 0 | 1 | 2 {
  if (pw.length < 8) return 0
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 2
  return 1
}

const strengthColor = ['bg-danger', 'bg-warning', 'bg-success']
const strengthText  = ['text-danger', 'text-warning', 'text-success']

export function SignupForm({ onSwitch }: Props) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const strength = password.length > 0 ? passwordStrength(password) : null

  function friendlyError(msg: string): string {
    if (msg.includes('User already registered')) return t('auth.errorAlreadyRegistered')
    if (msg.includes('Password should be')) return t('auth.errorPasswordTooShort')
    if (msg.includes('Invalid email')) return t('auth.errorInvalidEmail')
    return t('auth.errorGeneric')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError(t('auth.passwordNoMatch'))
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({ email, password })
    if (err) setError(friendlyError(err.message))
    else setDone(true)
    setLoading(false)
  }

  const field = 'w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent'

  if (done) {
    return (
      <div className="space-y-4">
        <div className="bg-success/10 border border-success/30 rounded-lg px-4 py-3 text-success text-sm">
          <p className="font-bold mb-1">{t('auth.almostThere')}</p>
          <p>{t('auth.confirmationSent', { email })}</p>
        </div>
        <p className="text-center text-muted text-sm">
          {t('auth.alreadyConfirmed')}{' '}
          <button type="button" onClick={onSwitch} className="text-accent hover:underline">
            {t('auth.signInLink')}
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
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">{t('auth.password')}</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
        {strength !== null && (
          <div className="mt-1.5 space-y-0.5">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : 'bg-border'}`} />
              ))}
            </div>
            <p className={`text-xs ${strengthText[strength]}`}>{t(`auth.passwordStrength${strength}`)}</p>
          </div>
        )}
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">{t('auth.confirmPassword')}</label>
        <input
          type={showPw ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className={field}
        />
        {confirm.length > 0 && confirm !== password && (
          <p className="text-danger text-xs mt-1">{t('auth.passwordNoMatch')}</p>
        )}
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
      </Button>
      <p className="text-center text-muted text-sm">
        {t('auth.haveAccount')}{' '}
        <button type="button" onClick={onSwitch} className="text-accent hover:underline">
          {t('auth.signInLink')}
        </button>
      </p>
    </form>
  )
}
