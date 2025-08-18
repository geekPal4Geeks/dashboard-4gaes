import axios from 'axios'
import { mockNpsData } from './mockNpsData'

const API_BASE_URL = 'http://localhost:5000'

// Configuración base de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar el token de autorización
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Obtiene los datos NPS de un mentor específico
 * @param {string} mentorId - ID del mentor
 * @returns {Promise<Object>} Datos NPS del mentor
 */
export const getMentorNpsData = async (mentorId) => {
  try {
    const response = await apiClient.post('/api/mentor-nps', {
      mentorId,
    })
    return response.data
  } catch (error) {
    console.error('Error al obtener datos NPS del mentor:', error)
    throw new Error(
      error.response?.data?.message || 'Error al obtener datos NPS del mentor'
    )
  }
}

/**
 * Obtiene los datos NPS del mentor actual usando el token almacenado
 * @param {string} mentorId - ID del mentor (opcional, se puede obtener del token)
 * @returns {Promise<Object>} Datos NPS del mentor
 */
export const getCurrentMentorNpsData = async (mentorId = null) => {
  try {
    // Si no se proporciona mentorId, intentar obtenerlo del token o usar el ID por defecto
    const targetMentorId = mentorId || '31a57e7b-db0f-421f-aea0-bf985e00de58'

    const response = await apiClient.post('/api/mentor-nps', {
      mentorId: targetMentorId,
    })
    return response.data
  } catch (error) {
    console.error('Error al obtener datos NPS del mentor actual:', error)
    console.log('Usando datos de prueba...')
    // Retornar datos de prueba si el backend no está disponible
    return mockNpsData
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
