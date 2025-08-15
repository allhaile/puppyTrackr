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
  const [customAmount, setCustomAmount] = useState('')
  const [duration, setDuration] = useState('')
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16))
  const [energy, setEnergy] = useState(3)
  const [vibe, setVibe] = useState('mid')
  const [pottyPee, setPottyPee] = useState(false)
  const [pottyPoop, setPottyPoop] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const resolvedAmount = type === 'meal'
      ? (amount === 'custom' ? customAmount : amount)
      : undefined

    const pottyType = type === 'potty'
      ? (pottyPee && pottyPoop
          ? 'both'
          : pottyPee
            ? 'pee'
            : pottyPoop
              ? 'poop'
              : undefined)
      : undefined

    const activity = {
      type,
      petId: activePet.id,
      userId: user?.id,
      timestamp,
      notes,
      ...(type === 'meal' && resolvedAmount && { amount: resolvedAmount }),
      ...(['walk', 'play', 'sleep'].includes(type) && duration && { duration: parseInt(duration) }),
      ...(type === 'potty' && pottyType && { pottyType }),
      energy,
      vibe,
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
      fields: ['duration', 'notes'],
    },
    potty: {
      title: 'Log Potty Break',
      icon: 'potty',
      color: 'from-blue-400 to-blue-600',
      fields: ['notes'],
    },
    sleep: {
      title: 'Log Sleep',
      icon: 'sleep',
      color: 'from-purple-400 to-purple-600',
      fields: ['duration', 'notes'],
    },
    play: {
      title: 'Log Play',
      icon: 'play',
      color: 'from-pink-400 to-pink-600',
      fields: ['duration', 'notes'],
    },
    grooming: {
      title: 'Log Grooming',
      icon: 'grooming',
      color: 'from-teal-400 to-teal-600',
      fields: ['notes'],
    }
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
                <select
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
                {amount === 'custom' && (
                  <input
                    type="text"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="e.g., 3/4 cup or 85 g"
                    className="input w-full mt-2"
                  />
                )}
              </div>
            )}

            {/* Duration field (for walks, sleep, play) */}
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

            {/* Potty type checkboxes */}
            {type === 'potty' && (
              <div>
                <label className="block text-sm font-medium mb-2">What happened?</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={pottyPee}
                      onChange={(e) => setPottyPee(e.target.checked)}
                    />
                    <span>Pee</span>
                  </label>
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={pottyPoop}
                      onChange={(e) => setPottyPoop(e.target.checked)}
                    />
                    <span>Poop</span>
                  </label>
                </div>
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

            {/* Energy rating (1-5) */}
            <div>
              <label className="block text-sm font-medium mb-2">Energy</label>
              <div className="flex space-x-2">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEnergy(n)}
                    className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                      energy === n ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
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
                    onClick={() => setVibe(v.key)}
                    className={`py-2 px-3 rounded-lg border-2 transition-all ${
                      vibe === v.key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

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