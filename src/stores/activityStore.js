import { create } from 'zustand'

const getStoredData = () => {
  try {
    const stored = localStorage.getItem('activity-storage')
    return stored ? JSON.parse(stored) : { activities: [] }
  } catch {
    return { activities: [] }
  }
}

const saveToStorage = (data) => {
  localStorage.setItem('activity-storage', JSON.stringify(data))
}

export const useActivityStore = create((set, get) => ({
  ...getStoredData(),

  addActivity: (activity) => {
    const newActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: activity.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    set((state) => {
      const newState = {
        activities: [newActivity, ...state.activities].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        ),
      }
      saveToStorage(newState)
      return newState
    })
    return newActivity
  },

  updateActivity: (activityId, updates) => {
    set((state) => {
      const newState = {
        activities: state.activities.map((activity) =>
          activity.id === activityId
            ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
            : activity
        ),
      }
      saveToStorage(newState)
      return newState
    })
  },

  deleteActivity: (activityId) => {
    set((state) => {
      const newState = {
        activities: state.activities.filter((activity) => activity.id !== activityId),
      }
      saveToStorage(newState)
      return newState
    })
  },

  getActivitiesByPet: (petId) => {
    return get().activities.filter((activity) => activity.petId === petId)
  },

  getActivitiesByType: (type, petId) => {
    return get().activities.filter(
      (activity) => activity.type === type && (!petId || activity.petId === petId)
    )
  },

  getRecentActivities: (limit = 10, petId) => {
    const activities = petId
      ? get().activities.filter((a) => a.petId === petId)
      : get().activities
    return activities.slice(0, limit)
  },

  clearActivities: () => {
    const newState = { activities: [] }
    saveToStorage(newState)
    set(newState)
  },
}))