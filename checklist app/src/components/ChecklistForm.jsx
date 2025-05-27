import { useState, useEffect } from 'react'
import { sitesAPI, violationsAPI, checklistsAPI } from '../services/api'

const ChecklistForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    site: '',
    image: null
  })
  const [imagePreview, setImagePreview] = useState('')
  const [sites, setSites] = useState([])
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sitesResponse, violationsResponse] = await Promise.all([
        sitesAPI.getAll(),
        violationsAPI.getAll()
      ])
      
      setSites(sitesResponse.data.data)
      setViolations(violationsResponse.data.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load form data')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('site', formData.site)
      if (formData.image) {
        submitData.append('image', formData.image)
      }
      
      await checklistsAPI.create(submitData)
      
      setSuccess('Inspection checklist created successfully!')
      
      // Reset form
      setFormData({
        name: '',
        site: '',
        image: null
      })
      setImagePreview('')
    } catch (error) {
      console.error('Error creating checklist:', error)
      setError(error.response?.data?.error || 'Failed to create checklist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Inspection Checklist</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Standard Violation Checklist</h3>
        <p className="text-blue-700 text-sm">
          All checklists will use the same standard violations. To modify violations, use the "Manage Violations" tab.
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Checklist Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inspection Checklist Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter inspection checklist name"
            required
            disabled={loading}
          />
        </div>

        {/* Site Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inspection Site
          </label>
          <select
            name="site"
            value={formData.site}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={loading}
          >
            <option value="">Select an inspection site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.sites}>{site.sites}</option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Site Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        {/* Standard Violations Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Standard Violations (Auto-Applied)
          </label>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
            {violations.map((violation, index) => (
              <div key={violation.id} className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-red-400 rounded"></div>
                <span className="text-gray-700">{violation.violations}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            These violations will be automatically added to your inspection checklist. 
            Modify them in the "Manage Violations" tab.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Inspection Checklist'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChecklistForm