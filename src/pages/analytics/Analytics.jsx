import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { usePets } from '../../contexts/PetContext'
import Icon from '../../components/ui/Icon'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns'

const Analytics = () => {
  const { activities, activePet } = usePets()
  const [timeRange, setTimeRange] = useState('week') // week, month, all
  
  // Filter activities based on time range
  const filteredActivities = useMemo(() => {
    if (!activities) return []
    
    const now = new Date()
    let startDate
    
    switch (timeRange) {
      case 'week':
        startDate = subDays(now, 7)
        break
      case 'month':
        startDate = subDays(now, 30)
        break
      default:
        return activities
    }
    
    return activities.filter(a => new Date(a.timestamp) >= startDate)
  }, [activities, timeRange])
  
  // Calculate statistics
  const stats = useMemo(() => {
    const typeCount = {}
    const hourlyDistribution = new Array(24).fill(0)
    const dailyCount = {}
    
    filteredActivities.forEach(activity => {
      // Count by type
      typeCount[activity.type] = (typeCount[activity.type] || 0) + 1
      
      // Hourly distribution
      const hour = new Date(activity.timestamp).getHours()
      hourlyDistribution[hour]++
      
      // Daily count
      const day = format(new Date(activity.timestamp), 'yyyy-MM-dd')
      dailyCount[day] = (dailyCount[day] || 0) + 1
    })
    
    return { typeCount, hourlyDistribution, dailyCount }
  }, [filteredActivities])
  
  // Get week days for chart
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date())
    const end = endOfWeek(new Date())
    return eachDayOfInterval({ start, end })
  }, [])
  
  // Activity types with colors
  const activityTypes = [
    { type: 'meal', label: 'Meals', icon: 'meal', color: 'from-orange-400 to-orange-600' },
    { type: 'walk', label: 'Walks', icon: 'walk', color: 'from-green-400 to-green-600' },
    { type: 'potty', label: 'Potty', icon: 'potty', color: 'from-blue-400 to-blue-600' },
    { type: 'sleep', label: 'Sleep', icon: 'sleep', color: 'from-purple-400 to-purple-600' },
    { type: 'play', label: 'Play', icon: 'play', color: 'from-pink-400 to-pink-600' },
    { type: 'medication', label: 'Meds', icon: 'medication', color: 'from-indigo-400 to-indigo-600' },
  ]
  
  const maxHourlyCount = Math.max(...stats.hourlyDistribution, 1)
  
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track {activePet.name}'s patterns and progress</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {['week', 'month', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {range === 'all' ? 'All Time' : `Last ${range}`}
            </button>
          ))}
        </div>
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
              <p className="text-3xl font-bold">{filteredActivities.length}</p>
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
                {filteredActivities.length > 0 
                  ? (filteredActivities.length / Math.max(Object.keys(stats.dailyCount).length, 1)).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-muted-foreground">Daily Average</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Icon name="calendar" className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {Object.keys(stats.typeCount).length}
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
                {Object.keys(stats.dailyCount).filter(day => {
                  const date = new Date(day)
                  const today = new Date()
                  return date.toDateString() === today.toDateString()
                })[0] ? stats.dailyCount[format(new Date(), 'yyyy-MM-dd')] : 0}
              </p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Icon name="clock" className="text-white" size={24} />
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
            const count = stats.typeCount[activity.type] || 0
            const percentage = filteredActivities.length > 0 
              ? ((count / filteredActivities.length) * 100).toFixed(0)
              : 0
              
            return (
              <div key={activity.type} className="text-center">
                <div className={`w-14 h-14 mx-auto mb-2 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                  <Icon name={activity.icon} className="text-white" size={24} />
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{activity.label}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </div>
            )
          })}
        </div>
      </motion.div>
      
      {/* Hourly Pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <h2 className="text-lg font-semibold mb-4">Daily Activity Pattern</h2>
        <div className="relative h-32">
          <div className="absolute inset-0 flex items-end justify-between space-x-1">
            {stats.hourlyDistribution.map((count, hour) => (
              <div
                key={hour}
                className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t opacity-80 hover:opacity-100 transition-opacity relative group"
                style={{ height: `${(count / maxHourlyCount) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-card px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>11 PM</span>
        </div>
      </motion.div>
      
      {/* Weekly Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <h2 className="text-lg font-semibold mb-4">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const count = stats.dailyCount[dayKey] || 0
            const isCurrentDay = isToday(day)
            
            return (
              <div
                key={dayKey}
                className={`text-center p-3 rounded-lg ${
                  isCurrentDay ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30'
                }`}
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {format(day, 'EEE')}
                </p>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">
                  {format(day, 'd')}
                </p>
              </div>
            )
          })}
        </div>
      </motion.div>
      
      {/* Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card"
      >
        <h2 className="text-lg font-semibold mb-4">Insights</h2>
        <div className="space-y-3">
          {Object.entries(stats.typeCount).length > 0 ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm">
                  Most frequent activity: <span className="font-semibold">
                    {Object.entries(stats.typeCount).sort((a, b) => b[1] - a[1])[0][0]}
                  </span> ({Object.entries(stats.typeCount).sort((a, b) => b[1] - a[1])[0][1]} times)
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm">
                  Most active hour: <span className="font-semibold">
                    {stats.hourlyDistribution.indexOf(Math.max(...stats.hourlyDistribution))}:00
                  </span>
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm">
                  Average activities per day: <span className="font-semibold">
                    {(filteredActivities.length / Math.max(Object.keys(stats.dailyCount).length, 1)).toFixed(1)}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Start logging activities to see insights about {activePet.name}'s patterns
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Analytics