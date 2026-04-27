import axios from 'axios'

/**
 * Base del backend 4geeks (rutas tipo /notion-page, /cohort-info, …).
 * En Express esas rutas viven bajo /api, por eso VITE suele ser `https://.../api`.
 * Si en prod queda sin sufijo, se añade `/api` para no llamar a host/notion-page (404).
 */
function resolveBackendApiUrl() {
  const raw = import.meta.env.VITE_BACKEND_URL
  if (raw == null || String(raw).trim() === '') return ''
  const base = String(raw).replace(/\/+$/, '')
  if (base === '') return ''
  if (/\/api$/i.test(base)) return base
  return `${base}/api`
}

export const API_URL = resolveBackendApiUrl()

export const getToken = () => localStorage.getItem('token')

export const getAuthHeaders = (extraHeaders = {}) => {
  const token = getToken()
  return {
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...extraHeaders,
  }
}

export const apiClient = axios.create({
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    ...getAuthHeaders(config.headers || {}),
  }
  return config
})
