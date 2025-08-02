import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useSupabaseData = () => {
  const { user } = useAuth()
  const [puppyName, setPuppyName] = useState('My Puppy')
  const [entries, setEntries] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [familyMembers, setFamilyMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // Create or get user profile
  useEffect(() => {
    if (!user) return

    const createOrGetProfile = async () => {
      try {
        // First check if profile exists
        let { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const newProfile = {
            id: user.id,
            phone: user.phone,
            email: user.email,
            display_name: user.phone ? `User ${user.phone.slice(-4)}` : `User ${user.email?.split('@')[0]}`,
            role: 'parent'
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([newProfile])
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
          } else {
            setUserProfile(createdProfile)
          }
        } else if (!error) {
          setUserProfile(profile)
        }
      } catch (err) {
        console.error('Profile error:', err)
      }
    }

    createOrGetProfile()
  }, [user])

  // Load puppy data and entries
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        // Load user's puppies
        const { data: puppies, error: puppyError } = await supabase
          .from('puppies')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1)

        if (puppyError) {
          console.error('Error loading puppies:', puppyError)
        } else if (puppies && puppies.length > 0) {
          setPuppyName(puppies[0].name)
          
          // Load entries for this puppy
          const { data: puppyEntries, error: entriesError } = await supabase
            .from('puppy_entries')
            .select(`
              *,
              user_profiles!inner(display_name, avatar_url)
            `)
            .eq('puppy_id', puppies[0].id)
            .order('created_at', { ascending: false })

          if (entriesError) {
            console.error('Error loading entries:', entriesError)
          } else {
            setEntries(puppyEntries || [])
          }
        }

        // Load family members (users with access to user's puppies)
        const { data: members, error: membersError } = await supabase
          .from('puppy_access')
          .select(`
            user_profiles!inner(id, display_name, avatar_url, role),
            puppies!inner(owner_id)
          `)
          .eq('puppies.owner_id', user.id)

        if (membersError) {
          console.error('Error loading family members:', membersError)
        } else {
          setFamilyMembers(members?.map(m => m.user_profiles) || [])
        }

        setLoading(false)
      } catch (err) {
        console.error('Data loading error:', err)
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const addEntry = async (entryData) => {
    if (!user || !userProfile) return

    try {
      // Get or create default puppy
      let { data: puppies } = await supabase
        .from('puppies')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)

      let puppyId
      if (!puppies || puppies.length === 0) {
        // Create default puppy
        const { data: newPuppy, error } = await supabase
          .from('puppies')
          .insert([{
            name: puppyName,
            owner_id: user.id
          }])
          .select()
          .single()

        if (error) {
          console.error('Error creating puppy:', error)
          return
        }
        puppyId = newPuppy.id
      } else {
        puppyId = puppies[0].id
      }

      const entry = {
        puppy_id: puppyId,
        user_id: user.id,
        type: entryData.type,
        details: entryData,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('puppy_entries')
        .insert([entry])
        .select(`
          *,
          user_profiles!inner(display_name, avatar_url)
        `)
        .single()

      if (error) {
        console.error('Error adding entry:', error)
      } else {
        setEntries(prev => [data, ...prev])
      }
    } catch (err) {
      console.error('Add entry error:', err)
    }
  }

  const updatePuppyName = async (newName) => {
    if (!user || !newName.trim()) return

    try {
      const { error } = await supabase
        .from('puppies')
        .update({ name: newName.trim() })
        .eq('owner_id', user.id)

      if (error) {
        console.error('Error updating puppy name:', error)
      } else {
        setPuppyName(newName.trim())
      }
    } catch (err) {
      console.error('Update puppy name error:', err)
    }
  }

  const updateUserProfile = async (updates) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
      } else {
        setUserProfile(data)
      }
    } catch (err) {
      console.error('Update profile error:', err)
    }
  }

  const exportData = async () => {
    if (!entries.length) return

    const data = {
      puppyName,
      userProfile,
      entries,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${puppyName.replace(/\s+/g, '_')}_data_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    // Data
    puppyName,
    entries,
    userProfile,
    familyMembers,
    loading,
    
    // Actions
    addEntry,
    updatePuppyName,
    updateUserProfile,
    exportData,
    
    // Legacy compatibility (for gradual migration)
    userName: userProfile?.display_name || 'User',
    users: familyMembers?.map(m => m.display_name) || [],
    setPuppyName: updatePuppyName,
    setUserName: (name) => updateUserProfile({ display_name: name }),
  }
} 