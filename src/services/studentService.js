import axios from 'axios'
import Swal from 'sweetalert2'
import { API_URL, getAuthHeaders } from './apiClient'
import { invalidateStudentCommentsCache } from './notionService'

export const updateStudentComment = async (
  studentId,
  comment,
  userName,
  notificationData = null,
  attachments = []
) => {
  try {
    const trimmedComment = typeof comment === 'string' ? comment.trim() : ''
    const commentWithSignature = trimmedComment
      ? `${trimmedComment}\n\n- ${userName}`
      : `- ${userName}`
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0
    const payload = hasAttachments
      ? new FormData()
      : {
          studentId,
          comment: commentWithSignature,
          notificationData,
        }

    if (hasAttachments) {
      payload.append('studentId', studentId)
      payload.append('comment', commentWithSignature)
      if (notificationData) {
        payload.append('notificationData', JSON.stringify(notificationData))
      }
      attachments.forEach((file) => payload.append('attachments', file))
    }

    const response = await axios.post(`${API_URL}/create-student-comment`, payload, {
      headers: getAuthHeaders(),
    })
    invalidateStudentCommentsCache(studentId)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire(
        'Permiso denegado',
        'No tienes permisos para comentar sobre este estudiante',
        'error'
      )
    } else {
      Swal.fire(
        'Error al actualizar el comentario:',
        error.message || 'Ocurrió un error inesperado',
        'error'
      )
    }
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

    const response = await axios.put(
      `${API_URL}/update-student-property`,
      {
        studentId,
        properties,
      },
      {
        headers: getAuthHeaders(),
      }
    )
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire(
        'Permiso denegado',
        'No tienes permisos para actualizar propiedades de este estudiante',
        'error'
      )
    } else {
      Swal.fire(
        'Error al actualizar las propiedades del estudiante:',
        error.message || 'Ocurrió un error inesperado',
        'error'
      )
    }
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
        headers: getAuthHeaders({
          'Content-Type': 'application/json',
        }),
      }
    )
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire(
        'Permiso denegado',
        'No tienes permisos para buscar estudiantes',
        'error'
      )
    } else if (error.response) {
      Swal.fire(
        'Error',
        error.response.data.error || 'Error al buscar el estudiante',
        'error'
      )
    } else if (error.request) {
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error')
    } else {
      Swal.fire('Error', error.message || 'Error al hacer la petición', 'error')
    }
    throw error
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
    const parseSpanishDateToISO = (dateStr) => {
      const meses = {
        enero: '01',
        febrero: '02',
        marzo: '03',
        abril: '04',
        mayo: '05',
        junio: '06',
        julio: '07',
        agosto: '08',
        septiembre: '09',
        octubre: '10',
        noviembre: '11',
        diciembre: '12',
      }
      const regex = /(\d{1,2}) de (\w+) de (\d{4}), (\d{2}):(\d{2})/
      const match = dateStr.match(regex)
      if (!match) return dateStr // Si ya es ISO, lo retorna igual
      const [, dia, mes, anio, hora, minuto] = match
      const mesNum = meses[mes.toLowerCase()]
      return `${anio}-${mesNum}-${dia.padStart(
        2,
        '0'
      )}T${hora}:${minuto}:00.000Z`
    }

    // Antes de enviar:
    const cancellationDateISO =
      typeof cancellationDate === 'string' && !cancellationDate.includes('T')
        ? parseSpanishDateToISO(cancellationDate)
        : new Date(cancellationDate).toISOString()

    // Si viene con 'T' (ej. "2025-09-25T14:30"), asumir local y convertir a ISO UTC
    // Si viene en formato legible español, parsearlo con parseSpanishDateToISO
    let originalMentorshipDateISO
    if (typeof originalMentorshipDate === 'string') {
      if (originalMentorshipDate.includes('T')) {
        originalMentorshipDateISO = new Date(
          originalMentorshipDate
        ).toISOString()
      } else {
        originalMentorshipDateISO = parseSpanishDateToISO(
          originalMentorshipDate
        )
      }
    } else {
      originalMentorshipDateISO = new Date(originalMentorshipDate).toISOString()
    }

    // Llama al servicio:
    const response = await axios.post(
      `${API_URL}/cancel-mentorship`,
      {
        cancellationDate: cancellationDateISO,
        cancellationNotes,
        cancellationReason,
        mentorName,
        originalMentorshipDate: originalMentorshipDateISO,
        studentId,
        supliedWithOtherStudent,
        mentorshipType,
      },
      {
        headers: getAuthHeaders(),
      }
    )

    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire(
        'Permiso denegado',
        'No tienes permisos para cancelar mentorías',
        'error'
      )
    } else {
      Swal.fire(
        'Error registrando cancelación de mentoría:',
        error.message || 'Ocurrió un error inesperado',
        'error'
      )
    }
    throw error
  }
}
