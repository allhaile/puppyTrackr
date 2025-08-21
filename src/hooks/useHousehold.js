import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const useHousehold = (user) => {
  const [households, setHouseholds] = useState([]) // [{id, name, invite_code, owner_id, role, joined_at}]
  const [household, setHousehold] = useState(null) // active
  const [members, setMembers] = useState([])
  const [dogs, setDogs] = useState([])
  const [activeDogId, setActiveDogId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Helper to generate 6-char invite codes like ABC123
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  useEffect(() => {
    if (user) {
      fetchHouseholdData()
    } else {
      setHouseholds([])
      setHousehold(null)
      setMembers([])
      setDogs([])
      setActiveDogId(null)
      setLoading(false)
    }
  }, [user])

  const fetchMembersAndDogs = useCallback(async (householdId) => {
    if (!householdId) {
      setMembers([])
      setDogs([])
      setActiveDogId(null)
      return
    }

    // Members via RPC (avoids recursive RLS)
    const { data: membersData, error: membersError } = await supabase.rpc('get_household_members', {
      p_household_id: householdId
    })

    if (membersError) throw membersError

    const membersWithProfiles = (membersData || []).map((member) => ({
      id: member.user_id,
      role: member.role,
      joinedAt: member.joined_at,
      display_name: member.display_name || 'Unknown User',
      avatar_url: undefined,
      email: member.email
    }))

    setMembers(membersWithProfiles)

    // Dogs
    const { data: dogsData, error: dogsError } = await supabase
      .from('puppies')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true })

    if (dogsError) throw dogsError
    setDogs(dogsData)

    if (dogsData.length > 0 && !activeDogId) {
      setActiveDogId(dogsData[0].id)
    } else if (dogsData.length === 0) {
      setActiveDogId(null)
    }
  }, [activeDogId])

  const fetchHouseholdData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all memberships with household details
      const { data, error: membershipsError } = await supabase
        .from('household_members')
        .select(`
          household_id,
          role,
          joined_at,
          households:household_id (
            id,
            name,
            invite_code,
            owner_id
          )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })

      if (membershipsError) throw membershipsError

      if (!data || data.length === 0) {
        // No memberships
        setHouseholds([])
        setHousehold(null)
        setMembers([])
        setDogs([])
        setActiveDogId(null)
        return
      }

      // Normalize list, filtering out any null household rows (RLS could hide them)
      const normalized = data
        .filter(m => m.households)
        .map(m => ({
          id: m.households.id,
          name: m.households.name,
          invite_code: m.households.invite_code,
          owner_id: m.households.owner_id,
          role: m.role,
          joined_at: m.joined_at,
        }))

      if (normalized.length === 0) {
        // All rows hidden by RLS; leave a helpful error and reset state
        setError('Unable to load household details due to access policies')
        setHouseholds([])
        setHousehold(null)
        setMembers([])
        setDogs([])
        setActiveDogId(null)
        return
      }

      setHouseholds(normalized)

      // Choose active (keep existing if still present), else most recent
      let nextActive = household && normalized.find(h => h.id === household.id)
      if (!nextActive) {
        nextActive = normalized[0]
      }
      setHousehold(nextActive)

      // Fetch members and dogs for active
      await fetchMembersAndDogs(nextActive.id)
    } catch (e) {
      console.error('Error fetching household data:', e)
      setError(e.message)
      setHouseholds([])
      setHousehold(null)
      setMembers([])
      setDogs([])
      setActiveDogId(null)
    } finally {
      setLoading(false)
    }
  }

  const setActiveHouseholdId = async (householdId) => {
    const found = households.find(h => h.id === householdId)
    setHousehold(found || null)
    try {
      await fetchMembersAndDogs(found?.id)
    } catch (e) {
      setError(e.message)
    }
  }

  const addDog = async (dogData) => {
    try {
      setError(null)
      if (!household?.id) throw new Error('No active household')

      // Insert allowed columns
      const insertData = {
        name: dogData?.name || 'New Pup',
        avatar: dogData?.avatar || null,
        household_id: household.id
      }

      const { data, error } = await supabase
        .from('puppies')
        .insert([insertData])
        .select()
        .single()

      if (error) throw error

      setDogs(prev => [...prev, data])
      
      if (dogs.length === 0) {
        setActiveDogId(data.id)
      }

      return data
    } catch (error) {
      setError(error.message)
      return null
    }
  }

  const updateDog = async (dogId, updates) => {
    try {
      setError(null)

      // Only update valid columns
      const updateData = {}
      if (typeof updates?.name === 'string') {
        updateData.name = updates.name
      }
      if (typeof updates?.avatar === 'string') {
        updateData.avatar = updates.avatar
      }

      const { data, error } = await supabase
        .from('puppies')
        .update(updateData)
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
      if (!household?.id) throw new Error('No active household')
      const newCode = generateInviteCode()
      const { data, error } = await supabase
        .from('households')
        .update({ invite_code: newCode })
        .eq('id', household.id)
        .select('invite_code')
        .single()

      if (error) throw error

      setHousehold(prev => prev ? ({ ...prev, invite_code: data.invite_code }) : prev)
      setHouseholds(prev => prev.map(h => h.id === household.id ? { ...h, invite_code: data.invite_code } : h))
      return { success: true, inviteCode: data.invite_code }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const removeMember = async (memberId) => {
    try {
      setError(null)
      if (!household?.id) throw new Error('No active household')
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
      if (!household?.id) throw new Error('No active household')
      const { error } = await supabase
        .from('households')
        .update({ name: newName })
        .eq('id', household.id)

      if (error) throw error

      setHousehold(prev => prev ? ({ ...prev, name: newName }) : prev)
      setHouseholds(prev => prev.map(h => h.id === household.id ? { ...h, name: newName } : h))
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const createHousehold = async (name = 'My Home') => {
    try {
      setError(null)
      if (!user?.id) throw new Error('Not authenticated')

      // Create household where current user is the owner
      const { data: created, error: createError } = await supabase
        .from('households')
        .insert([{ name, owner_id: user.id }])
        .select()
        .single()

      if (createError) throw createError

      // Add membership explicitly (owner) - may already be added via trigger in some schemas, but safe to ensure
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{ household_id: created.id, user_id: user.id, role: 'owner' }])
      if (memberError && memberError.code !== '23505') { // ignore duplicate unique violation
        throw memberError
      }

      await fetchHouseholdData()
      return { success: true, household: created }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const deleteHousehold = async (householdId) => {
    try {
      setError(null)
      if (!user?.id) throw new Error('Not authenticated')
      const total = households.length
      if (total <= 1) {
        throw new Error('You must belong to at least one household')
      }

      // Only owner can delete due to RLS policy
      const targetId = householdId || household?.id
      if (!targetId) throw new Error('No household selected')

      const { error: delError } = await supabase
        .from('households')
        .delete()
        .eq('id', targetId)

      if (delError) throw delError

      await fetchHouseholdData()

      // If deletion removed the active one and none is set, ensure at least one exists.
      if (households.length === 0) {
        await createHousehold()
      }

      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const updateMemberRole = async (memberId, role) => {
    try {
      setError(null)
      if (!household?.id) throw new Error('No active household')
      const { error } = await supabase.rpc('set_member_role', {
        target_household_id: household.id,
        target_user_id: memberId,
        new_role: role
      })
      if (error) throw error
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m))
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const leaveHousehold = async () => {
    try {
      setError(null)
      if (!household?.id || !user?.id) throw new Error('Missing household or user')

      const { error: leaveError } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', household.id)
        .eq('user_id', user.id)

      if (leaveError) throw leaveError

      // Refresh memberships
      await fetchHouseholdData()

      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const activeDog = dogs.find(dog => dog.id === activeDogId)

  return {
    // Memberships
    households,
    household,
    setActiveHouseholdId,

    // Members & dogs
    members,
    dogs,
    activeDog,
    activeDogId,
    setActiveDogId,

    // Status
    loading,
    error,

    // Mutations
    addDog,
    updateDog,
    deleteDog,
    generateNewInviteCode,
    removeMember,
    updateHouseholdName,
    updateMemberRole,
    leaveHousehold,
    createHousehold,
    deleteHousehold,

    // Utils
    refetch: fetchHouseholdData
  }
} 