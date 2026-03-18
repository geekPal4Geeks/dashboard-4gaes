import { API_URL, apiClient } from './apiClient'

export const getCurrentMentorMentorshipsData = async (
  periodType = 'academic',
  { signal } = {}
) => {
  try {
    const response = await apiClient.get(`${API_URL}/mentor/my-mentorships`, {
      params: {
        periodType,
      },
      signal,
    })
    return response.data
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
    const response = await apiClient.get(`${API_URL}/mentor/my-mentorships`, {
      params: {
        mentorId,
      },
    })
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al obtener datos de mentorías del mentor'
    )
  }
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

    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al solicitar revisión de la mentoría'
    )
  }
}
