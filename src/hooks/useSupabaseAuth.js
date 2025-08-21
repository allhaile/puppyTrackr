import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id || 'No session')
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id || 'No user')
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      setLoading(true)
      console.log('Fetching profile for user:', userId)
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      )
      
      const queryPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) {
        console.log('Profile error:', error)
        // If profile doesn't exist, this might be a new user
        if (error.code === 'PGRST116') {
          console.log('Profile not found - checking if user exists in auth.users')
          
          // Get user info from Supabase auth to create profile
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            console.log('User exists in auth, creating profile...')
            // Try to create a basic profile using UPSERT to handle duplicates
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .upsert([{
                id: userId,
                display_name: user.email ? user.email.split('@')[0] : 'New User',
                email: user.email || null,
                phone: null
              }], {
                onConflict: 'id'
              })
              .select()
              .single()
            
            if (createError) {
              console.error('Failed to create profile:', createError)
              // If creation fails, set a minimal profile to avoid blocking the app
              setProfile({
                id: userId,
                display_name: 'User',
                email: user.email || null,
                phone: null
              })
              return
            }
            
            console.log('Created new profile:', newProfile)
            setProfile(newProfile)
            return
          } else {
            console.error('No user found in auth system')
            throw new Error('User not found in authentication system')
          }
        }
        throw error
      }
      console.log('Profile data:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (email, options = {}) => {
    try {
      setError(null)
      console.log('Attempting email OTP auth for:', email)
      
      // Use OTP authentication instead of signup with password
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: options.createUser === true // Explicitly create only when requested
        }
      })
      
      if (error) {
        console.error('Email OTP error:', error)
        throw error
      }
      
      console.log('OTP sent successfully to:', email)
      return { success: true }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const verifyOtp = async (params) => {
    try {
      setError(null)
      
      const { error } = await supabase.auth.verifyOtp(params)
      if (error) throw error
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // Clear any local volatile state
      try {
        localStorage.removeItem('pending_invite_code')
        localStorage.removeItem('onboarding_completed')
        localStorage.removeItem('household_setup_complete')
      } catch {}
    } catch (error) {
      setError(error.message)
    }
  }

  const updateProfile = async (updates) => {
    try {
      setError(null)
      const payload = {}
      if (typeof updates.display_name === 'string') payload.display_name = updates.display_name
      if (typeof updates.phone === 'string' || updates.phone === null) payload.phone = updates.phone
      if (typeof updates.first_name === 'string') payload.first_name = updates.first_name
      if (typeof updates.last_name === 'string') payload.last_name = updates.last_name
      if (typeof updates.username === 'string') payload.username = updates.username

      // If first/last provided and display_name missing, compute a nice display name
      if (!payload.display_name && (payload.first_name || payload.last_name)) {
        const first = payload.first_name || ''
        const last = payload.last_name || ''
        const combined = `${first} ${last}`.trim()
        if (combined) payload.display_name = combined
      }
      const { error } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', user.id)

      if (error) throw error
      await fetchProfile(user.id)
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    signInWithEmail,
    verifyOtp,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  }
} 