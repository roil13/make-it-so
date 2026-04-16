import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ProtectedRoute } from './components/shared/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { AuthPage } from './pages/AuthPage'
import { TodayPage } from './pages/TodayPage'
import { GoalsPage } from './pages/GoalsPage'
import { ProgressPage } from './pages/ProgressPage'
import { ManagePage } from './pages/ManagePage'

function DirectionManager() {
  const { i18n } = useTranslation()
  useEffect(() => {
    const update = (lng: string) => {
      document.documentElement.lang = lng
      document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr'
    }
    update(i18n.language)
    i18n.on('languageChanged', update)
    return () => { i18n.off('languageChanged', update) }
  }, [i18n])
  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DataProvider>
              <AppShell>
                <Routes>
                  <Route path="/today" element={<TodayPage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/manage" element={<ManagePage />} />
                  <Route path="*" element={<Navigate to="/today" replace />} />
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
        <DirectionManager />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
