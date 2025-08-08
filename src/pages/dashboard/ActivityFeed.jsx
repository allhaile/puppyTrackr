import React from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import Icon from '../../components/ui/Icon'
import { useAuth } from '../../contexts/AuthContext'

const activityColors = {
  meal: 'from-orange-400 to-orange-600',
  walk: 'from-green-400 to-green-600',
  potty: 'from-blue-400 to-blue-600',
  sleep: 'from-purple-400 to-purple-600',
  play: 'from-pink-400 to-pink-600',
  groom: 'from-teal-400 to-teal-600',
  vet: 'from-red-400 to-red-600',
  medication: 'from-indigo-400 to-indigo-600',
}

const ActivityFeed = ({ activities }) => {
  const { caregivers } = useAuth()

  if (!activities || activities.length === 0) {
    return (
      <div className="glass-card text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <Icon name="clock" size={32} className="text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No activities logged yet today</p>
        <p className="text-sm text-muted-foreground mt-2">
          Tap the + button to start tracking
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const caregiver = caregivers.find(c => c.id === activity.caregiverId)
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activityColors[activity.type]} flex items-center justify-center flex-shrink-0`}>
                <Icon name={activity.type} className="text-white" size={24} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold capitalize">{activity.type}</h3>
                    {activity.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.notes}</p>
                    )}
                    
                    {/* Details */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activity.duration && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted/50">
                          {activity.duration} mins
                        </span>
                      )}
                      {activity.amount && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted/50">
                          {activity.amount}
                        </span>
                      )}
                      {activity.location && (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted/50">
                          {activity.location}
                        </span>
                      )}
                    </div>

                    {/* Caregiver */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Icon name="user" size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {caregiver?.name || 'Unknown'} • {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-sm text-muted-foreground flex-shrink-0">
                    {new Date(activity.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default ActivityFeed