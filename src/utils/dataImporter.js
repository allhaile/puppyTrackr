// Data import utility for migrating Notion kudos data to PuppyTrackr
import { supabase } from '../lib/supabase';

/**
 * Supported activity types in PuppyTrackr
 */
export const ACTIVITY_TYPES = {
  potty: 'potty',
  meal: 'meal', 
  sleep: 'sleep',
  med: 'med',
  training: 'training',
  note: 'note',
  grooming: 'grooming'  // Add grooming as a supported type
};

/**
 * Maps Lil Nugget Daily Log fields to PuppyTrackr format
 * Customized for your specific Notion table structure
 */
const FIELD_MAPPING = {
  // Lil Nugget specific mappings (handles BOM character)
  '\ufeffLogs': 'logs',
  'Logs': 'logs',
  'Date/Time': 'dateTime',
  'Entry type?': 'type',
  'Pee/Poop?': 'peePoop',
  'When?': 'when',
  'Notes': 'notes',
  'Vibe?': 'vibe',
  'Energy': 'energy',
  'Treat?': 'treat',
  'Logged By?': 'user',
  
  // Common fallbacks
  'Activity': 'type',
  'Type': 'type', 
  'Title': 'details',
  'Description': 'details',
  'Details': 'details',
  'Note': 'notes',
  'Comments': 'notes',
  'Time': 'time',
  'Date': 'time',
  'Created': 'time',
  'User': 'user',
  'Person': 'user',
  'Recorded by': 'user',
  'Who': 'user',
  'Mood': 'vibe',
  'Vibe': 'vibe',
  'Treats': 'treat'
};

/**
 * Maps Lil Nugget activity names to PuppyTrackr types
 */
const ACTIVITY_TYPE_MAPPING = {
  // Direct mappings
  'potty': 'potty',
  'meal': 'meal',
  'training': 'training',
  'nap': 'sleep',
  'grooming': 'grooming',
  'note': 'note',
  
  // Handle combined activities - prioritize the most important activity
  'meal, training': 'meal', // Meal is more critical to track
  'potty, meal': 'potty',   // Potty is highest priority
  'potty, training': 'potty',
  'grooming, training': 'grooming',
  'meal, note, potty, training': 'potty',
  'meal, potty': 'potty',
  'nap, potty': 'potty',
  'meal, potty, training': 'potty',
  
  // Common variations -> standardized types
  'bathroom': 'potty',
  'potty break': 'potty',
  'pee': 'potty',
  'poop': 'potty',
  'toilet': 'potty',
  
  'food': 'meal',
  'eating': 'meal',
  'breakfast': 'meal',
  'lunch': 'meal', 
  'dinner': 'meal',
  'feeding': 'meal',
  
  'bedtime': 'sleep',
  'rest': 'sleep',
  'sleep': 'sleep',
  
  'medication': 'med',
  'meds': 'med',
  'medicine': 'med',
  'pills': 'med',
  'treatment': 'med',
  
  'lesson': 'training',
  'practice': 'training',
  'learning': 'training',
  'trick': 'training',
  
  'observation': 'note',
  'behavior': 'note',
  'general': 'note'
};

/**
 * Parse Lil Nugget date format: "July 27, 2025 9:03 AM"
 * Simplified and more reliable implementation
 */
