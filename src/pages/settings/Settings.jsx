import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import Icon from '../../components/ui/Icon'

const Settings = () => {
  const { 
    user, 
    profile, 
    household, 
    members, 
    dogs,
    updateProfile, 
    updateHouseholdName,
    generateNewInviteCode,
    removeMember,
    signOut 
  } = useAuth()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [profileForm, setProfileForm] = useState({
    display_name: profile?.display_name || '',
    email: profile?.email || '',
    phone: profile?.phone || ''
  })
  const [householdForm, setHouseholdForm] = useState({
    name: household?.name || ''
  })

  const handleProfileUpdate = async () => {
    const result = await updateProfile(profileForm)
    if (result.success) {
      setIsEditing(false)
    }
  }

  const handleHouseholdUpdate = async () => {
    const result = await updateHouseholdName(householdForm.name)
    if (result.success) {
      setIsEditing(false)
    }
  }

  const handleGenerateInvite = async () => {
    await generateNewInviteCode()
  }

  const handleRemoveMember = async (memberId) => {
    if (confirm('Are you sure you want to remove this member?')) {
      await removeMember(memberId)
    }
  }

  const inviteUrl = household?.invite_code 
    ? `${window.location.origin}/join/${household.invite_code}`
    : ''

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl)
    // TODO: Show toast notification
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'household', label: 'Household', icon: 'home' },
    { id: 'members', label: 'Members', icon: 'users' },
    { id: 'dogs', label: 'Dogs', icon: 'dog' },
    { id: 'preferences', label: 'Preferences', icon: 'settings' }
  ]

  const TabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-outline text-sm"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      display_name: e.target.value
                    }))}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-muted-foreground">{profile?.display_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed for security reasons
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <p className="text-muted-foreground">{user?.phone || 'Not provided'}</p>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      case 'household':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Household Settings</h2>
              {household?.userRole === 'owner' && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-outline text-sm"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Household Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={householdForm.name}
                    onChange={(e) => setHouseholdForm(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-muted-foreground">{household?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Role</label>
                <p className="text-muted-foreground capitalize">{household?.userRole}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Invite Code</label>
                <div className="flex items-center space-x-3">
                  <code className="bg-muted px-3 py-2 rounded text-sm font-mono">
                    {household?.invite_code}
                  </code>
                  {household?.userRole === 'owner' && (
                    <button
                      onClick={handleGenerateInvite}
                      className="btn-outline text-sm"
                    >
                      Regenerate
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Invite Link</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="input flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="btn-outline text-sm"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn-primary text-sm"
                  >
                    Share
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleHouseholdUpdate}
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      case 'members':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Household Members</h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn-primary text-sm"
              >
                Invite Member
              </button>
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Icon name="user" size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{member.display_name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  
                  {household?.userRole === 'owner' && member.id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 'dogs':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Dogs</h2>
              <button className="btn-primary text-sm">
                Add Dog
              </button>
            </div>

            <div className="space-y-3">
              {dogs?.map((dog) => (
                <div
                  key={dog.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      {dog.avatar_url ? (
                        <img
                          src={dog.avatar_url}
                          alt={dog.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Icon name="dog" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{dog.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dog.breed || 'Mixed breed'}
                        {dog.birth_date && ` • ${calculateAge(dog.birth_date)}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="btn-outline text-sm">Edit</button>
                    <button className="text-red-500 hover:text-red-700 text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">App Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme throughout the app
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified about important updates
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>

              <div className="pt-6 border-t">
                <button
                  onClick={signOut}
                  className="w-full btn-outline text-red-500 hover:bg-red-50 hover:border-red-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                       (today.getMonth() - birth.getMonth())
    
    if (ageInMonths < 12) {
      return `${ageInMonths} ${ageInMonths === 1 ? 'month' : 'months'} old`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return `${years} ${years === 1 ? 'year' : 'years'}${months > 0 ? ` ${months}mo` : ''} old`
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <Icon name={tab.icon} size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="glass-card">
              <TabContent />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background p-6 rounded-lg max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Invite Family Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Share this link:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="input flex-1 font-mono text-sm"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="btn-outline text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Send this link to family members so they can join your household.</p>
                <p className="mt-2">They'll need to:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Click the link</li>
                  <li>Sign up or sign in</li>
                  <li>Enter their name</li>
                </ol>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 btn-ghost"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Join ${household?.name}`,
                      text: `You've been invited to join ${household?.name} on PuppyTrackr!`,
                      url: inviteUrl
                    })
                  } else {
                    copyInviteLink()
                  }
                }}
                className="flex-1 btn-primary"
              >
                Share
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Settings