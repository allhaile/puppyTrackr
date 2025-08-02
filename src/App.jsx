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
import DogForm from './components/DogForm';
import HouseholdInvite from './components/HouseholdInvite';
import AuthWrapper from './components/AuthWrapper';

// Hooks
import { useHouseholdData } from './hooks/useHouseholdData';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showDogForm, setShowDogForm] = useState(false);
  const [showHouseholdInvite, setShowHouseholdInvite] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const {
    loading: dataLoading,
    household,
    dogs,
    activeDog,
    entries,
    householdMembers,
    user,
    switchDog,
    addDog,
    updateDog,
    deleteDog,
    addEntry,
    updateEntry,
    deleteEntry,
    updateHousehold,
    joinHouseholdByInvite,
    removeMember,
    generateNewInviteCode,
    exportHouseholdData,
    getInviteLink,
    refreshData
  } = useHouseholdData();

  // Handle adding new dog
  const handleAddDog = async (dogData) => {
    setLoading(true);
    try {
      const { error } = await addDog(dogData);
      if (!error) {
        setShowDogForm(false);
        setEditingDog(null);
      } else {
        console.error('Error adding dog:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle editing dog
  const handleEditDog = async (dogData) => {
    if (!editingDog) return;
    
    setLoading(true);
    try {
      const { error } = await updateDog(editingDog.id, dogData);
      if (!error) {
        setShowDogForm(false);
        setEditingDog(null);
      } else {
        console.error('Error updating dog:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle adding entry
  const handleAddEntry = async (entryData) => {
    setLoading(true);
    try {
      // Convert the old format to new format
      const newEntryData = {
        type: entryData.type,
        details: {
          notes: entryData.notes,
          mood: entryData.mood,
          energy: entryData.energy,
          hasTreat: entryData.hasTreat,
          time: entryData.time,
          // Include any additional details from the entry
          ...entryData
        },
        created_at: entryData.time
      };

      const { error } = await addEntry(newEntryData);
      if (!error) {
        setShowQuickAdd(false);
      } else {
        console.error('Error adding entry:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle household actions
  const handleOpenDogForm = (dog = null) => {
    setEditingDog(dog);
    setShowDogForm(true);
  };

  const handleExportData = async () => {
    try {
      const { data, error } = await exportHouseholdData();
      if (error) {
        console.error('Error exporting data:', error);
        return;
      }

      // Download the data as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${household?.name || 'household'}-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView 
            entries={entries} 
            activeDog={activeDog}
            household={household}
          />
        );
      case 'analytics':
        return <AnalyticsView entries={entries} />;
      case 'history':
        return (
          <HistoryView 
            entries={entries} 
            activeDog={activeDog}
            onEditEntry={updateEntry}
            onDeleteEntry={deleteEntry}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            household={household}
            dogs={dogs}
            activeDog={activeDog}
            members={householdMembers}
            user={user}
            onUpdateHousehold={updateHousehold}
            onAddDog={() => handleOpenDogForm()}
            onEditDog={handleOpenDogForm}
            onDeleteDog={deleteDog}
            onShowInvites={() => setShowHouseholdInvite(true)}
            onExportData={handleExportData}
            onRefreshData={refreshData}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        );
      default:
        return <HomeView entries={entries} activeDog={activeDog} household={household} />;
    }
  };

  return (
    <AuthWrapper>
      <div className={`app ${isDarkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-neutral-25 dark:bg-neutral-900">
          {/* Header */}
          <Header
            household={household}
            dogs={dogs}
            activeDog={activeDog}
            onDogChange={switchDog}
            onAddDog={() => handleOpenDogForm()}
            onHouseholdClick={() => setShowHouseholdInvite(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          {/* Main Content */}
          <main className="relative">
            {dataLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-neutral-600 dark:text-neutral-400">Loading your household...</p>
                </div>
              </div>
            ) : (
              renderActiveView()
            )}
          </main>

          {/* Bottom Navigation */}
          <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Floating Add Button */}
          {activeDog && (
            <button
              onClick={() => setShowQuickAdd(true)}
              className="fixed bottom-20 right-4 sm:right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-30 focus:outline-none focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-800"
              title="Quick add activity"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}

          {/* Modals */}
          <QuickAddForm
            isOpen={showQuickAdd}
            onAdd={handleAddEntry}
            onClose={() => setShowQuickAdd(false)}
            currentUser={user?.user_metadata?.display_name || user?.email || 'Unknown'}
            users={householdMembers.map(member => member.user_profiles?.display_name || 'Unknown')}
          />

          <DogForm
            isOpen={showDogForm}
            onClose={() => {
              setShowDogForm(false);
              setEditingDog(null);
            }}
            onSubmit={editingDog ? handleEditDog : handleAddDog}
            dog={editingDog}
            loading={loading}
          />

          <HouseholdInvite
            isOpen={showHouseholdInvite}
            onClose={() => setShowHouseholdInvite(false)}
            household={household}
            members={householdMembers}
            inviteLink={getInviteLink()}
            onGenerateNewCode={generateNewInviteCode}
            onRemoveMember={removeMember}
          />
        </div>
      </div>
    </AuthWrapper>
  );
}

export default App; 