'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import Navigation from '@/components/Navigation'
import { Milestone, CreateMilestoneData } from '@/lib/types'
import { format } from 'date-fns'
import { 
  PlusIcon, 
  PhotoIcon,
  ScaleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function Milestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchMilestones()
  }, [])

  const fetchMilestones = async () => {
    try {
      const response = await fetch('/api/milestones')
      
      if (response.ok) {
        const data = await response.json()
        setMilestones(data)
      }
    } catch (error) {
      console.error('Error fetching milestones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMilestone = async (data: CreateMilestoneData) => {
    try {
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowAddForm(false)
        fetchMilestones()
      }
    } catch (error) {
      console.error('Error creating milestone:', error)
    }
  }

  // Prepare weight chart data
  const weightMilestones = milestones
    .filter(m => m.weight !== null)
    .sort((a, b) => new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime())

  const chartData = {
    labels: weightMilestones.map(m => format(new Date(m.achievedAt), 'MMM d')),
    datasets: [
      {
        label: 'Weight (lbs)',
        data: weightMilestones.map(m => m.weight),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Puppy Weight Progress',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Weight (lbs)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Milestones</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Milestone</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading milestones...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weight Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ScaleIcon className="h-5 w-5 mr-2 text-blue-600" />
                Weight Progress
              </h2>
              
              {weightMilestones.length > 0 ? (
                <div className="h-80">
                  <Line data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ScaleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No weight data yet</p>
                    <p className="text-sm">Add milestones with weight to see progress</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Milestones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Recent Milestones
              </h2>
              
              {milestones.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {milestones
                    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
                    .slice(0, 10)
                    .map((milestone) => (
                      <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                          <span className="text-sm text-gray-500">
                            {format(new Date(milestone.achievedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        {milestone.description && (
                          <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4">
                          {milestone.weight && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <ScaleIcon className="h-3 w-3 mr-1" />
                              {milestone.weight} lbs
                            </span>
                          )}
                          {milestone.photoUrl && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <PhotoIcon className="h-3 w-3 mr-1" />
                              Photo
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No milestones yet</p>
                  <p className="text-sm">Add your first milestone to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Milestones Grid */}
        {milestones.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Milestones</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestones
                .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
                .map((milestone) => (
                  <div key={milestone.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {milestone.photoUrl && (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                        {/* In a real app, you'd display the actual image */}
                        <span className="text-gray-500 ml-2">Photo</span>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                        <span className="text-sm text-gray-500">
                          {format(new Date(milestone.achievedAt), 'MMM d')}
                        </span>
                      </div>
                      
                      {milestone.description && (
                        <p className="text-gray-600 text-sm mb-3">{milestone.description}</p>
                      )}
                      
                      {milestone.weight && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <ScaleIcon className="h-3 w-3 mr-1" />
                          {milestone.weight} lbs
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Milestone Form Modal */}
      {showAddForm && (
        <MilestoneForm
          onSubmit={handleAddMilestone}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}

// Milestone Form Component
interface MilestoneFormProps {
  onSubmit: (data: CreateMilestoneData) => void
  onCancel: () => void
}

function MilestoneForm({ onSubmit, onCancel }: MilestoneFormProps) {
  const [formData, setFormData] = useState<CreateMilestoneData>({
    title: '',
    description: '',
    weight: undefined,
    photoUrl: '',
    achievedAt: new Date(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      weight: formData.weight ? Number(formData.weight) : undefined,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'achievedAt' ? new Date(value) : value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Milestone</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., First vet visit, Lost first tooth"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us more about this milestone..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (lbs)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo URL
              </label>
              <input
                type="url"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                                 In a production app, you&apos;d upload photos directly
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Achieved
              </label>
              <input
                type="datetime-local"
                name="achievedAt"
                value={format(formData.achievedAt!, "yyyy-MM-dd'T'HH:mm")}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Add Milestone
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 