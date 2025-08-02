import { useState, useEffect, useCallback } from 'react';

// Global storage change listeners
const storageListeners = new Map();

/**
 * Custom hook for localStorage management with React state synchronization
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Refresh function to re-read from localStorage
  const refreshFromStorage = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      const newValue = item ? JSON.parse(item) : initialValue;
      setStoredValue(newValue);
    } catch (error) {
      console.warn(`Error refreshing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Set up listener for external changes
  useEffect(() => {
    if (!storageListeners.has(key)) {
      storageListeners.set(key, new Set());
    }
    storageListeners.get(key).add(refreshFromStorage);

    // Listen for storage events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === key) {
        refreshFromStorage();
      }
    };

    // Listen for custom localStorage update events
    const handleLocalStorageUpdate = (e) => {
      if (e.detail?.keys?.includes(key)) {
        refreshFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdated', handleLocalStorageUpdate);

    return () => {
      storageListeners.get(key)?.delete(refreshFromStorage);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleLocalStorageUpdate);
    };
  }, [key, refreshFromStorage]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Notify other hooks using the same key
      storageListeners.get(key)?.forEach(listener => {
        if (listener !== refreshFromStorage) {
          listener();
        }
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, refreshFromStorage];
};

/**
 * Trigger refresh for all hooks using a specific localStorage key
 */
export const triggerStorageRefresh = (key) => {
  if (storageListeners.has(key)) {
    storageListeners.get(key).forEach(listener => listener());
  }
};

/**
 * Custom hook for simple string localStorage values
 */
export const useLocalStorageString = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      return window.localStorage.getItem(key) || initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}; 