import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithPhone = async (phone) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      }
    })
    return { data, error }
  }

  const signInWithEmail = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email
    })
    return { data, error }
  }

  const verifyOtp = async (phone, token, type = 'sms') => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type
    })
    return { data, error }
  }

  const verifyEmailOtp = async (email, token, type = 'email') => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    session,
    loading,
    signInWithPhone,
    signInWithEmail,
    verifyOtp,
    verifyEmailOtp,
    signOut
  }
} 