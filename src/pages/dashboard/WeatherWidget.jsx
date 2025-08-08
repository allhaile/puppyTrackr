import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Icon from '../../components/ui/Icon'

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulated weather data - in production, connect to weather API
    setTimeout(() => {
      setWeather({
        temp: 72,
        condition: 'Partly Cloudy',
        icon: 'sun',
        walkability: 'Perfect for walks!',
        humidity: 45,
        wind: 8,
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="glass-card animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-muted/50 rounded w-20" />
            <div className="h-3 bg-muted/50 rounded w-32" />
          </div>
          <div className="w-12 h-12 bg-muted/50 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">{weather.temp}°F</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{weather.condition}</span>
          </div>
          <p className="text-sm text-primary mt-1">{weather.walkability}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-xs text-muted-foreground">
              💧 {weather.humidity}%
            </span>
            <span className="text-xs text-muted-foreground">
              🌬️ {weather.wind} mph
            </span>
          </div>
        </div>
        
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
          <Icon name={weather.icon} className="text-white" size={32} />
        </div>
      </div>
    </motion.div>
  )
}

export default WeatherWidget