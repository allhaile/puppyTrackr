import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { usePets } from '../../contexts/PetContext'
import Icon from '../../components/ui/Icon'

const AnalyticsSimple = () => {
  const { activities, activePet } = usePets()
  const [timeRange, setTimeRange] = useState('week')
  
  // Calculate basic statistics
  const stats = useMemo(() => {
    if (!activities) return { total: 0, types: {} }
    
    const types = {}
    activities.forEach(activity => {
      types[activity.type] = (types[activity.type] || 0) + 1
    })
    
    return { 
      total: activities.length,
      types 
    }
  }, [activities])
  
  // Activity types configuration
  const activityTypes = [
    { type: 'meal', label: 'Meals', icon: 'meal', color: 'from-orange-400 to-orange-600' },
    { type: 'walk', label: 'Walks', icon: 'walk', color: 'from-green-400 to-green-600' },
    { type: 'potty', label: 'Potty', icon: 'potty', color: 'from-blue-400 to-blue-600' },
    { type: 'sleep', label: 'Sleep', icon: 'sleep', color: 'from-purple-400 to-purple-600' },
    { type: 'play', label: 'Play', icon: 'play', color: 'from-pink-400 to-pink-600' },
    { type: 'medication', label: 'Meds', icon: 'medication', color: 'from-indigo-400 to-indigo-600' },
  ]
  
  if (!activePet) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-16">
          <Icon name="chart" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Select a pet to view analytics</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track {activePet.name}'s patterns and progress
        </p>
      </motion.div>
      
      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Activities</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="chart" className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {Object.keys(stats.types).length}
              </p>
              <p className="text-sm text-muted-foreground">Activity Types</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <Icon name="pet" className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {stats.types.meal || 0}
              </p>
              <p className="text-sm text-muted-foreground">Meals Today</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Icon name="meal" className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {stats.types.walk || 0}
              </p>
              <p className="text-sm text-muted-foreground">Walks Today</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Icon name="walk" className="text-white" size={24} />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Activity Distribution */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <h2 className="text-lg font-semibold mb-4">Activity Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {activityTypes.map(activity => {
            const count = stats.types[activity.type] || 0
            const percentage = stats.total > 0 
              ? Math.round((count / stats.total) * 100)
              : 0
              
            return (
              <motion.div 
                key={activity.type} 
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className={`w-14 h-14 mx-auto mb-2 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                  <Icon name={activity.icon} className="text-white" size={24} />
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{activity.label}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
      
      {/* Recent Trends */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <h2 className="text-lg font-semibold mb-4">Activity Trends</h2>
        <div className="space-y-4">
          {Object.entries(stats.types).length > 0 ? (
            Object.entries(stats.types)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([type, count]) => {
                const percentage = Math.round((count / stats.total) * 100)
                const activityConfig = activityTypes.find(a => a.type === type)
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon name={activityConfig?.icon || 'pet'} size={16} />
                        <span className="capitalize font-medium">{type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className={`h-full bg-gradient-to-r ${activityConfig?.color || 'from-gray-400 to-gray-600'}`}
                      />
                    </div>
                  </div>
                )
              })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Start logging activities to see trends for {activePet.name}
            </p>
          )}
        </div>
      </motion.div>
      
      {/* Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card"
      >
        <h2 className="text-lg font-semibold mb-4">Quick Insights</h2>
        <div className="space-y-3">
          {Object.entries(stats.types).length > 0 ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm">
                  Most frequent activity: <span className="font-semibold capitalize">
                    {Object.entries(stats.types).sort((a, b) => b[1] - a[1])[0][0]}
                  </span> ({Object.entries(stats.types).sort((a, b) => b[1] - a[1])[0][1]} times)
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm">
                  Total tracked activities: <span className="font-semibold">
                    {stats.total}
                  </span>
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm">
                  Activity variety: <span className="font-semibold">
                    {Object.keys(stats.types).length} different types
                  </span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No insights available yet. Start tracking {activePet.name}'s activities!
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AnalyticsSimple