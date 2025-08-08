import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'

const Onboarding = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    userName: '',
    petName: '',
    petBreed: '',
    petAge: '',
  })

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true')
    localStorage.setItem('user', JSON.stringify({ name: formData.userName }))
    
    // Create first pet
    const pet = {
      id: Date.now().toString(),
      name: formData.petName,
      breed: formData.petBreed,
      age: formData.petAge,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('pet-storage', JSON.stringify({ 
      pets: [pet], 
      activePetId: pet.id 
    }))
    
    window.location.href = '/'
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
          <p className="text-muted-foreground mb-8">
            Track activities, coordinate care, and keep your pet healthy and happy.
          </p>
        </div>
      ),
    },
    {
      title: 'What\'s your name?',
      description: 'Let\'s personalize your experience',
      content: (
        <div>
          <input
            type="text"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
            placeholder="Your name"
            className="input w-full"
            autoFocus
          />
        </div>
      ),
    },
    {
      title: 'Add your first pet',
      description: 'Tell us about your furry friend',
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
            />
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
  const canContinue = step === 0 || 
    (step === 1 && formData.userName) || 
    (step === 2 && formData.petName)

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
              disabled={!canContinue}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLastStep ? 'Get Started' : 'Continue'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Onboarding