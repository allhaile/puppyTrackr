import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Activity, Target, Filter, Scissors } from 'lucide-react';
import { getAnalyticsData, getEntriesInRange, getTodayEntries, countEntriesByType } from '../utils/helpers';

const AnalyticsView = ({ entries }) => {
  const [selectedType, setSelectedType] = useState('all');
  const [timeRange, setTimeRange] = useState(7);

  const activityTypes = [
    { value: 'all', label: 'All Activities', icon: Activity },
    { value: 'potty', label: 'Potty Breaks', icon: Target },
    { value: 'meal', label: 'Meals', icon: Activity },
    { value: 'sleep', label: 'Sleep', icon: Activity },
    { value: 'med', label: 'Medications', icon: Activity },
    { value: 'training', label: 'Training', icon: Activity },
    { value: 'grooming', label: 'Grooming', icon: Scissors },
  ];

  const timeRanges = [
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' },
  ];

  const chartData = getAnalyticsData(entries, selectedType === 'all' ? null : selectedType, timeRange);
  const todayEntries = getTodayEntries(entries);
  const recentEntries = getEntriesInRange(entries, timeRange);

  // Calculate insights
  const totalToday = todayEntries.length;
  const averageDaily = recentEntries.length / timeRange;
  const pottyToday = countEntriesByType(todayEntries, 'potty');
  const mealsToday = countEntriesByType(todayEntries, 'meal');
  
  // New insights for mood and energy
  const highEnergyToday = todayEntries.filter(e => e.energy === 'High').length;
  const treatsToday = todayEntries.filter(e => e.hasTreat).length;
  const happyMoodToday = todayEntries.filter(e => e.mood === '🎉').length;

  const insights = [
    {
      title: 'Today\'s Total',
      value: totalToday,
      subtitle: 'activities logged',
      trend: totalToday > averageDaily ? 'up' : 'down',
      color: 'primary'
    },
    {
      title: 'Daily Average',
      value: Math.round(averageDaily * 10) / 10,
      subtitle: `over ${timeRange} days`,
      color: 'success'
    },
    {
      title: 'Potty Breaks',
      value: pottyToday,
      subtitle: 'today',
      color: 'warning'
    },
    {
      title: 'Meals',
      value: mealsToday,
      subtitle: 'today',
      color: 'neutral'
    }
  ];

  const additionalInsights = [
    {
      title: 'High Energy',
      value: highEnergyToday,
      subtitle: 'activities today',
      color: 'error'
    },
    {
      title: 'Happy Mood',
      value: happyMoodToday,
      subtitle: 'activities today',
      color: 'success'
    },
    {
      title: 'Treats Given',
      value: treatsToday,
      subtitle: 'times today',
      color: 'primary'
    },
    {
      title: 'Activity Rate',
      value: totalToday > 0 ? Math.round((happyMoodToday / totalToday) * 100) : 0,
      subtitle: '% positive mood',
      color: 'neutral'
    }
  ];

  const getInsightCardColor = (color) => {
    const colors = {
      primary: 'bg-primary-25 border-primary-200',
      success: 'bg-success-25 border-success-200',
      warning: 'bg-warning-25 border-warning-200',
      neutral: 'bg-neutral-25 border-neutral-200'
    };
    return colors[color] || 'bg-neutral-25 border-neutral-200';
  };

  return (
    <div className="p-6 pb-20 bg-neutral-25 dark:bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Puppy Insights</h1>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400">🐾 Discover patterns in your furry friend's daily adventures</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <Filter className="w-4 h-4 inline mr-1" />
            Activity Type
          </label>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field"
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="input-field"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {insights.map((insight, index) => (
          <div key={index} className="stat-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                {insight.value}
              </div>
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {insight.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Insights Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {additionalInsights.map((insight, index) => (
          <div key={index} className="stat-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                {insight.value}{insight.subtitle.includes('%') ? '%' : ''}
              </div>
              <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {insight.title}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {insight.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="card dark:bg-neutral-800 dark:border-neutral-700 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Activity Trends ({timeRange} days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-neutral-600 dark:text-neutral-400"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-neutral-600 dark:text-neutral-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#5c2a33" 
                  strokeWidth={2}
                  dot={{ fill: '#5c2a33', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="card dark:bg-neutral-800 dark:border-neutral-700 text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No data available</h3>
          <p className="text-neutral-600 dark:text-neutral-400">
            Start tracking activities to see insights and trends
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView; 