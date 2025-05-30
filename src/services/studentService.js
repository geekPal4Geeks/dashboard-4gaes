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
