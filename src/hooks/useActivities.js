import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useActivities = (activeDogId, user) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (activeDogId && user) {
      fetchActivities()
    } else {
      setActivities([])
    }
  }, [activeDogId, user])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('puppy_entries')
        .select(`
          *,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('puppy_id', activeDogId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedActivities = data.map(entry => ({
        id: entry.id,
        type: entry.type,
        petId: entry.puppy_id,
        userId: entry.user_id,
        caregiverName: entry.user_profiles?.display_name || 'Unknown User',
        caregiverAvatar: entry.user_profiles?.avatar_url,
        timestamp: entry.created_at,
        createdAt: entry.created_at,
        ...entry.details
      }))

      setActivities(formattedActivities)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const addActivity = async (activityData) => {
    try {
      setError(null)
      
      // Extract details from activity data
      const { type, petId, userId, ...details } = activityData
      
      const { data, error } = await supabase
        .from('puppy_entries')
        .insert([{
          puppy_id: petId || activeDogId,
          user_id: userId || user.id,
          type,
          details
        }])
        .select(`
          *,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      const formattedActivity = {
        id: data.id,
        type: data.type,
        petId: data.puppy_id,
        userId: data.user_id,
        caregiverName: data.user_profiles?.display_name || 'Unknown User',
        caregiverAvatar: data.user_profiles?.avatar_url,
        timestamp: data.created_at,
        createdAt: data.created_at,
        ...data.details
      }

      setActivities(prev => [formattedActivity, ...prev])
      return { success: true, activity: formattedActivity }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const updateActivity = async (activityId, updates) => {
    try {
      setError(null)
      
      // Separate details from metadata
      const { type, ...details } = updates
      const updateData = {
        ...(type && { type }),
        details: {
          ...activities.find(a => a.id === activityId)?.details,
          ...details
        }
      }

      const { data, error } = await supabase
        .from('puppy_entries')
        .update(updateData)
        .eq('id', activityId)
        .select(`
          *,
          user_profiles (
            display_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      const formattedActivity = {
        id: data.id,
        type: data.type,
        petId: data.puppy_id,
        userId: data.user_id,
        caregiverName: data.user_profiles?.display_name || 'Unknown User',
        caregiverAvatar: data.user_profiles?.avatar_url,
        timestamp: data.created_at,
        createdAt: data.created_at,
        ...data.details
      }

      setActivities(prev => prev.map(activity => 
        activity.id === activityId ? formattedActivity : activity
      ))

      return { success: true, activity: formattedActivity }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const deleteActivity = async (activityId) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('puppy_entries')
        .delete()
        .eq('id', activityId)

      if (error) throw error

      setActivities(prev => prev.filter(activity => activity.id !== activityId))
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  // Helper functions
  const getTodayActivities = () => {
    const today = new Date().toDateString()
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp).toDateString()
      return activityDate === today
    })
  }

  const getActivitiesByType = (type) => {
    return activities.filter(activity => activity.type === type)
  }

  const getLastActivityTime = (type) => {
    const typeActivities = activities.filter(a => a.type === type)
    if (typeActivities.length === 0) return null
    return new Date(typeActivities[0].timestamp) // Already sorted by newest first
  }

  const getStats = () => {
    const todayActivities = getTodayActivities()
    return {
      meals: todayActivities.filter(a => a.type === 'meal').length,
      potty: todayActivities.filter(a => a.type === 'potty').length,
      walks: todayActivities.filter(a => a.type === 'walk').length,
      medications: todayActivities.filter(a => a.type === 'medicine').length,
    }
  }

  return {
    activities,
    loading,
    error,
    addActivity,
    updateActivity,
    deleteActivity,
    getTodayActivities,
    getActivitiesByType,
    getLastActivityTime,
    getStats,
    refetch: fetchActivities
  }
} 