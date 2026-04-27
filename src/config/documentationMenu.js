/**
 * Inicio: probando react-notion-x con POST /notion-page. Resto de guías en Markdown (src/content/docs).
 */
export const NOTION_INICIO_PAGE_ID = 'c9e6a7bbd0324cd7a7a29603e635ecfb'

/**
 * `sourceUrl` es referencia a la guía pública (no se carga en runtime salvo en futuras pruebas).
 */
export const NOTION_SITE_BASE = 'https://4geeksacademy.notion.site'

/** Enlaces antiguos con ID hex de Notion en la URL → slugs actuales. */
export const LEGACY_NOTION_ID_TO_SLUG = {
  c9e6a7bbd0324cd7a7a29603e635ecfb: 'responsabilidades-mentores',
  '1bcc9f261fc680c7bacadeddd35b6807': 'servicio-mentorias-mentores',
  '209c9f261fc680a5ab08e29c51bfd0c5': 'calendly-mentor',
  '1b6c9f261fc6804a936ec32675f9f5c4': 'bienvenida-4geeks',
  '1bac9f261fc680c4b22af5060c9499d9': 'evaluar-progreso-estudiantes',
  '7e831db823264e97bd66e172edb8fb6c': 'prework-fullstack',
  '4c315b2489434de1aaf9df59c9dbe990': 'prework-datascience',
  c7071a03134d4bcab1dda66079a78e8e: 'guia-proyecto-final-mentores',
  '1b6c9f261fc680d7bd46d2f2b9cda4e3': 'requisitos-proyecto-final-fs',
  ae1cefdb259843b98b27035bcc3d7060: 'corregir-proyectos',
  '1b6c9f261fc6804b93e0c068e383bad7': 'youtube-clases',
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
    id: 'prework-fullstack',
    title: 'Estructura de Clases Prework Fullstack',
    description: '',
    category: 'Proyectos',
    courses: ['FS'],
    sourceUrl: `${NOTION_SITE_BASE}/7e831db823264e97bd66e172edb8fb6c`,
  },
  {
    id: 'prework-datascience',
    title: 'Estructura de Clases Prework Data Science',
    description: '',
    category: 'Proyectos',
    courses: ['DS'],
    sourceUrl: `${NOTION_SITE_BASE}/4c315b2489434de1aaf9df59c9dbe990`,
  },
  {
    id: 'guia-proyecto-final-mentores',
    title: 'Guía para mentores sobre el proyecto final',
    description: '',
    category: 'Proyectos',
    courses: ['FS'],
    sourceUrl: `${NOTION_SITE_BASE}/c7071a03134d4bcab1dda66079a78e8e`,
  },
  {
    id: 'requisitos-proyecto-final-fs',
    title: 'Requisitos individuales del proyecto final Full-Stack',
    description: '',
    category: 'Proyectos',
    courses: ['FS'],
    sourceUrl: `${NOTION_SITE_BASE}/Requisitos-individuales-del-proyecto-final-Full-Stack-1b6c9f261fc680d7bd46d2f2b9cda4e3`,
  },
  {
    id: 'corregir-proyectos',
    title: 'Guía para corregir proyectos',
    description: '',
    category: 'How to',
    courses: ['FS', 'DS'],
    sourceUrl: `${NOTION_SITE_BASE}/ae1cefdb259843b98b27035bcc3d7060`,
  },
  {
    id: 'youtube-clases',
    title: 'Guía para subir y organizar las clases en Youtube',
    description: '',
    category: 'How to',
    courses: ['FS', 'DS', 'CS'],
    sourceUrl: `${NOTION_SITE_BASE}/1b6c9f261fc6804b93e0c068e383bad7`,
  },
]

export function isLegacyNotionPageIdParam(param) {
  return typeof param === 'string' && /^[a-f0-9]{32}$/i.test(param)
}
