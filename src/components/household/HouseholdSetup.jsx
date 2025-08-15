import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Icon from '../ui/Icon'

const HouseholdSetup = () => {
  const navigate = useNavigate()
  const { user, profile, household, households, updateHouseholdName } = useAuth()

  const [mode, setMode] = useState('create') // 'create' | 'join'
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const suggestedName = useMemo(() => {
    const base = profile?.display_name || user?.email?.split('@')[0] || 'My'
    return `${base}'s Household`
  }, [profile, user])

  const handleCreate = async () => {
    try {
      setLoading(true)
      setError('')

      const targetName = (householdName || suggestedName).trim()
      if (!targetName) {
        setError('Please enter a household name')
        setLoading(false)
        return
      }

      if (!household && (!households || households.length === 0)) {
        // Create new household + owner membership
        const { data: newHousehold, error: hErr } = await supabase
          .from('households')
          .insert([{ name: targetName, owner_id: user.id }])
          .select()
          .single()
        if (hErr) throw hErr

        const { error: mErr } = await supabase
          .from('household_members')
          .insert([{ household_id: newHousehold.id, user_id: user.id, role: 'owner' }])
        if (mErr) throw mErr
      } else {
        // Rename active household (owner-allowed)
        const result = await updateHouseholdName(targetName)
        if (!result?.success) {
          throw new Error(result?.error || 'Failed to set household name')
        }
      }

      localStorage.setItem('household_setup_complete', 'true')
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message || 'Failed to create household')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    try {
      setLoading(true)
      setError('')

      const code = inviteCode.trim().toUpperCase()
      if (!code || code.length < 6) {
        setError('Enter a valid 6-character invite code')
        setLoading(false)
        return
      }

      const { error: rpcError } = await supabase.rpc('join_household_by_invite', {
        invite_code_param: code
      })

      if (rpcError) {
        if (rpcError.message?.toLowerCase().includes('already a member')) {
          setError('You are already a member of this household')
        } else if (rpcError.message?.toLowerCase().includes('invalid')) {
          setError('Invalid or expired invite code')
        } else {
          throw rpcError
        }
        return
      }

      localStorage.setItem('household_setup_complete', 'true')
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message || 'Failed to join household')
    } finally {
      setLoading(false)
    }
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
              <Icon name="home" className="text-white" size={32} />
            </div>
            <h1 className="text-xl font-bold">Set up your household</h1>
            <p className="text-muted-foreground">Create a new household or join an existing one</p>
          </div>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => setMode('create')}
              className={`py-2 rounded-lg border text-sm ${mode === 'create' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50'}`}
            >
              Create
            </button>
            <button
              onClick={() => setMode('join')}
              className={`py-2 rounded-lg border text-sm ${mode === 'join' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50'}`}
            >
              Join
            </button>
          </div>

          {mode === 'create' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Household name</label>
                <input
                  type="text"
                  placeholder={suggestedName}
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  className="input w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can change this later in Settings
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Create Household'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Invite code</label>
                <input
                  type="text"
                  placeholder="ABC123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input w-full uppercase"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ask a household owner for their 6-character code
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Household'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default HouseholdSetup 