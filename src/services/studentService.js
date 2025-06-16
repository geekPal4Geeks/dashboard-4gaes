import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL

export const updateStudentComment = async (
  studentId,
  comment,
  userName,
  notificationData = null
) => {
  console.log(notificationData)
  try {
    const commentWithSignature = `${comment}\n\n- ${userName}`
    const response = await axios.post(`${API_URL}/create-student-comment`, {
      studentId,
      comment: commentWithSignature,
      notificationData,
    })
    return response.data
  } catch (error) {
    console.error('Error al actualizar el comentario:', error)
    throw error
  }
}

export const updateStudentProperty = async (
  studentId,
  propertyNameOrProperties,
  propertyValue
) => {
  try {
    // Si propertyNameOrProperties es un string, es una sola propiedad
    // Si es un array, son múltiples propiedades

    const properties =
      typeof propertyNameOrProperties === 'string'
        ? [{ propertyName: propertyNameOrProperties, propertyValue }]
        : propertyNameOrProperties

    const response = await axios.put(`${API_URL}/update-student-property`, {
      studentId,
      properties,
    })
    return response.data
  } catch (error) {
    console.error(
      `Error al actualizar las propiedades del estudiante ${studentId}:`,
      error
    )
    throw error
  }
}

export const findStudentByEmail = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/search-student-by-email`,
      {
        email: email,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  } catch (error) {
    // Manejo de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error en la respuesta:', error.response.data)
      throw new Error(
        error.response.data.error || 'Error al buscar el estudiante'
      )
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta:', error.request)
      throw new Error('No se pudo conectar con el servidor')
    } else {
      // Algo sucedió al configurar la petición
      console.error('Error:', error.message)
      throw new Error('Error al hacer la petición')
    }
  }
}

export const cancelStudentMentorship = async (
  cancellationDate,
  cancellationNotes,
  cancellationReason,
  mentorName,
  originalMentorshipDate,
  studentId,
  supliedWithOtherStudent,
  mentorshipType
) => {
  try {
    const response = await axios.post(`${API_URL}/cancel-mentorship`, {
      cancellationDate,
      cancellationNotes,
      cancellationReason,
      mentorName,
      originalMentorshipDate,
      studentId,
      supliedWithOtherStudent,
      mentorshipType,
    })
    console.log('Mentorship cancellation registered:', response.data)
    return response.data
  } catch (error) {
    console.error('Error registrando cancelación de mentoría:', error)
    throw error
  }
}
