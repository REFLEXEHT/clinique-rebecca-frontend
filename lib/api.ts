import axios from 'axios'

// En production sur Vercel, on passe toujours par le proxy Next.js /api/*
// Cela évite les erreurs CORS car les requêtes partent du même domaine
const BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? '' // Utilise le proxy /api/* configuré dans next.config.js
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')

export const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rb_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('rb_token')
      localStorage.removeItem('rb_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  register: (data: any) => api.post('/auth/register', data),
}
export const servicesApi = {
  list: () => api.get('/services'),
  create: (data: any) => api.post('/admin/services', data),
  update: (id: number, data: any) => api.put(`/admin/services/${id}`, data),
  delete: (id: number) => api.delete(`/admin/services/${id}`),
}
export const specialistesApi = {
  list: (categorie?: string) => api.get('/specialistes', { params: categorie && categorie !== 'tous' ? { categorie } : {} }),
  getById: (id: number) => api.get(`/specialistes/${id}`),
  create: (data: any) => api.post('/admin/specialistes', data),
  update: (id: number, data: any) => api.put(`/admin/specialistes/${id}`, data),
  delete: (id: number) => api.delete(`/admin/specialistes/${id}`),
}
export const horairesApi = {
  list: () => api.get('/horaires'),
  update: (jour: string, data: any) => api.put(`/admin/horaires/${jour}`, data),
}
export const rdvApi = {
  create: (data: any) => api.post('/rendez-vous', data),
  adminList: (params?: any) => api.get('/admin/rendez-vous', { params }),
  update: (id: number, data: any) => api.put(`/admin/rendez-vous/${id}`, data),
  cancel: (id: number) => api.delete(`/admin/rendez-vous/${id}`),
  medecinList: () => api.get('/medecin/rendez-vous'),
  patientList: () => api.get('/patient/rendez-vous'),
}
export const actesApi = {
  create: (data: any) => api.post('/medecin/actes', data),
  list: (medecinId?: number) => api.get('/medecin/actes', { params: medecinId ? { medecin_id: medecinId } : {} }),
  adminList: () => api.get('/admin/actes'),
}
export const comptaApi = {
  list: (params?: any) => api.get('/admin/mouvements', { params }),
  create: (data: any) => api.post('/admin/mouvements', data),
  delete: (id: number) => api.delete(`/admin/mouvements/${id}`),
}
export const tarifsApi = {
  list: () => api.get('/admin/tarifs'),
  update: (id: number, prix: number) => api.put(`/admin/tarifs/${id}`, { prix_htg: prix }),
  create: (data: any) => api.post('/admin/tarifs', data),
  delete: (id: number) => api.delete(`/admin/tarifs/${id}`),
}
export const stocksApi = {
  list: () => api.get('/pharmacie/stocks'),
  update: (id: number, quantite: number) => api.put(`/admin/stocks/${id}`, { quantite }),
  create: (data: any) => api.post('/admin/stocks', data),
  delete: (id: number) => api.delete(`/admin/stocks/${id}`),
}
export const patientsApi = {
  list: (params?: any) => api.get('/admin/patients', { params }),
  getById: (id: number) => api.get(`/admin/patients/${id}`),
  create: (data: any) => api.post('/admin/patients', data),
  update: (id: number, data: any) => api.put(`/admin/patients/${id}`, data),
}
export const depensesApi = {
  list: (params?: any) => api.get('/admin/depenses', { params }),
  create: (data: any) => api.post('/admin/depenses', data),
  delete: (id: number) => api.delete(`/admin/depenses/${id}`),
}
export const usersApi = {
  list: () => api.get('/admin/users'),
  update: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  delete: (id: number) => api.delete(`/admin/users/${id}`),
  activate: (id: number) => api.put(`/admin/users/${id}/activate`),
}
export const chatApi = {
  send: (message: string, history: any[]) => api.post('/chat', { message, history }),
}
export const laboApi = {
  list: () => api.get('/labo/analyses'),
  create: (data: any) => api.post('/labo/analyses', data),
  update: (id: number, data: any) => api.put(`/labo/analyses/${id}`, data),
}
export const caissierApi = {
  listRdv: (params?: any) => api.get('/caissier/rendez-vous', { params }),
  encaisser: (rdvId: number, data: any) => api.post(`/caissier/encaissement/${rdvId}`, data),
}
