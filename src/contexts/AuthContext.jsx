import React, { createContext, useContext } from 'react'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useHousehold } from '../hooks/useHousehold'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const auth = useSupabaseAuth()
  const household = useHousehold(auth.user)

  const value = {
    // Auth properties
    user: auth.user,
    profile: auth.profile,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading || household.loading,
    error: auth.error || household.error,
    
    // Auth methods
    signInWithEmail: auth.signInWithEmail,
    signInWithPhone: auth.signInWithPhone,
    verifyOtp: auth.verifyOtp,
    signOut: auth.signOut,
    updateProfile: auth.updateProfile,
    
    // Household data (for backward compatibility)
    // Household state
    households: household.households,
    household: household.household,
    setActiveHouseholdId: household.setActiveHouseholdId,
    members: household.members,
    caregivers: household.members, // Alias for backward compatibility
    dogs: household.dogs,
    activeDog: household.activeDog,
    activeDogId: household.activeDogId,
    setActiveDogId: household.setActiveDogId,
    
    // Dog management methods
    addDog: household.addDog,
    updateDog: household.updateDog,
    deleteDog: household.deleteDog,
    
    // Household methods
    generateNewInviteCode: household.generateNewInviteCode,
    removeMember: household.removeMember,
    updateHouseholdName: household.updateHouseholdName,
    updateMemberRole: household.updateMemberRole,
    leaveHousehold: household.leaveHousehold,
    
    // Legacy methods for backward compatibility
    addCaregiver: (caregiver) => {
      console.warn('addCaregiver is deprecated, use household invite system instead')
      return { id: Date.now().toString(), ...caregiver }
    },
    removeCaregiver: household.removeMember,
    updateCaregiver: (id, updates) => {
      console.warn('updateCaregiver is deprecated')
    },
    login: (userData) => {
      console.warn('login is deprecated, use signInWithEmail or signInWithPhone instead')
    },
    logout: auth.signOut,
    // Re-fetch household/memberships
    refetchHousehold: household.refetch
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}