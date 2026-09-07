import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const isAiOrOcr = config.url && (config.url.includes('/ai/') || config.url.includes('/ocr/'));
  if (isAiOrOcr) {
    const geminiKey = localStorage.getItem('gemini_api_key') || 'AIzaSy-DEMO-KEY-FOR-TESTING-ONLY';
    if (geminiKey) {
      config.headers['X-Gemini-API-Key'] = geminiKey;
    }
  }
  return config;
});

export default api;
export { API_BASE_URL };
