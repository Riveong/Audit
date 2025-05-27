import { useState, useEffect } from 'react'
import { checklistsAPI, progressAPI } from '../services/api'

const ChecklistView = ({ checklistId, onClose, isLoggedIn }) => {
  const [checklist, setChecklist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingNotes, setEditingNotes] = useState(null)
  const [tempNote, setTempNote] = useState('')

  useEffect(() => {
    if (checklistId) {
      fetchChecklist()
    }
  }, [checklistId])

  const fetchChecklist = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await checklistsAPI.getById(checklistId)
      setChecklist(response.data.data)
    } catch (error) {
      console.error('Error fetching checklist:', error)
      setError('Failed to load inspection checklist details')
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = async (violationId, currentChecked) => {
    if (!isLoggedIn) return

    try {
      const newChecked = !currentChecked
      await progressAPI.updateProgress(checklistId, violationId, newChecked)
      
      // Update local state
      setChecklist(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.violation_id === violationId 
            ? { ...item, is_checked: newChecked, checked_at: newChecked ? new Date().toISOString() : null }
            : item
        )
      }))
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const updateNotes = async (violationId, notes) => {
    if (!isLoggedIn) return

    try {
      const item = checklist.items.find(item => item.violation_id === violationId)
      await progressAPI.updateProgress(checklistId, violationId, item.is_checked, notes)
      
      // Update local state
      setChecklist(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.violation_id === violationId 
            ? { ...item, notes }
            : item
        )
      }))
      
      setEditingNotes(null)
      setTempNote('')
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  const resetProgress = async () => {
    if (!isLoggedIn || !confirm('Are you sure you want to reset all inspection findings?')) return

    try {
      await progressAPI.resetProgress(checklistId)
      
      // Update local state
      setChecklist(prev => ({
        ...prev,
        items: prev.items.map(item => ({
          ...item,
          is_checked: false,
          checked_at: null,
          notes: null
        }))
      }))
    } catch (error) {
      console.error('Error resetting progress:', error)
    }
  }

  const markAsCompleted = async () => {
    if (!isLoggedIn || !confirm('Are you sure you want to mark this checklist as completed?')) return

    try {
      await checklistsAPI.markAsCompleted(checklistId)
      
      // Update local state
      setChecklist(prev => ({
        ...prev,
        status: 'completed'
      }))
    } catch (error) {
      console.error('Error marking checklist as completed:', error)
    }
  }

  const startEditingNotes = (violationId, currentNotes) => {
    setEditingNotes(violationId)
    setTempNote(currentNotes || '')
  }

  const cancelEditingNotes = () => {
    setEditingNotes(null)
    setTempNote('')
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inspection checklist...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!checklist) return null

  const violationsFound = checklist.items.filter(item => item.is_checked).length
  const completionPercentage = (violationsFound / checklist.items.length) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{checklist.name}</h2>
              <p className="text-blue-100">📍 {checklist.site}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-100 mb-2">
              <span>Violations Found</span>
              <span>{violationsFound}/{checklist.items.length} ({Math.round(completionPercentage)}%)</span>
            </div>
            <div className="w-full bg-blue-800 bg-opacity-30 rounded-full h-3">
              <div 
                className="bg-red-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          {isLoggedIn && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={resetProgress}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                🔄 Reset Inspection
              </button>
              {checklist.status !== 'completed' && (
                <button
                  onClick={markAsCompleted}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  ✅ Mark as Completed
                </button>
              )}
              {violationsFound === checklist.items.length && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                  ⚠️ All Violations Found!
                </div>
              )}
              {checklist.status === 'completed' && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                  ✅ Completed
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inspection Items */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {checklist.items.map((item, index) => (
              <div 
                key={item.violation_id}
                className={`border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
                  item.is_checked ? 'bg-red-50 border-red-200' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItem(item.violation_id, item.is_checked)}
                    disabled={!isLoggedIn}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      item.is_checked 
                        ? 'bg-red-500 border-red-500' 
                        : isLoggedIn 
                          ? 'border-gray-300 hover:border-red-400' 
                          : 'border-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {item.is_checked && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1">
                    {/* Violation Text */}
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium transition-all duration-200 ${
                        item.is_checked ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {index + 1}. {item.violations}
                      </h4>
                      
                      {/* Timestamp */}
                      {item.checked_at && (
                        <span className="text-xs text-red-600">
                          ⚠️ Found: {new Date(item.checked_at).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Notes Section */}
                    <div className="mt-2">
                      {editingNotes === item.violation_id ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            placeholder="Add inspection notes for this violation..."
                            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="2"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateNotes(item.violation_id, tempNote)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditingNotes}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {item.notes ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 flex-1">
                              <p className="text-sm text-gray-700">{item.notes}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm italic flex-1">No inspection notes</p>
                          )}
                          
                          {isLoggedIn && (
                            <button
                              onClick={() => startEditingNotes(item.violation_id, item.notes)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              📝 {item.notes ? 'Edit' : 'Add'} Notes
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {!isLoggedIn && 'Login to mark violations found and add inspection notes'}
            </p>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChecklistView