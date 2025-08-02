import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Check, AlertCircle, Loader } from 'lucide-react';
import { useHouseholdData } from '../hooks/useHouseholdData';

const InviteHandler = ({ inviteCode, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { joinHouseholdByInvite } = useHouseholdData();

  const handleJoinHousehold = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { data, error: joinError } = await joinHouseholdByInvite(inviteCode, displayName.trim());
      
      if (joinError) {
        setError(joinError.message || 'Failed to join household');
      } else {
        setSuccess(true);
        if (onSuccess) {
          setTimeout(() => onSuccess(data), 1500);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while joining the household');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Welcome to the household!
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            You've successfully joined the household. You can now help track all the dogs together!
          </p>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Redirecting you to the app...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          Join Household
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          You've been invited to help track a family's dogs on PuppyTrackr!
        </p>
      </div>

      <form onSubmit={handleJoinHousehold} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`input-field ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : ''}`}
            placeholder="Enter your name"
            required
            disabled={loading}
          />
          {error && (
            <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !displayName.trim()}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Joining Household...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Join Household</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-xs text-neutral-500 dark:text-neutral-400 text-center">
        <p>By joining, you'll be able to:</p>
        <ul className="mt-2 space-y-1">
          <li>• Track activities for all household dogs</li>
          <li>• See activities logged by other family members</li>
          <li>• Add your own observations and notes</li>
        </ul>
      </div>
    </div>
  );
};

export default InviteHandler; 