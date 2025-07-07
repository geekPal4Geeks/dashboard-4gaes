import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Tooltip,
  Skeleton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import { getCohortNotionInfo, getMultipleStudentsInfo } from '../services/notionService'
import WarningIcon from '@mui/icons-material/Warning'
import {
  notionToMuiColor,
  getStageColor,
  getStageLabel,
  preworkStatusColors,
  getPreworkStatusColor,
  getColorPriority,
  formatDate,
  getNumberColor,
  getDaysInPreworkColor,
  getTeamSlackId,
} from '../utils/cohortHelpers'
import { updateStudentProperty } from '../services/studentService'
import { parseStudentData, parseCohortData } from '../utils/studentHelpers'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

export default function CohortDetail() {
  const { cohortId } = useParams()
  const navigate = useNavigate()
  const [cohort, setCohort] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMoreStudents, setLoadingMoreStudents] = useState(false)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [editingAbsences, setEditingAbsences] = useState({})
  const [savingAbsences, setSavingAbsences] = useState({})
  const [pendingUpdates, setPendingUpdates] = useState({})
  const [updateQueue, setUpdateQueue] = useState({})

  const isPrework = cohort?.properties?.Status?.select?.name === 'Prework'

  const sortStudentsByPreworkStatus = (students) => {
    return [...students].sort((a, b) => {
      const statusA = a.properties?.['Prework Status']?.select?.name || ''
      const statusB = b.properties?.['Prework Status']?.select?.name || ''

      // Si alguno es "Prework Done", va al final
      if (statusA === 'Prework Done') return 1
      if (statusB === 'Prework Done') return -1

      const colorA = getPreworkStatusColor(statusA)
      const colorB = getPreworkStatusColor(statusB)

      return getColorPriority(colorA) - getColorPriority(colorB)
    })
  }

  // Función para procesa las actualizaciones
  const processUpdateQueue = useCallback(
    async (studentId) => {
      // Verificar si existe el valor en la cola, incluyendo 0
      if (updateQueue[studentId] === undefined) return

      try {
        setSavingAbsences((prev) => ({ ...prev, [studentId]: true }))
        const value = updateQueue[studentId]

        await updateStudentProperty(studentId, 'Absences', value)

        setStudents((prev) =>
          prev.map((student) =>
            student.student.id === studentId
              ? {
                  ...student,
                  basicInfo: {
                    ...student.basicInfo,
                    absences: value,
                  },
                }
              : student
          )
        )

        // Limpiar la cola para este estudiante
        setUpdateQueue((prev) => {
          const newState = { ...prev }
          delete newState[studentId]
          return newState
        })
      } catch (error) {
        console.error('Error al actualizar inasistencias:', error)
        // Solo mostrar error si el componente sigue montado
        if (!error.isUnmounted) {
          setError('Error al actualizar las inasistencias')
          // Limpiar el error después de 3 segundos
          setTimeout(() => setError(null), 3000)
        }
      } finally {
        setSavingAbsences((prev) => ({ ...prev, [studentId]: false }))
        setPendingUpdates((prev) => {
          const newState = { ...prev }
          delete newState[studentId]
          return newState
        })
      }
    },
    [updateQueue]
  )

  // Función debounce para actualizar inasistencias
  const debouncedUpdate = useCallback(
    (studentId, value) => {
      // Limpiar el timeout anterior si existe
      if (pendingUpdates[studentId]) {
        clearTimeout(pendingUpdates[studentId])
      }

      // Actualizar la cola con el último valor
      setUpdateQueue((prev) => ({
        ...prev,
        [studentId]: value,
      }))

      // Establecer nuevo timeout
      const timeoutId = setTimeout(() => {
        processUpdateQueue(studentId)
      }, 2000) // 2 segundos de delay

      // Guardar el ID del timeout
      setPendingUpdates((prev) => ({
        ...prev,
        [studentId]: timeoutId,
      }))
    },
    [pendingUpdates, processUpdateQueue]
  )

  const handleAbsencesChange = (studentId, value) => {
    // Asegurarnos de que el valor sea un número válido, incluyendo 0
    const numericValue = value === '' ? 0 : Number(value)
    if (isNaN(numericValue)) return

    setEditingAbsences((prev) => ({
      ...prev,
      [studentId]: numericValue,
    }))

    // Actualizar el estado local inmediatamente para reflejar el cambio
    setStudents((prev) =>
      prev.map((student) =>
        student.student.id === studentId
          ? {
              ...student,
              basicInfo: {
                ...student.basicInfo,
                absences: numericValue,
              },
            }
          : student
      )
    )

    debouncedUpdate(studentId, numericValue)
  }

  // Limpiar timeouts pendientes al desmontar el componente
  useEffect(() => {
    let isUnmounted = false

    return () => {
      isUnmounted = true
      // Limpiar todos los timeouts pendientes
      Object.values(pendingUpdates).forEach((timeoutId) => {
        clearTimeout(timeoutId)
      })
      // Limpiar la cola de actualizaciones
      setUpdateQueue({})
    }
  }, [pendingUpdates])

  // Procesar cualquier actualización pendiente cuando el componente se desmonte
  useEffect(() => {
    return () => {
      Object.keys(updateQueue).forEach((studentId) => {
        processUpdateQueue(studentId)
      })
    }
  }, [processUpdateQueue, updateQueue])

  useEffect(() => {
    const fetchData = async () => {
      const BATCH_SIZE = 8; // Cargar primeros 8 estudiantes inmediatamente
      
      try {
        // === FASE INICIAL: Mostrar información básica inmediatamente ===
        const cohortData = await getCohortNotionInfo(cohortId)
        
        // Mostrar información básica de la cohorte inmediatamente
        setCohort(cohortData)
        setInitialDataLoaded(true)
        setLoading(false) // Ya no estamos en loading principal

        // Obtener los datos de los estudiantes desde Data for Zapier
        const zapierData =
          cohortData.properties?.['Data for Zapier']?.formula?.string
        const studentsData = parseStudentData(zapierData)

        // Si no hay estudiantes, terminar aquí
        if (!studentsData || studentsData.length === 0) {
          setStudents([])
          return
        }

        // === MOSTRAR PLACEHOLDERS PARA TODOS LOS ESTUDIANTES ===
        const allStudentPlaceholders = studentsData.map((basicStudent) => ({
          basicInfo: basicStudent,
          properties: null,
          isLoading: true
        }))
        setStudents(allStudentPlaceholders)

        // Preparar IDs para peticiones en paralelo
        const studentIds = studentsData
          .map(student => student.notion_id)
          .filter(id => id !== null && id !== undefined)

        const teacherId = cohortData.properties?.Teacher?.relation?.[0]?.id
        const taIds =
          cohortData.properties?.['T.A.']?.relation?.map((ta) => ta.id) || []

        // === PROGRESSIVE LOADING: PRIMERA FASE ===
        // Cargar primer lote de estudiantes + profesores inmediatamente
        const firstBatchIds = studentIds.slice(0, BATCH_SIZE)
        const teacherAndTaIds = [
          ...(teacherId ? [teacherId] : []),
          ...taIds
        ]

        const firstBatchResults = await getMultipleStudentsInfo([
          ...firstBatchIds,
          ...teacherAndTaIds
        ])

        // Separar resultados del primer lote
        const firstBatchStudentsInfo = firstBatchResults.slice(0, firstBatchIds.length)
        const teacherInfo = teacherId ? firstBatchResults[firstBatchIds.length] : null
        const taInfos = taIds.length > 0 ? firstBatchResults.slice(firstBatchIds.length + (teacherId ? 1 : 0)) : []

        // Crear estudiantes del primer lote completados
        const firstBatchStudents = studentsData.slice(0, BATCH_SIZE).map((basicStudent, index) => {
          const detailedInfo = firstBatchStudentsInfo[index]
          return {
            ...(detailedInfo || {}),
            basicInfo: basicStudent,
          }
        })

        // Crear placeholders para estudiantes restantes
        const remainingPlaceholders = studentsData.slice(BATCH_SIZE).map((basicStudent) => ({
          basicInfo: basicStudent,
          properties: null,
          isLoading: true
        }))

        // Actualizar la información de los profesores en la cohorte
        const updatedCohort = {
          ...cohortData,
          properties: {
            ...cohortData.properties,
            Teacher: {
              ...cohortData.properties.Teacher,
              relation: teacherInfo
                ? [
                    {
                      id: teacherId,
                      name:
                        teacherInfo?.properties?.Name?.title?.[0]?.plain_text ||
                        'Sin nombre',
                    },
                  ]
                : [],
            },
            'T.A.': {
              ...cohortData.properties['T.A.'],
              relation: taInfos
                .filter((ta) => ta !== null)
                .map((ta, index) => ({
                  id: taIds[index],
                  name:
                    ta?.properties?.Name?.title?.[0]?.plain_text ||
                    'Sin nombre',
                })),
            },
          },
        }

        setCohort(updatedCohort)
        setStudents([...firstBatchStudents, ...remainingPlaceholders])

        // === PROGRESSIVE LOADING: SEGUNDA FASE ===
        // Cargar estudiantes restantes en background
        const remainingIds = studentIds.slice(BATCH_SIZE)
        if (remainingIds.length > 0) {
          setLoadingMoreStudents(true)
          
          try {
            const remainingResults = await getMultipleStudentsInfo(remainingIds)
            
            const remainingStudents = studentsData.slice(BATCH_SIZE).map((basicStudent, index) => {
              const detailedInfo = remainingResults[index]
              return {
                ...(detailedInfo || {}),
                basicInfo: basicStudent,
              }
            })

            // Actualizar con todos los estudiantes completos
            setStudents([...firstBatchStudents, ...remainingStudents])
          } catch (err) {
            console.error('Error cargando estudiantes restantes:', err)
            // Mantener placeholders si falla la segunda carga
          } finally {
            setLoadingMoreStudents(false)
          }
        }

      } catch (err) {
        setError('Error al cargar la información')
        console.error('Error completo:', err)
        setLoading(false)
      }
    }

    fetchData()
  }, [cohortId])

  const renderNumber = (number) => {
    if (number <= 3)
      return (
        <Typography color="success.main" sx={{ fontWeight: 'thin' }}>
          {number}
        </Typography>
      )
    if (number <= 5)
      return (
        <Chip
          label={number}
          color="warning"
          size="small"
          sx={{ fontWeight: 'medium' }}
        />
      )
    if (number <= 8)
      return (
        <Chip
          label={number}
          color="warning"
          size="small"
          sx={{ fontWeight: 'medium' }}
        />
      )
    return (
      <Chip
        label={number}
        color="error"
        size="small"
        sx={{ fontWeight: 'medium' }}
      />
    )
  }

  const renderDaysInPrework = (days) => {
    if (days <= 3) {
      return (
        <Typography color="success.main" sx={{ fontWeight: 'thin' }}>
          {days}
        </Typography>
      )
    }
    return (
      <Chip
        label={days}
        color={getDaysInPreworkColor(days)}
        size="small"
        sx={{ fontWeight: 'medium' }}
      />
    )
  }

  const handleStudentClick = (student) => {
    // Pasar el objeto student y cohort por el state de navegación
    navigate(`/cohort/${cohortId}/student/${student.student.id || student.basicInfo?.notion_id}`, {
      state: { student, cohort }
    })
  }

  const handleSkillReviewClick = () => {
    navigate(`/cohort/${cohortId}/skill-review`)
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (!cohort) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">
          No se encontró información de la cohorte
        </Alert>
      </Container>
    )
  }

  // Obtener mentores y TAs usando el mismo helper que StudentDetail
  let mentors = []
  let tas = []
  let pm = null
  let pmSlackId = null
  if (cohort) {
    const mentorsCohortStr = cohort?.properties?.['Mentors in this cohort']?.formula?.string
    const parsed = parseCohortData(mentorsCohortStr)
    mentors = parsed.mentors
    tas = parsed.tas
    pm = cohort?.properties?.['Program Manager']?.select?.name
    pmSlackId = pm ? getTeamSlackId(pm) : null
  }

  // Mapeo de color para el bookmark y el chip de status
  const statusColorMap = {
    warning: '#ff9800', // Prework
    success: '#43a047', // En curso
    info: '#1976d2',    // Proyecto Final
    default: '#bdbdbd',
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/courses')}
        sx={{ mb: 3 }}
      >
        Volver
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4, position: 'relative' }}>
        <BookmarkIcon
          sx={{
            position: 'absolute',
            top: -24,
            right: 32,
            zIndex: 1,
            fontSize: 80,
            color: statusColorMap[getStageColor(cohort.properties?.Status?.select?.name)] || statusColorMap.default,
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          {/* Determinar color de status para chips y bookmark */}
          {(() => {
            const status = cohort.properties?.Status?.select?.name;
            const muiColor = getStageColor(status);
            const color = statusColorMap[muiColor] || statusColorMap.default;
            return (
              <>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#23272f', fontSize: { xs: '1.3rem', md: '1.7rem' }, mb: 0, mr: 2 }} gutterBottom>
                  {(
                    cohort.properties?.Cohort?.title?.[0]?.plain_text ||
                    'Cohorte sin nombre'
                  )
                    .replaceAll('-', ' ')
                    .toUpperCase()}
                </Typography>
                <Chip
                  label={getStageLabel(status)}
                  sx={{
                    bgcolor: color,
                    color: muiColor === 'warning' ? '#fff' : 'white',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    px: 1.5,
                    py: 0.25,
                    height: 26,
                  }}
                />
                <Chip
                  label={cohort.properties?.Program?.select?.name || 'Sin programa'}
                  sx={{ border: '1px solid #1976d2', color: '#1976d2', fontWeight: 600, fontSize: '0.85rem', px: 1.5, py: 0.25, bgcolor: 'white', height: 26 }}
                />
              </>
            );
          })()}
        </Box>

        {cohort.properties?.Status?.select?.name === 'Final Project' && (
          <Box sx={{
            display: 'flex', alignItems: 'center', bgcolor: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', px: 1.5, py: 1, borderRadius: 2, mb: 3, mt: 1, fontWeight: 500, fontSize: '0.92rem',
          }}>
            <WarningIcon sx={{ mr: 1.2, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.92rem' }}>
              Recordar completar la revisión de habilidades antes de finalizar
            </Typography>
          </Box>
        )}

        <Grid container spacing={0} sx={{ mb: 4, mt: 4, width: '100%', flexWrap: 'nowrap' }}>
          <Grid item sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexBasis: '30%', maxWidth: '30%', minWidth: 0 }}>
            <Typography variant="h6" sx={{ color: '#374151', fontWeight: 600, fontSize: '1rem', mb: 1.2 }}>
              Fechas importantes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.97rem', mr: 1 }}>Inicio prework:</Typography>
                <Typography sx={{ color: '#23272f', fontWeight: 600 }}>{formatDate(cohort.properties?.['Start date (prework)']?.date?.start)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.97rem', mr: 1 }}>Inicio contenido:</Typography>
                <Typography sx={{ color: '#23272f', fontWeight: 600 }}>{formatDate(cohort.properties?.['Start Date (content)']?.date?.start)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.97rem', mr: 1 }}>Finaliza:</Typography>
                <Typography sx={{ color: '#23272f', fontWeight: 600 }}>{formatDate(cohort.properties?.['End Date (course)']?.date?.start)}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexBasis: '25%', maxWidth: '25%', minWidth: 0 }}>
            <Typography variant="h6" sx={{ color: '#374151', fontWeight: 600, fontSize: '1rem', mb: 1.2 }}>
              Estadísticas
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.97rem', width: 180, minWidth: 150 }}>Estudiantes activos:</Typography>
                <Typography sx={{ color: '#23272f', fontWeight: 700, fontSize: '1.05rem' }}>{cohort.properties?.['Active (#)']?.rollup?.number || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.97rem', width: 180, minWidth: 150 }}>Proyectos en revisión:</Typography>
                <Typography sx={{ color: '#23272f', fontWeight: 700, fontSize: '1.05rem' }}>{cohort.properties?.['Projects in review']?.number || 0}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item sx={{ display: 'flex', flexDirection: 'column', height: '100%', flexBasis: '45%', maxWidth: '45%', minWidth: 0 }}>
            <Typography variant="h6" sx={{ color: '#374151', fontWeight: 600, fontSize: '1rem', mb: 1.2 }}>
              Personal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
              {/* Fila 1: PM, Mentor y TA (si solo hay 1 TA) */}
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4, width: '100%', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* PM */}
                {pm && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
                      <FiberManualRecordIcon sx={{ color: '#e3f2fd', fontSize: 16, mr: 0.5 }} /> PM
                    </Typography>
                    <Chip
                      label={pm}
                      color="primary"
                      clickable={!!pmSlackId}
                      component={pmSlackId ? 'a' : undefined}
                      href={pmSlackId ? `slack://user?team=T0BFXMWMV&id=${pmSlackId}` : undefined}
                      target={pmSlackId ? '_blank' : undefined}
                      rel={pmSlackId ? 'noopener noreferrer' : undefined}
                      sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 2, py: 0.5, bgcolor: '#e3f2fd', color: '#1976d2' }}
                    />
                  </Box>
                )}
                {/* Mentor */}
                {mentors.length > 0 && mentors.map((m, i) => (
                  <Box key={i}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
                      <FiberManualRecordIcon sx={{ color: '#f3e5f5', fontSize: 16, mr: 0.5 }} /> Mentor
                    </Typography>
                    <Chip
                      label={m.firstName}
                      clickable={!!m.slackId}
                      component={m.slackId ? 'a' : undefined}
                      href={m.slackId ? `slack://user?team=T0BFXMWMV&id=${m.slackId}` : undefined}
                      target={m.slackId ? '_blank' : undefined}
                      rel={m.slackId ? 'noopener noreferrer' : undefined}
                      sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 2, py: 0.5, bgcolor: '#f3e5f5', color: '#7b1fa2' }}
                    />
                  </Box>
                ))}
                {/* Si hay solo 1 TA, mostrarlo aquí */}
                {tas.length === 1 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
                      <FiberManualRecordIcon sx={{ color: '#ffebee', fontSize: 16, mr: 0.5 }} /> TA
                    </Typography>
                    <Chip
                      label={tas[0].firstName}
                      clickable={!!tas[0].slackId}
                      component={tas[0].slackId ? 'a' : undefined}
                      href={tas[0].slackId ? `slack://user?team=T0BFXMWMV&id=${tas[0].slackId}` : undefined}
                      target={tas[0].slackId ? '_blank' : undefined}
                      rel={tas[0].slackId ? 'noopener noreferrer' : undefined}
                      sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 2, py: 0.5, bgcolor: '#ffebee', color: '#d32f2f' }}
                    />
                  </Box>
                )}
              </Box>
              {/* Si hay más de 1 TA, mostrar los chips de TA en la siguiente línea con wrap */}
              {tas.length > 1 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
                    <FiberManualRecordIcon sx={{ color: '#ffebee', fontSize: 16, mr: 0.5 }} /> TA
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tas.map((t, i) => (
                      <Chip
                        key={i}
                        label={t.firstName}
                        clickable={!!t.slackId}
                        component={t.slackId ? 'a' : undefined}
                        href={t.slackId ? `slack://user?team=T0BFXMWMV&id=${t.slackId}` : undefined}
                        target={t.slackId ? '_blank' : undefined}
                        rel={t.slackId ? 'noopener noreferrer' : undefined}
                        sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 2, py: 0.5, bgcolor: '#ffebee', color: '#d32f2f' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

         
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            Estudiantes
          </Typography>
          {cohort.properties?.['Status']?.select?.name === 'Final Project' && (
            <Button variant="outlined" onClick={handleSkillReviewClick}>
              Revisión de habilidades
            </Button>
          )}
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="center">
                  Slack{' '}
                  <Tooltip
                    title="Debes tener instalada la app de Slack en tu dispositivo para abrir el chat directamente desde aquí."
                    arrow
                  >
                    <InfoOutlinedIcon
                      sx={{
                        fontSize: 18,
                        ml: 0.5,
                        color: 'text.secondary',
                        verticalAlign: 'middle',
                        cursor: 'pointer',
                      }}
                    />
                  </Tooltip>
                </TableCell>
                {!isPrework && (
                  <>
                    <TableCell align="center">Proyectos pendientes</TableCell>
                    <TableCell align="center">% Proyectos pendientes</TableCell>
                    <TableCell align="center">% Inasistencias</TableCell>
                  </>
                )}
                {isPrework && (
                  <>
                    <TableCell align="center">Estado de prework</TableCell>
                    <TableCell align="center"># Días en estado</TableCell>
                  </>
                )}
                <TableCell align="center">Inasistencias</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortStudentsByPreworkStatus(students).map((student, index) => {
                // Safe check: if student.student is missing, render a placeholder row
                if (!student.student) {
                  return (
                    <TableRow
                      key={student.basicInfo?.notion_id || `loading-${index}`}
                      sx={{
                        '&:nth-of-type(odd)': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <TableCell colSpan={isPrework ? 6 : 8} align="center">
                        <Skeleton variant="text" width="80%" />
                      </TableCell>
                    </TableRow>
                  )
                }

                // Helpers para color de %
                const percentProjects =
                  student.student.properties?.['% Projects undelivered']?.formula?.number
                let colorProjects = 'default'
                if (typeof percentProjects === 'number') {
                  if (percentProjects >= 30) colorProjects = 'error'
                  else if (percentProjects >= 20) colorProjects = 'warning'
                  else if (percentProjects >= 10) colorProjects = 'tertiary'
                  else if (percentProjects > 0) colorProjects = 'success'
                  else colorProjects = 'default'
                }
                const percentAbsences =
                  student.student.properties?.['% Absences']?.formula?.number
                let colorAbsences = 'default'
                if (typeof percentAbsences === 'number') {
                  if (percentAbsences >= 15) colorAbsences = 'error'
                  else if (percentAbsences >= 10) colorAbsences = 'warning'
                  else if (percentAbsences >= 5) colorAbsences = 'tertiary'
                  else if (percentAbsences > 0) colorAbsences = 'success'
                  else colorAbsences = 'default'
                }
                return (
                  <TableRow
                    key={student.student?.id || student.basicInfo?.notion_id || `loading-${index}`}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={(e) => {
                      if (e.target.closest('td:last-child')) {
                        e.stopPropagation()
                        return
                      }
                      handleStudentClick(student)
                    }}
                  >
                    <TableCell>
                      <Typography
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {student.basicInfo?.full_name || 'Sin nombre'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {student.basicInfo?.slack_id ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(
                              `slack://user?team=${'T0BFXMWMV'}&id=${
                                student.basicInfo.slack_id
                              }`,
                              '_blank'
                            )
                          }}
                        >
                          Slack
                        </Button>
                      ) : (
                        'Sin Slack ID'
                      )}
                    </TableCell>
                    {!isPrework && (
                      <>
                        <TableCell align="center">
                          {renderNumber(
                            student.basicInfo?.pending_projects || 0
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {typeof percentProjects === 'number' ? (
                            colorProjects === 'success' ||
                            colorProjects === 'default' ? (
                              <Typography
                                sx={{
                                  color:
                                    colorProjects === 'success'
                                      ? 'success.main'
                                      : 'inherit',
                                  fontWeight: 'light',
                                }}
                              >
                                {`${percentProjects}%`}
                              </Typography>
                            ) : (
                              <Chip
                                label={`${percentProjects}%`}
                                color={colorProjects}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            )
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {typeof percentAbsences === 'number' ? (
                            colorAbsences === 'success' ||
                            colorAbsences === 'default' ? (
                              <Typography
                                sx={{
                                  color:
                                    colorAbsences === 'success'
                                      ? 'success.main'
                                      : 'inherit',
                                  fontWeight: 'light',
                                }}
                              >
                                {`${percentAbsences}%`}
                              </Typography>
                            ) : (
                              <Chip
                                label={`${percentAbsences}%`}
                                color={colorAbsences}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            )
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </>
                    )}
                    {isPrework && (
                      <>
                        <TableCell align="center">
                          <Chip
                            label={
                              student.student.properties?.['Prework Status']?.select
                                ?.name || 'No definido'
                            }
                            color={getPreworkStatusColor(
                              student.student.properties?.['Prework Status']?.select
                                ?.name
                            )}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {renderDaysInPrework(
                            student.student.properties?.['Days in prework status']
                              ?.formula?.number || 0
                          )}
                        </TableCell>
                      </>
                    )}
                    {/* Celda de Inasistencias: editable solo en prework, siempre al final */}
                    <TableCell align="center">
                      {isPrework ? (
                        <TextField
                          type="number"
                          size="small"
                          value={
                            editingAbsences[student.student?.id || student.basicInfo?.notion_id] !== undefined
                              ? editingAbsences[student.student?.id || student.basicInfo?.notion_id]
                              : student.basicInfo?.absences || 0
                          }
                          onChange={(e) => {
                            e.stopPropagation()
                            handleAbsencesChange(student.student?.id || student.basicInfo?.notion_id, e.target.value)
                          }}
                          inputProps={{
                            min: 0,
                            style: { width: 60, textAlign: 'center' },
                          }}
                          disabled={savingAbsences[student.student?.id || student.basicInfo?.notion_id]}
                        />
                      ) : (
                        renderNumber(student.basicInfo?.absences || 0)
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {loadingMoreStudents && (
          <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Cargando más estudiantes...
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