const parseLilNuggetDate = (dateTimeStr, whenStr) => {
  try {
    if (!dateTimeStr || dateTimeStr.trim() === '') {
      throw new Error('Empty date string');
    }

    let dateStr = dateTimeStr.trim();
    
    // Handle the specific format from CSV: "August 1, 2025 9:39 PM"
    const dateRegex = /^(\w+)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/;
    const dateMatch = dateStr.match(dateRegex);
    
    if (dateMatch) {
      const [, monthName, day, year, hour, minute, ampm] = dateMatch;
      
      // Convert month name to number
      const monthMap = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
      };
      
      const monthNum = monthMap[monthName];
      if (monthNum === undefined) {
        console.warn('Unknown month name:', monthName);
        throw new Error('Unknown month name');
      }
      
      // Convert hour to 24-hour format
      let hour24 = parseInt(hour, 10);
      if (ampm === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      // Create date in local timezone - this preserves the user's intended time
      const localDate = new Date(
        parseInt(year, 10),
        monthNum,
        parseInt(day, 10),
        hour24,
        parseInt(minute, 10),
        0
      );
      
      if (!isNaN(localDate.getTime())) {
        // Return the date as ISO string - this will be in the user's local timezone
        return localDate.toISOString();
      }
    }
    
    // Try standard date parsing for other formats
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      // Validate the year is reasonable (between 2020 and 2030)
      const year = parsedDate.getFullYear();
      if (year >= 2020 && year <= 2030) {
        return parsedDate.toISOString();
      } else {
        console.warn('Date year seems unreasonable:', year, 'from', dateStr);
      }
    }
    
    // Handle MM/DD/YY or MM/DD/YYYY patterns
    const shortDatePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(.*))?$/;
    const match = dateStr.match(shortDatePattern);
    
    if (match) {
      let [, month, day, year, timeAndRest] = match;
      
      // Fix two-digit year interpretation
      if (year.length === 2) {
        const yearNum = parseInt(year, 10);
        // Assume years 00-30 are 2000-2030, and 31-99 are 1931-1999
        if (yearNum <= 30) {
          year = '20' + year;
        } else {
          year = '19' + year;
        }
      }
      
      // Try to parse the corrected date string
      const fixedDateStr = timeAndRest ? 
        `${month}/${day}/${year} ${timeAndRest}` : 
        `${month}/${day}/${year}`;
      
      const secondParsedDate = new Date(fixedDateStr);
      if (!isNaN(secondParsedDate.getTime())) {
        return secondParsedDate.toISOString();
      }
    }
    
  } catch (e) {
    console.warn('Error parsing date:', dateTimeStr, e);
  }
  
  // If that fails, try to use the "When?" field with today's date
  if (whenStr && whenStr.match(/^\d{1,2}:\d{2}(?:\s*[AP]M)?$/i)) {
    const today = new Date();
    const timeMatch = whenStr.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
    if (timeMatch) {
      let [, hours, minutes, ampm] = timeMatch;
      hours = parseInt(hours, 10);
      
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      }
      
      today.setHours(hours, parseInt(minutes, 10), 0, 0);
      return today.toISOString();
    }
  }
  
  // Last resort: current time
  console.warn('Using current time as fallback for date:', dateTimeStr);
  return new Date().toISOString();
};

/**
 * Transform Cleaned Puppy Log row to PuppyTrackr entry format
 * Creates single entries with multiple types for combined activities (e.g., "Meal, Training")
 */
