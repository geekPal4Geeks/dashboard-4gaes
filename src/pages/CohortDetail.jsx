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
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import { getCohortNotionInfo, getStudentInfo } from '../services/notionService'
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
import StudentDetailModal from '../components/StudentDetailModal'
import { updateStudentProperty } from '../services/studentService'
import { parseStudentData } from '../utils/studentHelpers'

export default function CohortDetail() {
  const { cohortId } = useParams()
  const navigate = useNavigate()
  const [cohort, setCohort] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingAbsences, setEditingAbsences] = useState({})
  const [savingAbsences, setSavingAbsences] = useState({})
  const [pendingUpdates, setPendingUpdates] = useState({})
  const [updateQueue, setUpdateQueue] = useState({})
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
            student.id === studentId
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
        student.id === studentId
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
      try {
        // Obtener información de la cohorte
        const cohortData = await getCohortNotionInfo(cohortId)
        setCohort(cohortData)

        // Obtener los datos de los estudiantes desde Data for Zapier
        const zapierData =
          cohortData.properties?.['Data for Zapier']?.formula?.string
        const studentsData = parseStudentData(zapierData)

        // Obtener información detallada de cada estudiante usando su notion_id
        const studentPromises = studentsData.map((student) => {
          if (student.notion_id) {
            return getStudentInfo(student.notion_id)
          } else {
            return null
          }
        })

        // Obtener información de los profesores
        const teacherId = cohortData.properties?.Teacher?.relation?.[0]?.id
        const taIds =
          cohortData.properties?.['T.A.']?.relation?.map((ta) => ta.id) || []

        const [fetchedStudentsInfo, teacherInfo, ...taInfos] =
          await Promise.all([
            Promise.all(studentPromises),
            teacherId ? getStudentInfo(teacherId) : null,
            ...taIds.map((taId) => getStudentInfo(taId)),
          ])

        const combinedStudents = studentsData.map((basicStudent, index) => {
          const detailedInfo = fetchedStudentsInfo[index]
          return {
            ...(detailedInfo || {}),
            basicInfo: basicStudent,
          }
        })

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
        setStudents(combinedStudents)
      } catch (err) {
        setError('Error al cargar la información')
        console.error('Error completo:', err)
      } finally {
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
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
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

  // Definir programManagerName y pmSlackId aquí, después de la verificación de cohort
  const programManagerName =
    cohort.properties?.['Program Manager']?.select?.name
  const pmSlackId = programManagerName
    ? getTeamSlackId(programManagerName)
    : null

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/courses')}
        sx={{ mb: 3 }}
      >
        Volver a Cursos
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
            color: 'primary.main',
          }}
        />
        <Typography variant="h4" gutterBottom>
          {(
            cohort.properties?.Cohort?.title?.[0]?.plain_text ||
            'Cohorte sin nombre'
          )
            .replaceAll('-', ' ')
            .toUpperCase()}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={getStageLabel(cohort.properties?.Status?.select?.name)}
            color={getStageColor(cohort.properties?.Status?.select?.name)}
          />
          <Chip
            label={cohort.properties?.Program?.select?.name || 'Sin programa'}
            color="primary"
            variant="outlined"
          />
          {cohort.properties?.['Projects in review']?.number > 20 && (
            <Chip
              label={`${cohort.properties['Projects in review'].number} proyectos pendientes`}
              color="warning"
              variant="outlined"
              icon={<WarningIcon />}
            />
          )}
          {cohort.properties?.Status?.select?.name === 'Final Project' && (
            <Chip
              label="Recordar completar la revisión de habilidades antes de finalizar"
              color="warning"
              variant="outlined"
              icon={<WarningIcon />}
            />
          )}
        </Box>

        <Grid container spacing={8} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Fechas Importantes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Inicio Prework:</strong>{' '}
                {formatDate(
                  cohort.properties?.['Start date (prework)']?.date?.start
                )}
              </Typography>
              <Typography variant="body2">
                <strong>Inicio Contenido:</strong>{' '}
                {formatDate(
                  cohort.properties?.['Start Date (content)']?.date?.start
                )}
              </Typography>
              <Typography variant="body2">
                <strong>Finaliza:</strong>{' '}
                {formatDate(
                  cohort.properties?.['End Date (course)']?.date?.start
                )}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Personal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Program Manager:</strong>{' '}
                {programManagerName ? (
                  <Tooltip title="Ir a Slack">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        window.open(
                          `slack://user?team=T0BFXMWMV&id=${pmSlackId}`,
                          '_blank'
                        )
                      }}
                      sx={{ ml: 1 }}
                    >
                      {programManagerName}
                    </Button>
                  </Tooltip>
                ) : (
                  'No asignado'
                )}
              </Typography>
              <Typography variant="body2">
                <strong>Teacher:</strong>{' '}
                {cohort.properties?.Teacher?.relation?.[0]?.name ||
                  'No asignado'}
              </Typography>
              <Typography variant="body2">
                <strong>Teaching Assistant:</strong>{' '}
                {cohort.properties?.['T.A.']?.relation?.[0]?.name ||
                  'No asignado'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Estadísticas
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>Estudiantes Activos:</strong>{' '}
                {cohort.properties?.['Active (#)']?.rollup?.number || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Proyectos en Revisión:</strong>{' '}
                {cohort.properties?.['Projects in review']?.number || 0}
              </Typography>
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
          <Button variant="outlined" onClick={handleSkillReviewClick}>
            Revisión de Habilidades
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="center">Slack</TableCell>
                {!isPrework && (
                  <>
                    <TableCell align="center">Proyectos Pendientes</TableCell>
                    <TableCell align="center">% Proyectos pendientes</TableCell>
                    <TableCell align="center">Inasistencias</TableCell>
                    <TableCell align="center">% Inasistencias</TableCell>
                  </>
                )}
                {isPrework && (
                  <>
                    <TableCell align="center">Estado de Prework</TableCell>
                    <TableCell align="center"># Días en estado</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortStudentsByPreworkStatus(students).map((student, index) => {
                // Helpers para color de %
                const percentProjects =
                  student.properties?.['% Projects undelivered']?.formula
                    ?.number
                let colorProjects = 'default'
                if (typeof percentProjects === 'number') {
                  if (percentProjects >= 30) colorProjects = 'error'
                  else if (percentProjects >= 20) colorProjects = 'warning'
                  else if (percentProjects >= 10) colorProjects = 'tertiary'
                  else if (percentProjects > 0) colorProjects = 'success'
                  else colorProjects = 'default'
                }
                const percentAbsences =
                  student.properties?.['% Absences']?.formula?.number
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
                    key={student.id}
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
                          {renderNumber(student.basicInfo?.absences || 0)}
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
                              student.properties?.['Prework Status']?.select
                                ?.name || 'No definido'
                            }
                            color={getPreworkStatusColor(
                              student.properties?.['Prework Status']?.select
                                ?.name
                            )}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {renderDaysInPrework(
                            student.properties?.['Days in prework status']
                              ?.formula?.number || 0
                          )}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <StudentDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        student={selectedStudent}
        isPrework={isPrework}
      />
    </Container>
  )
}
