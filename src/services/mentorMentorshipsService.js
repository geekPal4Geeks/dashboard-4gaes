import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL

// Configuración base de axios SIN baseURL
const apiClient = axios.create({
  timeout: 30000, // 30 segundos máximo
})

// Interceptor para agregar el token de autorización
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    // El backend espera formato "Token <token>" (consistente con otros servicios)
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

/**
 * Obtiene los datos de mentorías del mentor actual usando solo el token (el backend resuelve el mentor)
 * @param {string} periodType - Tipo de periodo: 'academic' | 'monthly' (por defecto: 'academic')
 * @returns {Promise<Object>} Datos de mentorías del mentor
 */
export const getCurrentMentorMentorshipsData = async (
  periodType = 'academic'
) => {
  try {
    const response = await apiClient.get(`${API_URL}/mentor/my-mentorships`, {
      params: {
        periodType,
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

/**
 * Obtiene los datos de mentorías de un mentor específico
 * @param {string} mentorId - ID del mentor
 * @returns {Promise<Object>} Datos de mentorías del mentor
 */
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

/**
 * Obtiene las mentorías canceladas del mentor actual usando solo el token
 * @param {string} periodType - Tipo de periodo: 'academic' | 'monthly' (por defecto: 'academic')
 * @returns {Promise<Object>} Datos de mentorías canceladas del mentor
 */
export const getCurrentMentorCancelledMentorshipsData = async (
  periodType = 'academic'
) => {
  try {
    const token = localStorage.getItem('token')

    // El endpoint de canceladas requiere Bearer según la documentación
    const response = await axios.get(
      `${API_URL}/mentor/cancelled-mentorships`,
      {
        params: {
          periodType,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      }
    )

    // Si la respuesta es exitosa pero no hay datos, retornar estructura vacía
    if (!response.data) {
      return { mentorName: null, cancelledMentorships: [] }
    }

    return response.data
  } catch (error) {
    // Si es un error 404 o similar, retornar estructura vacía en lugar de lanzar error
    if (error.response?.status === 404 || error.response?.status === 500) {
      return { mentorName: null, cancelledMentorships: [] }
    }

    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Error al obtener mentorías canceladas del mentor'
    )
  }
}

/**
 * Función de utilidad para formatear duración en minutos a formato legible
 * @param {number} minutes - Duración en minutos
 * @returns {string} Duración formateada (ej: "1h 30min")
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '--'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}min`
  }
}

/**
 * Función de utilidad para formatear fecha y hora
 * @param {string} dateTimeString - Fecha y hora en formato ISO
 * @returns {string} Fecha y hora formateada
 */
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
  } catch (error) {
    return '--'
  }
}

/**
 * Función de utilidad para obtener el color según el estado
 * @param {string} status - Estado de la mentoría
 * @returns {string} Color CSS
 */
export const getStatusColor = (status) => {
  const colorMap = {
    'A pagar': '#4caf50', // Verde
    'No corresponde': '#9e9e9e', // Gris
    'No realizada': '#f44336', // Rojo
    'No realizada a pagar': '#ff9800', // Naranja
  }
  return colorMap[status] || '#9e9e9e'
}

/**
 * Función de utilidad para obtener la descripción del estado
 * @param {string} status - Estado de la mentoría
 * @returns {string} Descripción del estado
 */
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

/**
 * Función de utilidad para obtener el color según el tipo de servicio
 * @param {string} service - Tipo de servicio ("Mock Interview" o "Mentoría")
 * @returns {string} Color CSS
 */
export const getServiceColor = (service) => {
  const colorMap = {
    'Mock Interview': '#9e9e9e', // Gris (igual que Mock interview)
    'Mock interview': '#9e9e9e', // Gris
    Mentoría: '#2196f3', // Azul
  }
  return colorMap[service] || '#9e9e9e'
}

/**
 * Solicita revisión de una mentoría
 * @param {Object} reviewData - Datos de la mentoría para solicitar revisión
 * @param {string} reviewData.cancellationId - ID de Notion de la cancelación (opcional, para mentorías canceladas)
 * @param {string} reviewData.mentorshipId - ID de la mentorship (requerido)
 * @param {string} reviewData.student - Nombre completo del estudiante (requerido)
 * @param {string} reviewData.studentId - ID de Notion del estudiante (opcional)
 * @param {string} reviewData.service - Tipo de servicio: 'Mock interview' | 'Mentoría' (requerido)
 * @param {string} reviewData.startTime - Fecha y hora de inicio en formato ISO (requerido)
 * @param {string} reviewData.endTime - Fecha y hora de finalización en formato ISO (opcional)
 * @param {number} reviewData.duration - Duración en minutos (opcional)
 * @param {string} reviewData.status - Estado de la mentorship (opcional)
 * @returns {Promise<Object>} Resultado de la solicitud de revisión
 */
export const requestMentorshipReview = async (reviewData) => {
  try {
    const token = localStorage.getItem('token')

    const response = await axios.post(
      `${API_URL}/mentor/request-review`,
      reviewData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
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
