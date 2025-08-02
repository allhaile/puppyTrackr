import React, { useState } from 'react';
import { Copy, Share, RefreshCw, UserPlus, Users, QrCode, X, Check, Trash2 } from 'lucide-react';

const HouseholdInvite = ({ 
  household, 
  members, 
  inviteLink, 
  onGenerateNewCode, 
  onRemoveMember,
  isOpen,
  onClose 
}) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${household?.name} on PuppyTrackr`,
          text: `You've been invited to help track our dogs!`,
          url: inviteLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const generateNewCode = async () => {
    setLoading(true);
    try {
      await onGenerateNewCode();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Household Members
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite Link Section */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">
              Invite Family & Friends
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Share this link with family members, dog sitters, or anyone you want to help track your dogs.
            </p>
            
            <div className="space-y-3">
              {/* Link Display */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg px-3 py-2">
                  <code className="text-sm text-neutral-700 dark:text-neutral-300 break-all">
                    {inviteLink}
                  </code>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex-shrink-0"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={shareLink}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Share className="w-4 h-4" />
                  <span>Share Link</span>
                </button>
                
                <button
                  onClick={generateNewCode}
                  disabled={loading}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  title="Generate new invite code"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {copied && (
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Link copied to clipboard!</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Members */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">
              Current Members ({members.length})
            </h3>
            
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      {member.user_profiles?.avatar_url ? (
                        <img 
                          src={member.user_profiles.avatar_url} 
                          alt={member.user_profiles.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xs">
                          {member.user_profiles?.display_name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {member.user_profiles?.display_name}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                        {member.role}
                      </div>
                    </div>
                  </div>

                  {member.role !== 'owner' && (
                    <button
                      onClick={() => onRemoveMember(member.user_id)}
                      className="p-1 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              How it works:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Family members click the invite link</li>
              <li>• They create a simple account (email verification)</li>
              <li>• They automatically join your household</li>
              <li>• Everyone can track all your dogs together!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseholdInvite; 