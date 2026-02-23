import { getCohortNotionInfo } from './notionService'

// Lista de cohortes que sabemos que no existen en Notion
const EXCLUDED_COHORTS = [
  902, 939, 101, 1224, 512, 1065, 942, 768, 767, 520, 519,
]

// Solo cohortes cuyo slug termina en digito tienen homologo en Notion
const hasNotionEquivalent = (slug) => {
  if (!slug) return false
  return /\d$/.test(slug)
}

const API_URL = import.meta.env.VITE_4GEEKS_API_URL

export async function getActiveCohorts(token, options = {}) {
  const { onProgress, academyId } = options;
  
  const resp = await fetch(
    `${API_URL}/admissions/user/me`,
    {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!resp.ok) throw new Error('No se pudieron obtener las cohortes')

  const data = await resp.json()

  const activeStages = ['PREWORK', 'STARTED', 'FINAL_PROJECT']
  const allowedRoles = ['REVIEWER', 'ASSISTANT', 'TEACHER']

  // Primero filtramos las cohortes activas y con roles permitidos
  const activeCohorts = data.cohorts?.filter(
    (cohort) =>
      activeStages.includes(cohort.cohort.stage) &&
      allowedRoles.includes(cohort.role) 
      && cohort.cohort?.academy?.id === academyId
  )

  // Luego filtramos las cohortes excluidas y las que no tienen homologo en Notion
  const filteredCohorts = activeCohorts?.filter(
    (cohort) =>
      !EXCLUDED_COHORTS.includes(Number(cohort.cohort.id)) &&
      hasNotionEquivalent(cohort.cohort?.slug)
  )

  if (!onProgress) {
    // Comportamiento original si no se pasa callback
    const cohortNotionPromises = filteredCohorts.map(cohort => 
      getCohortNotionInfo(cohort.cohort.id)
    )

    const cohortNotionResults = await Promise.allSettled(cohortNotionPromises)

    const cohortsWithNotionInfo = filteredCohorts.map((cohort, index) => {
      const result = cohortNotionResults[index]
      if (result.status === 'fulfilled') {
        return {
          ...cohort,
          notionInfo: result.value,
        }
      } else {
        console.error(
          `Error obteniendo información de Notion para cohorte ${cohort.cohort.id}:`,
          result.reason
        )
        return {
          ...cohort,
          notionInfo: null,
        }
      }
    })

    return cohortsWithNotionInfo
  }

  // Nuevo comportamiento con callback de progreso
  const completedCohorts = []
  const pendingCohorts = [...filteredCohorts]

  // Notificar cohorts pendientes inicialmente
  if (onProgress) {
    onProgress([], pendingCohorts)
  }

  // Procesar cada cohorte individualmente
  const promises = filteredCohorts.map(async (cohort, index) => {
    try {
      const notionInfo = await getCohortNotionInfo(cohort.cohort.id)
      const completedCohort = {
        ...cohort,
        notionInfo,
      }
      
      // Mover de pending a completed
      const pendingIndex = pendingCohorts.findIndex(p => p.cohort.id === cohort.cohort.id)
      if (pendingIndex !== -1) {
        pendingCohorts.splice(pendingIndex, 1)
      }
      completedCohorts.push(completedCohort)
      
      // Notificar progreso
      if (onProgress) {
        onProgress([completedCohort], [...pendingCohorts])
      }
      
      return completedCohort
    } catch (error) {
      console.error(
        `Error obteniendo información de Notion para cohorte ${cohort.cohort.id}:`,
        error
      )
      const cohortWithError = {
        ...cohort,
        notionInfo: null,
      }
      
      // Mover de pending a completed (aunque haya fallado)
      const pendingIndex = pendingCohorts.findIndex(p => p.cohort.id === cohort.cohort.id)
      if (pendingIndex !== -1) {
        pendingCohorts.splice(pendingIndex, 1)
      }
      completedCohorts.push(cohortWithError)
      
      // Notificar progreso
      if (onProgress) {
        onProgress([cohortWithError], [...pendingCohorts])
      }
      
      return cohortWithError
    }
  })

  // Esperar a que todas terminen
  await Promise.allSettled(promises)
  
  return completedCohorts
}
