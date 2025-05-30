import axios from 'axios'

// Lista de cohortes que sabemos que no existen en Notion

const API_URL = import.meta.env.VITE_BACKEND_URL

export async function getCohortNotionInfo(cohortId) {
  try {
    const response = await axios.post(`${API_URL}/cohort-info`, {
      cohortId: cohortId,
    })
    return response.data
  } catch (error) {
    console.error('Error al obtener información de la cohorte:', error.message)
    if (error.response) {
      console.error('Detalles del error:', error.response.data)
      throw new Error(`Error del servidor: ${error.response.status}`)
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor')
      throw new Error('No se pudo conectar con el servidor')
    } else {
      console.error('Error en la configuración de la petición:', error.message)
      throw new Error('Error en la configuración de la petición')
    }
  }
}

// Función para obtener información de un estudiante
export const getStudentInfo = async (studentId) => {
  try {
    const response = await axios.post(
      `${API_URL}/student-info`,
      {
        studentId: studentId,
      }
    )
    return response.data
  } catch (error) {
    console.error('Error al obtener información del estudiante:', error.message)
    if (error.response) {
      console.error('Detalles del error:', error.response.data)
      throw new Error(`Error del servidor: ${error.response.status}`)
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor')
      throw new Error('No se pudo conectar con el servidor')
    } else {
      console.error('Error en la configuración de la petición:', error.message)
      throw new Error('Error en la configuración de la petición')
    }
  }
}
