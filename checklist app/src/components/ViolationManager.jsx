import { useState, useEffect } from 'react'
import { violationsAPI } from '../services/api'

const ViolationManager = () => {
  const [violations, setViolations] = useState([])
  const [newViolation, setNewViolation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchViolations()
  }, [])

  const fetchViolations = async () => {
    try {
      const response = await violationsAPI.getAll()
      setViolations(response.data.data)
    } catch (error) {
      console.error('Error fetching violations:', error)
      setError('Failed to load violations')
    }
  }

  const addViolation = async (e) => {
    e.preventDefault()
    if (!newViolation.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await violationsAPI.create(newViolation.trim())
      setViolations([...violations, response.data.data])
      setNewViolation('')
      setSuccess('Violation added successfully!')
    } catch (error) {
      console.error('Error creating violation:', error)
      setError(error.response?.data?.error || 'Failed to create violation')
    } finally {
      setLoading(false)
    }
  }

  const removeViolation = async (violationToRemove) => {
    if (!confirm(`Are you sure you want to delete "${violationToRemove.violations}"?`)) return

    try {
      await violationsAPI.delete(violationToRemove.id)
      setViolations(violations.filter(violation => violation.id !== violationToRemove.id))
      setSuccess('Violation deleted successfully!')
    } catch (error) {
      console.error('Error deleting violation:', error)
      setError(error.response?.data?.error || 'Failed to delete violation')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Standard Violations</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Global Violations</h3>
        <p className="text-yellow-700 text-sm">
          These violations will be applied to ALL inspection checklists. Changes here will affect all future checklists.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      {/* Add New Violation */}
      <form onSubmit={addViolation} className="mb-8">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newViolation}
            onChange={(e) => setNewViolation(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter new violation (e.g., Equipment not properly maintained)"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newViolation.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Violation'}
          </button>
        </div>
      </form>

      {/* Violations List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Standard Violations ({violations.length} items)
        </h3>
        {violations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No violations defined. Add some violations to get started.</p>
          </div>
        ) : (
          violations.map((violation, index) => (
            <div key={violation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 font-mono">#{index + 1}</span>
                <span className="font-medium text-gray-700">{violation.violations}</span>
              </div>
              <button
                onClick={() => removeViolation(violation)}
                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                title="Delete violation"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {violations.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Preview: How this appears in inspection checklists</h4>
          <div className="space-y-2">
            {violations.slice(0, 3).map((violation, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className="w-4 h-4 border-2 border-red-400 rounded"></div>
                <span className="text-blue-700">{violation.violations}</span>
              </div>
            ))}
            {violations.length > 3 && (
              <div className="text-blue-600 text-sm">... and {violations.length - 3} more</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ViolationManager