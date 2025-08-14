import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useActivities = (activeDogId, user, members = [], profile = null) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Build a quick lookup for member display names (no hooks to avoid order changes)
  const userIdToName = (() => {
    const map = new Map()
    if (Array.isArray(members)) {
      for (const m of members) {
        if (m && m.id) {
          map.set(m.id, m.display_name || m.email || 'Unknown User')
        }
      }
    }
    if (user?.id) {
      const selfName = profile?.display_name || user.email || 'You'
      map.set(user.id, selfName)
    }
    return map
  })()

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
        .select('*')
        .eq('puppy_id', activeDogId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedActivities = data.map(entry => ({
        id: entry.id,
        type: entry.type,
        petId: entry.puppy_id,
        userId: entry.user_id,
        caregiverName: userIdToName.get(entry.user_id) || 'Unknown User',
        caregiverAvatar: undefined,
        timestamp: entry.timestamp || entry.created_at,
        createdAt: entry.created_at,
        notes: entry.notes,
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
      
      const { 
        type, 
        petId, 
        userId, 
        notes,
        timestamp,
        ...otherDetails 
      } = activityData
      
      const entryData = {
        puppy_id: petId || activeDogId,
        user_id: userId || user.id,
        type,
        notes,
        timestamp: timestamp ? new Date(timestamp).toISOString() : undefined,
        details: Object.keys(otherDetails).length > 0 ? otherDetails : undefined,
      }
      
      Object.keys(entryData).forEach(key => {
        if (entryData[key] === undefined) delete entryData[key]
      })
      
      const { data, error } = await supabase
        .from('puppy_entries')
        .insert([entryData])
        .select('*')
        .single()

      if (error) throw error

      const formattedActivity = {
        id: data.id,
        type: data.type,
        petId: data.puppy_id,
        userId: data.user_id,
        caregiverName: userIdToName.get(data.user_id) || 'Unknown User',
        caregiverAvatar: undefined,
        timestamp: data.timestamp || data.created_at,
        createdAt: data.created_at,
        notes: data.notes,
        ...(data.details || {})
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
      
      const { type, notes, timestamp, ...details } = updates
      const updateData = {
        ...(type && { type }),
        ...(notes !== undefined && { notes }),
        ...(timestamp && { timestamp: new Date(timestamp).toISOString() }),
        details: {
          ...activities.find(a => a.id === activityId)?.details,
          ...details
        }
      }

      const { data, error } = await supabase
        .from('puppy_entries')
        .update(updateData)
        .eq('id', activityId)
        .select('*')
        .single()

      if (error) throw error

      const formattedActivity = {
        id: data.id,
        type: data.type,
        petId: data.puppy_id,
        userId: data.user_id,
        caregiverName: userIdToName.get(data.user_id) || 'Unknown User',
        caregiverAvatar: undefined,
        timestamp: data.timestamp || data.created_at,
        createdAt: data.created_at,
        ...(data.details || {})
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
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    return activities.filter(activity => {
      const ts = new Date(activity.timestamp).getTime()
      return !Number.isNaN(ts) && ts >= oneDayAgo
    })
  }

  const getActivitiesByType = (type) => {
    return getTodayActivities().filter(activity => activity.type === type)
  }

  const getLastActivityTime = (type) => {
    const typeActivities = activities.filter(a => a.type === type)
    if (typeActivities.length === 0) return null
    return new Date(typeActivities[0].timestamp)
  }

  const getStats = () => {
    const lastDay = getTodayActivities()
    return {
      meals: lastDay.filter(a => a.type === 'meal').length,
      potty: lastDay.filter(a => a.type === 'potty').length,
      walks: lastDay.filter(a => a.type === 'walk').length,
      play: lastDay.filter(a => a.type === 'play').length,
      sleep: lastDay.filter(a => a.type === 'sleep').length,
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