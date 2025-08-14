import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { usePets } from '../../contexts/PetContext'
import { useAuth } from '../../contexts/AuthContext'
import Icon from '../ui/Icon'

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { pets, activePet, setActivePet } = usePets()
  const { households, household, setActiveHouseholdId, signOut } = useAuth()
  const [showPetSelector, setShowPetSelector] = useState(false)
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="pet" className="text-white" size={20} />
            </div>
            <span className="font-bold text-lg hidden sm:block">PuppyTrackr</span>
          </motion.div>

          {/* Center - Household + Pet Selector */}
          <div className="flex-1 max-w-lg mx-4 flex items-center space-x-2">
            {/* Household selector (if multiple) */}
            {households && households.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowHouseholdSelector(!showHouseholdSelector)}
                  className="glass px-3 py-2 rounded-xl flex items-center space-x-2 hover:bg-muted/20 transition-colors"
                >
                  <Icon name="home" size={14} className="text-primary" />
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {household?.name || 'Household'}
                  </span>
                  <Icon name="chevronDown" size={14} />
                </button>
                <AnimatePresence>
                  {showHouseholdSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 right-0 w-64 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50"
                    >
                      {households.map(h => (
                        <button
                          key={h.id}
                          onClick={() => {
                            setActiveHouseholdId(h.id)
                            setShowHouseholdSelector(false)
                            setShowPetSelector(false)
                          }}
                          className={`w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors ${household?.id === h.id ? 'bg-muted/30' : ''}`}
                        >
                          <div className="min-w-0 pr-3">
                            <p className="font-medium truncate">{h.name}</p>
                            <p className="text-xs text-muted-foreground capitalize truncate">{h.role}</p>
                          </div>
                          {household?.id === h.id && <Icon name="check" size={16} className="text-primary" />}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          navigate('/household/setup')
                          setShowHouseholdSelector(false)
                        }}
                        className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-muted/50 transition-colors border-t border-border"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Icon name="plus" size={16} />
                        </div>
                        <span className="font-medium">Create or Join</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Pet Selector */}
            {pets.length > 0 && (
              <div className="relative flex-1">
                <button
                  onClick={() => setShowPetSelector(!showPetSelector)}
                  className="w-full glass px-3 py-2 rounded-xl flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Icon name="pet" size={14} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium truncate">
                      {activePet ? activePet.name : 'Select Pet'}
                    </span>
                  </div>
                  <Icon 
                    name="chevronDown" 
                    size={16} 
                    className={`transition-transform ${showPetSelector ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {showPetSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 right-0 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-40"
                    >
                      {pets.map((pet) => (
                        <button
                          key={pet.id}
                          onClick={() => {
                            setActivePet(pet.id)
                            setShowPetSelector(false)
                          }}
                          className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-muted/50 transition-colors ${
                            activePet?.id === pet.id ? 'bg-muted/30' : ''
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Icon name="pet" size={16} className="text-primary" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{pet.name}</p>
                            <p className="text-xs text-muted-foreground">{pet.breed}</p>
                          </div>
                          {activePet?.id === pet.id && (
                            <Icon name="check" size={16} className="text-primary" />
                          )}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          navigate('/profile/new')
                          setShowPetSelector(false)
                        }}
                        className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-muted/50 transition-colors border-t border-border"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Icon name="plus" size={16} />
                        </div>
                        <span className="font-medium">Add New Pet</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/care')}
              className="btn-icon"
            >
              <Icon name="bell" size={20} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="btn-icon"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={signOut}
              className="btn-icon"
              title="Sign out"
            >
              <Icon name="close" size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header