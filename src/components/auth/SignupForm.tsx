import { useState, type FormEvent } from 'react'
import { supabase } from '../../supabase/client'
import { Button } from '../shared/Button'

interface Props {
  onSwitch: () => void
}

export function SignupForm({ onSwitch }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }

  const field = 'w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} />
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={field} />
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Create Account'}
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
