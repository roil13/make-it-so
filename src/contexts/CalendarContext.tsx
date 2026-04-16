import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { PublicClientApplication } from '@azure/msal-browser'
import { fetchGoogleEvents, fetchGoogleUserEmail } from '../services/googleCalendarService'
import { fetchMicrosoftEvents, fetchMicrosoftUserEmail } from '../services/microsoftCalendarService'
import type { CalendarEvent } from '../types'

type CalMode = 'read' | 'readwrite'

interface CalendarState {
  googleAvailable: boolean
  googleConnected: boolean
  googleEmail: string
  googleMode: CalMode
  microsoftAvailable: boolean
  microsoftConnected: boolean
  microsoftEmail: string
  microsoftMode: CalMode
  events: CalendarEvent[]
  loadingEvents: boolean
  connectGoogle: () => void
  disconnectGoogle: () => void
  setGoogleMode: (m: CalMode) => void
  connectMicrosoft: () => void
  disconnectMicrosoft: () => void
  setMicrosoftMode: (m: CalMode) => void
  fetchEventsForDate: (date: string) => Promise<void>
}

const CalendarContext = createContext<CalendarState | null>(null)

const GCAL_TOKEN_KEY   = 'mis_gcal_token'
const GCAL_MODE_KEY    = 'mis_gcal_mode'
const MSCAL_TOKEN_KEY  = 'mis_mscal_token'
const MSCAL_MODE_KEY   = 'mis_mscal_mode'
const GCAL_EMAIL_KEY   = 'mis_gcal_email'
const MSCAL_EMAIL_KEY  = 'mis_mscal_email'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const msClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID as string | undefined
const msTenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID as string | undefined

const msalInstance = msClientId
  ? new PublicClientApplication({
      auth: {
        clientId: msClientId,
        authority: `https://login.microsoftonline.com/${msTenantId ?? 'common'}`,
        redirectUri: window.location.origin,
      },
    })
  : null

function InnerProvider({ children }: { children: ReactNode }) {
  const [googleToken, setGoogleToken]     = useState(() => localStorage.getItem(GCAL_TOKEN_KEY) ?? '')
  const [googleEmail, setGoogleEmail]     = useState(() => localStorage.getItem(GCAL_EMAIL_KEY) ?? '')
  const [googleMode, setGoogleModeState]  = useState<CalMode>(() => (localStorage.getItem(GCAL_MODE_KEY) as CalMode) ?? 'read')
  const [msToken, setMsToken]             = useState(() => localStorage.getItem(MSCAL_TOKEN_KEY) ?? '')
  const [msEmail, setMsEmail]             = useState(() => localStorage.getItem(MSCAL_EMAIL_KEY) ?? '')
  const [msMode, setMsModeState]          = useState<CalMode>(() => (localStorage.getItem(MSCAL_MODE_KEY) as CalMode) ?? 'read')
  const [events, setEvents]               = useState<CalendarEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  const googleConnected    = !!googleToken
  const microsoftConnected = !!msToken

  const googleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar',
    onSuccess: async (res) => {
      const token = res.access_token
      localStorage.setItem(GCAL_TOKEN_KEY, token)
      setGoogleToken(token)
      const email = await fetchGoogleUserEmail(token).catch(() => '')
      localStorage.setItem(GCAL_EMAIL_KEY, email)
      setGoogleEmail(email)
    },
    onError: (err) => console.error('Google login error', err),
  })

  function disconnectGoogle() {
    localStorage.removeItem(GCAL_TOKEN_KEY)
    localStorage.removeItem(GCAL_EMAIL_KEY)
    setGoogleToken('')
    setGoogleEmail('')
  }

  function setGoogleMode(m: CalMode) {
    localStorage.setItem(GCAL_MODE_KEY, m)
    setGoogleModeState(m)
  }

  async function connectMicrosoft() {
    if (!msalInstance) {
      alert('VITE_MICROSOFT_CLIENT_ID is not configured in .env.local')
      return
    }
    try {
      await msalInstance.initialize()
      const res = await msalInstance.loginPopup({
        scopes: ['Calendars.ReadWrite', 'User.Read'],
      })
      const token = res.accessToken
      localStorage.setItem(MSCAL_TOKEN_KEY, token)
      setMsToken(token)
      const email = await fetchMicrosoftUserEmail(token).catch(() => '')
      localStorage.setItem(MSCAL_EMAIL_KEY, email)
      setMsEmail(email)
    } catch (err) {
      console.error('Microsoft login error', err)
    }
  }

  function disconnectMicrosoft() {
    localStorage.removeItem(MSCAL_TOKEN_KEY)
    localStorage.removeItem(MSCAL_EMAIL_KEY)
    setMsToken('')
    setMsEmail('')
  }

  function setMicrosoftMode(m: CalMode) {
    localStorage.setItem(MSCAL_MODE_KEY, m)
    setMsModeState(m)
  }

  const fetchEventsForDate = useCallback(async (date: string) => {
    if (!googleConnected && !microsoftConnected) return
    setLoadingEvents(true)
    const results: CalendarEvent[] = []
    try {
      if (googleConnected) {
        const evts = await fetchGoogleEvents(googleToken, date).catch(() => [])
        results.push(...evts)
      }
      if (microsoftConnected) {
        const evts = await fetchMicrosoftEvents(msToken, date).catch(() => [])
        results.push(...evts)
      }
      setEvents(results)
    } finally {
      setLoadingEvents(false)
    }
  }, [googleConnected, googleToken, microsoftConnected, msToken])

  return (
    <CalendarContext.Provider value={{
      googleAvailable: !!googleClientId,
      googleConnected, googleEmail, googleMode,
      microsoftAvailable: !!msClientId,
      microsoftConnected, microsoftEmail: msEmail, microsoftMode: msMode,
      events, loadingEvents,
      connectGoogle: googleLogin,
      disconnectGoogle,
      setGoogleMode,
      connectMicrosoft,
      disconnectMicrosoft,
      setMicrosoftMode: setMicrosoftMode,
      fetchEventsForDate,
    }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function CalendarProvider({ children }: { children: ReactNode }) {
  if (!googleClientId) {
    // No Google client ID configured — still render with Microsoft-only support
    return <InnerProvider>{children}</InnerProvider>
  }
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <InnerProvider>{children}</InnerProvider>
    </GoogleOAuthProvider>
  )
}

export function useCalendar(): CalendarState {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider')
  return ctx
}
