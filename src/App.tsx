import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ProtectedRoute } from './components/shared/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { AuthPage } from './pages/AuthPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { TodayPage } from './pages/TodayPage'
import { GoalsPage } from './pages/GoalsPage'
import { PlansPage } from './pages/PlansPage'
import { JournalPage } from './pages/JournalPage'

/** Keeps <html dir> and <html lang> in sync with the active i18n language. */
function I18nSync() {
  const { i18n } = useTranslation()
  useEffect(() => {
    const isRTL = i18n.language === 'he'
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])
  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DataProvider>
              <AppShell>
                <Routes>
                  <Route path="/today"   element={<TodayPage />} />
                  <Route path="/goals"   element={<GoalsPage />} />
                  <Route path="/plans"   element={<PlansPage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="*"        element={<Navigate to="/today" replace />} />
                </Routes>
              </AppShell>
            </DataProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <I18nSync />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
