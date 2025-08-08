import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePets } from '../../contexts/PetContext'
import Icon from '../ui/Icon'
import QuickLog from '../forms/QuickLog'

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showQuickLog, setShowQuickLog] = useState(false)
  const { activePet } = usePets()
  const navigate = useNavigate()

  const actions = [
    { icon: 'meal', label: 'Meal', color: 'from-orange-400 to-orange-600', type: 'meal' },
    { icon: 'walk', label: 'Walk', color: 'from-green-400 to-green-600', type: 'walk' },
    { icon: 'potty', label: 'Potty', color: 'from-blue-400 to-blue-600', type: 'potty' },
    { icon: 'sleep', label: 'Sleep', color: 'from-purple-400 to-purple-600', type: 'sleep' },
  ]

  const handleQuickAction = (type) => {
    setShowQuickLog(type)
    setIsOpen(false)
  }

  if (!activePet) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Quick Actions */}
            <div className="fixed bottom-24 right-4 z-50 space-y-3">
              {actions.map((action, index) => (
                <motion.button
                  key={action.type}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleQuickAction(action.type)}
                  className="flex items-center space-x-3 bg-card rounded-full pl-4 pr-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <Icon name={action.icon} className="text-white" size={20} />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </motion.button>
              ))}
              
              <motion.button
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: actions.length * 0.05 }}
                onClick={() => {
                  navigate('/log')
                  setIsOpen(false)
                }}
                className="flex items-center space-x-3 bg-card rounded-full pl-4 pr-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                  <Icon name="edit" className="text-white" size={20} />
                </div>
                <span className="font-medium">Custom</span>
              </motion.button>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <Icon name="plus" className="text-white" size={28} />
      </motion.button>

      {/* Quick Log Modal */}
      {showQuickLog && (
        <QuickLog
          type={showQuickLog}
          onClose={() => setShowQuickLog(false)}
        />
      )}
    </>
  )
}

export default FloatingActionButton