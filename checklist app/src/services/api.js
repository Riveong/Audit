import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (empid, password) => api.post('/auth/login', { empid, password }),
  register: (empid, password) => api.post('/auth/register', { empid, password }),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
}

// Sites API
export const sitesAPI = {
  getAll: () => api.get('/sites'),
  create: (sites) => api.post('/sites', { sites }),
  delete: (id) => api.delete(`/sites/${id}`),
}

// Violations API
export const violationsAPI = {
  getAll: () => api.get('/violations'),
  create: (violations) => api.post('/violations', { violations }),
  delete: (id) => api.delete(`/violations/${id}`),
  updateOrder: (violations) => api.put('/violations/order', { violations }),
}

// Checklists API
export const checklistsAPI = {
  getAll: () => api.get('/checklists'),
  getById: (id) => api.get(`/checklists/${id}`),
  create: (formData) => api.post('/checklists', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, formData) => api.put(`/checklists/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`/checklists/${id}`),
  markAsCompleted: (id) => api.put(`/checklists/${id}/complete`)
}

// Progress API
export const progressAPI = {
  updateProgress: (checklistId, violationId, isChecked, notes = null) => 
    api.put(`/checklists/${checklistId}/progress/${violationId}`, { 
      is_checked: isChecked, 
      notes 
    }),
  getProgress: (checklistId) => api.get(`/checklists/${checklistId}/progress`),
  resetProgress: (checklistId) => api.post(`/checklists/${checklistId}/reset`),
}

// Health check
export const healthCheck = () => api.get('/health')

export default api