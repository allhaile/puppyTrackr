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
        timestamp: entry.timestamp || entry.created_at,
        createdAt: entry.created_at,
        // Map schema fields to app format
        notes: entry.notes,
        amount: entry.amount,
        duration: entry.duration_minutes,
        location: entry.location,
        pottyType: entry.potty_type,
        // Legacy support for any additional data
        ...(entry.details || {})
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
      
      // Map activity data to schema fields
      const { 
        type, 
        petId, 
        userId, 
        notes,
        amount,
        duration,
        location,
        pottyType,
        timestamp,
        ...otherDetails 
      } = activityData
      
      // Prepare the entry data mapping to schema fields
      const entryData = {
        puppy_id: petId || activeDogId,
        user_id: userId || user.id,
        type,
        notes,
        timestamp: timestamp ? new Date(timestamp).toISOString() : undefined,
        // Map specific fields
        amount,
        duration_minutes: duration ? parseInt(duration) : undefined,
        location,
        potty_type: pottyType,
      }
      
      // Remove undefined fields
      Object.keys(entryData).forEach(key => {
        if (entryData[key] === undefined) {
          delete entryData[key]
        }
      })
      
      const { data, error } = await supabase
        .from('puppy_entries')
        .insert([entryData])
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
        timestamp: data.timestamp || data.created_at,
        createdAt: data.created_at,
        // Map schema fields back to app format
        notes: data.notes,
        amount: data.amount,
        duration: data.duration_minutes,
        location: data.location,
        pottyType: data.potty_type,
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