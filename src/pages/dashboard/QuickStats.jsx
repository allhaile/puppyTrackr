import React from 'react'
import { motion } from 'framer-motion'
import Icon from '../../components/ui/Icon'

const QuickStats = ({ stats }) => {
  const statCards = [
    { 
      label: 'Meals', 
      value: stats.meals, 
      icon: 'meal', 
      color: 'from-orange-400 to-orange-600',
      target: 3,
    },
    { 
      label: 'Potty Breaks', 
      value: stats.potty, 
      icon: 'potty', 
      color: 'from-blue-400 to-blue-600',
      target: 5,
    },
    { 
      label: 'Walks', 
      value: stats.walks, 
      icon: 'walk', 
      color: 'from-green-400 to-green-600',
      target: 2,
    },
    { 
      label: 'Medications', 
      value: stats.medications, 
      icon: 'medication', 
      color: 'from-indigo-400 to-indigo-600',
      target: 2,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const progress = stat.target > 0 ? (stat.value / stat.target) * 100 : 0
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card relative overflow-hidden"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon name={stat.icon} className="text-white" size={20} />
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              
              {/* Progress bar */}
              {stat.target > 0 && (
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
                    className={`h-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default QuickStats