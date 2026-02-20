import axios from 'axios';

// Create Axios instance
const api = axios.create({
  // baseURL: 'https://organisational-elsi-aguillen-f837d936.koyeb.app/api',
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
});

export default api;
