import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [caregivers, setCaregivers] = useState(() => {
    const stored = localStorage.getItem('caregivers')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('caregivers', JSON.stringify(caregivers))
  }, [caregivers])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    localStorage.clear()
  }

  const addCaregiver = (caregiver) => {
    const newCaregiver = {
      ...caregiver,
      id: Date.now().toString(),
      role: caregiver.role || 'viewer',
      addedAt: new Date().toISOString(),
    }
    setCaregivers(prev => [...prev, newCaregiver])
    return newCaregiver
  }

  const removeCaregiver = (caregiverId) => {
    setCaregivers(prev => prev.filter(c => c.id !== caregiverId))
  }

  const updateCaregiver = (caregiverId, updates) => {
    setCaregivers(prev => 
      prev.map(c => c.id === caregiverId ? { ...c, ...updates } : c)
    )
  }

  const value = {
    user,
    caregivers,
    isAuthenticated: !!user,
    login,
    logout,
    addCaregiver,
    removeCaregiver,
    updateCaregiver,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}