export const transformNotionEntry = (notionRow, defaultUser = 'Imported User') => {
  const baseEntry = {
    time: new Date().toISOString(),
    user: defaultUser,
    type: 'note',
    types: [], // Array to store multiple activity types
    notes: ''
  };

  // Temporary storage for rich data
  let rawData = {};

  // Map fields based on FIELD_MAPPING
  Object.entries(notionRow).forEach(([key, value]) => {
    const normalizedKey = key.trim();
    const mappedField = FIELD_MAPPING[normalizedKey];
    
    if (mappedField && value && value.toString().trim()) {
      rawData[mappedField] = value.toString().trim();
    }
  });

  // Handle date/time
  if (rawData.dateTime) {
    baseEntry.time = parseLilNuggetDate(rawData.dateTime, rawData.when);
  }

  // Handle user
  if (rawData.user) {
    baseEntry.user = rawData.user;
  }

  // Handle activity types - support multiple activities in single entry
  let activityTypes = ['note']; // default fallback
  let originalActivityString = '';
  
  if (rawData.type) {
    originalActivityString = rawData.type.toLowerCase().trim();
    
    // Split by comma and clean up
    const activities = originalActivityString.split(',').map(a => a.trim());
    const mappedTypes = [];
    
    for (const activity of activities) {
      const mappedType = ACTIVITY_TYPE_MAPPING[activity];
      if (mappedType && !mappedTypes.includes(mappedType)) {
        mappedTypes.push(mappedType);
      }
    }
    
    if (mappedTypes.length > 0) {
      activityTypes = mappedTypes;
    }
  }

  // Create single entry with multiple types
  const entry = {
    ...baseEntry,
    id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: activityTypes[0], // Primary type (for backward compatibility)
    types: activityTypes,   // All types for this entry
    mood: rawData.vibe || '🎉', // Map vibe to mood
    energy: rawData.energy || 'Medium', // Use energy level from CSV
    hasTreat: rawData.treat === 'Yes' || false // Convert Yes/No to boolean
  };

  // Build rich details from all the available data
  let detailsParts = [];
  
  // Add pee/poop specifics if this includes a potty activity
  if (activityTypes.includes('potty') && rawData.peePoop && rawData.peePoop !== 'None') {
    detailsParts.push(`Type: ${rawData.peePoop}`);
  }
  
  // Add energy level (now handled as separate field, but keep in details for legacy)
  if (rawData.energy && rawData.energy !== 'None') {
    detailsParts.push(`Energy: ${rawData.energy}`);
  }
  
  // Add the actual time if different from date
  if (rawData.when && rawData.when !== 'None') {
    detailsParts.push(`Time: ${rawData.when}`);
  }

  // If this has multiple activities, note them
  if (activityTypes.length > 1) {
    detailsParts.push(`Activities: ${originalActivityString}`);
  }

  // Combine details
  if (detailsParts.length > 0) {
    entry.details = detailsParts.join(', ');
  }

  // Use notes field for the main description
  if (rawData.notes && rawData.notes !== 'None') {
    entry.notes = rawData.notes;
  }

  return [entry]; // Return single entry in array for consistency with existing code
};

/**
 * Parse CSV data from Notion export
 */
export const parseNotionCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Helper function to parse CSV line with proper quote handling
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Don't forget the last field
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Only add rows that have some data
    if (Object.values(row).some(value => value && value.trim())) {
      rows.push(row);
    }
  }

  return rows;
};

/**
 * Parse JSON data from Notion export
 */
export const parseNotionJSON = (jsonText) => {
  try {
    const data = JSON.parse(jsonText);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    throw new Error('Invalid JSON format: ' + error.message);
  }
};

/**
 * Import data to localStorage (browser storage)
 */
