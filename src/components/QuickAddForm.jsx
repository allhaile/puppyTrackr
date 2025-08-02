import React, { useState, useEffect } from 'react';
import { X, MapPin, Utensils, Moon, Pill, GraduationCap, FileText, Plus, Scissors, Check, User, Calendar, Clock } from 'lucide-react';
import { getPlaceholder } from '../utils/helpers';

const QuickAddForm = ({ isOpen, onAdd, onClose, currentUser, users }) => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [mood, setMood] = useState('🎉');
  const [energy, setEnergy] = useState('Medium');
  const [hasTreat, setHasTreat] = useState(false);

  // Initialize with current date, time, and user when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setDate(now.toISOString().split('T')[0]); // YYYY-MM-DD format
      setTime(now.toTimeString().slice(0, 5)); // HH:MM format
      setSelectedUser(currentUser || 'Parent 1');
    }
  }, [isOpen, currentUser]);

  const types = [
    { id: 'potty', label: 'Potty', icon: MapPin },
    { id: 'meal', label: 'Meal', icon: Utensils },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'med', label: 'Medicine', icon: Pill },
    { id: 'training', label: 'Training', icon: GraduationCap },
    { id: 'grooming', label: 'Grooming', icon: Scissors },
    { id: 'note', label: 'Note', icon: FileText },
  ];

  const moodOptions = [
    { value: '🎉', label: 'Happy' },
    { value: '😴', label: 'Sleepy' },
    { value: '😊', label: 'Content' },
    { value: '🥺', label: 'Anxious' },
    { value: '😮', label: 'Alert' },
    { value: '😔', label: 'Low' }
  ];

  const energyLevels = ['Low', 'Medium', 'High'];

  const toggleType = (typeId) => {
    setSelectedTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTypes.length === 0) return;

    // Combine date and time into proper local ISO string
    const dateTime = new Date(`${date}T${time}`);
    const dateTimeString = dateTime.toISOString();

    // Create single entry with multiple types
    const entryData = {
      type: selectedTypes[0], // Primary type for backward compatibility
      types: selectedTypes,   // All selected types
      notes: notes.trim() || undefined,
      time: dateTimeString,
      user: selectedUser,
      mood: mood,
      energy: energy,
      hasTreat: hasTreat
    };
    onAdd(entryData);
    
    // Reset form
    setSelectedTypes([]);
    setNotes('');
    setMood('🎉');
    setEnergy('Medium');
    setHasTreat(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
      <div className={`modal-content max-w-lg transform transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Quick Add</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Logged by
            </label>
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="input-field"
              required
            >
              {users && users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Activity Types (select multiple)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {types.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleType(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 relative ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/50 border-primary-300 dark:border-primary-600 text-primary-700 dark:text-primary-300'
                        : 'bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <type.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{type.label}</span>
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedTypes.length > 0 && (
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">
                {selectedTypes.length} activity type{selectedTypes.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Mood and Energy */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Mood
              </label>
              <select 
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="input-field"
              >
                {moodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.value} {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Energy Level
              </label>
              <select 
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                className="input-field"
              >
                {energyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Treat Toggle */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasTreat}
                onChange={(e) => setHasTreat(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Treats given
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any details..."
              rows="3"
              className="input-field resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedTypes.length === 0}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {selectedTypes.length > 1 ? `${selectedTypes.length} ` : ''}Entr{selectedTypes.length > 1 ? 'ies' : 'y'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddForm; 