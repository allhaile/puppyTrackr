import React, { useState } from 'react';
import { Settings, User, Download, Upload, Trash2, AlertTriangle, Bell, Moon, Globe, Key, Sun } from 'lucide-react';
import UserSelector from './UserSelector';
import DataImportModal from './DataImportModal';

const SettingsView = ({ 
  puppyName, 
  setPuppyName, 
  puppyAvatar,
  setPuppyAvatar,
  userName,
  userDisplayName,
  setUserName,
  setUserDisplayName,
  users, 
  addUser, 
  removeUser, 
  guestMode,
  onEnableGuest,
  onDisableGuest,
  onClearAllData,
  onExportData,
  onDataImport,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleImportSuccess = (result) => {
    setShowImportModal(false);
    if (onDataImport) {
      onDataImport(result);
    }
  };

  return (
    <div className="p-6 pb-20 bg-neutral-25 dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Settings</h1>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">Manage your puppy tracking preferences</p>
      </div>

      <div className="space-y-8">
        {/* Theme Settings */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Appearance</h2>
          <div className="card dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-medium text-neutral-900 dark:text-white">
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-primary-600' 
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Puppy Information */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Puppy Profile</h2>
          <div className="card dark:bg-neutral-800 dark:border-neutral-700 space-y-6">
            {/* Puppy Avatar & Name */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#5c2a33]">
                <img 
                  src="/kudos-steps-avatar.jpg" 
                  alt="Puppy Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Puppy Name
                </label>
                <input
                  type="text"
                  value={puppyName}
                  onChange={(e) => setPuppyName(e.target.value)}
                  className="input-field dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:placeholder-neutral-400"
                  placeholder="Enter your puppy's name"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Your Profile */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Your Profile</h2>
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                value={userDisplayName}
                onChange={(e) => setUserDisplayName(e.target.value)}
                className="input-field"
                placeholder="How should we call you?"
              />
              <p className="text-xs text-neutral-500 mt-1">
                This appears when you log activities and in the app header
              </p>
            </div>
          </div>
        </section>

        {/* Family Members */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Family Members</h2>
          <div className="card">
            <UserSelector
              users={users}
              onAddUser={addUser}
              onRemoveUser={removeUser}
              showManagement={true}
            />
          </div>
        </section>

                 {/* Data Management */}
         <section>
           <h2 className="text-lg font-semibold text-neutral-900 mb-4">Data Management</h2>
           <div className="card space-y-4">
             {/* Import Data - Development Only */}
             {process.env.NODE_ENV === 'development' && (
               <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                 <div className="flex items-center space-x-3">
                   <div className="p-2 bg-blue-100 rounded-lg">
                     <Upload className="w-5 h-5 text-blue-600" />
                   </div>
                   <div>
                     <h3 className="font-medium text-blue-900">Import Data</h3>
                     <p className="text-sm text-blue-700">Upload your existing activity data from Notion or other sources</p>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowImportModal(true)}
                   className="btn-secondary"
                 >
                   Import
                 </button>
               </div>
             )}

            {/* Export Data */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Download className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">Export Data</h3>
                  <p className="text-sm text-neutral-600">Download your data as a backup file</p>
                </div>
              </div>
              <button
                onClick={onExportData}
                className="btn-secondary"
              >
                Export
              </button>
            </div>

            {/* Clear Data */}
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-red-900">Clear All Data</h3>
                  <p className="text-sm text-red-700">Permanently delete all activity records</p>
                </div>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="btn-secondary text-red-600 hover:bg-red-100 border-red-300"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* App Settings */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">App Settings</h2>
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-neutral-500" />
                <div>
                  <h3 className="font-medium text-neutral-900">Notifications</h3>
                  <p className="text-sm text-neutral-600">Receive reminders and updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 text-neutral-500" />
                <div>
                  <h3 className="font-medium text-neutral-900">Dark Mode</h3>
                  <p className="text-sm text-neutral-600">Switch to dark theme</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* App Info */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">About</h2>
          <div className="card space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-700">Version</span>
              <span className="text-neutral-900 font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-700">Last Updated</span>
              <span className="text-neutral-900 font-medium">Today</span>
            </div>
          </div>
        </section>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Confirm Clear Data</h3>
              </div>
              <p className="text-neutral-600 mb-6">
                This will permanently delete all activity records for {puppyName}. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearAllData();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Import Modal */}
      <DataImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportSuccess}
        mode="localStorage"
      />
    </div>
  );
};

export default SettingsView; 