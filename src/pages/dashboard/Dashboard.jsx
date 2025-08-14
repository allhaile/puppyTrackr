import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { usePets } from '../../contexts/PetContext'
import { useAuth } from '../../contexts/AuthContext'
import Icon from '../../components/ui/Icon'
import ActivityFeed from './ActivityFeed'
import QuickStats from './QuickStats'
import InsightsBanner from './InsightsBanner'
import WeatherWidget from './WeatherWidget'

const Dashboard = () => {
  const { activePet, todayActivities, stats, getLastActivityTime } = usePets()
  const { user, profile } = useAuth()
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  if (!activePet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl">
            <span>🐶</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Welcome to PuppyTrackr!</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start by adding your first pet to begin tracking their daily activities and health.
          </p>
          <button
            onClick={() => window.location.href = '/profile/new'}
            className="btn-primary"
          >
            Add Your First Pet
          </button>
        </motion.div>
      </div>
    )
  }

  const displayName = profile?.display_name || user?.email || 'Pet Parent'

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl">
            <span>{activePet?.avatar || '🐶'}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {greeting}, {displayName}!
            </h1>
            <p className="text-muted-foreground">
              Here's how {activePet.name} is doing today
            </p>
          </div>
        </div>
      </motion.div>

      {/* Smart Insights Banner */}
      <InsightsBanner pet={activePet} lastActivityTime={getLastActivityTime} />

      {/* Quick Stats Grid */}
      <QuickStats stats={stats} />

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Recent Activity Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Activities</h2>
          {todayActivities.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {todayActivities.length} activities today
            </span>
          )}
        </div>
        
        <ActivityFeed activities={todayActivities} />
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[ 
          { type: 'meal', label: 'Log Meal', icon: 'meal', color: 'from-orange-400 to-orange-600' },
          { type: 'walk', label: 'Log Walk', icon: 'walk', color: 'from-green-400 to-green-600' },
          { type: 'potty', label: 'Log Potty', icon: 'potty', color: 'from-blue-400 to-blue-600' },
          { type: 'play', label: 'Log Play', icon: 'play', color: 'from-purple-400 to-purple-600' },
        ].map((action) => (
          <motion.button
            key={action.type}
            whileTap={{ scale: 0.95 }}
            className="glass-card p-4 hover:scale-105 transition-transform"
            onClick={() => window.location.href = `/log?type=${action.type}`}
          >
            <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
              <Icon name={action.icon} className="text-white" size={24} />
            </div>
            <p className="text-sm font-medium">{action.label}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

export default Dashboard