import axios from 'axios'
import Swal from 'sweetalert2'

const API_URL = import.meta.env.VITE_BACKEND_URL

let cohortInfoErrorShown = false;

// Cache simple con expiración
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function getCacheKey(endpoint, params) {
  return `${endpoint}_${JSON.stringify(params)}`;
}

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Axios con timeout personalizado
const axiosWithTimeout = axios.create({
  timeout: 30000, // 15 segundos máximo
});

export async function getNotionPage(pageId, token) {
  const cacheKey = getCacheKey('notion-page', { pageId });
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

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

  const data = await resp.json();
  setCachedData(cacheKey, data);
  return data;
}

// Lista de cohortes que sabemos que no existen en Notion
export async function getCohortNotionInfo(cohortId) {
  const cacheKey = getCacheKey('cohort-info', { cohortId });
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axiosWithTimeout.post(
      `${API_URL}/cohort-info`,
      { cohortId: cohortId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    setCachedData(cacheKey, response.data);
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
  const cacheKey = getCacheKey('student-info', { studentId });
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axiosWithTimeout.post(
      `${API_URL}/student-info`,
      { studentId: studentId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    setCachedData(cacheKey, response.data);
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
  const cacheKey = getCacheKey('cohort-page-by-id', { pageId });
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axiosWithTimeout.post(
      `${API_URL}/cohort-page-by-id`,
      { pageId: pageId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    setCachedData(cacheKey, response.data);
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

// Función para limpiar el cache manualmente si es necesario
export const clearNotionCache = () => {
  cache.clear();
}

// Función para obtener múltiples estudiantes en paralelo con manejo de errores
export const getMultipleStudentsInfo = async (studentIds) => {
  const results = await Promise.allSettled(
    studentIds.map(studentId => getStudentInfo(studentId))
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Error obteniendo info del estudiante ${studentIds[index]}:`, result.reason);
      return null;
    }
  });
}
