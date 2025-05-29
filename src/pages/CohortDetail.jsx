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
import axios from 'axios'
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
} from '../utils/cohortHelpers'

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
      if (!updateQueue[studentId]) return

      try {
        setSavingAbsences((prev) => ({ ...prev, [studentId]: true }))
        const value = updateQueue[studentId]

        await axios.put('http://localhost:5000/api/update-student-property', {
          studentId,
          propertyName: 'Absences',
          propertyValue: value,
        })

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
    // Actualizar tanto editingAbsences como el estado local inmediatamente
    setEditingAbsences((prev) => ({
      ...prev,
      [studentId]: value,
    }))

    // Actualizar el estado local inmediatamente para reflejar el cambio
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

    debouncedUpdate(studentId, value)
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

  const parseStudentData = (zapierData) => {
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
        const studentPromises = studentsData.map((student) =>
          getStudentInfo(student.notion_id)
        )

        // Obtener información de los profesores
        const teacherId = cohortData.properties?.Teacher?.relation?.[0]?.id
        const taIds =
          cohortData.properties?.['T.A.']?.relation?.map((ta) => ta.id) || []

        const [studentsInfo, teacherInfo, ...taInfos] = await Promise.all([
          Promise.all(studentPromises),
          teacherId ? getStudentInfo(teacherId) : null,
          ...taIds.map((taId) => getStudentInfo(taId)),
        ])

        // Combinar la información básica con la detallada
        const combinedStudents = studentsInfo.map((info, index) => ({
          ...info,
          basicInfo: studentsData[index],
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

  const isStudentActive = (student) => {
    const status =
      student.properties?.['Educational Status']?.select?.name?.toLowerCase() ||
      ''
    return !['dropped', 'early dropped'].includes(status)
  }

  const renderNumber = (number) => {
    if (number <= 3) {
      return (
        <Typography color="success.main" sx={{ fontWeight: 'thin' }}>
          {number}
        </Typography>
      )
    }
    return (
      <Chip
        label={number}
        color={getNumberColor(number)}
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
                {cohort.properties?.['Program Manager']?.select?.name ||
                  'No asignado'}
              </Typography>
              <Typography variant="body2">
                <strong>Teacher:</strong>{' '}
                {cohort.properties?.Teacher?.relation?.[0]?.name ||
                  'No asignado'}
              </Typography>
              <Typography variant="body2">
                <strong>Teaching Assistant:</strong>{' '}
                {cohort.properties?.['T.A.']?.relation?.length > 0 ? (
                  <Tooltip
                    title={
                      <Box sx={{ p: 1 }}>
                        {cohort.properties?.['T.A.']?.relation?.map(
                          (ta, index) => (
                            <Typography key={ta.id} variant="body2">
                              {index + 1}. {ta.name}
                            </Typography>
                          )
                        )}
                      </Box>
                    }
                    arrow
                  >
                    <Box component="span" sx={{ cursor: 'help' }}>
                      {cohort.properties?.['T.A.']?.relation
                        ?.slice(0, 2)
                        .map((ta) => ta.name)
                        .join(', ')}
                      {cohort.properties?.['T.A.']?.relation?.length > 2 &&
                        '...'}
                    </Box>
                  </Tooltip>
                ) : (
                  'No asignado'
                )}
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

        <Typography variant="h5" gutterBottom>
          Estudiantes
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Slack ID</TableCell>
                {!isPrework && <TableCell>Proyectos Pendientes</TableCell>}
                {isPrework && (
                  <>
                    <TableCell>Prework Status</TableCell>
                    <TableCell>Days in PW Status</TableCell>
                  </>
                )}
                <TableCell>Inasistencias</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortStudentsByPreworkStatus(
                students.filter(isStudentActive)
              ).map((student, index) => (
                <TableRow
                  key={student.id}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  <TableCell>
                    {student.basicInfo?.full_name || 'Sin nombre'}
                  </TableCell>
                  <TableCell>
                    {student.basicInfo?.slack_id || 'Sin Slack ID'}
                  </TableCell>
                  {!isPrework && (
                    <TableCell>
                      {renderNumber(student.basicInfo?.pending_projects || 0)}
                    </TableCell>
                  )}
                  {isPrework && (
                    <>
                      <TableCell>
                        <Chip
                          label={
                            student.properties?.['Prework Status']?.select
                              ?.name || 'No definido'
                          }
                          color={getPreworkStatusColor(
                            student.properties?.['Prework Status']?.select?.name
                          )}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {renderDaysInPrework(
                          student.properties?.['Days in prework status']
                            ?.formula?.number || 0
                        )}
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    {isPrework ? (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <TextField
                          type="number"
                          size="small"
                          value={
                            editingAbsences[student.id] ??
                            student.basicInfo?.absences ??
                            0
                          }
                          onChange={(e) =>
                            handleAbsencesChange(
                              student.id,
                              parseInt(e.target.value)
                            )
                          }
                          disabled={savingAbsences[student.id]}
                          sx={{ width: '80px' }}
                        />
                        {savingAbsences[student.id] && (
                          <CircularProgress size={20} />
                        )}
                      </Box>
                    ) : (
                      renderNumber(student.basicInfo?.absences || 0)
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        student.properties?.['Educational Status']?.select?.name
                      }
                      color={
                        notionToMuiColor[
                          student.properties?.['Educational Status']?.select
                            ?.color
                        ]
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}
