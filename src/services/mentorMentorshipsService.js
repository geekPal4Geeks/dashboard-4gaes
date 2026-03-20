import { API_URL, apiClient } from './apiClient'

const CACHE_TTL_MS = 2 * 60 * 1000
const responseCache = new Map()

const getCachedResponse = (key) => {
  const cached = responseCache.get(key)
  if (!cached) return null
  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(key)
    return null
  }
  return cached.data
}

const setCachedResponse = (key, data) => {
  responseCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })
  return data
}

const readStoredImpersonationToken = (email = null) => {
  const normalizedEmail = email?.trim()?.toLowerCase?.() || null

  const directKeys = [
    normalizedEmail ? `impersonation_token:${normalizedEmail}` : null,
    normalizedEmail ? `impersonated_token:${normalizedEmail}` : null,
    normalizedEmail ? `breathcode_impersonation_token:${normalizedEmail}` : null,
    'impersonation_token',
    'impersonated_token',
    'breathcode_impersonation_token',
  ].filter(Boolean)

  for (const key of directKeys) {
    const value = localStorage.getItem(key)
    if (value) return value
  }

  const mapKeys = ['impersonation_tokens', 'breathcode_impersonation_tokens']
  for (const key of mapKeys) {
    const rawValue = localStorage.getItem(key)
    if (!rawValue) continue

    try {
      const parsed = JSON.parse(rawValue)
      if (normalizedEmail && parsed && typeof parsed === 'object') {
        const token = parsed[normalizedEmail]
        if (typeof token === 'string' && token) return token
      }
    } catch {
      continue
    }
  }

  return null
}

export const getCurrentMentorMentorshipsData = async (
  periodType = 'academic',
  {
    signal,
    email = null,
    memberId = null,
    impersonationToken = null,
    summaryOnly = false,
  } = {}
) => {
  try {
    const cacheKey = `current:${periodType}:${email || 'self'}:${summaryOnly ? 'summary' : 'full'}`
    const cachedData = getCachedResponse(cacheKey)
    if (cachedData) return cachedData

    const resolvedImpersonationToken =
      impersonationToken || readStoredImpersonationToken(email)

    const response = await apiClient.get(`${API_URL}/mentor/my-mentorships`, {
      params: {
        periodType,
        ...(summaryOnly ? { summaryOnly: 'true' } : {}),
        ...(email ? { email } : {}),
      },
      headers: resolvedImpersonationToken
        ? { 'X-Impersonation-Token': resolvedImpersonationToken }
        : {},
      signal,
      timeout: 120000,
    })
    return setCachedResponse(cacheKey, response.data)
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al obtener datos de mentorías del mentor'
    )
  }
}

export const getMentorMentorshipsData = async (mentorId) => {
  try {
    const cacheKey = `mentor-id:${mentorId}`
    const cachedData = getCachedResponse(cacheKey)
    if (cachedData) return cachedData

    const response = await apiClient.get(`${API_URL}/mentor/my-mentorships`, {
      params: {
        mentorId,
      },
      timeout: 120000,
    })
    return setCachedResponse(cacheKey, response.data)
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al obtener datos de mentorías del mentor'
    )
  }
}

export const getCurrentMentorMentorshipsSummary = async (
  periodType = 'academic',
  options = {}
) => {
  return getCurrentMentorMentorshipsData(periodType, {
    ...options,
    summaryOnly: true,
  })
}

export const formatDuration = (minutes) => {
  if (!minutes) return '--'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${mins}min`
}

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '--'
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '--'
  }
}

export const getStatusColor = (status) => {
  const colorMap = {
    'A pagar': '#4caf50',
    'No corresponde': '#9e9e9e',
    'No realizada': '#f44336',
    'No realizada a pagar': '#ff9800',
  }
  return colorMap[status] || '#9e9e9e'
}

export const getStatusDescription = (status) => {
  const descriptions = {
    'A pagar': 'Mentoría realizada que está pendiente de pago',
    'No corresponde':
      'Mentoría que no corresponde pagar por alguna razón específica',
    'No realizada': 'Mentoría que no se realizó y no debe pagarse',
    'No realizada a pagar': 'Mentoría que no se realizó pero debe pagarse',
  }
  return descriptions[status] || 'Estado no definido'
}

export const getServiceColor = (service) => {
  const colorMap = {
    'Mock Interview': '#9e9e9e',
    'Mock interview': '#9e9e9e',
    Mentoría: '#2196f3',
  }
  return colorMap[service] || '#9e9e9e'
}

export const requestMentorshipReview = async (reviewData) => {
  try {
    const response = await apiClient.post(
      `${API_URL}/mentor/request-review`,
      reviewData
    )

    responseCache.clear()
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al solicitar revisión de la mentoría'
    )
  }
}
