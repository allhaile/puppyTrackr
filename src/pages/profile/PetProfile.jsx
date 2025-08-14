import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { usePets } from '../../contexts/PetContext'
import Icon from '../../components/ui/Icon'

const PetProfile = () => {
  const { petId } = useParams()
  const navigate = useNavigate()
  const { pets, activePet, addPet, updatePet, deletePet, setActivePet } = usePets()
  
  const isNewPet = petId === 'new'
  const currentPet = isNewPet ? null : (petId ? pets.find(p => p.id === petId) : activePet)
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    birthday: '',
    gender: '',
    color: '',
    microchipId: '',
    vetName: '',
    vetPhone: '',
    medications: '',
    allergies: '',
    notes: '',
  })
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [avatarEmoji, setAvatarEmoji] = useState('🐕')
  
  const avatarOptions = ['🐕', '🐶', '🦮', '🐩', '🐕‍🦺', '🐈', '🐱', '🐰', '🐹', '🐦']
  
  useEffect(() => {
    if (currentPet) {
      setFormData({
        name: currentPet.name || '',
        breed: currentPet.breed || '',
        age: currentPet.age || '',
        weight: currentPet.weight || '',
        birthday: currentPet.birthday || '',
        gender: currentPet.gender || '',
        color: currentPet.color || '',
        microchipId: currentPet.microchipId || '',
        vetName: currentPet.vetName || '',
        vetPhone: currentPet.vetPhone || '',
        medications: currentPet.medications || '',
        allergies: currentPet.allergies || '',
        notes: currentPet.notes || '',
      })
      setAvatarEmoji(currentPet.avatar || '🐕')
    }
  }, [currentPet])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const petData = {
      ...formData,
      avatar: avatarEmoji,
      name: formData.name?.trim() || 'New Pup'
    }
    
    if (isNewPet) {
      const created = await addPet(petData)
      if (created && created.id) {
        setActivePet(created.id)
      }
      navigate('/')
    } else if (currentPet) {
      await updatePet(currentPet.id, petData)
      navigate('/')
    }
  }
  
  const handleDelete = () => {
    if (currentPet) {
      deletePet(currentPet.id)
      navigate('/')
    }
  }
  
  const calculateAge = () => {
    if (!formData.birthday) return ''
    const today = new Date()
    const birth = new Date(formData.birthday)
    const diffTime = Math.abs(today - birth)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) return `${diffDays} days old`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months old`
    const years = Math.floor(diffDays / 365)
    return `${years} year${years !== 1 ? 's' : ''} old`
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {isNewPet ? 'Add New Pet' : `${currentPet?.name || 'Pet'} Profile`}
            </h1>
            <p className="text-muted-foreground">
              {isNewPet ? 'Add a new pet to your family' : 'Manage your pet\'s information'}
            </p>
          </div>
          
          {!isNewPet && currentPet && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-ghost text-destructive hover:bg-destructive/10"
            >
              <Icon name="trash" size={20} />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div className="glass-card">
            <label className="block text-sm font-medium mb-4">Choose Avatar</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">
                {avatarEmoji}
              </div>
              <div className="flex flex-wrap gap-2">
                {avatarOptions.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
                      avatarEmoji === emoji
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="glass-card space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Buddy"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Breed</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Golden Retriever"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Birthday</label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="input w-full"
                />
                {formData.birthday && (
                  <p className="text-xs text-muted-foreground mt-1">{calculateAge()}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input w-full"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Weight (lbs)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="input w-full"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color/Markings</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Golden, Brown spots"
                />
              </div>
            </div>
          </div>
          
          {/* Medical Information */}
          <div className="glass-card space-y-4">
            <h2 className="text-lg font-semibold">Medical Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Microchip ID</label>
                <input
                  type="text"
                  value={formData.microchipId}
                  onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
                  className="input w-full"
                  placeholder="15-digit microchip number"
                />
              </div>
              
              <div>
                <label className="block text sm font-medium mb-2">Vet Name</label>
                <input
                  type="text"
                  value={formData.vetName}
                  onChange={(e) => setFormData({ ...formData, vetName: e.target.value })}
                  className="input w-full"
                  placeholder="Dr. Smith / Animal Hospital"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Vet Phone</label>
                <input
                  type="tel"
                  value={formData.vetPhone}
                  onChange={(e) => setFormData({ ...formData, vetPhone: e.target.value })}
                  className="input w-full"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Current Medications</label>
              <textarea
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                className="input w-full h-20 resize-none"
                placeholder="List any medications and dosages"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Allergies</label>
              <textarea
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="input w-full h-20 resize-none"
                placeholder="List any known allergies"
              />
            </div>
          </div>
          
          {/* Additional Notes */}
          <div className="glass-card space-y-4">
            <h2 className="text-lg font-semibold">Additional Notes</h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input w-full h-24 resize-none"
              placeholder="Any special instructions, behaviors, or notes about your pet"
            />
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {isNewPet ? 'Add Pet' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-xl max-w-md w-full p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Icon name="trash" className="text-destructive" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete {currentPet?.name}?</h3>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all data for this pet.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 btn-primary bg-destructive hover:bg-destructive/90"
              >
                Delete Pet
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default PetProfile