import React from 'react';
import { X, MapPin, Utensils, Moon, Pill, GraduationCap, FileText, User, Calendar, Clock, Scissors } from 'lucide-react';
import { formatTime, formatTimeDetailed, getUserBadgeColor, getIconColor, getEntryTypes } from '../utils/helpers';

const ActivityDetailModal = ({ isOpen, onClose, entry }) => {
  if (!isOpen || !entry) return null;

  const IconComponent = ({ type, className = "w-5 h-5" }) => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const activityTypes = getEntryTypes(entry);
  const isMultipleTypes = activityTypes.length > 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
              {isMultipleTypes ? (
                <div className="flex items-center -space-x-1">
                  {activityTypes.slice(0, 2).map((type, index) => (
                    <div key={type} className={`bg-white dark:bg-neutral-800 rounded-full p-1 border border-neutral-200 dark:border-neutral-600 ${index > 0 ? 'ml-1' : ''}`}>
                      <IconComponent type={type} className="w-3 h-3" />
                    </div>
                  ))}
                </div>
              ) : (
                <IconComponent type={entry.type} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white capitalize">
                {isMultipleTypes ? activityTypes.join(' + ') : entry.type} {isMultipleTypes ? 'Activities' : 'Activity'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Activity Details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Date</p>
                <p className="text-neutral-900 dark:text-white">{formatDate(entry.time)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Time</p>
                <p className="text-neutral-900 dark:text-white">{formatTimeDetailed(entry.time)}</p>
              </div>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Recorded by</p>
              <span className={`badge ${getUserBadgeColor(entry.user)}`}>
                {entry.user}
              </span>
            </div>
          </div>

          {/* Activity Type */}
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 flex items-center justify-center">
              <IconComponent type={entry.type} className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Activity Type</p>
              <p className="text-neutral-900 dark:text-white capitalize font-medium">{entry.type}</p>
            </div>
          </div>

          {/* Details */}
          {entry.details && (
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Details</p>
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                <p className="text-neutral-900 dark:text-white whitespace-pre-wrap">{entry.details}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Notes</p>
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                <p className="text-neutral-900 dark:text-white whitespace-pre-wrap">{entry.notes}</p>
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(entry.mood || entry.energy || entry.hasTreat) && (
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Additional Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {entry.mood && (
                  <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">{entry.mood}</div>
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Mood</p>
                  </div>
                )}
                {entry.energy && (
                  <div className={`rounded-lg p-3 text-center ${
                    entry.energy === 'High' ? 'bg-red-50 dark:bg-red-900/20' :
                    entry.energy === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                    'bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    <div className={`text-sm font-semibold mb-1 ${
                      entry.energy === 'High' ? 'text-red-700 dark:text-red-300' :
                      entry.energy === 'Medium' ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-blue-700 dark:text-blue-300'
                    }`}>
                      {entry.energy}
                    </div>
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Energy</p>
                  </div>
                )}
                {entry.hasTreat && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <div className="text-lg mb-1">🦴</div>
                    <p className="text-xs font-medium text-green-700 dark:text-green-300">Treats Given</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Entry ID for debugging */}
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Entry ID: {entry.id}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailModal; 