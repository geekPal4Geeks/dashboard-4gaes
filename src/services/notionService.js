import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = import.meta.env.VITE_BACKEND_URL

let cohortInfoErrorShown = false;

export async function getNotionPage(pageId, token) {
  const resp = await fetch(`${API_URL}/notion-page`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pageId }),
  })

  if (!resp.ok) {
    const errorData = await resp.json()
    throw new Error(errorData.detail || 'Failed to fetch Notion page')
  }

  return await resp.json()
}
// Lista de cohortes que sabemos que no existen en Notion
export async function getCohortNotionInfo(cohortId) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/cohort-info`,
      { cohortId: cohortId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      if (!cohortInfoErrorShown) {
        cohortInfoErrorShown = true;
        Swal.fire('Permiso denegado', 'No tienes permisos para ver esta cohorte', 'error')
          .then(() => {
            setTimeout(() => {
              cohortInfoErrorShown = false;
            }, 5000);
          });
      }
    } else {
      if (!cohortInfoErrorShown) {
        cohortInfoErrorShown = true;
        Swal.fire('Ha ocurrido un error', error.message,  'error')
          .then(() => {
            setTimeout(() => {
              cohortInfoErrorShown = false;
            }, 5000);
          });
      }
    }
    throw error;
  }
}

// Función para obtener información de un estudiante
export const getStudentInfo = async (studentId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/student-info`,
      { studentId: studentId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire('Permiso denegado', 'No tienes permisos para ver este estudiante', 'error');
    } else {
      Swal.fire('Error', error.message || 'Ocurrió un error inesperado', 'error');
    }
    throw error;
  }
}

// Nueva función para obtener información de la página de la cohorte por ID
export async function getCohortPageById(pageId) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/cohort-page-by-id`,
      { pageId: pageId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire('Permiso denegado', 'No tienes permisos para ver esta página de cohorte', 'error');
    } else {
      Swal.fire('Error', error.message || 'Ocurrió un error inesperado', 'error');
    }
    throw error;
  }
}
