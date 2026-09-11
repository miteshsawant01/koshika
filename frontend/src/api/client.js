import axios from 'axios';

const DEFAULT_PROD_URL = 'https://stembridge-backend.onrender.com/api';
const DEFAULT_LOCAL_URL = 'http://127.0.0.1:8000/api';

/**
 * Normalizes any backend URL string to have no trailing slash and end with /api
 */
export function normalizeApiUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let clean = rawUrl.trim().replace(/\/+$/, '');
  if (!clean) return '';
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }
  return clean;
}

/**
 * Dynamically resolves the API base URL with full environment intelligence
 */
export function getApiBaseUrl() {
  // 1. User manual override stored in localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('koshika_backend_url');
    if (saved && saved.trim()) {
      return normalizeApiUrl(saved);
    }
  }

  // 2. Vite environment variable (from .env.production or Vercel config)
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return normalizeApiUrl(envUrl);
  }

  // 3. Environment-aware detection:
  // If running in browser on a production domain (e.g. *.vercel.app, *.onrender.com, or custom domain):
  // ALWAYS default to the live production Render backend so database is fetched immediately.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
    if (!isLocal) {
      return DEFAULT_PROD_URL;
    }
  }

  // 4. Default for local development
  return DEFAULT_LOCAL_URL;
}

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic request interceptor ensures current baseURL is always used
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();

  const isAiOrOcr = config.url && (config.url.includes('/ai/') || config.url.includes('/ocr/'));
  if (isAiOrOcr) {
    const geminiKey = (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null) || 'AIzaSy-DEMO-KEY-FOR-TESTING-ONLY';
    if (geminiKey) {
      config.headers['X-Gemini-API-Key'] = geminiKey;
    }
  }
  return config;
});

// Response interceptor with Render cold-start auto-retry
api.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('koshika-backend-status', { detail: { status: 'online' } }));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Detect Render cold start: network error or 502/503/504
    const isNetworkOrColdStart =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      [502, 503, 504].includes(error.response?.status);

    if (isNetworkOrColdStart && originalRequest && !originalRequest._retryCount) {
      originalRequest._retryCount = 1;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('koshika-backend-status', {
            detail: { status: 'waking', message: 'Waking up Render backend container...' },
          })
        );
      }
      // Wait 3 seconds and retry once
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return api(originalRequest);
    }

    if (isNetworkOrColdStart && originalRequest?._retryCount === 1) {
      originalRequest._retryCount = 2;
      // Wait another 4 seconds and retry second time
      await new Promise((resolve) => setTimeout(resolve, 4000));
      return api(originalRequest);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('koshika-backend-status', {
          detail: { status: 'offline', error: error.message },
        })
      );
    }
    return Promise.reject(error);
  }
);

/**
 * Diagnostic helper to test any backend URL
 */
export async function testBackendConnection(candidateUrl) {
  const target = normalizeApiUrl(candidateUrl || getApiBaseUrl());
  const client = axios.create({ timeout: 15000 });
  try {
    const res = await client.get(`${target}/health/`);
    return { ok: true, data: res.data, url: target };
  } catch (err) {
    try {
      // Fallback test on stats
      const res = await client.get(`${target}/dashboard/stats/`);
      return { ok: true, data: res.data, url: target };
    } catch (err2) {
      return { ok: false, error: err2.message || err.message, url: target };
    }
  }
}

export default api;
export { API_BASE_URL };
