import axios from 'axios'

const BASE = 'https://clinique-rebecca-api.onrender.com'

export const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
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
  vente: (data: any) => api.post('/pharmacie/ventes', data),
}
export const laboApi = {
  list: () => api.get('/labo/resultats'),
  create: (data: any) => api.post('/labo/resultats', data),
  update: (id: number, data: any) => api.put(`/labo/resultats/${id}`, data),
  patientResultats: (patientId: string) => api.get(`/patient/resultats/${patientId}`),
}
export const statsApi = {
  dashboard: () => api.get('/admin/stats/dashboard'),
  rdvParJour: (jours = 7) => api.get('/admin/stats/rdv-par-jour', { params: { jours } }),
  recettesParJour: (jours = 7) => api.get('/admin/stats/recettes-par-jour', { params: { jours } }),
}
export const patientsApi = {
  list: (search?: string) => api.get('/admin/patients', { params: search ? { search } : {} }),
  getById: (id: string) => api.get(`/admin/patients/${id}`),
}
export const chatApi = {
  send: (message: string, historique: any[] = []) => api.post('/chat', { message, historique }),
}
