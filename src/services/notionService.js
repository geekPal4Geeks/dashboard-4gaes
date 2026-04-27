import axios from 'axios'
import Swal from 'sweetalert2'
import { API_URL, getAuthHeaders } from './apiClient'

let cohortInfoErrorShown = false

// Cache simple con expiración
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

function getCacheKey(endpoint, params) {
  return `${endpoint}_${JSON.stringify(params)}`
}

function getCachedData(key) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCachedData(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

function deleteCachedData(key) {
  cache.delete(key)
}

/** True si el recordMap sirve para react-notion-x. */
function hasNotionBlocks(recordMap) {
  return (
    recordMap?.block &&
    typeof recordMap.block === 'object' &&
    Object.keys(recordMap.block).length > 0
  )
}

function pickErrorMessage(body, status) {
  if (body == null) return `Error al obtener la página de Notion (HTTP ${status})`
  if (typeof body === 'string' && body.trim()) return `${body.trim()} (HTTP ${status})`
  if (typeof body !== 'object' || Array.isArray(body)) {
    return `Error al obtener la página de Notion (HTTP ${status})`
  }
  const d = body.detail
  if (typeof d === 'string' && d.trim()) return `${d.trim()} (HTTP ${status})`
  if (Array.isArray(d) && d[0] && typeof d[0] === 'string') {
    return `${d[0]} (HTTP ${status})`
  }
  const msg = body.message || body.error
  if (typeof msg === 'string' && msg.trim()) return `${msg.trim()} (HTTP ${status})`
  return `Error al obtener la página de Notion (HTTP ${status})`
}

/**
 * Unwraps common API shapes for react-notion-x (ExtendedRecordMap con `block`).
 */
export function parseNotionPageResponse(data) {
  if (data == null || typeof data !== 'object' || Array.isArray(data)) {
    return { recordMap: null, publicUrl: null, raw: data }
  }

  const pickUrl = (obj) => {
    if (!obj || typeof obj !== 'object') return null
    const keys = [
      'publicUrl',
      'notionUrl',
      'notion_page_url',
      'pageUrl',
      'url',
      'fallbackUrl',
      'embedUrl',
    ]
    for (const k of keys) {
      const v = obj[k]
      if (typeof v === 'string' && v.trim() !== '' && /^https?:\/\//i.test(v)) {
        return v.trim()
      }
    }
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
      for (const k of keys) {
        const v = obj.data[k]
        if (typeof v === 'string' && v.trim() !== '' && /^https?:\/\//i.test(v)) {
          return v.trim()
        }
      }
    }
    return null
  }

  const publicUrl = pickUrl(data)

  const withBlock = (rm) =>
    rm && typeof rm === 'object' && !Array.isArray(rm) && rm.block && typeof rm.block === 'object'

  const tryPaths = [
    data.recordMap,
    data.record_map,
    data.data?.recordMap,
    data.data?.record_map,
    data.result?.recordMap,
    data.result?.record_map,
    data.payload?.recordMap,
    data.payload?.record_map,
    data.body?.recordMap,
    data.body?.record_map,
  ]

  for (const candidate of tryPaths) {
    if (withBlock(candidate)) {
      return { recordMap: candidate, publicUrl, raw: data }
    }
  }

  if (withBlock(data)) {
    return { recordMap: data, publicUrl, raw: data }
  }

  if (data.data && withBlock(data.data)) {
    return { recordMap: data.data, publicUrl, raw: data }
  }

  if (data.result && withBlock(data.result)) {
    return { recordMap: data.result, publicUrl, raw: data }
  }

  return { recordMap: null, publicUrl, raw: data }
}

