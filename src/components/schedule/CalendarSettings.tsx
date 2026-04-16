import { useCalendar } from '../../contexts/CalendarContext'
import { Button } from '../shared/Button'

export function useCalendarAvailable() {
  const { googleAvailable, microsoftAvailable } = useCalendar()
  return googleAvailable || microsoftAvailable
}

export function CalendarSettings() {
  const {
    googleAvailable, googleConnected, googleEmail, googleMode,
    connectGoogle, disconnectGoogle, setGoogleMode,
    microsoftAvailable, microsoftConnected, microsoftEmail, microsoftMode,
    connectMicrosoft, disconnectMicrosoft, setMicrosoftMode,
  } = useCalendar()

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
      <p className="text-foreground font-bold text-sm uppercase tracking-widest">Connected Calendars</p>

      {googleAvailable && (
        <ProviderRow
          name="Google Calendar"
          icon="🗓"
          connected={googleConnected}
          email={googleEmail}
          mode={googleMode}
          onConnect={connectGoogle}
          onDisconnect={disconnectGoogle}
          onModeChange={setGoogleMode}
        />
      )}

      {microsoftAvailable && (
        <ProviderRow
          name="Outlook / Microsoft 365"
          icon="📅"
          connected={microsoftConnected}
          email={microsoftEmail}
          mode={microsoftMode}
          onConnect={connectMicrosoft}
          onDisconnect={disconnectMicrosoft}
          onModeChange={setMicrosoftMode}
        />
      )}

      {!googleAvailable && !microsoftAvailable && (
        <p className="text-muted text-sm">
          No calendar providers configured. Add <code className="text-accent">VITE_GOOGLE_CLIENT_ID</code> or <code className="text-accent">VITE_MICROSOFT_CLIENT_ID</code> to <code className="text-accent">.env.local</code>.
        </p>
      )}
    </div>
  )
}

interface ProviderRowProps {
  name: string
  icon: string
  connected: boolean
  email: string
  mode: 'read' | 'readwrite'
  onConnect: () => void
  onDisconnect: () => void
  onModeChange: (m: 'read' | 'readwrite') => void
}

function ProviderRow({ name, icon, connected, email, mode, onConnect, onDisconnect, onModeChange }: ProviderRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-t border-border/40 first:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-foreground text-sm font-bold">{name}</p>
          {connected
            ? <p className="text-muted text-xs">{email}</p>
            : <p className="text-muted text-xs">Not connected</p>
          }
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {connected && (
          <div className="flex rounded-md border border-border overflow-hidden text-xs font-bold">
            <button
              onClick={() => onModeChange('read')}
              className={`px-2 py-1 transition-colors ${mode === 'read' ? 'bg-accent text-on-accent' : 'text-muted hover:text-foreground'}`}
            >
              Read
            </button>
            <button
              onClick={() => onModeChange('readwrite')}
              className={`px-2 py-1 transition-colors ${mode === 'readwrite' ? 'bg-accent text-on-accent' : 'text-muted hover:text-foreground'}`}
            >
              Read+Write
            </button>
          </div>
        )}
        {connected
          ? <Button size="sm" variant="ghost" onClick={onDisconnect}>Disconnect</Button>
          : <Button size="sm" onClick={onConnect}>Connect</Button>
        }
      </div>
    </div>
  )
}
