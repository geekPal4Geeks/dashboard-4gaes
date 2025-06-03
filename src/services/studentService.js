import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL

export const updateStudentComment = async (studentId, comment, userName) => {
  try {
    const commentWithSignature = `${comment}\n\n- ${userName}`
    const response = await axios.post(`${API_URL}/create-student-comment`, {
      studentId,
      comment: commentWithSignature,
    })
    console.log('Student id', studentId, 'Comment:', commentWithSignature)
    return response.data
  } catch (error) {
    console.error('Error al actualizar el comentario:', error)
    throw error
  }
}

export const updateStudentProperty = async (
  studentId,
  propertyName,
  propertyValue
) => {
  try {
    const response = await axios.put(`${API_URL}/update-student-property`, {
      studentId,
      propertyName,
      propertyValue,
    })
    return response.data
  } catch (error) {
    console.error(
      `Error al actualizar la propiedad ${propertyName} del estudiante ${studentId}:`,
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
  supliedWithOtherStudent
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
    })
    console.log('Mentorship cancellation registered:', response.data)
    return response.data
  } catch (error) {
    console.error('Error registrando cancelación de mentoría:', error)
    throw error
  }
}
