import React, { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'
import { useActivities } from '../hooks/useActivities'

const PetContext = createContext()

export const usePets = () => {
  const context = useContext(PetContext)
  if (!context) throw new Error('usePets must be used within PetProvider')
  return context
}

export const PetProvider = ({ children }) => {
  const { user, profile, dogs, activeDog, activeDogId, setActiveDogId, addDog, updateDog, deleteDog, members } = useAuth()
  
  const activitiesHook = useActivities(activeDogId, user, members, profile)

  // Get pet data from auth context
  const pets = dogs || []
  const activePet = activeDog

  const value = {
    // Pet data
    pets,
    activePet,
    activePetId: activeDogId,
    
    // Pet management (delegated to auth context/household)
    setActivePet: setActiveDogId,
    addPet: addDog,
    updatePet: updateDog,
    deletePet: deleteDog,
    
    // Activity data
    activities: activitiesHook.activities,
    todayActivities: activitiesHook.getTodayActivities(),
    stats: activitiesHook.getStats(),
    
    // Activity management
    addActivity: activitiesHook.addActivity,
    updateActivity: activitiesHook.updateActivity,
    deleteActivity: activitiesHook.deleteActivity,
    getLastActivityTime: activitiesHook.getLastActivityTime,
    
    // Loading states
    loading: activitiesHook.loading,
    error: activitiesHook.error,
    
    // Backward compatibility
    getActivitiesByType: activitiesHook.getActivitiesByType,
    getRecentActivities: (limit = 10) => activitiesHook.activities.slice(0, limit)
  }

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>
}