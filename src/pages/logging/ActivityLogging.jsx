import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePets } from '../../contexts/PetContext'
import { useAuth } from '../../contexts/AuthContext'
import Icon from '../../components/ui/Icon'

const ActivityLogging = () => {
  const navigate = useNavigate()
  const { activePet, addActivity, pets, setActivePet } = usePets()
  const { user } = useAuth()
  const initialType = (() => {
    const type = new URLSearchParams(window.location.search).get('type')
    return type || ''
  })()
  const [selectedType, setSelectedType] = useState(initialType)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    timestamp: new Date().toISOString().slice(0, 16),
    notes: '',
    amount: '',
    customAmount: '',
    duration: '',
    treat: false,
    energy: 3, // 1-5
    vibe: 'mid', // 'low' | 'mid' | 'celebratory'
    pottyPee: false,
    pottyPoop: false,
  })

  const activityTypes = [
    { type: 'meal', label: 'Meal', icon: 'meal', color: 'from-orange-400 to-orange-600' },
    { type: 'walk', label: 'Walk', icon: 'walk', color: 'from-green-400 to-green-600' },
    { type: 'potty', label: 'Potty', icon: 'potty', color: 'from-blue-400 to-blue-600' },
    { type: 'sleep', label: 'Sleep', icon: 'sleep', color: 'from-purple-400 to-purple-600' },
    { type: 'play', label: 'Play', icon: 'play', color: 'from-pink-400 to-pink-600' },
    { type: 'grooming', label: 'Grooming', icon: 'grooming', color: 'from-teal-400 to-teal-600' },
  ]

  // Auto-select first pet if none is active
  useEffect(() => {
    if (!activePet && pets && pets.length > 0) {
      setActivePet(pets[0].id)
    }
  }, [activePet, pets, setActivePet])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!selectedType || !activePet) return

    // Validate potty selection
    if (selectedType === 'potty' && !formData.pottyPee && !formData.pottyPoop) {
      setError('Please select at least one: pee or poop')
      return
    }

    const pottyType = selectedType === 'potty'
      ? (formData.pottyPee && formData.pottyPoop
          ? 'both'
          : formData.pottyPee
            ? 'pee'
            : 'poop')
      : undefined

    const resolvedAmount = selectedType === 'meal'
      ? (formData.amount === 'custom' ? formData.customAmount : formData.amount)
      : undefined

    const activity = {
      type: selectedType,
      petId: activePet.id,
      userId: user?.id,
      timestamp: formData.timestamp,
      notes: formData.notes || undefined,
      // Flexible details captured by backend as JSONB
      ...(selectedType === 'meal' && resolvedAmount && { amount: resolvedAmount }),
      ...(['walk', 'play', 'sleep'].includes(selectedType) && formData.duration && { duration: parseInt(formData.duration) }),
      ...(selectedType === 'potty' && { pottyType }),
      treat: !!formData.treat,
      energy: Number(formData.energy),
      vibe: formData.vibe,
    }

    // Remove empty/undefined
    Object.keys(activity).forEach(key => {
      if (activity[key] === '' || activity[key] === undefined || activity[key] === null) delete activity[key]
    })

    addActivity(activity)
    navigate('/')
  }

  // Loading state while selecting first pet
  if (!activePet && pets && pets.length > 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Preparing form...</p>
      </div>
    )
  }

  if (!activePet) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Please select a pet first</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-6">Log Activity for {activePet.name}</h1>

        {/* Activity Type Selection */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium">What are you logging?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {activityTypes.map((activity) => (
              <motion.button
                key={activity.type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedType(activity.type)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === activity.type
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                  <Icon name={activity.icon} className="text-white" size={20} />
                </div>
                <p className="text-xs font-medium">{activity.label}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Activity Form */}
        {selectedType && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 glass-card"
          >
            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            {/* Timestamp */}
            <div>
              <label className="block text-sm font-medium mb-2">When</label>
              <input
                type="datetime-local"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            {/* Dynamic fields based on activity type */}
            {['meal'].includes(selectedType) && (
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <select
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Select amount</option>
                  <option value="1/4 cup">1/4 cup</option>
                  <option value="1/2 cup">1/2 cup</option>
                  <option value="3/4 cup">3/4 cup</option>
                  <option value="1 cup">1 cup</option>
                  <option value="1 1/4 cups">1 1/4 cups</option>
                  <option value="1 1/2 cups">1 1/2 cups</option>
                  <option value="2 cups">2 cups</option>
                  <option value="50 g">50 g</option>
                  <option value="100 g">100 g</option>
                  <option value="150 g">150 g</option>
                  <option value="200 g">200 g</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="custom">Custom...</option>
                </select>
                {formData.amount === 'custom' && (
                  <input
                    type="text"
                    value={formData.customAmount}
                    onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                    placeholder="e.g., 3/4 cup or 85 g"
                    className="input w-full mt-2"
                  />
                )}
              </div>
            )}

            {['walk', 'play', 'sleep'].includes(selectedType) && (
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  className="input w-full"
                  min="1"
                />
              </div>
            )}

            {/* Potty type */}
            {selectedType === 'potty' && (
              <div>
                <label className="block text-sm font-medium mb-2">What happened?</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.pottyPee}
                      onChange={(e) => setFormData({ ...formData, pottyPee: e.target.checked })}
                    />
                    <span>Pee</span>
                  </label>
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.pottyPoop}
                      onChange={(e) => setFormData({ ...formData, pottyPoop: e.target.checked })}
                    />
                    <span>Poop</span>
                  </label>
                </div>
              </div>
            )}

            {/* Treat given */}
            <div>
              <label className="block text-sm font-medium mb-2">Treat</label>
              <label className="inline-flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.treat}
                  onChange={(e) => setFormData({ ...formData, treat: e.target.checked })}
                />
                <span>Treat given</span>
              </label>
            </div>

            {/* Energy rating (1-5) */}
            <div>
              <label className="block text-sm font-medium mb-2">Energy</label>
              <div className="flex space-x-2">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData({ ...formData, energy: n })}
                    className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                      formData.energy === n ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Vibe</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'low', label: 'Low vibe' },
                  { key: 'mid', label: 'Mid vibe' },
                  { key: 'celebratory', label: 'Celebratory vibe' },
                ].map(v => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, vibe: v.key })}
                    className={`py-2 px-3 rounded-lg border-2 transition-all ${
                      formData.vibe === v.key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional details..."
                className="input w-full h-24 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Save Activity
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  )
}

export default ActivityLogging