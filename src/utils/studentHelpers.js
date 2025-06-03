export const parseStudentData = (zapierData) => {
  if (!zapierData) return []

  // Dividir por cada estudiante (separados por coma)
  const studentsData = zapierData.split(',').filter(Boolean)

  return studentsData.map((studentStr) => {
    // Dividir cada propiedad del estudiante (separadas por |)
    const properties = studentStr.split('|').reduce((acc, prop) => {
      const [key, value] = prop.split(':')
      acc[key] = value
      return acc
    }, {})

    return {
      notion_id: properties.notion_id,
      full_name: properties.full_name,
      email: properties.email,
      slack_id: properties.slack_id,
      absences: parseInt(properties.absences) || 0,
      pending_projects: parseInt(properties.pending_projects) || 0,
      is_in_academic_recovery: properties.is_in_academic_recovery === 'true',
    }
  })
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
