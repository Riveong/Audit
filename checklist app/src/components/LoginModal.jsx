import { useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    empid: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.empid || !formData.password) {
      setError('Employee ID and password are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login(formData.empid, formData.password)
      
      // Store token and user info
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      onLoginSuccess(response.data.user)
      onClose()
      
      // Reset form
      setFormData({ empid: '', password: '' })
      
    } catch (error) {
      console.error('Login error:', error)
      setError(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8">
        {/* Header */}
        <div className="bg-blue-600 rounded-t-lg p-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">🔐 Login</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                name="empid"
                value={formData.empid}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
                placeholder="Enter your ID"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base text-gray-900"
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.empid || !formData.password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors text-base"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>


        </div>
      </div>
    </div>
  )
}

export default LoginModal