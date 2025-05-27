import { useState, useEffect } from 'react'
import { sitesAPI } from '../services/api'

const SiteManager = () => {
  const [sites, setSites] = useState([])
  const [newSite, setNewSite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const response = await sitesAPI.getAll()
      setSites(response.data.data)
    } catch (error) {
      console.error('Error fetching sites:', error)
      setError('Failed to load sites')
    }
  }

  const addSite = async (e) => {
    e.preventDefault()
    if (!newSite.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await sitesAPI.create(newSite.trim())
      setSites([...sites, response.data.data])
      setNewSite('')
      setSuccess('Site added successfully!')
    } catch (error) {
      console.error('Error creating site:', error)
      setError(error.response?.data?.error || 'Failed to create site')
    } finally {
      setLoading(false)
    }
  }

  const removeSite = async (siteToRemove) => {
    if (!confirm(`Are you sure you want to delete "${siteToRemove.sites}"?`)) return

    try {
      await sitesAPI.delete(siteToRemove.id)
      setSites(sites.filter(site => site.id !== siteToRemove.id))
      setSuccess('Site deleted successfully!')
    } catch (error) {
      console.error('Error deleting site:', error)
      setError(error.response?.data?.error || 'Failed to delete site')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Sites</h2>

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
      
      {/* Add New Site */}
      <form onSubmit={addSite} className="mb-8">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter new site name"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newSite.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Site'}
          </button>
        </div>
      </form>

      {/* Sites List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Current Sites ({sites.length})
        </h3>
        {sites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No sites available. Add some sites to get started.</p>
          </div>
        ) : (
          sites.map((site) => (
            <div key={site.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{site.sites}</span>
              <button
                onClick={() => removeSite(site)}
                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                title="Delete site"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SiteManager