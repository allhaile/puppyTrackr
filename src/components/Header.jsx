import React from 'react';
import { User, ChevronDown, Moon, Sun } from 'lucide-react';

const Header = ({ userName, userDisplayName, onUserClick, isDarkMode, onToggleDarkMode }) => {
  // Use display name if available, otherwise fall back to userName
  const displayText = userDisplayName || userName || 'Select User';
  
  // Fun greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 Night owl';
    if (hour < 12) return '☀️ Good morning';
    if (hour < 17) return '🌤️ Good afternoon';
    if (hour < 20) return '🌅 Good evening';
    return '✨ Night time';
  };

  return (
    <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img 
              src="/puppyTrackr-icon.png" 
              alt="PuppyTrackr Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-black dark:text-white">PuppyTrackr</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{getGreeting()}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-all duration-200"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-600" />
            )}
          </button>

          {/* User Button */}
          <button
            onClick={onUserClick}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900 dark:to-purple-900 hover:from-primary-100 hover:to-purple-100 dark:hover:from-primary-800 dark:hover:to-purple-800 border border-primary-200 dark:border-primary-700 rounded-lg px-3 py-2 transition-all duration-200"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="/kudos-steps-avatar.jpg" 
                alt="User Avatar" 
                className="w-6 h-6 object-cover"
              />
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{displayText}</span>
            <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 