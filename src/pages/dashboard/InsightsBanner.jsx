import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import Icon from '../../components/ui/Icon'

const InsightsBanner = ({ pet, lastActivityTime }) => {
  const [currentInsight, setCurrentInsight] = useState(0)
  const [insights, setInsights] = useState([])

  useEffect(() => {
    const generatedInsights = []
    
    // Check last walk time
    const lastWalk = lastActivityTime('walk')
    if (lastWalk) {
      const hoursSinceWalk = (Date.now() - lastWalk) / (1000 * 60 * 60)
      if (hoursSinceWalk > 4) {
        generatedInsights.push({
          icon: 'walk',
          text: `${pet.name} hasn't been walked in ${formatDistanceToNow(lastWalk)}`,
          action: 'Time for a walk?',
          color: 'from-green-400 to-green-600',
        })
      }
    }

    // Check last meal
    const lastMeal = lastActivityTime('meal')
    if (lastMeal) {
      const hoursSinceMeal = (Date.now() - lastMeal) / (1000 * 60 * 60)
      if (hoursSinceMeal > 6) {
        generatedInsights.push({
          icon: 'meal',
          text: `Last meal was ${formatDistanceToNow(lastMeal, { addSuffix: true })}`,
          action: 'Schedule next meal',
          color: 'from-orange-400 to-orange-600',
        })
      }
    }

    // Check last potty break
    const lastPotty = lastActivityTime('potty')
    if (lastPotty) {
      const hoursSincePotty = (Date.now() - lastPotty) / (1000 * 60 * 60)
      if (hoursSincePotty > 3) {
        generatedInsights.push({
          icon: 'potty',
          text: `${pet.name} might need a potty break`,
          action: `Last one was ${formatDistanceToNow(lastPotty, { addSuffix: true })}`,
          color: 'from-blue-400 to-blue-600',
        })
      }
    }

    // Default insights if no specific ones
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        icon: 'pet',
        text: `${pet.name} is doing great today!`,
        action: 'Keep up the good work',
        color: 'from-primary to-secondary',
      })
    }

    setInsights(generatedInsights)
  }, [pet, lastActivityTime])

  useEffect(() => {
    if (insights.length > 1) {
      const interval = setInterval(() => {
        setCurrentInsight((prev) => (prev + 1) % insights.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [insights])

  if (insights.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentInsight}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center space-x-4"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${insights[currentInsight]?.color} flex items-center justify-center flex-shrink-0`}>
            <Icon name={insights[currentInsight]?.icon} className="text-white" size={24} />
          </div>
          
          <div className="flex-1">
            <p className="font-medium">{insights[currentInsight]?.text}</p>
            <p className="text-sm text-muted-foreground">{insights[currentInsight]?.action}</p>
          </div>

          {insights.length > 1 && (
            <div className="flex space-x-1">
              {insights.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentInsight ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default InsightsBanner