/**
 * `sourceUrl` es la guía pública en Notion (también fuente del pageId vía 32-hex al final de la ruta).
 */
export const NOTION_SITE_BASE = 'https://4geeksacademy.notion.site'

/** Toma el último id hex de 32 chars en la URL pública de Notion. */
function extractNotionPageIdFromSourceUrl(url) {
  if (!url || typeof url !== 'string') return null
  const matches = url.match(/[a-f0-9]{32}/gi)
  if (!matches || matches.length === 0) return null
  return matches[matches.length - 1].toLowerCase()
}

/**
 * Incluir aquí y en `DOCUMENTATION_MENU` cualquier enlace con ID de página antiguo, para `…/documentation/<id32>`.
 */
export const LEGACY_NOTION_ID_TO_SLUG = {
  c9e6a7bbd0324cd7a7a29603e635ecfb: 'responsabilidades-mentores',
  '1bcc9f261fc680c7bacadeddd35b6807': 'servicio-mentorias-mentores',
  '4a49d7747d9447eb9181635a6284f7c9': 'servicio-mentorias-mentores',
  '209c9f261fc680a5ab08e29c51bfd0c5': 'calendly-mentor',
  cfa08abda9b64452a5e06cf363d8b33e: 'calendly-mentor',
  '1b6c9f261fc6804a936ec32675f9f5c4': 'bienvenida-4geeks',
  '1bac9f261fc680c4b22af5060c9499d9': 'evaluar-progreso-estudiantes',
  ae1cefdb259843b98b27035bcc3d7060: 'corregir-proyectos',
}

export const DOCUMENTATION_MENU = [
  {
    id: 'responsabilidades-mentores',
    title: 'Responsabilidades de los Mentores',
    description: 'Rol y responsabilidades de los mentores',
    category: 'Inicio',
    sourceUrl: `${NOTION_SITE_BASE}/Responsabilidades-de-los-Mentores-c9e6a7bbd0324cd7a7a29603e635ecfb`,
  },
  {
    id: 'servicio-mentorias-mentores',
    title: 'Servicio de Mentorías - Mentores',
    description: '',
    category: 'Mentorías',
    sourceUrl: `${NOTION_SITE_BASE}/Gu-a-para-dar-mentor-as-Espa-a-4a49d7747d9447eb9181635a6284f7c9`,
  },
  {
    id: 'calendly-mentor',
    title: 'Cómo configurar Calendly para convertirse en mentor',
    description: '',
    category: 'Mentorías',
    sourceUrl: `${NOTION_SITE_BASE}/How-to-Setup-Calendly-for-becoming-a-mentor-cfa08abda9b64452a5e06cf363d8b33e`,
  },
  {
    id: 'bienvenida-4geeks',
    title: 'Te damos la Bienvenida a 4Geeks Academy',
    description: '',
    category: 'Proyectos',
    courses: ['FS', 'DS', 'CS'],
    sourceUrl: `${NOTION_SITE_BASE}/1b6c9f261fc6804a936ec32675f9f5c4`,
  },
  {
    id: 'evaluar-progreso-estudiantes',
    title: 'Guía para evaluar el progreso de los estudiantes',
    description: '',
    category: 'Proyectos',
    courses: ['FS', 'DS', 'CS'],
    sourceUrl: `${NOTION_SITE_BASE}/1bac9f261fc680c4b22af5060c9499d9`,
  },
  {
    id: 'corregir-proyectos',
    title: 'Guía para corregir proyectos',
    description: '',
    category: 'How to',
    courses: ['FS', 'DS'],
    sourceUrl: `${NOTION_SITE_BASE}/ae1cefdb259843b98b27035bcc3d7060`,
  },
]

/**
 * `slug` del menú → `pageId` (32 hex) para `POST /notion-page`.
 * Derivado de `sourceUrl` (último id en la ruta pública de Notion).
 */
export const NOTION_PAGE_ID_BY_SLUG = Object.fromEntries(
  DOCUMENTATION_MENU.map((item) => {
    const pageId = extractNotionPageIdFromSourceUrl(item.sourceUrl)
    return [item.id, pageId]
  }).filter(([, pageId]) => pageId)
)

export const NOTION_INICIO_PAGE_ID =
  NOTION_PAGE_ID_BY_SLUG['responsabilidades-mentores'] ||
  'c9e6a7bbd0324cd7a7a29603e635ecfb'

export function getNotionPageIdForSlug(slug) {
  if (!slug || typeof slug !== 'string') return null
  return NOTION_PAGE_ID_BY_SLUG[slug] ?? null
}

export function isLegacyNotionPageIdParam(param) {
  return typeof param === 'string' && /^[a-f0-9]{32}$/i.test(param)
}
