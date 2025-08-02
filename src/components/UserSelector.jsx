import React from 'react';
import { X, User, Users, UserCheck, Clock } from 'lucide-react';

const UserSelector = ({ isOpen, users, currentUser, onUserSelect, onClose, onEnableGuest }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Select User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Current User */}
          {currentUser && (
            <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/50 border border-primary-200 dark:border-primary-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <div>
                  <div className="text-sm font-medium text-primary-900 dark:text-primary-200">Currently logging as</div>
                  <div className="text-lg font-semibold text-primary-800 dark:text-primary-300">{currentUser}</div>
                </div>
              </div>
            </div>
          )}

          {/* User List */}
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user}
                onClick={() => onUserSelect(user)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  currentUser === user
                    ? 'bg-primary-50 dark:bg-primary-900/50 border-primary-200 dark:border-primary-600 text-primary-900 dark:text-primary-200'
                    : 'bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    user === 'Guest' 
                      ? 'bg-warning-100 dark:bg-warning-900/50'
                      : currentUser === user
                        ? 'bg-primary-100 dark:bg-primary-800'
                        : 'bg-neutral-100 dark:bg-neutral-600'
                  }`}>
                    {user === 'Guest' ? (
                      <Clock className={`w-4 h-4 ${user === 'Guest' ? 'text-warning-600 dark:text-warning-400' : 'text-primary-600 dark:text-primary-400'}`} />
                    ) : (
                      <User className={`w-4 h-4 ${currentUser === user ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-600 dark:text-neutral-400'}`} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{user}</div>
                    {user === 'Guest' && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Quick access for trusted users</div>
                    )}
                  </div>
                  {currentUser === user && (
                    <div className="ml-auto">
                      <UserCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Guest Mode Info */}
          <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Guest Access</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Select "Guest" for quick logging without switching between family members. 
                  Perfect for babysitters or temporary caregivers.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelector; 