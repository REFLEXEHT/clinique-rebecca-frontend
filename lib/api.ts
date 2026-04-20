import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

// ─── Services ────────────────────────────────────────────────────────────────
export const servicesApi = {
  list: () => api.get('/services'),
  create: (data: any) => api.post('/admin/services', data),
  update: (id: number, data: any) => api.put(`/admin/services/${id}`, data),
  delete: (id: number) => api.delete(`/admin/services/${id}`),
}

// ─── Spécialistes ────────────────────────────────────────────────────────────
export const specialistesApi = {
  list: (categorie?: string) =>
    api.get('/specialistes', { params: categorie ? { categorie } : {} }),
  create: (data: any) => api.post('/admin/specialistes', data),
  update: (id: number, data: any) => api.put(`/admin/specialistes/${id}`, data),
  delete: (id: number) => api.delete(`/admin/specialistes/${id}`),
}

// ─── Horaires ────────────────────────────────────────────────────────────────
export const horairesApi = {
  list: () => api.get('/horaires'),
  update: (jour: string, data: any) => api.put(`/admin/horaires/${jour}`, data),
}

// ─── Rendez-vous ─────────────────────────────────────────────────────────────
export const rdvApi = {
  create: (data: any) => api.post('/rendez-vous', data),
  adminList: (params?: any) => api.get('/admin/rendez-vous', { params }),
  update: (id: number, data: any) => api.put(`/admin/rendez-vous/${id}`, data),
  cancel: (id: number) => api.delete(`/admin/rendez-vous/${id}`),
}

// ─── Comptabilité ────────────────────────────────────────────────────────────
export const comptaApi = {
  list: (params?: any) => api.get('/admin/mouvements', { params }),
  create: (data: any) => api.post('/admin/mouvements', data),
  delete: (id: number) => api.delete(`/admin/mouvements/${id}`),
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export const statsApi = {
  dashboard: () => api.get('/admin/stats/dashboard'),
  rdvParJour: (jours = 7) => api.get('/admin/stats/rdv-par-jour', { params: { jours } }),
  recettesParJour: (jours = 7) => api.get('/admin/stats/recettes-par-jour', { params: { jours } }),
}

// ─── Patients ────────────────────────────────────────────────────────────────
export const patientsApi = {
  list: (search?: string) => api.get('/admin/patients', { params: search ? { search } : {} }),
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────
export const chatApi = {
  send: (message: string, historique: any[] = []) =>
    api.post('/chat', { message, historique }),
}