export async function getNotionPage(pageId, token) {
  if (!API_URL) {
    throw new Error(
      'Falta VITE_BACKEND_URL. Debe ser la base del API (p. ej. https://tudominio.com/api).'
    )
  }
  const cacheKey = getCacheKey('notion-page', { pageId })
  const cachedData = getCachedData(cacheKey)
  if (cachedData && hasNotionBlocks(cachedData.recordMap)) {
    return cachedData
  }
  if (cachedData) {
    deleteCachedData(cacheKey)
  }

  const resp = await fetch(`${API_URL}/notion-page`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(token ? { Authorization: `Token ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pageId }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    let body = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = text || null
    }
    throw new Error(pickErrorMessage(body, resp.status))
  }

  const raw = await resp.json()
  const parsed = parseNotionPageResponse(raw)
  if (import.meta.env.DEV && !hasNotionBlocks(parsed.recordMap)) {
    const keys = raw && typeof raw === 'object' && !Array.isArray(raw) ? Object.keys(raw) : []
    console.warn(
      '[getNotionPage] Sin recordMap con blocks; revisa la forma del JSON del backend. Claves:',
      keys
    )
  }
  if (hasNotionBlocks(parsed.recordMap)) {
    setCachedData(cacheKey, parsed)
  }
  return parsed
}

// Axios con timeout personalizado
const axiosWithTimeout = axios.create({
  timeout: 30000, // 15 segundos máximo
})

// Lista de cohortes que sabemos que no existen en Notion
export async function getCohortNotionInfo(cohortId) {
  const cacheKey = getCacheKey('cohort-info', { cohortId })
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    const response = await axiosWithTimeout.post(
      `${API_URL}/cohort-info`,
      { cohortId: cohortId },
      {
        headers: getAuthHeaders(),
      }
    )

    setCachedData(cacheKey, response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      if (!cohortInfoErrorShown) {
        cohortInfoErrorShown = true
        Swal.fire(
          'Permiso denegado',
          'No tienes permisos para ver esta cohorte',
          'error'
        ).then(() => {
          setTimeout(() => {
            cohortInfoErrorShown = false
          }, 5000)
        })
      }
    } else {
      if (!cohortInfoErrorShown) {
        cohortInfoErrorShown = true
        Swal.fire('Ha ocurrido un error', error.message, 'error').then(() => {
          setTimeout(() => {
            cohortInfoErrorShown = false
          }, 5000)
        })
      }
    }
    throw error
  }
}

// Función para obtener información de un estudiante
export const getStudentInfo = async (studentId) => {
  const cacheKey = getCacheKey('student-info', { studentId })
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    const response = await axiosWithTimeout.post(
      `${API_URL}/student-info`,
      { studentId: studentId },
      {
        headers: getAuthHeaders(),
      }
    )

    setCachedData(cacheKey, response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire(
        'Permiso denegado',
        'No tienes permisos para ver este estudiante',
        'error'
      )
    } else {
      Swal.fire(
        'Error',
        error.message || 'Ocurrió un error inesperado',
        'error'
      )
    }
    throw error
  }
}

// Nueva función para obtener los comentarios de un estudiante
export const getStudentComments = async (studentId) => {
  const cacheKey = getCacheKey('student-comments', { studentId })
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    const response = await axiosWithTimeout.post(
      `${API_URL}/student-comments`,
      { studentId: studentId },
      {
        headers: getAuthHeaders(),
      }
    )

    setCachedData(cacheKey, response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire(
        'Permiso denegado',
        'No tienes permisos para ver los comentarios de este estudiante',
        'error'
      )
    } else {
      Swal.fire(
        'Error',
        error.message || 'Ocurrió un error al obtener los comentarios',
        'error'
      )
    }
    throw error
  }
}

export const invalidateStudentCommentsCache = (studentId) => {
  const cacheKey = getCacheKey('student-comments', { studentId })
  deleteCachedData(cacheKey)
}

// Nueva función para obtener información de un usuario de Notion por ID
export const getNotionUser = async (userId) => {
  const cacheKey = getCacheKey('notion-user', { userId })
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    const response = await axiosWithTimeout.post(
      `${API_URL}/notion-user`,
      { userId },
      {
        headers: getAuthHeaders(),
      }
    )

    setCachedData(cacheKey, response.data)
    return response.data
  } catch (error) {
    // No mostramos alerta para no ser intrusivos si falla un solo usuario
    console.error(`Error obteniendo al usuario ${userId}:`, error)
    // Devolvemos null para no romper el flujo
    return null
  }
}

// Nueva función para obtener información de la página de la cohorte por ID
export async function getCohortPageById(pageId) {
  const cacheKey = getCacheKey('cohort-page-by-id', { pageId })
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    return cachedData
  }

  try {
    const response = await axiosWithTimeout.post(
      `${API_URL}/cohort-page-by-id`,
      { pageId: pageId },
      {
        headers: getAuthHeaders(),
      }
    )

    setCachedData(cacheKey, response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire(
        'Permiso denegado',
        'No tienes permisos para ver esta página de cohorte',
        'error'
      )
    } else {
      Swal.fire(
        'Error',
        error.message || 'Ocurrió un error inesperado',
        'error'
      )
    }
    throw error
  }
}

// Función para limpiar el cache manualmente si es necesario
export const clearNotionCache = () => {
  cache.clear()
}

// Función para obtener múltiples estudiantes en paralelo con manejo de errores
export const getMultipleStudentsInfo = async (studentIds) => {
  const results = await Promise.allSettled(
    studentIds.map((studentId) => getStudentInfo(studentId))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      console.error(
        `Error obteniendo info del estudiante ${studentIds[index]}:`,
        result.reason
      )
      return null
    }
  })
}
