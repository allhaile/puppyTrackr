import React, { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './contexts/ThemeContext'
import { PetProvider } from './contexts/PetContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/ui/LoadingScreen'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Import Analytics directly to avoid lazy loading issue
import Analytics from './pages/analytics/AnalyticsSimple'

// Lazy load other pages for code splitting
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const ActivityLogging = lazy(() => import('./pages/logging/ActivityLogging'))
const PetProfile = lazy(() => import('./pages/profile/PetProfile'))
const CareManagement = lazy(() => import('./pages/care/CareManagement'))
const Settings = lazy(() => import('./pages/settings/Settings'))
const Onboarding = lazy(() => import('./pages/onboarding/Onboarding'))

function App() {
  // Check if user has completed onboarding
  const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')

  useEffect(() => {
    // Request notification permission on app load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Add app height fix for mobile browsers
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    setAppHeight()
    window.addEventListener('resize', setAppHeight)
    return () => window.removeEventListener('resize', setAppHeight)
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <PetProvider>
            <AnimatePresence mode="wait">
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {!hasCompletedOnboarding ? (
                    <>
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="*" element={<Navigate to="/onboarding" replace />} />
                    </>
                  ) : (
                    <Route element={<Layout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/log" element={<ActivityLogging />} />
                      <Route path="/profile/:petId?" element={<PetProfile />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/care" element={<CareManagement />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                  )}
                </Routes>
              </Suspense>
            </AnimatePresence>
          </PetProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App