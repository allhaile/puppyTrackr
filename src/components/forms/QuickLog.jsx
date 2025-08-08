import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePets } from '../../contexts/PetContext'
import { useAuth } from '../../contexts/AuthContext'
import Icon from '../ui/Icon'

const QuickLog = ({ type, onClose }) => {
  const { activePet, addActivity } = usePets()
  const { user } = useAuth()
  const [notes, setNotes] = useState('')
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [location, setLocation] = useState('')
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16))

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const activity = {
      type,
      petId: activePet.id,
      caregiverId: user?.id || 'default',
      timestamp,
      notes,
      ...(amount && { amount }),
      ...(duration && { duration: parseInt(duration) }),
      ...(location && { location }),
    }
    
    addActivity(activity)
    onClose()
  }

  const typeConfig = {
    meal: {
      title: 'Log Meal',
      icon: 'meal',
      color: 'from-orange-400 to-orange-600',
      fields: ['amount', 'notes'],
    },
    walk: {
      title: 'Log Walk',
      icon: 'walk',
      color: 'from-green-400 to-green-600',
      fields: ['duration', 'location', 'notes'],
    },
    potty: {
      title: 'Log Potty Break',
      icon: 'potty',
      color: 'from-blue-400 to-blue-600',
      fields: ['location', 'notes'],
    },
    sleep: {
      title: 'Log Sleep',
      icon: 'sleep',
      color: 'from-purple-400 to-purple-600',
      fields: ['duration', 'notes'],
    },
  }

  const config = typeConfig[type] || typeConfig.meal

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className={`bg-gradient-to-br ${config.color} p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon name={config.icon} size={24} />
                </div>
                <h2 className="text-xl font-bold">{config.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <p className="text-white/80">Recording for {activePet?.name}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Timestamp */}
            <div>
              <label className="block text-sm font-medium mb-2">When</label>
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            {/* Amount field (for meals) */}
            {config.fields.includes('amount') && (
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 1 cup, 200g"
                  className="input w-full"
                />
              </div>
            )}

            {/* Duration field (for walks, sleep) */}
            {config.fields.includes('duration') && (
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  className="input w-full"
                  min="1"
                />
              </div>
            )}

            {/* Location field */}
            {config.fields.includes('location') && (
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Backyard, Park"
                  className="input w-full"
                />
              </div>
            )}

            {/* Notes */}
            {config.fields.includes('notes') && (
              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details..."
                  className="input w-full h-20 resize-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
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
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuickLog