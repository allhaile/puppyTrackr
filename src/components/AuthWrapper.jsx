import React from 'react'
import { useAuth } from '../hooks/useAuth'
import LoginScreen from './LoginScreen'
import LoadingScreen from './LoadingScreen'

const AuthWrapper = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoginScreen />
  }

  return children
}

export default AuthWrapper 