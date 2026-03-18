import { API_URL, apiClient } from './apiClient'

export const getCurrentMentorNpsData = async (email = null) => {
  try {
    const response = await apiClient.post(`${API_URL}/mentor-nps`, email ? { email } : {})
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al obtener datos NPS del mentor'
    )
  }
}

export const getMentorNpsData = async (mentorId) => {
  try {
    const response = await apiClient.post(`${API_URL}/mentor-nps`, {
      mentorId,
    })
    return response.data
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
    const response = await apiClient.post(`${API_URL}/mentors/preview-by-email`, {
      email,
    })
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al buscar al mentor'
    )
  }
}

export const getNpsComments = async (npsId) => {
  try {
    const response = await apiClient.post(`${API_URL}/nps-comments`, {
      npsId,
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
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al actualizar el estado de la evaluación'
    )
  }
}
