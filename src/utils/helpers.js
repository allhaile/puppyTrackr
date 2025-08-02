/**
 * Format timestamp to readable time string with timezone
 */
export const formatTime = (timeString) => {
  if (!timeString) {
    return 'Unknown time';
  }
  
  const date = new Date(timeString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

/**
 * Format timestamp to readable time string without timezone (for compact display)
 */
export const formatTimeCompact = (timeString) => {
  if (!timeString) {
    return 'Unknown time';
  }
  
  const date = new Date(timeString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format timestamp to detailed time string with full timezone name
 */
export const formatTimeDetailed = (timeString) => {
  if (!timeString) {
    return 'Unknown time';
  }
  
  const date = new Date(timeString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'long'
  });
};

/**
 * Get Lucide icon component for activity type
 */
export const getIcon = (type) => {
  // These will be imported and used as React components
  const iconMap = {
    potty: 'MapPin',
    meal: 'Utensils', 
    sleep: 'Moon',
    med: 'Pill',
    training: 'GraduationCap',
    note: 'FileText'
  };
  return iconMap[type] || 'FileText';
};

/**
 * Get icon color classes for activity type
 */
export const getIconColor = (type) => {
  const colors = {
    potty: 'text-warning-600',
    meal: 'text-success-600',
    sleep: 'text-primary-600',
    med: 'text-error-600',
    training: 'text-neutral-600',
    grooming: 'text-purple-600',
    note: 'text-neutral-500'
  };
  return colors[type] || 'text-neutral-500';
};

/**
 * Get background color classes for activity type cards
 */
export const getActivityCardColor = (type) => {
  const colors = {
    potty: 'bg-warning-25 border-warning-200',
    meal: 'bg-success-25 border-success-200',
    sleep: 'bg-primary-25 border-primary-200',
    med: 'bg-error-25 border-error-200',
    training: 'bg-neutral-25 border-neutral-200',
    grooming: 'bg-purple-25 border-purple-200',
    note: 'bg-neutral-25 border-neutral-200'
  };
  return colors[type] || 'bg-neutral-25 border-neutral-200';
};

/**
 * Get badge color classes for user
 */
export const getUserBadgeColor = (user) => {
  const colors = {
    'Parent 1': 'badge-primary',
    'Parent 2': 'badge-success', 
    'Sitter': 'badge-warning',
    'Grandma': 'badge-neutral',
    'Friend': 'badge-neutral',
    'Guest': 'bg-neutral-50 text-neutral-600'
  };
  return colors[user] || 'badge-neutral';
};

/**
 * Get placeholder text for form inputs based on activity type
 */
export const getPlaceholder = (type) => {
  const placeholders = {
    potty: 'Location and outcome details',
    meal: 'Food type and amount',
    sleep: 'Duration and quality',
    med: 'Medicine name and dosage',
    training: 'Commands and progress',
    note: 'Observations and notes'
  };
  return placeholders[type];
};

/**
 * Get all activity types from an entry (handles both single and multiple types)
 */
export const getEntryTypes = (entry) => {
  if (entry.types && Array.isArray(entry.types) && entry.types.length > 0) {
    return entry.types;
  }
  return [entry.type];
};

/**
 * Check if entry includes a specific activity type
 */
export const entryIncludesType = (entry, type) => {
  const entryTypes = getEntryTypes(entry);
  return entryTypes.includes(type);
};

/**
 * Count entries by activity type (handles multiple types per entry)
 */
export const countEntriesByType = (entries, type) => {
  return entries.filter(entry => entryIncludesType(entry, type)).length;
};

/**
 * Filter entries for today
 */
export const getTodayEntries = (entries) => {
  const today = new Date().toDateString();
  return entries.filter(entry => 
    new Date(entry.time).toDateString() === today
  );
};

/**
 * Filter entries for date range
 */
export const getEntriesInRange = (entries, days) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  return entries.filter(entry => new Date(entry.time) >= startDate);
};

/**
 * Group entries by date
 */
export const groupEntriesByDate = (entries) => {
  return entries.reduce((groups, entry) => {
    const date = new Date(entry.time).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(entry);
    return groups;
  }, {});
};

/**
 * Get analytics data for charts
 */
export const getAnalyticsData = (entries, type, days = 7) => {
  const filteredEntries = getEntriesInRange(entries, days);
  const grouped = {};
  
  // Create array of last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    grouped[dateStr] = 0;
  }
  
  // Count entries by date (handles multiple types per entry)
  filteredEntries
    .filter(entry => !type || entryIncludesType(entry, type))
    .forEach(entry => {
      const dateStr = entry.time.split('T')[0];
      if (grouped.hasOwnProperty(dateStr)) {
        grouped[dateStr]++;
      }
    });
    
  return Object.entries(grouped).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count
  }));
};

/**
 * Export data as JSON file
 */
export const exportData = (puppyName, userName, entries) => {
  const data = { puppyName, userName, entries };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${puppyName}_data.json`;
  a.click();
  URL.revokeObjectURL(url);
}; 