import axios from 'axios';

// Always use the Vite dev proxy (/api → http://localhost:5000/api).
// If deploying, set VITE_API_URL=https://your-backend.com/api in client/.env
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Timeout after 10 s so you get a real error, not a silent hang
  timeout: 10_000,
});

// Restore JWT on page load
const token = localStorage.getItem('crm_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Auto-logout on 401; surface every other error clearly
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_admin');
      window.location.href = '/login';
    }
    // Re-attach a human-readable message so UI can show it
    const msg =
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Request timed out — is the server running?' :
       err.message === 'Network Error' ? 'Cannot reach server — check that the backend is running on port 5000.' :
       err.message);
    err.displayMessage = msg;
    return Promise.reject(err);
  }
);

// ── Leads ─────────────────────────────────────────────────────
export const getLeads         = (params)        => api.get('/leads', { params });
export const getLead          = (id)            => api.get(`/leads/${id}`);
export const createLead       = (data)          => api.post('/leads', data);
export const updateLeadStatus = (id, status)    => api.patch(`/leads/${id}/status`, { status });
export const deleteLead       = (id)            => api.delete(`/leads/${id}`);
export const getStats         = ()              => api.get('/leads/analytics/stats');

// ── Notes ─────────────────────────────────────────────────────
export const getNotes = (leadId)             => api.get(`/leads/${leadId}/notes`);
export const addNote  = (leadId, note_text)  => api.post(`/leads/${leadId}/notes`, { note_text });

export default api;
