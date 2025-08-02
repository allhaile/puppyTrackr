import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download, Eye } from 'lucide-react';
import { processNotionImport, generateImportPreview, importToLocalStorage, importToSupabase } from '../utils/dataImporter';
import { formatTime } from '../utils/helpers';

const DataImportModal = ({ isOpen, onClose, onImport, mode = 'localStorage', puppyId, userId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'success'

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setProcessing(true);
    setProcessedData(null);

    try {
      const result = await processNotionImport(selectedFile, {
        defaultUser: 'Imported User'
      });

      if (result.success) {
        setProcessedData(result);
        setStep('preview');
      } else {
        setImportResult({ success: false, error: result.error });
      }
    } catch (error) {
      setImportResult({ success: false, error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!processedData) return;

    setProcessing(true);
    let result;

    if (mode === 'localStorage') {
      result = importToLocalStorage(processedData.entries);
    } else if (mode === 'supabase') {
      result = await importToSupabase(processedData.entries, puppyId, userId);
    }

    setImportResult(result);
    setStep('success');
    setProcessing(false);

    if (result.success && onImport) {
      onImport(result);
    }
  };

  const resetModal = () => {
    setFile(null);
    setProcessedData(null);
    setImportResult(null);
    setStep('upload');
    setProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const preview = processedData ? generateImportPreview(processedData.entries) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Import Notion Data
            </h2>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-sm text-orange-600 mt-1">🔧 Development Tool Only</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-neutral-600 mb-4">
                  Upload your Notion export file (CSV or JSON) to import your existing activity data.
                </p>
              </div>

              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={processing}
                />
                
                {processing ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-neutral-600">Processing your file...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto bg-neutral-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-neutral-900 font-medium">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-neutral-500">
                        Supports CSV and JSON files from Notion export
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Format Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Expected Format
                </h3>
                <p className="text-sm text-blue-800 mb-2">
                  Your Notion export should include columns like:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Activity/Type:</strong> potty, meal, sleep, medicine, training, note, walk, play</li>
                  <li>• <strong>Time/Date:</strong> When the activity occurred</li>
                  <li>• <strong>Description/Details:</strong> What happened</li>
                  <li>• <strong>User/Person:</strong> Who recorded it (optional)</li>
                  <li>• <strong>Notes:</strong> Additional comments (optional)</li>
                </ul>
              </div>

              {importResult && !importResult.success && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-900">Import Error</h3>
                      <p className="text-sm text-red-700 mt-1">{importResult.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && preview && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Import Preview</h3>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-600">Total Activities</p>
                    <p className="text-2xl font-semibold text-neutral-900">{preview.totalEntries}</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-600">Date Range</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {preview.dateRange.earliest} - {preview.dateRange.latest}
                    </p>
                  </div>
                </div>

                {/* Combined Activities Notice */}
                {processedData.entries.some(entry => entry.types && entry.types.length > 1) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Combined Activities Detected
                    </h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Some rows contain multiple activities (e.g., "meal, training"). These will be imported as single entries that count toward multiple activity types.
                    </p>
                    <p className="text-xs text-blue-700">
                      This creates a cleaner history view while still tracking each activity type individually in your stats.
                    </p>
                  </div>
                )}

                {/* Activity Breakdown */}
                <div className="mb-6">
                  <h4 className="font-medium text-neutral-900 mb-3">Activity Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(preview.activityBreakdown).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center py-2 px-3 bg-neutral-50 rounded">
                        <span className="text-sm font-medium text-neutral-700 capitalize">{type}</span>
                        <span className="text-sm text-neutral-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Entries */}
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">
                    Sample Entries (showing {preview.sampleEntries.length} of {preview.totalEntries})
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {preview.sampleEntries.map((entry, index) => (
                      <div key={index} className="bg-neutral-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-neutral-900 capitalize">{entry.type}</span>
                          <div className="text-right">
                            <div className="text-sm text-neutral-500">
                              {new Date(entry.time).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {formatTime(entry.time)}
                            </div>
                          </div>
                        </div>
                        {entry.details && (
                          <p className="text-sm text-neutral-700 mb-1">{entry.details}</p>
                        )}
                        {entry.notes && entry.notes !== 'No notes' && (
                          <p className="text-xs text-neutral-500 italic mb-1">{entry.notes}</p>
                        )}
                        
                        {/* Show additional data fields */}
                        <div className="flex items-center space-x-2 mb-1">
                          {entry.mood && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              {entry.mood} Mood
                            </span>
                          )}
                          {entry.energy && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              entry.energy === 'High' ? 'bg-red-100 text-red-700' :
                              entry.energy === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {entry.energy} Energy
                            </span>
                          )}
                          {entry.hasTreat && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              🦴 Treats
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-neutral-400">
                          Recorded by: {entry.user}
                        </div>
                        {entry.types && entry.types.length > 1 && (
                          <div className="text-xs text-blue-600 mt-1 italic">
                            ✨ Multiple activities: {entry.types.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 italic">
                    This is a preview. All {preview.totalEntries} activities will be imported.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={processing}
                  className="btn-primary flex items-center space-x-2"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Import {preview.totalEntries} Activities</span>
                </button>
              </div>
            </div>
          )}

          {step === 'success' && importResult && (
            <div className="text-center space-y-6">
              {importResult.success ? (
                <div>
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Import Successful!</h3>
                  <p className="text-neutral-600 mb-4">
                    Successfully imported {importResult.imported} activities to your puppy's history.
                  </p>
                  <button
                    onClick={handleClose}
                    className="btn-primary"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Import Failed</h3>
                  <p className="text-neutral-600 mb-4">{importResult.error}</p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setStep('upload')}
                      className="btn-secondary"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleClose}
                      className="btn-primary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImportModal; 