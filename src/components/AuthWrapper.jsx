import React from 'react'
import { useAuth } from '../hooks/useAuth'
import LoginScreen from './LoginScreen'
import LoadingScreen from './LoadingScreen'

const AuthWrapper = ({ children }) => {
  const { user, loading } = useAuth()

  // TEMPORARY: Bypass auth for debugging
  // Remove this when Supabase is working
  const BYPASS_AUTH = true
  
  if (BYPASS_AUTH) {
    return children
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoginScreen />
  }

  return children
}

export default AuthWrapper 