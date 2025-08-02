import React, { useState } from 'react';
import { MapPin, Utensils, Moon, Pill, GraduationCap, FileText, User, Calendar, Scissors, CalendarDays, List } from 'lucide-react';
import { formatTime, getUserBadgeColor, groupEntriesByDate, getIconColor, getActivityCardColor, getEntryTypes } from '../utils/helpers';
import ActivityDetailModal from './ActivityDetailModal';
import CalendarView from './CalendarView';

const HistoryView = ({ entries }) => {
  const groupedEntries = groupEntriesByDate(entries);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedEntry(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setViewMode('list'); // Switch to list view when a date is selected
  };

  // Filter entries by selected date if one is chosen
  const filteredGroupedEntries = selectedDate 
    ? { [selectedDate.toDateString()]: groupedEntries[selectedDate.toDateString()] || [] }
    : groupedEntries;

  const IconComponent = ({ type, className = "w-4 h-4" }) => {
    const icons = {
      potty: MapPin,
      meal: Utensils,
      sleep: Moon,
      med: Pill,
      training: GraduationCap,
      grooming: Scissors,
      note: FileText
    };
    const Icon = icons[type] || FileText;
    return <Icon className={`${className} ${getIconColor(type)}`} />;
  };

  const MultiTypeIcons = ({ entry, className = "w-4 h-4" }) => {
    const types = getEntryTypes(entry);
    
    if (types.length === 1) {
      return <IconComponent type={types[0]} className={className} />;
    }
    
    return (
      <div className="flex items-center -space-x-1">
        {types.slice(0, 3).map((type, index) => (
          <div key={type} className={`bg-white dark:bg-neutral-800 rounded-full p-1 border border-neutral-200 dark:border-neutral-600 ${index > 0 ? 'ml-1' : ''}`}>
            <IconComponent type={type} className="w-3 h-3" />
          </div>
        ))}
        {types.length > 3 && (
          <div className="bg-neutral-100 dark:bg-neutral-700 rounded-full p-1 border border-neutral-200 dark:border-neutral-600 ml-1">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-1">+{types.length - 3}</span>
          </div>
        )}
      </div>
    );
  };

  const getActivityTypesLabel = (entry) => {
    const types = getEntryTypes(entry);
    if (types.length === 1) {
      return types[0];
    }
    return types.join(', ');
  };

  const getPrimaryCardColor = (entry) => {
    const types = getEntryTypes(entry);
    // Use the first type for the card color
    return getActivityCardColor(types[0]);
  };

  return (
    <div className="p-4 sm:p-6 pb-20 bg-neutral-25 dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Activity History</h1>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-neutral-600 dark:text-neutral-400">
            {selectedDate 
              ? `Activities for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
              : 'Complete log of all recorded activities'
            }
          </p>
          
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              View all dates
            </button>
          )}
        </div>
      </div>
      
      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="mb-8">
          <CalendarView
            entries={entries}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {Object.keys(filteredGroupedEntries).length === 0 ? (
            <div className="card dark:bg-neutral-800 dark:border-neutral-700 text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                {selectedDate ? 'No activities for this date' : 'No activities recorded yet'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {selectedDate ? 'Try selecting a different date or view all activities' : 'Start logging activities to see them here'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(filteredGroupedEntries)
                .sort(([a], [b]) => new Date(b) - new Date(a))
                .map(([date, dateEntries]) => (
                  <div key={date}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {dateEntries.length} {dateEntries.length === 1 ? 'activity' : 'activities'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {dateEntries
                        .sort((a, b) => new Date(b.time) - new Date(a.time))
                        .map((entry) => (
                          <div 
                            key={entry.id} 
                            onTouchStart={(e) => {
                              // Simple touch handler for mobile - we'll enhance this
                              const touch = e.touches[0];
                              entry._touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
                            }}
                            onTouchEnd={(e) => {
                              if (!entry._touchStart) return;
                              
                              const touch = e.changedTouches[0];
                              const deltaX = touch.clientX - entry._touchStart.x;
                              const deltaY = touch.clientY - entry._touchStart.y;
                              const deltaTime = Date.now() - entry._touchStart.time;
                              
                              // If it's a tap (small movement, quick time), open modal
                              if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
                                handleEntryClick(entry);
                              }
                              
                              delete entry._touchStart;
                            }}
                            onClick={() => handleEntryClick(entry)}
                            className={`card-compact dark:bg-neutral-800 dark:border-neutral-700 ${getPrimaryCardColor(entry)} w-full text-left hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 touch-manipulation`}>
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0 mt-0.5">
                                <MultiTypeIcons entry={entry} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-3">
                                    <span className="font-semibold text-neutral-900 dark:text-white capitalize">
                                      {getActivityTypesLabel(entry)}
                                    </span>
                                    <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                                      {formatTime(entry.time)}
                                    </span>
                                  </div>
                                </div>
                                {entry.notes && (
                                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">{entry.notes}</p>
                                )}
                                
                                {/* Additional Info Row */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span className={`badge ${getUserBadgeColor(entry.user)}`}>
                                      <User className="w-3 h-3 mr-1" />
                                      {entry.user}
                                    </span>
                                    
                                    {/* Mood, Energy, and Treat indicators */}
                                    <div className="flex items-center space-x-2">
                                      {entry.mood && (
                                        <span className="text-sm" title="Mood">
                                          {entry.mood}
                                        </span>
                                      )}
                                      {entry.energy && (
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          entry.energy === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                          entry.energy === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        }`} title="Energy Level">
                                          {entry.energy}
                                        </span>
                                      )}
                                      {entry.hasTreat && (
                                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full font-medium" title="Treats Given">
                                          🦴
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
      
      {/* Activity Detail Modal */}
      <ActivityDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        entry={selectedEntry}
      />
    </div>
  );
};

export default HistoryView; 