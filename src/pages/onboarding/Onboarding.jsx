import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { dogBreeds } from '../../lib/dogBreeds'
import { useAuth } from '../../contexts/AuthContext'

const Onboarding = () => {
  const navigate = useNavigate()
  const { updateProfile, profile } = useAuth()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('owner')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    petName: '',
    petBreed: '',
    petAge: '',
  })

  const handleComplete = async () => {
    try {
      setSaving(true)
      setError('')
      const displayName = `${formData.first_name} ${formData.last_name}`.trim() || profile?.display_name
      const result = await updateProfile({
        first_name: formData.first_name.trim() || null,
        last_name: formData.last_name.trim() || null,
        username: formData.username.trim() || null,
        display_name: displayName
      })
      if (!result.success) throw new Error(result.error || 'Failed to save profile')

      localStorage.setItem('onboarding_completed', 'true')
      const target = role === 'owner' ? '/household/setup?mode=create' : '/household/setup?mode=join'
      navigate(target, { replace: true })
    } catch (e) {
      setError(e.message || 'Could not complete onboarding')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    {
      title: 'Welcome to PuppyTrackr!',
      description: 'The modern way to track and care for your pets',
      content: (
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Icon name="pet" size={48} className="text-white" />
          </div>
          <p className="text-muted-foreground mb-6">
            Track activities, coordinate care, and keep your pet healthy and happy.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setRole('owner')}
              className={`py-3 rounded-lg border ${role === 'owner' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50'}`}
            >
              I\'m an Owner
            </button>
            <button
              onClick={() => setRole('support')}
              className={`py-3 rounded-lg border ${role === 'support' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50'}`}
            >
              I\'m Support
            </button>
          </div>
        </div>
      ),
    },
    {
      title: 'Your details',
      description: 'We\'ll use these to personalize your account',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2">First name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g., Alex"
                className="input w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g., Kim"
                className="input w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s+/g, '').toLowerCase() })}
              placeholder="yourhandle"
              className="input w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">Public identifier; must be unique.</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Add your first pet (optional)',
      description: 'You can do this later in the app',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pet name</label>
            <input
              type="text"
              value={formData.petName}
              onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
              placeholder="e.g., Buddy"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Breed</label>
            <input
              type="text"
              value={formData.petBreed}
              onChange={(e) => setFormData({ ...formData, petBreed: e.target.value })}
              placeholder="e.g., Golden Retriever"
              className="input w-full"
              list="breed-options-onboarding"
            />
            <datalist id="breed-options-onboarding">
              {dogBreeds.map((breed) => (
                <option key={breed} value={breed} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="text"
              value={formData.petAge}
              onChange={(e) => setFormData({ ...formData, petAge: e.target.value })}
              placeholder="e.g., 2 years"
              className="input w-full"
            />
          </div>
        </div>
      ),
    },
  ]

  const currentStep = steps[step]
  const isLastStep = step === steps.length - 1
  const canContinue = (step === 0) || (step === 1 && formData.first_name && formData.last_name && formData.username) || step === 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-md"
      >
        <div className="glass-card">
          {/* Progress */}
          <div className="flex space-x-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{currentStep.title}</h1>
              <p className="text-muted-foreground">{currentStep.description}</p>
            </div>
            
            <div className="py-8">
              {currentStep.content}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 btn-ghost"
              >
                Back
              </button>
            )}
            <button
              onClick={isLastStep ? handleComplete : () => setStep(step + 1)}
              disabled={!canContinue || saving}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLastStep ? (saving ? 'Saving...' : 'Finish') : 'Continue'}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Onboarding