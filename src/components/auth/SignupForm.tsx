import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../supabase/client'
import { Button } from '../shared/Button'

interface Props {
  onSwitch: () => void
}

function friendlyError(msg: string): string {
  if (msg.includes('User already registered')) return 'An account with this email already exists'
  if (msg.includes('Password should be')) return 'Password must be at least 6 characters'
  if (msg.includes('Invalid email')) return 'Please enter a valid email address'
  return 'Something went wrong. Please try again'
}

function passwordStrength(pw: string): 0 | 1 | 2 {
  if (pw.length < 8) return 0
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 2
  return 1
}

const strengthLabel = ['Too short', 'Could be stronger', 'Strong']
const strengthColor = ['bg-danger', 'bg-warning', 'bg-success']
const strengthText  = ['text-danger', 'text-warning', 'text-success']

export function SignupForm({ onSwitch }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const strength = password.length > 0 ? passwordStrength(password) : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError("Passwords don't match")
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
          <p className="font-bold mb-1">Almost there!</p>
          <p>We sent a confirmation link to <span className="font-bold">{email}</span>. Check your inbox and click the link to activate your account.</p>
        </div>
        <p className="text-center text-muted text-sm">
          Already confirmed?{' '}
          <button type="button" onClick={onSwitch} className="text-accent hover:underline">
            Sign in
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
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
        {strength !== null && (
          <div className="mt-1.5 space-y-0.5">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : 'bg-border'}`} />
              ))}
            </div>
            <p className={`text-xs ${strengthText[strength]}`}>{strengthLabel[strength]}</p>
          </div>
        )}
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Confirm Password</label>
        <input
          type={showPw ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className={field}
        />
        {confirm.length > 0 && confirm !== password && (
          <p className="text-danger text-xs mt-1">Passwords don't match</p>
        )}
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>
      <p className="text-center text-muted text-sm">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-accent hover:underline">
          Sign in
        </button>
      </p>
    </form>
  )
}