export const importToLocalStorage = (entries) => {
  try {
    // Get existing entries
    const existingEntries = JSON.parse(localStorage.getItem('entries') || '[]');
    
    // Flatten entries array in case some are multi-entry arrays
    const flatEntries = entries.flat();
    
    // Normalize timestamps to avoid slight differences causing duplicates
    const normalizeTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      // Round to nearest minute to avoid millisecond differences
      date.setSeconds(0, 0);
      return date.toISOString();
    };
    
    // Create a more sophisticated deduplication that handles imported entries
    const newEntries = flatEntries.filter(newEntry => {
      const normalizedNewTime = normalizeTimestamp(newEntry.time);
      
      return !existingEntries.some(existing => {
        const normalizedExistingTime = normalizeTimestamp(existing.time);
        
        // Check for exact duplicates (same time, type, user, and notes)
        const isExactDuplicate = 
          normalizedExistingTime === normalizedNewTime && 
          existing.type === newEntry.type &&
          existing.user === newEntry.user &&
          (existing.notes || '') === (newEntry.notes || '');
        
        // Check for near-duplicate imports (within 1 minute, same type and user)
        // This prevents reimporting the same data multiple times
        const timeDiff = Math.abs(new Date(normalizedExistingTime) - new Date(normalizedNewTime));
        const isNearDuplicate = 
          timeDiff <= 60000 && // Within 1 minute
          existing.type === newEntry.type &&
          existing.user === newEntry.user &&
          existing.id && existing.id.startsWith('imported_'); // Only check against other imported entries
        
        return isExactDuplicate || isNearDuplicate;
      });
    });
    
    // Combine and sort by timestamp (newest first)
    const allEntries = [...existingEntries, ...newEntries]
      .sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Save back to localStorage
    localStorage.setItem('entries', JSON.stringify(allEntries));
    
    // Dispatch custom event to notify components of localStorage update
    window.dispatchEvent(new CustomEvent('localStorageUpdated', {
      detail: { keys: ['entries'], action: 'import' }
    }));
    
    return {
      success: true,
      imported: newEntries.length,
      skipped: flatEntries.length - newEntries.length,
      total: allEntries.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Import data directly to Supabase (after authentication)
 */
export const importToSupabase = async (entries, puppyId, userId) => {
  try {
    if (!puppyId || !userId) {
      throw new Error('Puppy ID and User ID are required for Supabase import');
    }

    // Format entries for Supabase
    const supabaseEntries = entries.map(entry => ({
      puppy_id: puppyId,
      user_id: userId,
      type: entry.type,
      details: {
        description: entry.details,
        notes: entry.notes || null,
        imported: true,
        original_time: entry.time
      },
      created_at: entry.time
    }));

    const { data, error } = await supabase
      .from('puppy_entries')
      .insert(supabaseEntries);

    if (error) throw error;

    return {
      success: true,
      imported: entries.length,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get date range from entries for preview
 */
const getDateRange = (entries) => {
  if (entries.length === 0) return 'No entries';
  
  const dates = entries.map(entry => new Date(entry.time));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
};

/**
 * Get activity breakdown for preview
 */
const getActivityBreakdown = (entries) => {
  const breakdown = {};
  
  entries.forEach(entry => {
    const type = entry.type || 'unknown';
    breakdown[type] = (breakdown[type] || 0) + 1;
  });
  
  return breakdown;
};

/**
 * Main import function - handles file upload and processing
 */
export const processNotionImport = async (file, options = {}) => {
  try {
    const text = await file.text();
    let rows;
    
    // Parse based on file type
    if (file.name.endsWith('.csv')) {
      rows = parseNotionCSV(text);
    } else if (file.name.endsWith('.json')) {
      rows = parseNotionJSON(text);
    } else {
      throw new Error('Unsupported file type. Please upload a CSV or JSON file.');
    }

    if (rows.length === 0) {
      throw new Error('No data found in file');
    }

    // Transform to PuppyTrackr format - now returns arrays of entries
    const transformedData = rows.map(row => 
      transformNotionEntry(row, options.defaultUser || 'Imported User')
    );
    
    // Flatten the array of arrays into a single array
    const entries = transformedData.flat();

    // Calculate preview statistics
    const preview = {
      totalActivities: entries.length,
      dateRange: getDateRange(entries),
      activityBreakdown: getActivityBreakdown(entries),
      sampleEntries: entries.slice(0, 10).map(entry => ({
        type: entry.type,
        time: entry.time,
        date: new Date(entry.time).toLocaleDateString(),
        notes: entry.notes || 'No notes',
        details: entry.details || '',
        user: entry.user || 'Unknown'
      }))
    };

    return {
      success: true,
      entries,
      preview,
      rawData: rows
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate import preview for user review
 */
export const generateImportPreview = (entries) => {
  const typeCount = {};
  let earliestDate = new Date();
  let latestDate = new Date(0);

  entries.forEach(entry => {
    typeCount[entry.type] = (typeCount[entry.type] || 0) + 1;
    const entryDate = new Date(entry.time);
    if (entryDate < earliestDate) earliestDate = entryDate;
    if (entryDate > latestDate) latestDate = entryDate;
  });

  return {
    totalEntries: entries.length,
    dateRange: {
      earliest: earliestDate.toLocaleDateString(),
      latest: latestDate.toLocaleDateString()
    },
    activityBreakdown: typeCount,
    sampleEntries: entries.slice(0, 10)
  };
}; 