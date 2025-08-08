import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useHousehold = (user) => {
  const [household, setHousehold] = useState(null)
  const [members, setMembers] = useState([])
  const [dogs, setDogs] = useState([])
  const [activeDogId, setActiveDogId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchHouseholdData()
    } else {
      setHousehold(null)
      setMembers([])
      setDogs([])
      setActiveDogId(null)
      setLoading(false)
    }
  }, [user])

  const fetchHouseholdData = async () => {
    try {
      setLoading(true)
      
      // Get user's household
      const { data: householdData, error: householdError } = await supabase
        .from('household_members')
        .select(`
          household_id,
          role,
          households (
            id,
            name,
            invite_code,
            created_by
          )
        `)
        .eq('user_id', user.id)
        .single()

      if (householdError) throw householdError

      const householdInfo = householdData.households
      setHousehold({
        ...householdInfo,
        userRole: householdData.role
      })

      // Get household members
      const { data: membersData, error: membersError } = await supabase
        .from('household_members')
        .select(`
          user_id,
          role,
          joined_at,
          user_profiles (
            display_name,
            avatar_url,
            email
          )
        `)
        .eq('household_id', householdInfo.id)

      if (membersError) throw membersError

      setMembers(membersData.map(member => ({
        id: member.user_id,
        role: member.role,
        joinedAt: member.joined_at,
        ...member.user_profiles
      })))

      // Get household dogs
      const { data: dogsData, error: dogsError } = await supabase
        .from('puppies')
        .select('*')
        .eq('household_id', householdInfo.id)
        .order('created_at', { ascending: true })

      if (dogsError) throw dogsError

      setDogs(dogsData)
      
      // Set active dog to first one if none selected
      if (dogsData.length > 0 && !activeDogId) {
        setActiveDogId(dogsData[0].id)
      }

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const addDog = async (dogData) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('puppies')
        .insert([{
          ...dogData,
          household_id: household.id,
          created_by: user.id
        }])
        .select()
        .single()

      if (error) throw error

      setDogs(prev => [...prev, data])
      
      // Set as active dog if it's the first one
      if (dogs.length === 0) {
        setActiveDogId(data.id)
      }

      return { success: true, dog: data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const updateDog = async (dogId, updates) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('puppies')
        .update(updates)
        .eq('id', dogId)
        .select()
        .single()

      if (error) throw error

      setDogs(prev => prev.map(dog => 
        dog.id === dogId ? data : dog
      ))

      return { success: true, dog: data }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const deleteDog = async (dogId) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('puppies')
        .delete()
        .eq('id', dogId)

      if (error) throw error

      setDogs(prev => prev.filter(dog => dog.id !== dogId))
      
      // If deleted dog was active, switch to another
      if (activeDogId === dogId) {
        const remainingDogs = dogs.filter(dog => dog.id !== dogId)
        setActiveDogId(remainingDogs.length > 0 ? remainingDogs[0].id : null)
      }

      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const generateNewInviteCode = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('households')
        .update({ invite_code: crypto.randomUUID().slice(0, 8) })
        .eq('id', household.id)
        .select('invite_code')
        .single()

      if (error) throw error

      setHousehold(prev => ({ ...prev, invite_code: data.invite_code }))
      return { success: true, inviteCode: data.invite_code }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const removeMember = async (memberId) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', household.id)
        .eq('user_id', memberId)

      if (error) throw error

      setMembers(prev => prev.filter(member => member.id !== memberId))
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const updateHouseholdName = async (newName) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('households')
        .update({ name: newName })
        .eq('id', household.id)

      if (error) throw error

      setHousehold(prev => ({ ...prev, name: newName }))
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const activeDog = dogs.find(dog => dog.id === activeDogId)

  return {
    household,
    members,
    dogs,
    activeDog,
    activeDogId,
    setActiveDogId,
    loading,
    error,
    addDog,
    updateDog,
    deleteDog,
    generateNewInviteCode,
    removeMember,
    updateHouseholdName,
    refetch: fetchHouseholdData
  }
} 