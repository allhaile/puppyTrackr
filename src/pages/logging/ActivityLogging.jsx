import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePets } from '../../contexts/PetContext'
import { useAuth } from '../../contexts/AuthContext'
import Icon from '../../components/ui/Icon'

const ActivityLogging = () => {
  const navigate = useNavigate()
  const { activePet, addActivity } = usePets()
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState({
    timestamp: new Date().toISOString().slice(0, 16),
    notes: '',
    amount: '',
    duration: '',
    location: '',
    mood: '',
    energy: '',
  })

  const activityTypes = [
    { type: 'meal', label: 'Meal', icon: 'meal', color: 'from-orange-400 to-orange-600' },
    { type: 'walk', label: 'Walk', icon: 'walk', color: 'from-green-400 to-green-600' },
    { type: 'potty', label: 'Potty', icon: 'potty', color: 'from-blue-400 to-blue-600' },
    { type: 'sleep', label: 'Sleep', icon: 'sleep', color: 'from-purple-400 to-purple-600' },
    { type: 'play', label: 'Play', icon: 'play', color: 'from-pink-400 to-pink-600' },
    { type: 'groom', label: 'Grooming', icon: 'groom', color: 'from-teal-400 to-teal-600' },
    { type: 'vet', label: 'Vet Visit', icon: 'vet', color: 'from-red-400 to-red-600' },
    { type: 'medication', label: 'Medication', icon: 'medication', color: 'from-indigo-400 to-indigo-600' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedType || !activePet) return

    const activity = {
      type: selectedType,
      petId: activePet.id,
      caregiverId: user?.id || 'default',
      ...formData,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
    }

    // Remove empty fields
    Object.keys(activity).forEach(key => {
      if (!activity[key]) delete activity[key]
    })

    addActivity(activity)
    navigate('/')
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
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g., 1 cup, 200g"
                  className="input w-full"
                />
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

            {['walk', 'potty', 'play'].includes(selectedType) && (
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Backyard, Dog Park"
                  className="input w-full"
                />
              </div>
            )}

            {/* Mood selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Mood</label>
              <div className="flex space-x-2">
                {['😊', '😐', '😔', '😴', '🤗'].map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood })}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      formData.mood === mood
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xl">{mood}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy level */}
            {['walk', 'play'].includes(selectedType) && (
              <div>
                <label className="block text-sm font-medium mb-2">Energy Level</label>
                <div className="flex space-x-2">
                  {['Low', 'Medium', 'High'].map((energy) => (
                    <button
                      key={energy}
                      type="button"
                      onClick={() => setFormData({ ...formData, energy })}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                        formData.energy === energy
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {energy}
                    </button>
                  ))}
                </div>
              </div>
            )}

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