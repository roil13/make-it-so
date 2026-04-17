import { Component, type ReactNode } from 'react'
import { supabase } from '../../supabase/client'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <p className="text-foreground font-black text-xl uppercase tracking-widest">Something went wrong</p>
          <p className="text-muted text-sm">An unexpected error occurred. Please reload the page.</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Reload
            </button>
            <button
              onClick={() => supabase.auth.signOut().then(() => window.location.assign('/auth'))}
              className="w-full py-2.5 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }
}
