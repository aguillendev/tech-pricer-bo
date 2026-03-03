import axios from 'axios';

function normalizeBaseUrl(url) {
  if (!url) return 'http://localhost:8080/api';
  if (/^https?:\/\//.test(url)) return url;
  // Sin protocolo: es localhost → http, cualquier otro → https
  return url.startsWith('localhost') ? `http://${url}` : `https://${url}`;
}

const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  timeout: 10000,
});

export default api;

// ── Profit Rules ──────────────────────────────────────────────────────────────
export const getRules = () => api.get('/admin/rules').then(r => r.data);
export const createRule = (rule) => api.post('/admin/rules', rule).then(r => r.data);
export const updateRule = (id, rule) => api.put(`/admin/rules/${id}`, rule).then(r => r.data);
export const deleteRule = (id) => api.delete(`/admin/rules/${id}`);

// ── Products ──────────────────────────────────────────────────────────────────
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const deleteProducts = (ids) => api.delete('/admin/products', { data: ids });
