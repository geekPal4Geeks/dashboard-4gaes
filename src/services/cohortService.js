import { getCohortNotionInfo } from './notionService'

// Lista de cohortes que sabemos que no existen en Notion
const EXCLUDED_COHORTS = [
  902, 939, 101, 1224, 512, 1065, 942, 768, 767, 520, 519,
]

const API_URL = import.meta.env.VITE_4GEEKS_API_URL

export async function getActiveCohorts(token) {
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
      && cohort.cohort?.academy?.id === 6
  )

  // Luego filtramos las cohortes excluidas
  const filteredCohorts = activeCohorts?.filter(
    (cohort) => !EXCLUDED_COHORTS.includes(Number(cohort.cohort.id))
  )

  // Obtenemos información de Notion solo para las cohortes filtradas usando Promise.allSettled
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
