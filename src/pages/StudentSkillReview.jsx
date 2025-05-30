import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Checkbox,
  Select,
  MenuItem,
  Rating,
  OutlinedInput,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { getCohortNotionInfo, getStudentInfo } from '../services/notionService'
import { updateStudentProperty } from '../services/studentService'
import {
  parseStudentData,
  generatePropertyKey,
  technicalSpecialtiesOptions,
  skillReviewProperties,
} from '../utils/studentHelpers'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

export default function StudentSkillReview() {
  const { cohortId } = useParams()
  const navigate = useNavigate()
  const [cohort, setCohort] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingStatus, setSavingStatus] = useState({})
  const [pendingUpdatesQueue, setPendingUpdatesQueue] = useState({})
  const [pendingTimeouts, setPendingTimeouts] = useState({})
  const [localSkillValues, setLocalSkillValues] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cohortData = await getCohortNotionInfo(cohortId)
        setCohort(cohortData)

        const zapierData =
          cohortData.properties?.['Data for Zapier']?.formula?.string
        const studentsData = parseStudentData(zapierData)

        const studentPromises = studentsData.map((student) =>
          getStudentInfo(student.notion_id)
        )

        const studentsInfo = await Promise.all(studentPromises)

        const formattedStudents = studentsInfo.map((info, index) => ({
          id: info.id,
          name:
            info.properties?.['Student']?.title?.[0]?.plain_text ||
            'Sin nombre',

          [generatePropertyKey('Responsabilidad (Skill review)')]:
            info.properties?.['Responsabilidad (Skill review)']?.number || 0,
          [generatePropertyKey('Organización (Skill review)')]:
            info.properties?.['Organización (Skill review)']?.number || 0,
          [generatePropertyKey('Capacidad de atención (Skill review)')]:
            info.properties?.['Capacidad de atención (Skill review)']?.number ||
            0,
          [generatePropertyKey('Dominio de conceptos (Skill review)')]:
            info.properties?.['Dominio de conceptos (Skill review)']?.number ||
            0,
          [generatePropertyKey('Habilidad técnica (Skill review)')]:
            info.properties?.['Habilidad técnica (Skill review)']?.number || 0,
          [generatePropertyKey('Capacidad resolutiva (Skill review)')]:
            info.properties?.['Capacidad resolutiva (Skill review)']?.number ||
            0,
          [generatePropertyKey('Trabajo en equipo (Skill review)')]:
            info.properties?.['Trabajo en equipo (Skill review)']?.number || 0,
          technicalSpecialties:
            info.properties?.['Technical specialties']?.multi_select?.map(
              (item) => item.name
            ) || [],
          recomendadoTA:
            info.properties?.['Recomendado para TA']?.checkbox || false,
          studentRank:
            info.properties?.['Student Rank']?.formula?.string?.length || 0,
          basicInfo: studentsData[index],
        }))

        setStudents(formattedStudents)
      } catch (err) {
        setError('Error al cargar la información de la cohorte o estudiantes')
        console.error('Error completo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [cohortId])

  const processStudentUpdates = useCallback(
    async (studentId) => {
      if (!pendingUpdatesQueue[studentId]) return

      setSavingStatus((prev) => ({ ...prev, [studentId]: true }))
      const updatesToProcess = { ...pendingUpdatesQueue[studentId] }
      setPendingUpdatesQueue((prev) => {
        const newState = { ...prev }
        delete newState[studentId]
        return newState
      })

      try {
        const updatePromises = []
        for (const propertyKey in updatesToProcess) {
          let notionPropertyName = propertyKey
          const notionProp = skillReviewProperties.find(
            (prop) => generatePropertyKey(prop) === propertyKey
          )
          if (notionProp) {
            notionPropertyName = notionProp
          } else if (propertyKey === 'recomendadoTA') {
            notionPropertyName = 'Recomendado para TA'
          } else if (propertyKey === 'technicalSpecialties') {
            notionPropertyName = 'Technical specialties'
            updatesToProcess[propertyKey] = updatesToProcess[propertyKey].map(
              (name) => ({ name })
            )
          }

          updatePromises.push(
            updateStudentProperty(
              studentId,
              notionPropertyName,
              updatesToProcess[propertyKey]
            )
          )
        }

        await Promise.all(updatePromises)

        setStudents((prevStudents) =>
          prevStudents.map((student) => {
            if (student.id === studentId) {
              const updatedStudent = { ...student, ...updatesToProcess }
              if (
                updatedStudent.technicalSpecialties &&
                Array.isArray(updatedStudent.technicalSpecialties)
              ) {
                updatedStudent.technicalSpecialties =
                  updatedStudent.technicalSpecialties.map(
                    (item) => item.name || item
                  )
              }

              if (typeof updatedStudent.studentRank !== 'number') {
                updatedStudent.studentRank =
                  updatedStudent.studentRank?.length || 0
              }
              return updatedStudent
            }
            return student
          })
        )
      } catch (err) {
        console.error(
          `Error al guardar cambios para estudiante ${studentId}:`,
          err
        )
        setError('Error al guardar algunos cambios.')
      } finally {
        setSavingStatus((prev) => {
          const newState = { ...prev }
          delete newState[studentId]
          return newState
        })
      }
    },
    [pendingUpdatesQueue, skillReviewProperties]
  )

  const debouncedUpdateProperty = useCallback(
    (studentId, propertyKey, value) => {
      setPendingUpdatesQueue((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [propertyKey]: value,
        },
      }))

      if (pendingTimeouts[studentId]) {
        clearTimeout(pendingTimeouts[studentId])
      }

      const timeoutId = setTimeout(() => {
        processStudentUpdates(studentId)
      }, 1000)

      setPendingTimeouts((prev) => ({ ...prev, [studentId]: timeoutId }))
    },
    [pendingUpdatesQueue, pendingTimeouts, processStudentUpdates]
  )

  const handleRatingChange = (studentId, propertyName, value) => {
    if (value === '' || /^\d*$/.test(value)) {
      setLocalSkillValues((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [propertyName]: value,
        },
      }))
    }
  }

  const handleCheckboxChange = (studentId, propertyName, checked) => {
    debouncedUpdateProperty(studentId, propertyName, checked)
  }

  const handleSpecialtiesChange = (studentId, value) => {
    debouncedUpdateProperty(studentId, 'technicalSpecialties', value)
  }

  const handleSkillBlur = (studentId, propertyName, value) => {
    let numericValue = value === '' ? 0 : parseInt(value)
    if (isNaN(numericValue)) numericValue = 0
    if (numericValue < 0) numericValue = 0
    if (numericValue > 5) numericValue = 5

    setLocalSkillValues((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [propertyName]: numericValue,
      },
    }))

    debouncedUpdateProperty(studentId, propertyName, numericValue)
  }

  useEffect(() => {
    return () => {
      Object.values(pendingTimeouts).forEach((timeoutId) =>
        clearTimeout(timeoutId)
      )
    }
  }, [pendingTimeouts])

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

  if (error && !Object.keys(savingStatus).length) {
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

  const isSavingAny = Object.keys(savingStatus).length > 0

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/cohort/${cohortId}`)}
        sx={{ mb: 3 }}
      >
        Volver a Detalles de Cohorte
      </Button>

      <Typography variant="h4" gutterBottom>
        Revisión de Habilidades de Estudiantes -{' '}
        {cohort.properties?.Cohort?.title?.[0]?.plain_text || 'Sin nombre'}
      </Typography>

      {isSavingAny && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography>Guardando cambios...</Typography>
        </Box>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200 }}>Nombre</TableCell>
                {skillReviewProperties.map((prop) => (
                  <TableCell key={prop} align="center">
                    {prop.replace(' (Skill review)', '') + ''}
                  </TableCell>
                ))}
                <TableCell align="center">Technical specialties</TableCell>
                <TableCell align="center">Recomendado para TA</TableCell>
                <TableCell align="center">Student Rank</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => {
                const studentId = student.id
                const currentResponsabilidad =
                  pendingUpdatesQueue[studentId]?.[
                    generatePropertyKey('Responsabilidad (Skill review)')
                  ] ??
                  student[generatePropertyKey('Responsabilidad (Skill review)')]
                const currentOrganizacion =
                  pendingUpdatesQueue[studentId]?.[
                    generatePropertyKey('Organización (Skill review)')
                  ] ??
                  student[generatePropertyKey('Organización (Skill review)')]
                const currentCapacidadAtencion =
                  pendingUpdatesQueue[studentId]?.[
                    generatePropertyKey('Capacidad de atención (Skill review)')
                  ] ??
                  student[
                    generatePropertyKey('Capacidad de atención (Skill review)')
                  ]
                const currentDominioConceptos =
                  pendingUpdatesQueue[studentId]?.[
                    generatePropertyKey('Dominio de conceptos (Skill review)')
                  ] ??
                  student[
                    generatePropertyKey('Dominio de conceptos (Skill review)')
                  ]
                const currentHabilidadTecnica =
                  pendingUpdatesQueue[studentId]?.[
                    generatePropertyKey('Habilidad técnica (Skill review)')
                  ] ??
                  student[
                    generatePropertyKey('Habilidad técnica (Skill review)')
                  ]
                const currentCapacidadResolutiva =
                  pendingUpdatesQueue[studentId]?.[
                    generatePropertyKey('Capacidad resolutiva (Skill review)')
                  ] ??
                  student[
                    generatePropertyKey('Capacidad resolutiva (Skill review)')
                  ]
                const currentTrabajoEquipo =
                  pendingUpdatesQueue[studentId]?.[
                    generatePropertyKey('Trabajo en equipo (Skill review)')
                  ] ??
                  student[
                    generatePropertyKey('Trabajo en equipo (Skill review)')
                  ]
                const currentSpecialties =
                  pendingUpdatesQueue[studentId]?.technicalSpecialties ??
                  student.technicalSpecialties
                const currentRecomendadoTA =
                  pendingUpdatesQueue[studentId]?.recomendadoTA ??
                  student.recomendadoTA

                const currentValues = {
                  [generatePropertyKey('Responsabilidad (Skill review)')]:
                    currentResponsabilidad,
                  [generatePropertyKey('Organización (Skill review)')]:
                    currentOrganizacion,
                  [generatePropertyKey('Capacidad de atención (Skill review)')]:
                    currentCapacidadAtencion,
                  [generatePropertyKey('Dominio de conceptos (Skill review)')]:
                    currentDominioConceptos,
                  [generatePropertyKey('Habilidad técnica (Skill review)')]:
                    currentHabilidadTecnica,
                  [generatePropertyKey('Capacidad resolutiva (Skill review)')]:
                    currentCapacidadResolutiva,
                  [generatePropertyKey('Trabajo en equipo (Skill review)')]:
                    currentTrabajoEquipo,
                }

                return (
                  <TableRow key={student.id}>
                    <TableCell sx={{ minWidth: 200 }}>{student.name}</TableCell>
                    {skillReviewProperties.map((propName) => {
                      const propertyKey = generatePropertyKey(propName)
                      const currentValue = currentValues[propertyKey]

                      return (
                        <TableCell key={propertyKey} align="center">
                          {propName.includes('(Skill review)') && (
                            <TextField
                              type="number"
                              value={
                                localSkillValues[student.id]?.[propertyKey] ??
                                currentValue
                              }
                              onChange={(e) =>
                                handleRatingChange(
                                  student.id,
                                  propertyKey,
                                  e.target.value
                                )
                              }
                              onBlur={(e) =>
                                handleSkillBlur(
                                  student.id,
                                  propertyKey,
                                  e.target.value
                                )
                              }
                              inputProps={{
                                min: 0,
                                max: 5,
                                inputMode: 'numeric',
                                style: {
                                  '-moz-appearance': 'textfield',
                                  '&::-webkit-outer-spin-button': {
                                    '-webkit-appearance': 'none',
                                    margin: 0,
                                  },
                                  '&::-webkit-inner-spin-button': {
                                    '-webkit-appearance': 'none',
                                    margin: 0,
                                  },
                                },
                              }}
                              sx={{
                                width: 60,
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                                  {
                                    '-webkit-appearance': 'none',
                                    margin: 0,
                                  },
                                '& input[type=number]': {
                                  '-moz-appearance': 'textfield',
                                },
                              }}
                              disabled={!!savingStatus[student.id]}
                            />
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell align="center">
                      <Select
                        multiple
                        value={currentSpecialties}
                        onChange={(e) =>
                          handleSpecialtiesChange(student.id, e.target.value)
                        }
                        input={
                          <OutlinedInput
                            size="small"
                            placeholder="Seleccionar"
                          />
                        }
                        MenuProps={MenuProps}
                        sx={{ minWidth: 150, maxWidth: 250 }}
                        disabled={!!savingStatus[student.id]}
                      >
                        {technicalSpecialtiesOptions.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={currentRecomendadoTA}
                        onChange={(e) =>
                          handleCheckboxChange(
                            student.id,
                            'recomendadoTA',
                            e.target.checked
                          )
                        }
                        disabled={!!savingStatus[student.id]}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Rating
                        name="read-only"
                        value={student.studentRank}
                        readOnly
                        max={5}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}
