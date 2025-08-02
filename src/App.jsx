import React, { useState } from 'react';
import { Plus } from 'lucide-react';

// Components
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import HomeView from './components/HomeView';
import AnalyticsView from './components/AnalyticsView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import QuickAddForm from './components/QuickAddForm';
import UserSelector from './components/UserSelector';

// Hooks
import { usePuppyData } from './hooks/usePuppyData';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showForm, setShowForm] = useState(false);
  const [showUserSelect, setShowUserSelect] = useState(false);

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const {
    entries,
    puppyName,
    puppyAvatar,
    userName,
    userDisplayName,
    users,
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
  } = usePuppyData();

  const handleUserSelect = (user) => {
    setUserName(user);
    setShowUserSelect(false);
  };

  const handleDataImport = (result) => {
    console.log(`Successfully imported ${result.imported} activities`);
    // Force immediate refresh of all data from localStorage to sync React state
    refreshAllData();
    
    // Also refresh after a brief delay to ensure all state updates are processed
    setTimeout(() => {
      refreshAllData();
    }, 50);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView entries={entries} puppyName={puppyName} puppyAvatar={puppyAvatar} />;
      case 'analytics':
        return <AnalyticsView entries={entries} puppyName={puppyName} />;
      case 'history':
        return <HistoryView entries={entries} />;
      case 'settings':
        return (
          <SettingsView
            puppyName={puppyName}
            puppyAvatar={puppyAvatar}
            setPuppyName={setPuppyName}
            setPuppyAvatar={setPuppyAvatar}
            userName={userName}
            userDisplayName={userDisplayName}
            setUserName={setUserName}
            setUserDisplayName={setUserDisplayName}
            users={users}
            addUser={addUser}
            removeUser={removeUser}
            guestMode={guestMode}
            onEnableGuest={enableGuestMode}
            onDisableGuest={disableGuestMode}
            onClearAllData={clearAllData}
            onExportData={exportData}
            onDataImport={handleDataImport}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );
      default:
        return <HomeView entries={entries} puppyName={puppyName} puppyAvatar={puppyAvatar} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-25 dark:bg-neutral-900">
      {/* Header */}
      <Header 
        userName={userName}
        userDisplayName={userDisplayName}
        onUserClick={() => setShowUserSelect(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content */}
      {renderActiveView()}

      {/* Floating Add Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg z-40 transition-all duration-200 hover:shadow-xl focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-800"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Modals */}
      <QuickAddForm
        isOpen={showForm}
        onAdd={addEntry}
        onClose={() => setShowForm(false)}
        currentUser={userName}
        users={users}
      />
      
      <UserSelector
        isOpen={showUserSelect}
        users={users}
        currentUser={userName}
        onUserSelect={handleUserSelect}
        onClose={() => setShowUserSelect(false)}
        onEnableGuest={enableGuestMode}
      />
    </div>
  );
}

export default App; 