import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import LoadingScreen from '../ui/LoadingScreen'
import Icon from '../ui/Icon'

const InviteHandler = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [household, setHousehold] = useState(null)
  const [error, setError] = useState(null)
  const [displayName, setDisplayName] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (code && isAuthenticated) {
      fetchHouseholdInfo()
    } else if (code) {
      // Store invite code for after authentication
      localStorage.setItem('pending_invite_code', code)
    }
  }, [code, isAuthenticated])

  const fetchHouseholdInfo = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('households')
        .select('id, name, created_by')
        .eq('invite_code', code)
        .single()

      if (error) throw error

      setHousehold(data)
    } catch (error) {
      setError('Invalid or expired invite link')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinHousehold = async () => {
    try {
      setJoining(true)
      setError(null)

      const { data, error } = await supabase.rpc('join_household_by_invite', {
        invite_code_param: code,
        user_display_name: displayName || null
      })

      if (error) {
        if (error.message.includes('already a member')) {
          setError('You are already a member of this household')
        } else {
          throw error
        }
        return
      }

      // Clear any stored invite code
      localStorage.removeItem('pending_invite_code')
      
      // Redirect to dashboard
      navigate('/', { replace: true })
    } catch (error) {
      setError(error.message || 'Failed to join household')
    } finally {
      setJoining(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
            <Icon name="users" className="text-white" size={32} />
          </div>
          <h1 className="text-xl font-bold mb-2">Join {household?.name || 'Household'}</h1>
          <p className="text-muted-foreground mb-4">Please sign in to accept this invitation</p>
          <div className="text-sm text-muted-foreground">
            You'll be redirected after signing in
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingScreen message="Loading invitation..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-4">
              <Icon name="alertCircle" className="text-red-500" size={32} />
            </div>
            <h1 className="text-xl font-bold mb-2">Invalid Invitation</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary w-full"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <Icon name="users" className="text-white" size={32} />
            </div>
            <h1 className="text-xl font-bold">Join {household?.name}</h1>
            <p className="text-muted-foreground">
              You've been invited to join this household on PuppyTrackr
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Display Name (Optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should your family see your name?"
                className="input w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can change this later in settings
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleJoinHousehold}
                disabled={joining}
                className="w-full btn-primary disabled:opacity-50"
              >
                {joining ? 'Joining...' : 'Join Household'}
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full btn-ghost"
              >
                Maybe Later
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              By joining, you'll be able to track and view activities for all pets in this household
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default InviteHandler 