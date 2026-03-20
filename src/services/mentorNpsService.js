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

export const getCurrentMentorNpsData = async (email = null) => {
  try {
    const cacheKey = `current:${email || 'self'}`
    const cachedData = getCachedResponse(cacheKey)
    if (cachedData) return cachedData

    const response = await apiClient.post(
      `${API_URL}/mentor-nps`,
      email ? { email } : {},
      { timeout: 120000 }
    )
    return setCachedResponse(cacheKey, response.data)
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al obtener datos NPS del mentor'
    )
  }
}

export const getCurrentMentorNpsSummary = async (email = null) => {
  try {
    const cacheKey = `summary:${email || 'self'}`
    const cachedData = getCachedResponse(cacheKey)
    if (cachedData) return cachedData

    const response = await apiClient.post(
      `${API_URL}/mentor-nps`,
      {
        ...(email ? { email } : {}),
        summaryOnly: true,
      },
      { timeout: 120000 }
    )
    return setCachedResponse(cacheKey, response.data)
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al obtener resumen NPS del mentor'
    )
  }
}

export const getMentorNpsData = async (mentorId) => {
  try {
    const cacheKey = `mentor-id:${mentorId}`
    const cachedData = getCachedResponse(cacheKey)
    if (cachedData) return cachedData

    const response = await apiClient.post(
      `${API_URL}/mentor-nps`,
      {
        mentorId,
      },
      { timeout: 120000 }
    )
    return setCachedResponse(cacheKey, response.data)
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al obtener datos NPS del mentor'
    )
  }
}

export const getMentorPreviewByEmail = async (email) => {
  try {
    const cacheKey = `preview:${email}`
    const cachedData = getCachedResponse(cacheKey)
    if (cachedData) return cachedData

    const response = await apiClient.post(
      `${API_URL}/mentors/preview-by-email`,
      {
        email,
      },
      { timeout: 120000 }
    )
    return setCachedResponse(cacheKey, response.data)
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al buscar al mentor'
    )
  }
}

export const getNpsComments = async (npsId, email = null) => {
  try {
    const response = await apiClient.post(`${API_URL}/nps-comments`, {
      npsId,
      ...(email ? { email } : {}),
    })
    return response.data?.comments || response.data || []
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al obtener comentarios NPS'
    )
  }
}

export const formatEvaluationDate = (dateString) => {
  if (!dateString) return 'N/A'

  if (
    typeof dateString === 'string' &&
    (dateString.includes('-') || dateString.includes('T'))
  ) {
    const date = new Date(dateString)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const numValue = parseInt(dateString, 10)
  if (!Number.isNaN(numValue)) {
    if (numValue < 10000) {
      const baseDate = new Date('2024-01-01')
      const daysToAdd = numValue % 365
      baseDate.setDate(baseDate.getDate() + daysToAdd)
      return baseDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    let date = new Date(numValue)
    if (date.getFullYear() > 1970) {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    date = new Date(numValue * 1000)
    if (date.getFullYear() > 1970) {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  return `ID: ${dateString}`
}

export const getScoreColor = (score) => {
  if (score >= 9) return '#4caf50'
  if (score >= 7) return '#ff9800'
  return '#f44336'
}

export const getCohortStatusText = (status) => {
  const statusMap = {
    Active: 'Activa',
    'Final Project': 'Proyecto Final',
    Finished: 'Finalizada',
  }
  return statusMap[status] || status
}

export const getCohortStatusColor = (status) => {
  const colorMap = {
    Active: '#4caf50',
    'Final Project': '#ff9800',
    Finished: '#9e9e9e',
  }
  return colorMap[status] || '#9e9e9e'
}

export const updateNpsEvaluationSeen = async (evaluationId, seen) => {
  try {
    const response = await apiClient.put(`${API_URL}/mentor-nps/evaluation-seen`, {
      evaluationId,
      seen,
    })
    responseCache.clear()
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al actualizar el estado de la evaluación'
    )
  }
}
