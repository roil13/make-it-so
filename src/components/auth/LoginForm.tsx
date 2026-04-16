import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../supabase/client'
import { Button } from '../shared/Button'

interface Props {
  onSwitch: () => void
}

function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Wrong email or password'
  if (msg.includes('Email not confirmed')) return 'Check your inbox to confirm your email first'
  if (msg.includes('User already registered')) return 'An account with this email already exists'
  if (msg.includes('Password should be')) return 'Password must be at least 6 characters'
  return 'Something went wrong. Please try again'
}

export function LoginForm({ onSwitch }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [resetSent, setResetSent] = useState(false)

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
      redirectTo: window.location.origin + '/auth',
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
            Reset link sent! Check your inbox for <span className="font-bold">{email}</span>.
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-muted text-sm">Enter your email and we'll send you a reset link.</p>
            <div>
              <label className="block text-muted text-xs uppercase tracking-widest mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending…' : 'Send Reset Link'}
            </Button>
          </form>
        )}
        <p className="text-center text-muted text-sm">
          <button type="button" onClick={() => { setMode('login'); setResetSent(false); setError('') }} className="text-accent hover:underline">
            Back to sign in
          </button>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-muted text-xs uppercase tracking-widest">Password</label>
          <button type="button" onClick={() => setMode('reset')} className="text-muted text-xs hover:text-accent transition-colors">
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={field + ' pr-9'}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in…' : 'Make it So'}
      </Button>
      <p className="text-center text-muted text-sm">
        No account?{' '}
        <button type="button" onClick={onSwitch} className="text-accent hover:underline">
          Sign up
        </button>
      </p>
    </form>
  )
}
