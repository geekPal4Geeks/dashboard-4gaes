import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Stack,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import {
  findStudentByEmail,
  updateStudentComment,
  cancelStudentMentorship,
  updateStudentProperty,
} from '../services/studentService'
import { getCohortPageById } from '../services/notionService'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { useNavigate } from 'react-router-dom'

// Motivos de reprogramación
const cancellationReasons = [
  'Reprograma',
  'No asistió a la mentoría (no notifica)',
  'No puede concurrir (notifica)',
  'No necesita mentoría',
  'No especifica',
  'Cancelada por mentor/a',
  'Otro',
]

export default function Mentorships() {
  const { store } = useGlobalReducer()
  const [email, setEmail] = useState('')
  const [student, setStudent] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [mentorshipHeld, setMentorshipHeld] = useState(null)
  const [cancellationReason, setCancellationReason] = useState('')

  // Helper function to format date for datetime-local input
  const formatLocalDateTime = (date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [cancellationDate, setCancellationDate] = useState(
    formatLocalDateTime(new Date())
  )
  const [originalMentorshipDate, setOriginalMentorshipDate] = useState(
    formatLocalDateTime(new Date())
  )
  const [supliedWithOtherStudent, setSupliedWithOtherStudent] = useState(false)
  const [cancellationNotes, setCancellationNotes] = useState('')
  const [cohortInfo, setCohortInfo] = useState(null)
  const [mentorInfo, setMentorInfo] = useState(null)
  const [taInfo, setTaInfo] = useState(null)
  const navigate = useNavigate()

  // Nuevos estados para el control de la fase del formulario
  const [formPhase, setFormPhase] = useState('selection')

  // Estados para el tipo y estado de registro - inicializados con valores por defecto
  const [sessionStatus, setSessionStatus] = useState('realizada')
  const [sessionType, setSessionType] = useState('mentorship')
  const [mockInterviewResult, setMockInterviewResult] = useState('')

  // Función para volver a la selección inicial y limpiar estados
  const handleBack = () => {
    setFormPhase('selection')
    setSessionStatus('realizada')
    setSessionType(null)
    setEmail('') // Limpiar el correo para una nueva búsqueda
    setStudent(null) // Limpiar el estudiante
    setError(null) // Limpiar cualquier error
    setFeedback('') // Limpiar feedback
    setShowQuestion(false) // Ocultar pregunta de mentoría (si aplica)
    setMentorshipHeld(null) // Resetear estado de mentoría
    setCancellationReason('') // Limpiar motivo de cancelación
    setCancellationNotes('') // Limpiar notas de cancelación
    setSupliedWithOtherStudent(false) // Resetear suplida con otro estudiante
    setCohortInfo(null) // Limpiar info de cohorte
    setMentorInfo(null) // Limpiar info de mentor
    setTaInfo(null) // Limpiar info de TA
    setCancellationDate(formatLocalDateTime(new Date())) // Resetear fecha de cancelación
    setOriginalMentorshipDate(formatLocalDateTime(new Date())) // Resetear fecha de mentoría original
    setMockInterviewResult('') // Limpiar resultado de mock interview
  }

  // Redirección si no hay token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  const handleSearch = async () => {
    if (!email) {
      setError('Por favor, ingrese un correo electrónico.')
      return
    }
    setLoading(true)
    setError(null)
    setStudent(null)
    setFeedback('')
    setShowQuestion(false)
    setMentorshipHeld(null)
    setCancellationReason('') // Limpiar al buscar nuevo estudiante
    setCancellationNotes('') // Limpiar al buscar nuevo estudiante
    setSupliedWithOtherStudent(false) // Limpiar al buscar nuevo estudiante
    setCohortInfo(null) // Limpiar info anterior
    setMentorInfo(null) // Limpiar info anterior
    setTaInfo(null) // Limpiar info anterior

    try {
      const foundStudent = await findStudentByEmail(email)
      if (foundStudent) {
        setStudent(foundStudent)
        setFormPhase('detail')
        if (sessionType === 'mentorship') {
          setMentorshipHeld(true)
          setShowQuestion(false)
        } else {
          setMentorshipHeld(null)
          setShowQuestion(false)
        }

        // Obtener información de la cohorte si está disponible
        if (foundStudent.properties?.['Cohort']?.relation?.length > 0) {
          const cohortId = foundStudent.properties['Cohort'].relation[0].id

          try {
            const cohortDetails = await getCohortPageById(cohortId)
            setCohortInfo(cohortDetails)

            const teacherRelation = cohortDetails.properties?.[
              'Teacher / TA'
            ]?.relation.find((person) => person.object === 'user')
            const taRelation = cohortDetails.properties?.[
              'Teacher / TA'
            ]?.relation.find(
              (person) =>
                person.object === 'user' && person.id !== teacherRelation?.id
            )

            if (teacherRelation) {
              // Para obtener el nombre y slack, probablemente necesites otra llamada API con el teacherRelation.id
              // O la información ya viene anidada en cohortDetails.properties?.['Teacher / TA']
              // Por ahora, usaremos placeholders. Deberás reemplazar esto con la forma correcta de acceder.
              setMentorInfo({
                name: teacherRelation.id, // Reemplazar con el nombre real
                slack: 'Slack Mentor N/A', // Reemplazar con el Slack ID real
              })
            }

            if (taRelation) {
              // Similar al mentor, necesitas obtener el nombre y slack real
              setTaInfo({
                name: taRelation.id, // Reemplazar con el nombre real
                slack: 'Slack TA N/A', // Reemplazar con el Slack ID real
              })
            }
          } catch (cohortError) {
            console.error('Error fetching cohort info:', cohortError)
            // No bloqueamos la búsqueda si falla la info de la cohorte
          }
        }
      } else {
        setError('Estudiante no encontrado.')
      }
    } catch (err) {
      console.error('Error searching student:', err)
      setError('Error al buscar estudiante.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFeedback = async () => {
    if (!student) {
      setError('No hay estudiante seleccionado para guardar feedback.')
      return
    }

    if (sessionType === 'mock_interview') {
      if (!mockInterviewResult) {
        setError('Por favor, seleccione un resultado para la Mock Interview.')
        return
      }
      if (!feedback.trim()) {
        setError('Por favor, ingrese el feedback de la Mock Interview.')
        return
      }
    } else {
      if (!feedback.trim()) {
        setError('Por favor, ingrese el feedback.')
        return
      }
    }

    setSaving(true)
    setError(null)
    try {
      let commentToSave = feedback

      const propertiesToUpdate = []

      if (sessionType === 'mock_interview') {
        // Agregamos el ícono según el resultado
        const icon = mockInterviewResult === 'Aprueba' ? '🟢' : '🔵'
        commentToSave = `${icon} ${mockInterviewResult} Mock Interview\n${feedback}`

        // Obtenemos los valores actuales directamente del estudiante
        const currentSessions =
          student.properties['GeekFORCE Sessions']?.multi_select || []
        const currentStage =
          student.properties['GeekFORCE Stage']?.status?.name || ''

        // Verificamos si ya tiene la etiqueta "Behavioral interview"
        const hasBehavioralInterview = currentSessions.some(
          (session) => session.name === 'Behavioral interview'
        )

        // Si aprueba y cumple las condiciones para actualizar el Stage
        if (
          mockInterviewResult === 'Aprueba' &&
          hasBehavioralInterview &&
          currentStage === 'Stage 2'
        ) {
          propertiesToUpdate.push({
            propertyName: 'GeekFORCE Stage',
            propertyValue: 'Stage 3',
          })
        }

        // Agregamos la etiqueta "Technical interview" si no existe
        if (
          !currentSessions.some(
            (session) => session.name === 'Technical interview'
          )
        ) {
          const updatedSessions = [
            ...currentSessions,
            { name: 'Technical interview' },
          ]

          propertiesToUpdate.push({
            propertyName: 'GeekFORCE Sessions',
            propertyValue: updatedSessions,
          })
        }
      }

      // Si hay propiedades para actualizar, las enviamos al backend
      if (propertiesToUpdate.length > 0) {
        try {
          // Modificación: Iterar y llamar a updateStudentProperty para cada propiedad
          for (const propUpdate of propertiesToUpdate) {
            await updateStudentProperty(
              student.id,
              propUpdate.propertyName,
              propUpdate.propertyValue
            )
          }
        } catch (notionError) {
          console.error('Error al actualizar Notion:', notionError)
          // No bloqueamos el guardado del feedback si falla la actualización en Notion
        }
      }

      await updateStudentComment(student.id, commentToSave, store.userName)
      setFeedback('')
      setMockInterviewResult('')
      setError('Feedback guardado con éxito.')
      setTimeout(() => setError(null), 3000)
    } catch (err) {
      console.error('Error saving feedback:', err)
      setError('Error al guardar feedback.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancellationReasonChange = (event) => {
    setCancellationReason(event.target.value)
  }

  const handleCancellationDateChange = (event) => {
    setCancellationDate(event.target.value)
  }

  const handleOriginalMentorshipDateChange = (event) => {
    setOriginalMentorshipDate(event.target.value)
  }

  const handleSupliedWithOtherStudentChange = (event) => {
    setSupliedWithOtherStudent(event.target.checked)
  }

  const handleCancellationNotesChange = (event) => {
    setCancellationNotes(event.target.value)
  }

  const handleCancelMentorship = async () => {
    if (!student) {
      setError('No hay estudiante seleccionado para registrar cancelación.')
      return
    }
    if (!cancellationDate || !originalMentorshipDate || !cancellationReason) {
      setError(
        'Por favor, complete todos los campos requeridos para la cancelación.'
      )
      return
    }

    setSaving(true)
    setError(null)
    try {
      await cancelStudentMentorship(
        cancellationDate,
        cancellationNotes,
        cancellationReason,
        store.userName,
        originalMentorshipDate,
        student.id,
        supliedWithOtherStudent,
        sessionType
      )

      setError('Cancelación registrada con éxito.')
      // Opcional: Limpiar campos y resetear estados relevantes
      setCancellationDate(formatLocalDateTime(new Date()))
      setOriginalMentorshipDate(formatLocalDateTime(new Date()))
      setCancellationReason('')
      setSupliedWithOtherStudent(false)
      setCancellationNotes('')
      setTimeout(() => setError(null), 3000)
    } catch (err) {
      console.error('Error registrando cancelación:', err)
      setError('Error al registrar cancelación.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelMockInterview = async () => {
    if (!student) {
      setError(
        'No hay estudiante seleccionado para registrar cancelación de Mock Interview.'
      )
      return
    }
    if (!cancellationDate || !originalMentorshipDate || !cancellationReason) {
      setError(
        'Por favor, complete todos los campos requeridos para la cancelación de Mock Interview.'
      )
      return
    }

    setSaving(true)
    setError(null)
    try {
      const mockInterviewComment = `Cancelación Mock Interview:
Motivo: ${cancellationReason}
Notas: ${cancellationNotes.trim()}`

      // Determinar el ícono basado en el motivo de cancelación
      const cancellationIcon = cancellationReason === 'Reprograma' ? '🟠' : '🔴'

      // Prepend el ícono al comentario
      const finalMockInterviewComment = `${cancellationIcon} ${mockInterviewComment}`

      // Solo enviar notificación si el motivo no es "Reprogramo"
      const shouldNotify = cancellationReason !== 'Reprograma'
      const slackId =
        student.properties?.['Slack ID']?.rich_text?.[0]?.plain_text || ''
      const coachName =
        student.properties?.['GeekFORCE Coach']?.select?.name ||
        'Coach de Carreras'

      await updateStudentComment(
        student.id,
        finalMockInterviewComment,
        store.userName,
        shouldNotify
          ? {
              slackId,
              coachName,
              type: 'mock_interview_cancellation',
            }
          : null
      )

      // Llamar a cancelStudentMentorship para registrar la cancelación en la base de datos
      await cancelStudentMentorship(
        cancellationDate,
        cancellationNotes,
        cancellationReason,
        store.userName,
        originalMentorshipDate,
        student.id,
        supliedWithOtherStudent,
        sessionType
      )

      setError('Cancelación de Mock Interview registrada con éxito.')
      // Opcional: Limpiar campos y resetear estados relevantes
      setCancellationDate(formatLocalDateTime(new Date()))
      setOriginalMentorshipDate(formatLocalDateTime(new Date()))
      setCancellationReason('')
      setSupliedWithOtherStudent(false)
      setCancellationNotes('')
      setTimeout(() => setError(null), 3000)
    } catch (err) {
      console.error('Error registrando cancelación de Mock Interview:', err)
      setError('Error al registrar cancelación de Mock Interview.')
    } finally {
      setSaving(false)
    }
  }

  const handleMockInterviewResultChange = (event) => {
    setMockInterviewResult(event.target.value)
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '80vh',
          pt: 4,
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Registro de Actividad de Mentoría
        </Typography>

        {/* Botón de flecha hacia atrás: visible si no estamos en la fase de selección */}
        {formPhase !== 'selection' && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="outlined" onClick={handleBack}>
              <ArrowBackIcon />
            </Button>
          </Box>
        )}

        {/* --- Fase: Selección --- */}
        {formPhase === 'selection' && (
          <Paper sx={{ p: 3, width: '100%', mb: 3 }}>
            <Stack spacing={4} alignItems="center">
              <Typography variant="h6" gutterBottom align="center">
                ¿Quieres reportar una sesión realizada o una cancelada?
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <ToggleButtonGroup
                  value={sessionStatus}
                  exclusive
                  onChange={(_, newStatus) => {
                    if (newStatus !== null) {
                      setSessionStatus(newStatus)
                      setSessionType(null) // Resetear el tipo cuando cambia el estado
                    }
                  }}
                >
                  <ToggleButton value="realizada" color="success">
                    Realizada
                  </ToggleButton>
                  <ToggleButton value="cancelada" color="error">
                    Cancelada
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Typography variant="h6" gutterBottom align="center">
                ¿Qué tipo de sesión fue?
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <ToggleButtonGroup
                  value={sessionType}
                  exclusive
                  onChange={(_, newType) => {
                    if (newType !== null) {
                      setSessionType(newType)
                    }
                  }}
                >
                  <ToggleButton
                    value="mentorship"
                    disabled={!sessionStatus}
                    color="info"
                  >
                    Mentoría
                  </ToggleButton>
                  <ToggleButton
                    value="mock_interview"
                    disabled={!sessionStatus}
                    color="warning"
                  >
                    Mock Interview
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {sessionStatus && sessionType && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setFormPhase('search')}
                  sx={{ mt: 3 }}
                >
                  Continuar
                </Button>
              )}
            </Stack>
          </Paper>
        )}

        {/* --- Fase: Búsqueda --- */}
        {(formPhase === 'search' || formPhase === 'detail') && (
          <Paper sx={{ p: 3, width: '100%', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Buscar Estudiante por Correo Electrónico
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <TextField
                label="Correo Electrónico del Estudiante"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Buscar'}
              </Button>
            </Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Asegúrate de usar el correo registrado en la academia. Si no
              encuentras al alumno, comunícate con el staff.
            </Alert>
            {error && (
              <Alert severity={error.includes('éxito') ? 'success' : 'error'}>
                {error}
              </Alert>
            )}
          </Paper>
        )}

        {/* --- Fase: Detalle (Formularios) --- */}
        {formPhase === 'detail' && (
          <>
            {sessionStatus === 'realizada' && sessionType === 'mentorship' && (
              <>
                {/* Sección para Información del Estudiante y Feedback (si la mentoría se llevó a cabo) */}
                {mentorshipHeld === true && (
                  <>
                    <Paper
                      sx={{
                        p: 3,
                        width: '100%',
                        mb: 3,
                        border: '1px solid #ccc',
                        backgroundColor: '#f9f9f9',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Información del Estudiante
                      </Typography>
                      <Typography variant="body1">
                        <strong>Nombre:</strong>
                        {student?.properties?.['Student']?.title?.[0]
                          ?.plain_text ? (
                          <Chip
                            label={
                              student.properties['Student'].title[0].plain_text
                            }
                            variant="outlined"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Cohorte:</strong>{' '}
                        {student.properties?.['Cohort name for Zapier'].formula
                          ?.string ? (
                          <Chip
                            label={
                              student.properties?.['Cohort name for Zapier']
                                .formula?.string || 'N/A'
                            }
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </Typography>
                      {/* Mostrar información del Mentor y TA */}
                      {mentorInfo && (
                        <Typography variant="body1">
                          <strong>Mentor:</strong> {mentorInfo.name}{' '}
                          {mentorInfo.slack !== 'N/A'
                            ? `(${mentorInfo.slack})`
                            : ''}
                        </Typography>
                      )}
                      {taInfo && (
                        <Typography variant="body1">
                          <strong>TA:</strong> {taInfo.name}{' '}
                          {taInfo.slack !== 'N/A' ? `(${taInfo.slack})` : ''}
                        </Typography>
                      )}
                      <Typography variant="body1">
                        <strong>Program Manager:</strong>{' '}
                        {student.properties?.['Program Manager']?.rollup
                          ?.array?.[0] ? (
                          <Chip
                            label={
                              student.properties?.['Program Manager']?.rollup
                                ?.array?.[0]?.select?.name || 'N/A'
                            }
                            variant="contained"
                            color="default"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </Typography>
                    </Paper>

                    <Paper sx={{ p: 3, width: '100%' }}>
                      <Typography variant="h6" gutterBottom>
                        Dejar Feedback
                      </Typography>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          gutterBottom
                          sx={{ fontWeight: 'bold' }}
                        >
                          Estructura recomendada para el feedback:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          <Typography
                            component="li"
                            variant="body2"
                            sx={{ mb: 1 }}
                          >
                            <strong>Tema presentado:</strong> Describir el
                            problema o tema que el estudiante trajo a la
                            mentoría.
                          </Typography>
                          <Typography
                            component="li"
                            variant="body2"
                            sx={{ mb: 1 }}
                          >
                            <strong>Desarrollo:</strong> Explicar brevemente
                            cómo se abordó el tema y qué soluciones se
                            propusieron.
                          </Typography>
                          <Typography
                            component="li"
                            variant="body2"
                            sx={{ mb: 1 }}
                          >
                            <strong>Dificultades:</strong> Mencionar si el
                            estudiante presentó dificultades específicas y cómo
                            se manejaron.
                          </Typography>
                          <Typography
                            component="li"
                            variant="body2"
                            sx={{ mb: 1 }}
                          >
                            <strong>Resultado:</strong> Describir el resultado
                            final y si el estudiante logró resolver su problema.
                          </Typography>
                          <Typography component="li" variant="body2">
                            <strong>Recomendaciones:</strong> Sugerir próximos
                            pasos o recursos adicionales si es necesario.
                          </Typography>
                        </Box>
                      </Paper>

                      <TextField
                        label="Feedback de la Mentoría"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        disabled={saving}
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSaveFeedback}
                        disabled={saving}
                      >
                        {saving ? (
                          <CircularProgress size={24} />
                        ) : (
                          'Guardar Feedback'
                        )}
                      </Button>
                    </Paper>
                  </>
                )}
              </>
            )}

            {sessionStatus === 'cancelada' && sessionType === 'mentorship' && (
              <Paper sx={{ p: 3, width: '100%', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Registrar Mentoría Cancelada
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {/* Campo Estudiante (No editable) */}
                  <Typography variant="body1">
                    <strong>Estudiante:</strong>{' '}
                    {student?.properties?.['Student']?.title?.[0]?.plain_text ||
                      'N/A'}
                  </Typography>
                  {/* Campo Fecha y hora de cancelación */}
                  <TextField
                    label="Fecha y hora de cancelación"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={cancellationDate}
                    onChange={handleCancellationDateChange}
                  />
                  {/* Campo Fecha y hora de mentoría */}
                  <TextField
                    label="Fecha y hora de sesión original"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={originalMentorshipDate}
                    onChange={handleOriginalMentorshipDateChange}
                  />
                  {/* Campo Motivo de reprogramación */}
                  <TextField
                    select
                    label="Motivo de cancelación"
                    fullWidth
                    value={cancellationReason}
                    onChange={handleCancellationReasonChange}
                  >
                    {cancellationReasons.map((reason) => (
                      <MenuItem key={reason} value={reason}>
                        {reason}
                      </MenuItem>
                    ))}
                  </TextField>
                  {/* Checkbox para suplir hora */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={supliedWithOtherStudent}
                        onChange={handleSupliedWithOtherStudentChange}
                      />
                    }
                    label="¿Ha suplido con otro alumno la hora de sesión?"
                  />
                  {/* Campo Notas de Cancelación */}
                  <TextField
                    label="Notas sobre la cancelación"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={cancellationNotes}
                    onChange={handleCancellationNotesChange}
                    sx={{ mb: 2 }}
                  />
                  {/* Campo Mentor (Autocompletado) */}
                  {/*<Typography variant="body1">
                    <strong>Mentor:</strong> {store.userName || 'Cargando...'}{' '}
                  </Typography> */}
                </Box>

                {/* Botón para registrar cancelación */}
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCancelMentorship}
                  disabled={saving}
                >
                  {saving ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Registrar Cancelación'
                  )}
                </Button>
              </Paper>
            )}

            {sessionStatus === 'realizada' &&
              sessionType === 'mock_interview' && (
                <Paper sx={{ p: 3, width: '100%', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Registrar Mock Interview
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    {/* Información del estudiante */}
                    <Paper
                      sx={{
                        p: 3,
                        width: '100%',
                        mb: 3,
                        border: '1px solid #ccc',
                        backgroundColor: '#f9f9f9',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Información del Estudiante
                      </Typography>
                      <Typography variant="body1">
                        <strong>Nombre:</strong>
                        {student?.properties?.['Student']?.title?.[0]
                          ?.plain_text ? (
                          <Chip
                            label={
                              student.properties['Student'].title[0].plain_text
                            }
                            variant="outlined"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Cohorte:</strong>{' '}
                        {student.properties?.['Cohort name for Zapier'].formula
                          ?.string ? (
                          <Chip
                            label={
                              student.properties?.['Cohort name for Zapier']
                                .formula?.string || 'N/A'
                            }
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        ) : (
                          'N/A'
                        )}
                      </Typography>
                    </Paper>

                    {/* Resultado de la Mock Interview */}
                    <TextField
                      select
                      label="Resultado de la sesión"
                      fullWidth
                      value={mockInterviewResult}
                      onChange={handleMockInterviewResultChange}
                      required
                    >
                      <MenuItem value="Aprueba">Aprueba</MenuItem>
                      <MenuItem value="Repetir sesión">Repetir sesión</MenuItem>
                    </TextField>

                    {/* Feedback de la Mock Interview */}
                    <TextField
                      label="Feedback de la Mock Interview"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      disabled={saving}
                      sx={{ mb: 2 }}
                    />

                    {/* Botón para guardar */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSaveFeedback}
                      disabled={saving || !mockInterviewResult}
                    >
                      {saving ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Guardar Resultado'
                      )}
                    </Button>
                  </Box>
                </Paper>
              )}

            {sessionStatus === 'cancelada' &&
              sessionType === 'mock_interview' && (
                <Paper sx={{ p: 3, width: '100%', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Registrar Mock Interview Cancelada
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    {/* Campo Estudiante (No editable) */}
                    <Typography variant="body1">
                      <strong>Estudiante:</strong>{' '}
                      {student?.properties?.['Student']?.title?.[0]
                        ?.plain_text || 'N/A'}
                    </Typography>
                    {/* Campo Fecha y hora de cancelación */}
                    <TextField
                      label="Fecha y hora de cancelación"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={cancellationDate}
                      onChange={handleCancellationDateChange}
                    />
                    {/* Campo Fecha y hora de mentoría */}
                    <TextField
                      label="Fecha y hora de sesión original"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={originalMentorshipDate}
                      onChange={handleOriginalMentorshipDateChange}
                    />
                    {/* Campo Motivo de reprogramación */}
                    <TextField
                      select
                      label="Motivo de cancelación"
                      fullWidth
                      value={cancellationReason}
                      onChange={handleCancellationReasonChange}
                    >
                      {cancellationReasons.map((reason) => (
                        <MenuItem key={reason} value={reason}>
                          {reason}
                        </MenuItem>
                      ))}
                    </TextField>
                    {/* Campo Notas de Cancelación */}
                    <TextField
                      label="Notas sobre la cancelación de Mock Interview"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={3}
                      value={cancellationNotes}
                      onChange={handleCancellationNotesChange}
                      sx={{ mb: 2 }}
                    />
                    {/* Campo Mentor (Autocompletado) */}
                    {/*<Typography variant="body1">
                      <strong>Mentor:</strong> {store.userName || 'Cargando...'}{' '}
                    </Typography>*/}
                  </Box>

                  {/* Botón para registrar cancelación */}
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCancelMockInterview}
                    disabled={saving}
                  >
                    {saving ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Registrar Cancelación de Mock Interview'
                    )}
                  </Button>
                </Paper>
              )}
          </>
        )}
      </Box>
    </Container>
  )
}
