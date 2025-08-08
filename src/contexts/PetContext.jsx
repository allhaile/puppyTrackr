import React, { createContext, useContext, useState, useEffect } from 'react'
import { useActivityStore } from '../stores/activityStore'
import { usePetStore } from '../stores/petStore'

const PetContext = createContext()

export const usePets = () => {
  const context = useContext(PetContext)
  if (!context) throw new Error('usePets must be used within PetProvider')
  return context
}

export const PetProvider = ({ children }) => {
  const petStore = usePetStore()
  const activityStore = useActivityStore()
  
  const pets = petStore?.pets || []
  const activePetId = petStore?.activePetId || null
  const activities = activityStore?.activities || []
  
  const activePet = pets.find(p => p.id === activePetId)

  // Get activities for active pet
  const petActivities = activities.filter(a => a.petId === activePetId)

  // Get today's activities
  const todayActivities = petActivities.filter(activity => {
    const activityDate = new Date(activity.timestamp)
    const today = new Date()
    return activityDate.toDateString() === today.toDateString()
  })

  // Calculate stats
  const stats = {
    meals: todayActivities.filter(a => a.type === 'meal').length,
    potty: todayActivities.filter(a => a.type === 'potty').length,
    walks: todayActivities.filter(a => a.type === 'walk').length,
    medications: todayActivities.filter(a => a.type === 'medication').length,
  }

  // Get last activity times
  const getLastActivityTime = (type) => {
    const filtered = petActivities.filter(a => a.type === type)
    if (filtered.length === 0) return null
    return new Date(Math.max(...filtered.map(a => new Date(a.timestamp))))
  }

  const value = {
    pets,
    activePet,
    activePetId,
    setActivePet: petStore?.setActivePet || (() => {}),
    addPet: petStore?.addPet || (() => {}),
    updatePet: petStore?.updatePet || (() => {}),
    deletePet: petStore?.deletePet || (() => {}),
    activities: petActivities,
    todayActivities,
    stats,
    addActivity: activityStore?.addActivity || (() => {}),
    updateActivity: activityStore?.updateActivity || (() => {}),
    deleteActivity: activityStore?.deleteActivity || (() => {}),
    getLastActivityTime,
  }

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>
}