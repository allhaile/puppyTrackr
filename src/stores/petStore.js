import { create } from 'zustand'

const getStoredData = () => {
  try {
    const stored = localStorage.getItem('pet-storage')
    return stored ? JSON.parse(stored) : { pets: [], activePetId: null }
  } catch {
    return { pets: [], activePetId: null }
  }
}

const saveToStorage = (data) => {
  localStorage.setItem('pet-storage', JSON.stringify(data))
}

export const usePetStore = create((set, get) => ({
  ...getStoredData(),

  addPet: (pet) => {
        const newPet = {
          ...pet,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => {
          const newState = {
            pets: [...state.pets, newPet],
            activePetId: state.activePetId || newPet.id,
          }
          saveToStorage(newState)
          return newState
        })
        return newPet
      },

      updatePet: (petId, updates) => {
        set((state) => {
          const newState = {
            ...state,
            pets: state.pets.map((pet) =>
              pet.id === petId
                ? { ...pet, ...updates, updatedAt: new Date().toISOString() }
                : pet
            ),
          }
          saveToStorage(newState)
          return newState
        })
      },

      deletePet: (petId) => {
        set((state) => {
          const newPets = state.pets.filter((pet) => pet.id !== petId)
          const newActivePetId = state.activePetId === petId 
            ? (newPets[0]?.id || null)
            : state.activePetId
          const newState = {
            pets: newPets,
            activePetId: newActivePetId,
          }
          saveToStorage(newState)
          return newState
        })
      },

      setActivePet: (petId) => {
        set((state) => {
          const newState = { ...state, activePetId: petId }
          saveToStorage(newState)
          return newState
        })
      },

      getPet: (petId) => {
        return get().pets.find((pet) => pet.id === petId)
      },
}))