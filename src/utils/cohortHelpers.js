export const notionToMuiColor = {
  blue: 'success',
  green: 'success',
  purple: 'secondary',
  pink: 'secondary',
  orange: 'warning',
  brown: 'error',
  gray: 'error',
  red: 'error',
  yellow: 'warning',
}

export const getStageColor = (stage) => {
  switch (stage) {
    case 'Prework':
      return 'warning'
    case 'Active':
      return 'success'
    case 'Final Project':
      return 'info'
    default:
      return 'default'
  }
}

export const getStageLabel = (stage) => {
  switch (stage) {
    case 'Prework':
      return 'Prework'
    case 'Active':
      return 'En curso'
    case 'Final Project':
      return 'Proyecto Final'
    default:
      return stage || 'Sin estado'
  }
}

export const preworkStatusColors = {
  // Azul
  'Not started': 'info',

  // Gris oscuro
  'Do NOT Follow': 'default',
  Dropped: 'default',
  Limbo: 'default',
  Agreement: 'default',

  // Rojo
  Missing: 'error',
  'CS - Intro & Virtual Box': 'error',
  'DS - Intro to Python': 'error',
  'FS - HTML': 'error',
  'FS - CSS': 'error',
  'FS - Digital Postcard': 'error',

  // Warning (amarillo más claro)
  'CS - Best Practices': 'warning',
  'CS - Cyber Governance': 'warning',
  'DS - Python Lists': 'warning',
  'DS - Python Functions': 'warning',
  'FS - Layouts': 'warning',
  'FS - IG Photo Feed': 'warning',

  // Tertiary (amarillo más oscuro o marrón)
  'CS - Packet Tracer': 'tertiary',
  'DS - Master Python': 'tertiary',
  'DS - Fix Misspell': 'tertiary',
  'DS - Learn in public': 'tertiary',
  'FS - JS Beginner': 'tertiary',
  'FS - Excuse Generator': 'tertiary',

  // Verde
  'CS - Introduction to Python': 'success',
  'DS - Monthly Sales Analyzer': 'success',
  'FS - Master JS': 'success',
  'Prework Done': 'success',
}

export const getPreworkStatusColor = (status) => {
  return preworkStatusColors[status] || 'default'
}

export const getColorPriority = (color) => {
  switch (color) {
    case 'info':
      return 1
    case 'error':
      return 2
    case 'warning':
      return 3
    case 'tertiary':
      return 4
    case 'success':
      return 5
    default:
      return 6
  }
}

export const formatDate = (dateString) => {
  if (!dateString) return 'No definida'
  const months = {
    '01': 'enero',
    '02': 'febrero',
    '03': 'marzo',
    '04': 'abril',
    '05': 'mayo',
    '06': 'junio',
    '07': 'julio',
    '08': 'agosto',
    '09': 'septiembre',
    10: 'octubre',
    11: 'noviembre',
    12: 'diciembre',
  }

  const date = new Date(dateString)
  const day = date.getDate()
  const month = months[(date.getMonth() + 1).toString().padStart(2, '0')]
  const year = date.getFullYear()

  return `${day} de ${month} de ${year}`
}

export const getNumberColor = (number) => {
  if (number <= 3) return 'success'
  if (number <= 5) return 'tertiary'
  if (number <= 8) return 'warning'
  return 'error'
}

export const getDaysInPreworkColor = (days) => {
  if (days <= 3) return 'success'
  if (days <= 6) return 'tertiary'
  if (days <= 10) return 'warning'
  return 'error'
}

// --- Helpers para CourseCard ---

export const getCourseCardStageColor = (stage) => {
  switch (stage) {
    case 'PREWORK':
      return 'warning'
    case 'STARTED':
      return 'success'
    case 'FINAL_PROJECT':
      return 'info'
    default:
      return 'default'
  }
}

export const getCourseCardStageLabel = (stage) => {
  switch (stage) {
    case 'PREWORK':
      return 'Prework'
    case 'STARTED':
      return 'En curso'
    case 'FINAL_PROJECT':
      return 'Proyecto Final'
    default:
      return stage
  }
}

export const getCourseCardRoleLabel = (role) => {
  switch (role) {
    case 'REVIEWER':
      return 'Revisor'
    case 'TEACHER ASSISTANT':
      return 'Asistente'
    case 'TEACHER':
      return 'Mentor'
    case 'ASSISTANT':
      return 'Asistente'
    default:
      return role
  }
}

export const getCourseCardBorderColor = (stage) => {
  const colorKey = getCourseCardStageColor(stage)
  switch (colorKey) {
    case 'warning':
      return '#ff9800'
    case 'success':
      return '#4caf50'
    case 'info':
      return '#2196f3'
    default:
      return '#e0e0e0'
  }
}

export const getTeamSlackId = (programManager) => {
  const teamSlackIds = {
    Ehiber: 'UU409472Q',
    Carmen: 'U06KK46LYH5',
    Francesc: 'U06FN52SR36',
    Luis: 'U08BGKH117A',
    Adrian: 'U07EX1PE6TC',
  }

  return teamSlackIds[programManager]
}
