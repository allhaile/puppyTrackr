import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../ui/Icon'

const navItems = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/analytics', icon: 'chart', label: 'Analytics' },
  { path: '/profile', icon: 'pet', label: 'Pet' },
  // { path: '/care', icon: 'care', label: 'Care' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
]

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-primary/10' : ''}`}>
                    <Icon name={item.icon} size={24} />
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default BottomNav