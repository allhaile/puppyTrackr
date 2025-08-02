import React, { useState } from 'react';
import { Settings, User, Download, Upload, Trash2, AlertTriangle, Bell, Moon, Globe, Key, Sun, Plus, Dog, Users } from 'lucide-react';
import UserSelector from './UserSelector';
import DataImportModal from './DataImportModal';

const SettingsView = ({ 
  household,
  dogs,
  activeDog,
  members,
  user,
  onUpdateHousehold,
  onAddDog,
  onEditDog,
  onDeleteDog,
  onShowInvites,
  onExportData,
  onRefreshData,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // User display name from localStorage
  const [userDisplayName, setUserDisplayName] = useState(localStorage.getItem('userDisplayName') || '');
  
  // Additional puppy profile states
  const [puppyBreed, setPuppyBreed] = useState(activeDog?.breed || localStorage.getItem('puppyBreed') || '');
  const [puppyBirthday, setPuppyBirthday] = useState(activeDog?.birth_date || localStorage.getItem('puppyBirthday') || '');
  const [puppyWeight, setPuppyWeight] = useState(activeDog?.weight_lbs || localStorage.getItem('puppyWeight') || '');
  const [puppyGender, setPuppyGender] = useState(activeDog?.gender || localStorage.getItem('puppyGender') || '');
  
  // Household name state
  const [householdName, setHouseholdName] = useState(household?.name || localStorage.getItem('householdName') || 'My Household');
  
  // Handle user display name change
  const updateUserDisplayName = (value) => {
    setUserDisplayName(value);
    localStorage.setItem('userDisplayName', value);
  };
  
  // Handle household name change
  const updateHouseholdName = async (value) => {
    setHouseholdName(value);
    localStorage.setItem('householdName', value);
    
    if (onUpdateHousehold && household?.id) {
      await onUpdateHousehold({ name: value });
    }
  };
  
  // Save puppy data and update activeDog
  const updatePuppyBreed = async (value) => {
    setPuppyBreed(value);
    localStorage.setItem('puppyBreed', value);
    
    if (activeDog && onEditDog) {
      await onEditDog(activeDog.id, { breed: value });
    }
  };
  
  const updatePuppyBirthday = async (value) => {
    setPuppyBirthday(value);
    localStorage.setItem('puppyBirthday', value);
    
    if (activeDog && onEditDog) {
      await onEditDog(activeDog.id, { birth_date: value });
    }
  };
  
  const updatePuppyWeight = async (value) => {
    setPuppyWeight(value);
    localStorage.setItem('puppyWeight', value);
    
    if (activeDog && onEditDog) {
      const weightNum = parseFloat(value) || 0;
      await onEditDog(activeDog.id, { weight_lbs: weightNum });
    }
  };
  
  const updatePuppyGender = async (value) => {
    setPuppyGender(value);
    localStorage.setItem('puppyGender', value);
    
    if (activeDog && onEditDog) {
      await onEditDog(activeDog.id, { gender: value });
    }
  };
  
  const updatePuppyName = async (value) => {
    if (activeDog && onEditDog) {
      await onEditDog(activeDog.id, { name: value });
    }
  };
  
  const updatePuppyAvatar = async (value) => {
    if (activeDog && onEditDog) {
      await onEditDog(activeDog.id, { avatar_url: value });
    }
  };
  
  // Calculate age from birthday
  const calculateAge = () => {
    if (!puppyBirthday) return '';
    const today = new Date();
    const birth = new Date(puppyBirthday);
    const diffTime = Math.abs(today - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''}`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;
  };
  
  // Available avatar options
  const avatarOptions = [
    '/kudos-steps-avatar.jpg',
    '/puppy-icon.jpg', 
    '🐕', '🐶', '🦮', '🐕‍🦺', '🎾', '🦴'
  ];

  const handleImportSuccess = (result) => {
    setShowImportModal(false);
    
    // Refresh the data after successful import
    if (result.success && onRefreshData) {
      onRefreshData();
    }
  };

  const handleClearAllData = () => {
    // For now, just clear localStorage entries
    localStorage.removeItem('entries');
    setShowClearConfirm(false);
    
    // Refresh data after clearing
    if (onRefreshData) {
      onRefreshData();
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
        {activeDog && (
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Puppy Profile</h2>
            <div className="card dark:bg-neutral-800 dark:border-neutral-700 space-y-6">
              {/* Puppy Avatar & Name */}
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#5c2a33] relative">
                    {activeDog.avatar_url && (activeDog.avatar_url.startsWith('/') || activeDog.avatar_url.startsWith('http')) ? (
                      <img 
                        src={activeDog.avatar_url} 
                        alt="Puppy Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl">
                        {activeDog.avatar_url || '🐕'}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    Choose Avatar:
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {avatarOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => updatePuppyAvatar(option)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          activeDog.avatar_url === option 
                            ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800' 
                            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                      >
                        {option.startsWith('/') || option.startsWith('http') ? (
                          <img 
                            src={option} 
                            alt="Avatar option" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm">
                            {option}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Puppy Name
                    </label>
                    <input
                      type="text"
                      value={activeDog.name || ''}
                      onChange={(e) => updatePuppyName(e.target.value)}
                      className="input-field dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:placeholder-neutral-400"
                      placeholder="Enter your puppy's name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Breed
                      </label>
                      <input
                        type="text"
                        value={puppyBreed}
                        onChange={(e) => updatePuppyBreed(e.target.value)}
                        className="input-field dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:placeholder-neutral-400"
                        placeholder="e.g. Golden Retriever"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Gender
                      </label>
                      <select
                        value={puppyGender}
                        onChange={(e) => updatePuppyGender(e.target.value)}
                        className="input-field dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Birthday
                      </label>
                      <input
                        type="date"
                        value={puppyBirthday}
                        onChange={(e) => updatePuppyBirthday(e.target.value)}
                        className="input-field dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                      />
                      {puppyBirthday && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          Age: {calculateAge()}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Weight (lbs)
                      </label>
                      <input
                        type="number"
                        value={puppyWeight}
                        onChange={(e) => updatePuppyWeight(e.target.value)}
                        className="input-field dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:placeholder-neutral-400"
                        placeholder="0"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Add Another Dog Button */}
              <div className="flex justify-center pt-4 border-t border-neutral-200 dark:border-neutral-600">
                <button
                  onClick={onAddDog}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/50 hover:bg-primary-100 dark:hover:bg-primary-900/70 border border-primary-200 dark:border-primary-700 rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Add Another Dog</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Household Settings */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Household</h2>
          <div className="card dark:bg-neutral-800 dark:border-neutral-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Household Name
              </label>
              <input
                type="text"
                value={householdName}
                onChange={(e) => updateHouseholdName(e.target.value)}
                className="input-field dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:placeholder-neutral-400"
                placeholder="e.g., The Smith Family, Downtown Dog House"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                This appears in the header and when sharing with family
              </p>
            </div>
            
            {onShowInvites && (
              <div className="flex justify-center pt-4 border-t border-neutral-200 dark:border-neutral-600">
                <button
                  onClick={onShowInvites}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/50 hover:bg-primary-100 dark:hover:bg-primary-900/70 border border-primary-200 dark:border-primary-700 rounded-lg transition-colors duration-200"
                >
                  <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Manage Household</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Your Profile */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Your Profile</h2>
          <div className="card dark:bg-neutral-800 dark:border-neutral-700 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                value={userDisplayName}
                onChange={(e) => updateUserDisplayName(e.target.value)}
                className="input-field dark:bg-neutral-700 dark:border-neutral-600 dark:text-white dark:placeholder-neutral-400"
                placeholder="How should we call you?"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                This appears when you log activities and in the app header
              </p>
            </div>
          </div>
        </section>

        {/* Family Members */}
        {members && members.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Family Members</h2>
            <div className="card dark:bg-neutral-800 dark:border-neutral-700">
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {member.user_profiles?.display_name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Data Management */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Data Management</h2>
          <div className="card dark:bg-neutral-800 dark:border-neutral-700 space-y-4">
            {/* Import Data - Development Only */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-300">Import Data</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Upload your existing activity data from Notion or other sources</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="btn-secondary text-blue-600 hover:bg-blue-100 border-blue-300 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:border-blue-700"
                >
                  Import
                </button>
              </div>
            )}

            {/* Export Data */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-600 rounded-lg">
                  <Download className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Export Data</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Download your data as a backup file</p>
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
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-300">Clear All Data</h3>
                  <p className="text-sm text-red-700 dark:text-red-400">Permanently delete all activity records</p>
                </div>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="btn-secondary text-red-600 hover:bg-red-100 border-red-300 dark:text-red-400 dark:hover:bg-red-900/30 dark:border-red-700"
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* App Settings */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">App Settings</h2>
          <div className="card dark:bg-neutral-800 dark:border-neutral-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Notifications</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Receive reminders and updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* App Info */}
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">About</h2>
          <div className="card dark:bg-neutral-800 dark:border-neutral-700 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-700 dark:text-neutral-300">Version</span>
              <span className="text-neutral-900 dark:text-white font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-700 dark:text-neutral-300">Last Updated</span>
              <span className="text-neutral-900 dark:text-white font-medium">Today</span>
            </div>
          </div>
        </section>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Confirm Clear Data</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                This will permanently delete all activity records for {activeDog?.name || 'your puppy'}. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
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