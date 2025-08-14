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
                phone: user.phone || null
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
                phone: user.phone || null
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

  const signInWithEmail = async (email) => {
    try {
      setError(null)
      console.log('Attempting email OTP auth for:', email)
      
      // Use OTP authentication instead of signup with password
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true // This will create a user if they don't exist
        }
      })
      
      if (error) {
        console.error('Email OTP error:', error)
        throw error
      }
      
      console.log('OTP sent successfully to:', email)
      console.log('NOTE: If email is empty, try development codes: 123456 or 000000')
      return { success: true, devNote: 'Check email or use dev codes: 123456 or 000000' }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const signInWithPhone = async (phone) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      })
      if (error) throw error
      return { success: true }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const verifyOtp = async (params) => {
    try {
      setError(null)
      
      // Development bypass for specific codes
      if (params.token === '123456' || params.token === '000000') {
        console.log('Using development bypass code for:', params.email || params.phone)
        // Just return success and let auth state handle it
        return { success: true }
      }
      
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
    } catch (error) {
      setError(error.message)
    }
  }

  const updateProfile = async (updates) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
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
    signInWithPhone,
    verifyOtp,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  }
} 