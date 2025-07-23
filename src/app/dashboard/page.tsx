'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { CareLog, CreateCareLogData, CareLogType, CARE_LOG_TYPES } from '@/lib/types'
import { 
  PlusIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [careLogs, setCareLogs] = useState<CareLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLog, setEditingLog] = useState<CareLog | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authChecked) {
      fetchCareLogs()
    }
  }, [selectedDate, authChecked]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      // Make a request to verify our authentication
      const response = await fetch('/api/care-logs?date=' + format(new Date(), 'yyyy-MM-dd'), {
        credentials: 'include'
      })
      
      if (response.status === 401) {
        router.push('/login')
        return
      }
      
      setAuthChecked(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const fetchCareLogs = async () => {
    try {
      const dateParam = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/care-logs?date=${dateParam}`)
      
      if (response.ok) {
        const logs = await response.json()
        setCareLogs(logs)
      }
    } catch (error) {
      console.error('Error fetching care logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1))
  }

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1))
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const handleAddLog = () => {
    setEditingLog(null)
    setShowAddForm(true)
  }

  const handleEditLog = (log: CareLog) => {
    setEditingLog(log)
    setShowAddForm(true)
  }

  const handleDeleteLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log entry?')) return

    try {
      const response = await fetch(`/api/care-logs/${logId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCareLogs(careLogs.filter(log => log.id !== logId))
      }
    } catch (error) {
      console.error('Error deleting care log:', error)
    }
  }

  const handleFormSubmit = async (data: CreateCareLogData) => {
    try {
      const url = editingLog ? `/api/care-logs/${editingLog.id}` : '/api/care-logs'
      const method = editingLog ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowAddForm(false)
        setEditingLog(null)
        fetchCareLogs()
      }
    } catch (error) {
      console.error('Error saving care log:', error)
    }
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Date Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousDay}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h1>
              {!isToday && (
                <button
                  onClick={handleToday}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                >
                  Go to Today
                </button>
              )}
            </div>
            
            <button
              onClick={handleNextDay}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Add Log Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Daily Timeline</h2>
          <button
            onClick={handleAddLog}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Log Entry</span>
          </button>
        </div>

        {/* Care Logs Timeline */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading timeline...</p>
            </div>
          ) : careLogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No activities logged for this day.</p>
              <button
                onClick={handleAddLog}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Add your first log entry
              </button>
            </div>
          ) : (
            careLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {CARE_LOG_TYPES[log.type]}
                      </span>
                      <span className="text-gray-600 text-sm">
                        by {log.caregiver}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {format(new Date(log.timestamp), 'h:mm a')}
                      </span>
                    </div>
                    {log.description && (
                      <p className="text-gray-900 mb-2">{log.description}</p>
                    )}
                    {log.notes && (
                      <p className="text-gray-600 text-sm">{log.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditLog(log)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <CareLogForm
          initialData={editingLog}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowAddForm(false)
            setEditingLog(null)
          }}
        />
      )}
    </div>
  )
}

// Care Log Form Component
interface CareLogFormProps {
  initialData?: CareLog | null
  onSubmit: (data: CreateCareLogData) => void
  onCancel: () => void
}

function CareLogForm({ initialData, onSubmit, onCancel }: CareLogFormProps) {
  const [formData, setFormData] = useState<CreateCareLogData>({
    type: initialData?.type || CareLogType.FEED,
    description: initialData?.description || '',
    caregiver: initialData?.caregiver || '',
    notes: initialData?.notes || '',
    timestamp: initialData?.timestamp ? new Date(initialData.timestamp) : new Date(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'timestamp' ? new Date(value) : value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {initialData ? 'Edit Log Entry' : 'Add Log Entry'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {Object.entries(CARE_LOG_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caregiver
              </label>
              <input
                type="text"
                name="caregiver"
                value={formData.caregiver}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Who performed this activity?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="datetime-local"
                name="timestamp"
                value={format(formData.timestamp!, "yyyy-MM-dd'T'HH:mm")}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes (optional)"
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
                {initialData ? 'Update' : 'Add'} Log Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 