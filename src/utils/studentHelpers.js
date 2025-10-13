export const parseStudentData = (zapierData) => {
  try {
    if (!zapierData) return []

    // Dividir por cada estudiante (separados por coma) - método más robusto
    // El problema es que hay comas dentro de los valores, necesitamos dividir por "notion_id:" que es único
    const studentsData = zapierData.split(/,(?=notion_id:)/).filter(Boolean)

    const result = studentsData
    .map((studentStr) => {
      // Dividir cada propiedad del estudiante (separadas por |)
      const properties = studentStr.split('|').reduce((acc, prop) => {
        const [key, value] = prop.split(':')
        acc[key] = value
        return acc
      }, {})


      // Función helper para parsear valores booleanos de manera más robusta
      const parseBoolean = (value) => {
        if (value === undefined || value === null) return false
        if (typeof value === 'boolean') return value
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase().trim()
          return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes'
        }
        return false
      }

      return {
        notion_id: properties.notion_id,
        full_name: properties.full_name,
        email: properties.email,
        slack_id: properties.slack_id,
        absences: parseInt(properties.absences) || 0,
        pending_projects: parseInt(properties.pending_projects) || 0,
        is_in_academic_recovery: parseBoolean(properties.is_in_academic_recovery),
        keep_private: parseBoolean(properties.keep_private),
      }
    })
    .filter(
      (student) =>
        student.notion_id &&
        student.full_name &&
        student.full_name.trim() !== '' &&
        student.full_name !== 'Sin nombre'
    )
    
    return result
  } catch (error) {
    console.error('Error in parseStudentData:', error)
    return []
  }
}

// Helper para generar la clave interna consistente
export const generatePropertyKey = (propName) => {
  return propName
    .replace(' (Skill review)', '')
    .toLowerCase()
    .replace(/ /g, '')
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
}

export const technicalSpecialtiesOptions = [
  'CS - Compliance',
  'CS - Blue team (defense)',
  'CS - Red team (attack)',
  'DS - Data Analysis',
  'DS - Data infraestructure',
  'DS - Data Visualization',
  'DS - Deep Learning',
  'DS - Machine Learning',
  'FS - Backend',
  'FS - Frontend',
]

export const skillReviewProperties = [
  'Responsabilidad (Skill review)',
  'Organización (Skill review)',
  'Capacidad de atención (Skill review)',
  'Dominio de conceptos (Skill review)',
  'Habilidad técnica (Skill review)',
  'Capacidad resolutiva (Skill review)',
  'Trabajo en equipo (Skill review)',
]

// Parsea la propiedad Cohort Data de Notion
export function parseCohortData(str) {
  if (!str) return { mentors: [], tas: [] }
  let mentors = []
  let tas = []
  // El string es una lista separada por comas de bloques notion_id:...|full_name:...|...|rol:...
  const people = str.split(/,notion_id:/).map((p, i) => (i === 0 ? p : 'notion_id:' + p))
  for (const person of people) {
    const fullName = person.match(/full_name:([^|]+)/)?.[1]
    const firstName = fullName.split(' ')[0]
    const lastName = fullName.split(' ')[1]
    const email = person.match(/email:([^|]+)/)?.[1]
    const slackId = person.match(/slack_id:([^|]+)/)?.[1]
    const rol = person.match(/rol:([^|]+)/)?.[1]
    if (rol && fullName) {
      const obj = { firstName, lastName, fullName, email, slackId, rol }
      if (rol.toLowerCase().includes('senior mentor')) mentors.push(obj)
      else if (rol.toLowerCase().includes('mentor assistant')) tas.push(obj)
    }
  }
  return { mentors, tas }
}

// Parsea el módulo actual de la cohorte y devuelve un label amigable
export function parseCurrentModuleLabel(currentModuleArr) {
  if (Array.isArray(currentModuleArr) && currentModuleArr.length > 0) {
    const select = currentModuleArr[0]?.select;
    if (select?.name) {
      // Ejemplo: 'FS-12-DOM Practice'
      const match = select.name.match(/^(FS|DS|CS)-(\d+)-(.*)$/);
      if (match) {
        const modulo = match[2];
        const proyecto = match[3].trim();
        return `Módulo ${modulo} · ${proyecto}`;
      } else {
        // Si no matchea, mostrar el string completo
        return select.name;
      }
    }
  }
  return null;
}
