import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Sites API
export const sitesAPI = {
  getAll: () => api.get('/sites'),
  create: (sites) => api.post('/sites', { sites }),
  delete: (id) => api.delete(`/sites/${id}`),
}

// Violations API (renamed from criterions)
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
  create: (formData) => {
    return api.post('/checklists', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  update: (id, formData) => {
    return api.put(`/checklists/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  delete: (id) => api.delete(`/checklists/${id}`),
}

// Checklist Progress API (updated to use violation terminology)
export const progressAPI = {
  updateProgress: (checklistId, violationId, is_checked, notes = null) => 
    api.put(`/checklists/${checklistId}/progress/${violationId}`, { is_checked, notes }),
  getProgress: (checklistId) => api.get(`/checklists/${checklistId}/progress`),
  resetProgress: (checklistId) => api.post(`/checklists/${checklistId}/reset`),
}

// Health check
export const healthCheck = () => api.get('/health')

export default api