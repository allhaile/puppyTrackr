import React, { useState } from 'react';
import { ChevronDown, Plus, Dog } from 'lucide-react';

const DogSelector = ({ dogs, activeDog, onDogChange, onAddDog, household }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDogSelect = (dog) => {
    onDogChange(dog);
    setIsOpen(false);
  };

  if (!dogs || dogs.length === 0) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
          <Dog className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">No dogs yet</p>
          <button
            onClick={onAddDog}
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Add your first dog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 w-full text-left"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 shadow-sm">
          {activeDog?.avatar_url ? (
            <img 
              src={activeDog.avatar_url} 
              alt={activeDog.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {activeDog?.name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
              {activeDog?.name}
            </h3>
            {dogs.length > 1 && (
              <ChevronDown 
                className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            )}
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
            {household?.name || localStorage.getItem('householdName') || 'Household'}
          </p>
        </div>
      </button>

      {isOpen && dogs.length > 1 && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-20 overflow-hidden">
            <div className="py-2">
              {dogs.map((dog) => (
                <button
                  key={dog.id}
                  onClick={() => handleDogSelect(dog)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 ${
                    activeDog?.id === dog.id ? 'bg-primary-50 dark:bg-primary-900/50' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-600">
                    {dog.avatar_url ? (
                      <img 
                        src={dog.avatar_url} 
                        alt={dog.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {dog.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-900 dark:text-white truncate">
                      {dog.name}
                    </div>
                    {dog.breed && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                        {dog.breed}
                      </div>
                    )}
                  </div>
                  
                  {activeDog?.id === dog.id && (
                    <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full" />
                  )}
                </button>
              ))}
              
              {/* Add dog option */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 mt-2 pt-2">
                <button
                  onClick={() => {
                    onAddDog();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div className="font-medium text-neutral-700 dark:text-neutral-300">
                    Add another dog
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DogSelector; 