import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const usePuppyData = () => {
  const [puppyName, setPuppyName, refreshPuppyName] = useLocalStorage('puppyName', 'My Puppy');
  const [puppyAvatar, setPuppyAvatar, refreshPuppyAvatar] = useLocalStorage('puppyAvatar', '🐕');
  const [userName, setUserName, refreshUserName] = useLocalStorage('userName', 'Parent 1');
  const [userDisplayName, setUserDisplayName, refreshUserDisplayName] = useLocalStorage('userDisplayName', '');
  const [users, setUsers, refreshUsers] = useLocalStorage('users', ['Parent 1', 'Parent 2', 'Sitter', 'Guest']);
  const [entries, setEntries, refreshEntries] = useLocalStorage('entries', []);
  const [guestMode, setGuestMode, refreshGuestMode] = useLocalStorage('guestMode', false);

  // Function to refresh all data from localStorage
  const refreshAllData = () => {
    refreshPuppyName();
    refreshPuppyAvatar();
    refreshUserName();
    refreshUserDisplayName();
    refreshUsers();
    refreshEntries();
    refreshGuestMode();
  };

  const addEntry = (entryData) => {
    const entry = {
      id: Date.now().toString(),
      time: entryData.time || new Date().toISOString(), // Use provided time or current time
      user: entryData.user || userName,
      ...entryData,
      types: entryData.types || [entryData.type] // Ensure types array exists
    };
    setEntries([...entries, entry]);
  };

  const addUser = (newUser) => {
    if (newUser && !users.includes(newUser)) {
      setUsers([...users, newUser]);
    }
  };

  const removeUser = (userToRemove) => {
    if (userToRemove !== 'Guest' && users.length > 1) {
      const updatedUsers = users.filter(user => user !== userToRemove);
      setUsers(updatedUsers);
      
      // If removing current user, switch to first available user
      if (userName === userToRemove) {
        setUserName(updatedUsers[0]);
      }
    }
  };

  const enableGuestMode = () => {
    setGuestMode(true);
    setUserName('Guest');
  };

  const disableGuestMode = () => {
    setGuestMode(false);
    if (userName === 'Guest') {
      setUserName('Parent 1');
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setEntries([]);
    }
  };

  const exportData = () => {
    const data = {
      puppyName,
      userName,
      users,
      entries,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${puppyName.replace(/\s+/g, '_')}_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    puppyName,
    puppyAvatar,
    userName,
    userDisplayName,
    users,
    entries,
    guestMode,
    setPuppyName,
    setPuppyAvatar,
    setUserName,
    setUserDisplayName,
    addEntry,
    addUser,
    removeUser,
    enableGuestMode,
    disableGuestMode,
    clearAllData,
    exportData,
    refreshAllData
  };
}; 