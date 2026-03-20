import axios from 'axios'

export const API_URL = import.meta.env.VITE_BACKEND_URL

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
