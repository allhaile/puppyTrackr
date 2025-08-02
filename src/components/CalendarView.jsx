import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { groupEntriesByDate } from '../utils/helpers';

const CalendarView = ({ entries, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  
  // Group entries by date for quick lookup
  const entriesByDate = groupEntriesByDate(entries);
  
  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  
  // Get the last day of the current month
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayWeekday = firstDayOfMonth.getDay();
  
  // Get the number of days in the month
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Create array of dates for the calendar grid
  const calendarDates = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDates.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    calendarDates.push(date);
  }
  
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };
  
  const getActivityCount = (date) => {
    if (!date) return 0;
    const dateString = date.toDateString();
    return entriesByDate[dateString]?.length || 0;
  };
  
  const getDateClasses = (date) => {
    if (!date) return 'invisible';
    
    const activityCount = getActivityCount(date);
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();
    
    let classes = 'relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700';
    
    if (isSelected) {
      classes += ' bg-primary-600 text-white hover:bg-primary-700';
    } else if (isToday) {
      classes += ' bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200';
    } else {
      classes += ' text-neutral-700 dark:text-neutral-300';
    }
    
    if (activityCount > 0 && !isSelected) {
      classes += ' ring-2 ring-primary-200 dark:ring-primary-800';
    }
    
    return classes;
  };
  
  const getActivityIndicator = (date) => {
    if (!date) return null;
    
    const activityCount = getActivityCount(date);
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    
    if (activityCount === 0) return null;
    
    return (
      <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs font-bold ${
        isSelected 
          ? 'bg-white text-primary-600' 
          : 'bg-primary-600 text-white dark:bg-primary-500'
      }`}>
        {activityCount > 99 ? '99+' : activityCount > 9 ? activityCount : activityCount}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 sm:p-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-8 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {day}
          </div>
        ))}
        
        {/* Calendar dates */}
        {calendarDates.map((date, index) => (
          <div key={index} className="h-8 sm:h-10 flex items-center justify-center">
            {date && (
              <button
                onClick={() => onDateSelect(date)}
                className={getDateClasses(date)}
              >
                {date.getDate()}
                {getActivityIndicator(date)}
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary-100 dark:bg-primary-900 rounded border border-primary-200 dark:border-primary-800"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-white dark:bg-neutral-700 rounded ring-2 ring-primary-200 dark:ring-primary-800"></div>
          <span>Has activities</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary-600 rounded"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 