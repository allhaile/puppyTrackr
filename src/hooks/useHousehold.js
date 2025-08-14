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

  const createHouseholdForUser = async () => {
    try {
      console.log('Creating household for user:', user?.id)
      
      // Generate a household name based on user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single()
      
      const householdName = profile?.display_name 
        ? `${profile.display_name}'s Household`
        : profile?.email 
        ? `${profile.email.split('@')[0]}'s Household`
        : 'My Household'
      
      // Create the household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert([{
          name: householdName,
          created_by: user.id
        }])
        .select()
        .single()
      
      if (householdError) {
        console.error('Error creating household:', householdError)
        throw householdError
      }
      
      console.log('Created household:', household)
      
      // Add user as owner of the household
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: household.id,
          user_id: user.id,
          role: 'owner'
        }])
      
      if (memberError) {
        console.error('Error adding user to household:', memberError)
        throw memberError
      }
      
      console.log('Added user as household owner')
      return household.id
      
    } catch (error) {
      console.error('Failed to create household:', error)
      throw error
    }
  }

  const fetchHouseholdData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching household data for user:', user?.id)
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Household fetch timeout')), 10000)
      )
      
      // Try the complex query first, with fallback to simple queries
      let householdData, householdError
      
      try {
        // Get user's household using foreign key relationship
        const householdQueryPromise = supabase
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

        const result = await Promise.race([householdQueryPromise, timeoutPromise])
        householdData = result.data
        householdError = result.error
      } catch (relationshipError) {
        console.log('Foreign key relationship failed, trying simple query:', relationshipError)
        
        // Fallback: Get household membership first, then household details separately
        const { data: membershipData, error: membershipError } = await Promise.race([
          supabase
            .from('household_members')
            .select('household_id, role')
            .eq('user_id', user.id)
            .single(),
          timeoutPromise
        ])
        
        if (membershipError) {
          householdError = membershipError
        } else {
          // Get household details separately
          const { data: householdDetails, error: householdDetailsError } = await Promise.race([
            supabase
              .from('households')
              .select('id, name, invite_code, created_by')
              .eq('id', membershipData.household_id)
              .single(),
            timeoutPromise
          ])
          
          if (householdDetailsError) {
            householdError = householdDetailsError
          } else {
            // Combine the data manually
            householdData = {
              household_id: membershipData.household_id,
              role: membershipData.role,
              households: householdDetails
            }
          }
        }
      }

      if (householdError) {
        console.log('Household error:', householdError)
        // If user doesn't have a household yet, this is expected
        if (householdError.code === 'PGRST116') {
          console.log('User has no household - creating one automatically')
          // Try to create a household automatically
          try {
            const householdId = await createHouseholdForUser()
            if (householdId) {
              // Retry fetching household data after creation
              await fetchHouseholdData()
              return
            }
          } catch (createError) {
            console.error('Failed to create household:', createError)
            setError('Failed to set up your household. Please try refreshing the page.')
          }
          
          setHousehold(null)
          setMembers([])
          setDogs([])
          setActiveDogId(null)
          setLoading(false)
          return
        }
        throw householdError
      }

      console.log('Household data:', householdData)
      const householdInfo = householdData.households
      setHousehold({
        ...householdInfo,
        userRole: householdData.role
      })

      // Get household members with simple query (no foreign key relationship)
      const { data: membersData, error: membersError } = await Promise.race([
        supabase
          .from('household_members')
          .select('user_id, role, joined_at')
          .eq('household_id', householdInfo.id),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Members fetch timeout')), 10000)
        )
      ])

      if (membersError) {
        console.log('Members error:', membersError)
        throw membersError
      }

      // Get user profiles separately for each member
      const membersWithProfiles = await Promise.all(
        membersData.map(async (member) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name, avatar_url, email')
            .eq('id', member.user_id)
            .single()
          
          return {
            id: member.user_id,
            role: member.role,
            joinedAt: member.joined_at,
            display_name: profile?.display_name || 'Unknown User',
            avatar_url: profile?.avatar_url,
            email: profile?.email
          }
        })
      )

      console.log('Members data:', membersWithProfiles)
      setMembers(membersWithProfiles)

      // Get household dogs with timeout
      const dogsQueryPromise = supabase
        .from('puppies')
        .select('*')
        .eq('household_id', householdInfo.id)
        .order('created_at', { ascending: true })

      const { data: dogsData, error: dogsError } = await Promise.race([
        dogsQueryPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Dogs fetch timeout')), 10000)
        )
      ])

      if (dogsError) {
        console.log('Dogs error:', dogsError)
        throw dogsError
      }

      console.log('Dogs data:', dogsData)
      setDogs(dogsData)
      
      // Set active dog to first one if none selected
      if (dogsData.length > 0 && !activeDogId) {
        setActiveDogId(dogsData[0].id)
      }

    } catch (error) {
      console.error('Error fetching household data:', error)
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