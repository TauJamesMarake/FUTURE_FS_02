import axios from 'axios';

// Base URL from env (falls back to local proxy)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Restore token on every page load
const token = localStorage.getItem('crm_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor: auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_admin');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Leads ────────────────────────────────────────────────────
export const getLeads = (params) => api.get('/leads', { params });
export const getLead = (id) => api.get(`/leads/${id}`);
export const createLead = (data) => api.post('/leads', data);
export const updateLeadStatus = (id, status) => api.patch(`/leads/${id}/status`, { status });
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const getStats = () => api.get('/leads/analytics/stats');

// ── Notes ────────────────────────────────────────────────────
export const getNotes = (leadId) => api.get(`/leads/${leadId}/notes`);
export const addNote = (leadId, note_text) => api.post(`/leads/${leadId}/notes`, { note_text });

export default api;
