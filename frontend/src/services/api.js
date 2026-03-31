import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Restore token on every page load
const token = localStorage.getItem('crm_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Auto logout on 401
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

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// Leads
export const getLeads         = (params) => api.get('/leads', { params });
export const getLead          = (id)     => api.get(`/leads/${id}`);
export const createLead       = (data)   => api.post('/leads', data);
export const updateLead       = (id, data) => api.patch(`/leads/${id}`, data);
export const updateLeadStatus = (id, status) => api.patch(`/leads/${id}/status`, { status });
export const deleteLead       = (id)     => api.delete(`/leads/${id}`);
export const restoreLead      = (id)     => api.patch(`/leads/${id}/restore`);
export const permanentDeleteLead = (id)  => api.delete(`/leads/${id}/permanent`);

// Stats
export const getStats = () => api.get('/leads/analytics/stats');

// Notes
export const getNotes   = (leadId)             => api.get(`/leads/${leadId}/notes`);
export const addNote    = (leadId, note_text)  => api.post(`/leads/${leadId}/notes`, { note_text });
export const deleteNote = (leadId, noteId)     => api.delete(`/leads/${leadId}/notes/${noteId}`);

// Export
/**
 * exportLeads- triggers a file download directly in the browser.
 *
 * For CSV  : axios fetches the blob, creates a temporary <a> and clicks it.
 * For PDF  : the backend returns a print-ready HTML page; we open it in a new
 *            tab so the browser's native Print → Save as PDF dialog fires.
 *
 * @param {'csv'|'pdf'} format
 */
export const exportLeads = async (format = 'csv') => {
  if (format === 'pdf') {
    const base = import.meta.env.VITE_API_URL || '/api';
    const authToken = localStorage.getItem('crm_token');
    const res = await api.get('/leads/export', {
      params: { format: 'pdf' },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/html' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return;
  }

  // CSv
  const res = await api.get('/leads/export', {
    params: { format: 'csv' },
    responseType: 'blob',
  });

  const url      = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  const link     = document.createElement('a');
  link.href      = url;
  link.download  = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default api;