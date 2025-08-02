import React, { useState } from 'react';
import { MapPin, Utensils, Moon, Pill, GraduationCap, FileText, User, Clock, Scissors } from 'lucide-react';
import { formatTime, getUserBadgeColor, getTodayEntries, getIconColor, getActivityCardColor, countEntriesByType } from '../utils/helpers';
import ActivityDetailModal from './ActivityDetailModal';

const HomeView = ({ entries, puppyName, puppyAvatar }) => {
  const todayEntries = getTodayEntries(entries);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedEntry(null);
  };
  
  const pottyCount = countEntriesByType(todayEntries, 'potty');
  const mealCount = countEntriesByType(todayEntries, 'meal');
  const sleepCount = countEntriesByType(todayEntries, 'sleep');
  const medCount = countEntriesByType(todayEntries, 'med');
  const trainingCount = countEntriesByType(todayEntries, 'training');
  const groomingCount = countEntriesByType(todayEntries, 'grooming');

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

  const stats = [
    { type: 'meal', label: 'Meals', value: mealCount, icon: Utensils },
    { type: 'potty', label: 'Potty Breaks', value: pottyCount, icon: MapPin },
    { type: 'training', label: 'Training', value: trainingCount, icon: GraduationCap },
    { type: 'grooming', label: 'Grooming', value: groomingCount, icon: Scissors },
  ];

  return (
    <div className="p-4 sm:p-6 pb-20 bg-neutral-25 dark:bg-neutral-900 min-h-screen">
      {/* Welcome Section */}
      <div className="card dark:bg-neutral-800 dark:border-neutral-700 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#5c2a33]">
            <img 
              src="/kudos-steps-avatar.jpg" 
              alt="Puppy Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {puppyName ? `Hey ${puppyName}!` : 'Welcome!'}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">Let's track your day</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.type} className="stat-card dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {stat.label}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${getActivityCardColor(stat.type)} flex-shrink-0`}>
                <IconComponent type={stat.type} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats Row */}
      {(trainingCount > 0 || todayEntries.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {trainingCount}
                </div>
                <div className="text-sm font-medium text-neutral-700">
                  Training Sessions
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50">
                <GraduationCap className="w-5 h-5 text-neutral-600" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-2xl font-bold text-neutral-900 mb-1">
                  {todayEntries.length}
                </div>
                <div className="text-sm font-medium text-neutral-700">
                  Total Activities
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-primary-50">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent Activities</h3>
        {todayEntries.length === 0 ? (
          <div className="card dark:bg-neutral-800 dark:border-neutral-700 text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h4 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No activities yet today</h4>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Start tracking {puppyName ? `${puppyName}'s` : 'your puppy\'s'} activities
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayEntries.slice(0, 5).map((entry) => (
              <button 
                key={entry.id} 
                onClick={() => handleEntryClick(entry)}
                className={`p-4 rounded-xl border-l-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 w-full text-left hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${
                  entry.type === 'potty' ? 'border-l-green-500' :
                  entry.type === 'meal' ? 'border-l-orange-500' :
                  entry.type === 'sleep' ? 'border-l-blue-500' :
                  entry.type === 'med' ? 'border-l-red-500' :
                  entry.type === 'training' ? 'border-l-purple-500' :
                  'border-l-neutral-400'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent type={entry.type} />
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-white capitalize">
                        {entry.type}
                      </div>
                      {entry.notes && (
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {entry.notes}
                        </div>
                      )}
                      
                      {/* Additional quick info */}
                      {(entry.mood || entry.energy || entry.hasTreat) && (
                        <div className="flex items-center space-x-2 mt-1">
                          {entry.mood && (
                            <span className="text-sm" title="Mood">{entry.mood}</span>
                          )}
                          {entry.energy && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              entry.energy === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' :
                              entry.energy === 'Medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                              {entry.energy}
                            </span>
                          )}
                          {entry.hasTreat && (
                            <span className="text-xs" title="Treats given">🦴</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    {formatTime(entry.time)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Activity Detail Modal */}
      <ActivityDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        entry={selectedEntry}
      />
    </div>
  );
};

export default HomeView; 