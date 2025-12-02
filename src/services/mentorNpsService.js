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
 * Obtiene los datos NPS del mentor actual usando solo el token (el backend resuelve el mentor)
 * @returns {Promise<Object>} Datos NPS del mentor
 */
export const getCurrentMentorNpsData = async () => {
  try {
    const response = await apiClient.post(`${API_URL}/mentor-nps`, {})
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || 'Error al obtener datos NPS del mentor'
    )
  }
}

/**
 * Obtiene los datos NPS de un mentor específico
 * @param {string} mentorId - ID del mentor
 * @returns {Promise<Object>} Datos NPS del mentor
 */
export const getMentorNpsData = async (mentorId) => {
  try {
    const response = await apiClient.post(`${API_URL}/mentor-nps`, {
      mentorId,
    })
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || 'Error al obtener datos NPS del mentor'
    )
  }
}

/**
 * Función de utilidad para formatear fechas de evaluación
 * @param {string} dateString - Fecha en formato NPS ID
 * @returns {string} Fecha formateada
 */
export const formatEvaluationDate = (dateString) => {
  if (!dateString) return 'N/A'

  // Si es un string que contiene caracteres de fecha (como "-" o "T"), tratar como fecha ISO
  if (
    typeof dateString === 'string' &&
    (dateString.includes('-') || dateString.includes('T'))
  ) {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  // Si es un número, intentar como timestamp
  const numValue = parseInt(dateString)
  if (!isNaN(numValue)) {
    // Si el valor es muy pequeño (menos de 10000), probablemente es un ID de NPS
    if (numValue < 10000) {
      // Para datos de prueba, generar una fecha simulada basada en el ID
      const baseDate = new Date('2024-01-01')
      const daysToAdd = numValue % 365 // Usar el ID para generar días diferentes
      baseDate.setDate(baseDate.getDate() + daysToAdd)
      return baseDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    // Intentar diferentes formatos de timestamp
    let date

    // Primero intentar como timestamp en milisegundos
    date = new Date(numValue)
    if (date.getFullYear() > 1970) {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    // Si no funciona, intentar como timestamp en segundos
    date = new Date(numValue * 1000)
    if (date.getFullYear() > 1970) {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }
  }

  // Si nada funciona, mostrar el valor original
  return `ID: ${dateString}`
}

/**
 * Función de utilidad para obtener el color según el score
 * @param {number} score - Score de 0-10
 * @returns {string} Color CSS
 */
export const getScoreColor = (score) => {
  if (score >= 9) return '#4caf50' // Verde - Excelente
  if (score >= 7) return '#ff9800' // Naranja - Bueno
  return '#f44336' // Rojo - Mejorable
}

/**
 * Función de utilidad para obtener el texto del estado de cohorte
 * @param {string} status - Estado de la cohorte
 * @returns {string} Texto legible del estado
 */
export const getCohortStatusText = (status) => {
  const statusMap = {
    Active: 'Activa',
    'Final Project': 'Proyecto Final',
    Finished: 'Finalizada',
  }
  return statusMap[status] || status
}

/**
 * Función de utilidad para obtener el color del estado de cohorte
 * @param {string} status - Estado de la cohorte
 * @returns {string} Color CSS
 */
export const getCohortStatusColor = (status) => {
  const colorMap = {
    Active: '#4caf50',
    'Final Project': '#ff9800',
    Finished: '#9e9e9e',
  }
  return colorMap[status] || '#9e9e9e'
}

/**
 * Actualiza el estado "visto" de una evaluación NPS
 * @param {string} evaluationId - ID de la evaluación
 * @param {boolean} seen - Estado de visto (true/false)
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const updateNpsEvaluationSeen = async (evaluationId, seen) => {
  try {
    const response = await apiClient.put(
      `${API_URL}/mentor-nps/evaluation-seen`,
      {
        evaluationId,
        seen,
      }
    )
    return response.data
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || 'Error al actualizar el estado de la evaluación'
    )
  }
}
