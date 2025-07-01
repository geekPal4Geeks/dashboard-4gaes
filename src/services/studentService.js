import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = import.meta.env.VITE_BACKEND_URL

export const updateStudentComment = async (
  studentId,
  comment,
  userName,
  notificationData = null
) => {
  const token = localStorage.getItem('token');
  try {
    const commentWithSignature = `${comment}\n\n- ${userName}`
    const response = await axios.post(`${API_URL}/create-student-comment`, {
      studentId,
      comment: commentWithSignature,
      notificationData,
    }, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire('Permiso denegado', 'No tienes permisos para comentar sobre este estudiante', 'error');
    } else {
      Swal.fire('Error al actualizar el comentario:', error.message || 'Ocurrió un error inesperado', 'error');
    }
    throw error;
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
    const token = localStorage.getItem('token');
    const properties =
      typeof propertyNameOrProperties === 'string'
        ? [{ propertyName: propertyNameOrProperties, propertyValue }]
        : propertyNameOrProperties

    const response = await axios.put(`${API_URL}/update-student-property`, {
      studentId,
      properties,
    }, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire('Permiso denegado', 'No tienes permisos para actualizar propiedades de este estudiante', 'error');
    } else {
      Swal.fire('Error al actualizar las propiedades del estudiante:', error.message || 'Ocurrió un error inesperado', 'error');
    }
    throw error;
  }
}

export const findStudentByEmail = async (email) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(
      `${API_URL}/search-student-by-email`,
      {
        email: email,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire('Permiso denegado', 'No tienes permisos para buscar estudiantes', 'error');
    } else if (error.response) {
      Swal.fire('Error', error.response.data.error || 'Error al buscar el estudiante', 'error');
    } else if (error.request) {
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    } else {
      Swal.fire('Error', error.message || 'Error al hacer la petición', 'error');
    }
    throw error;
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
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/cancel-mentorship`, {
      cancellationDate,
      cancellationNotes,
      cancellationReason,
      mentorName,
      originalMentorshipDate,
      studentId,
      supliedWithOtherStudent,
      mentorshipType,
    }, {
      headers: {
        'Authorization': `Token ${token}`,
      },
    })

    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire('Permiso denegado', 'No tienes permisos para cancelar mentorías', 'error');
    } else {
      Swal.fire('Error registrando cancelación de mentoría:', error.message || 'Ocurrió un error inesperado', 'error');
    }
    throw error;
  }
}
