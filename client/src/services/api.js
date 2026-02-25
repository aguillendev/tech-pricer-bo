import axios from 'axios';

// Create Axios instance
const api = axios.create({
  // baseURL: 'https://organisational-elsi-aguillen-f837d936.koyeb.app/api',
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
});

export default api;

// ── Profit Rules ──────────────────────────────────────────────────────────────
export const getRules = () => api.get('/admin/rules').then(r => r.data);
export const createRule = (rule) => api.post('/admin/rules', rule).then(r => r.data);
export const updateRule = (id, rule) => api.put(`/admin/rules/${id}`, rule).then(r => r.data);
export const deleteRule = (id) => api.delete(`/admin/rules/${id}`);
