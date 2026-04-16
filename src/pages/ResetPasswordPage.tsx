import { useState, useEffect, type FormEvent } from 'react'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { Button } from '../components/shared/Button'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  // Supabase fires PASSWORD_RECOVERY once it processes the token in the URL hash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) {
      setError('Something went wrong. Please try again')
    } else {
      await supabase.auth.signOut()
      navigate('/auth', { replace: true })
    }
  }

  const field =
    'w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
            <Zap className="text-accent" size={28} />
          </div>
          <h1 className="text-foreground font-black text-2xl uppercase tracking-widest">Make it So</h1>
          <p className="text-muted text-sm mt-1">Shape your reality. Right now.</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-foreground font-bold text-sm uppercase tracking-widest mb-5">Set New Password</h2>

          {!ready ? (
            <p className="text-muted text-sm">Verifying your reset link…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-muted text-xs uppercase tracking-widest mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={field + ' pr-9'}
                    placeholder="Min. 6 characters"
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

              <div>
                <label className="block text-muted text-xs uppercase tracking-widest mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className={field + ' pr-9'}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-danger text-sm">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving…' : 'Set Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
