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
  IconButton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
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
  const [localChanges, setLocalChanges] = useState({})

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

  const handleRatingChange = (studentId, propertyName, value) => {
    if (value === '' || /^\d*$/.test(value)) {
      setLocalChanges((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [propertyName]: value,
        },
      }))
    }
  }

  const handleCheckboxChange = (studentId, propertyName, checked) => {
    setLocalChanges((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [propertyName]: checked,
      },
    }))
  }

  const handleSpecialtiesChange = (studentId, value) => {
    setLocalChanges((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        technicalSpecialties: value,
      },
    }))
  }

  const handleSkillBlur = (studentId, propertyName, value) => {
    let numericValue = value === '' ? 0 : parseInt(value)
    if (isNaN(numericValue)) numericValue = 0
    if (numericValue < 0) numericValue = 0
    if (numericValue > 5) numericValue = 5

    setLocalChanges((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [propertyName]: numericValue,
      },
    }))
  }

  const handleSaveRow = async (studentId) => {
    if (!localChanges[studentId]) return

    setSavingStatus((prev) => ({ ...prev, [studentId]: true }))
    const changesToSave = { ...localChanges[studentId] }

    try {
      // Preparar el array de propiedades para la actualización
      const propertiesToUpdate = []

      // Procesar las propiedades de skill review
      skillReviewProperties.forEach((prop) => {
        const propertyKey = generatePropertyKey(prop)
        if (changesToSave[propertyKey] !== undefined) {
          propertiesToUpdate.push({
            propertyName: prop,
            propertyValue: changesToSave[propertyKey],
          })
        }
      })

      // Procesar las especialidades técnicas
      if (changesToSave.technicalSpecialties !== undefined) {
        propertiesToUpdate.push({
          propertyName: 'Technical specialties',
          propertyValue: changesToSave.technicalSpecialties.map((name) => ({
            name,
          })),
        })
      }

      // Procesar el checkbox de recomendado TA
      if (changesToSave.recomendadoTA !== undefined) {
        propertiesToUpdate.push({
          propertyName: 'Recomendado para TA',
          propertyValue: changesToSave.recomendadoTA,
        })
      }

      // Realizar una única llamada con todas las propiedades
      await updateStudentProperty(studentId, propertiesToUpdate)

      // Actualizar el estado local
      setStudents((prevStudents) =>
        prevStudents.map((student) => {
          if (student.id === studentId) {
            const updatedStudent = { ...student, ...changesToSave }
            if (
              updatedStudent.technicalSpecialties &&
              Array.isArray(updatedStudent.technicalSpecialties)
            ) {
              updatedStudent.technicalSpecialties =
                updatedStudent.technicalSpecialties.map(
                  (item) => item.name || item
                )
            }
            return updatedStudent
          }
          return student
        })
      )

      // Limpiar los cambios locales después de guardar exitosamente
      setLocalChanges((prev) => {
        const newChanges = { ...prev }
        delete newChanges[studentId]
        return newChanges
      })
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

  // const isSavingAny = Object.keys(savingStatus).length > 0

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/cohort/${cohortId}`)}
        sx={{ mb: 3 }}
      >
        Volver a la Cohorte
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Revisión de Habilidades
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Los cambios se guardan automáticamente. Puedes usar la tecla TAB para
        navegar entre las columnas.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!loading && !cohort && (
        <Alert severity="warning">
          No se encontró información de la cohorte o estudiantes.
        </Alert>
      )}

      {!loading && cohort && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cohorte:{' '}
            {cohort.properties?.Cohort?.title?.[0]?.plain_text || 'Sin nombre'}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Estudiante</TableCell>
                  {skillReviewProperties.map((prop) => (
                    <TableCell key={prop} align="center">
                      {prop.replace(' (Skill review)', '')}
                    </TableCell>
                  ))}
                  <TableCell align="center">Especialidades Técnicas</TableCell>
                  <TableCell align="center">Recomendado TA</TableCell>
                  <TableCell align="center">Rank</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'medium', color: 'primary.main' }}
                        >
                          {student.name}
                        </Typography>
                        {savingStatus[student.id] && (
                          <CircularProgress size={16} />
                        )}
                        {Object.keys(localChanges[student.id] || {}).length >
                          0 && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSaveRow(student.id)}
                            disabled={!!savingStatus[student.id]}
                          >
                            <SaveIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    {skillReviewProperties.map((prop) => {
                      const propertyKey = generatePropertyKey(prop)
                      const currentValue =
                        localChanges[student.id]?.[propertyKey] ??
                        student[propertyKey]

                      return (
                        <TableCell key={propertyKey} align="center">
                          {prop.includes('(Skill review)') && (
                            <TextField
                              type="number"
                              value={currentValue}
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
                        value={
                          localChanges[student.id]?.technicalSpecialties ??
                          student.technicalSpecialties
                        }
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
                        checked={
                          localChanges[student.id]?.recomendadoTA ??
                          student.recomendadoTA
                        }
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  )
}
