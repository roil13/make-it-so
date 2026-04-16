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

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const field = 'w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent'

  // ── Reset password view ──────────────────────────────────────────────────
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={field}
              />
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

  // ── Login view ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 bg-surface-2 border border-border rounded-md px-3 py-2 text-foreground text-sm font-bold hover:border-accent/50 transition-colors"
      >
        <GoogleIcon />
        Sign in with Google
      </button>

      <div className="flex items-center gap-2 text-muted text-xs">
        <hr className="flex-1 border-border" />
        or
        <hr className="flex-1 border-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-muted text-xs uppercase tracking-widest mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={field}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-muted text-xs uppercase tracking-widest">Password</label>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="text-muted text-xs hover:text-accent transition-colors"
            >
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
      </form>

      <p className="text-center text-muted text-sm">
        No account?{' '}
        <button type="button" onClick={onSwitch} className="text-accent hover:underline">
          Sign up
        </button>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}
