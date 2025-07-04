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
import Swal from 'sweetalert2'
import { parseCohortData, parseCurrentModuleLabel } from '../utils/studentHelpers'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { getTeamSlackId } from '../utils/cohortHelpers'
import GitHubIcon from '@mui/icons-material/GitHub'
import { StudentInfoBoxTrigger } from '../components/StudentInfoBox'

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
  const [copied, setCopied] = useState(false)

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
      const response = await findStudentByEmail(email)
      if (response && response.student && response.cohort) {
        setStudent(response.student)
        setCohortInfo(response.cohort)
        setFormPhase('detail')
        if (sessionType === 'mentorship') {
          setMentorshipHeld(true)
          setShowQuestion(false)
        } else {
          setMentorshipHeld(null)
          setShowQuestion(false)
        }
        // Puedes mantener aquí la lógica de mentor/TA si la necesitas, usando response.cohort
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
      // Mostrar SweetAlert y limpiar estados al volver al inicio
      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'La mentoría se registró correctamente.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
        timer: 2500,
        timerProgressBar: true,
      }).then(() => {
        handleBack()
        setFormPhase('selection')
      })
      return // <-- Evita que siga ejecutando código después del SweetAlert
    } catch (err) {
      console.error('Error saving feedback:', err)
      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Ha ocurrido un error al registrar el Feedback.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
        timer: 2500,
        timerProgressBar: true,
      }).then(() => {
        setFormPhase('selection')
      })
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
      // Mostrar SweetAlert y limpiar estados al volver al inicio
      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'La cancelación se registró correctamente.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
        timer: 2500,
        timerProgressBar: true,
      }).then(() => {
        handleBack()
        setFormPhase('selection')
      })
      return // <-- Evita que siga ejecutando código después del SweetAlert
    } catch (err) {
      console.error('Error registrando cancelación:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error registrando cancelación',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
        timer: 2500,
        timerProgressBar: true,
      }).then(() => {
        setFormPhase('selection')
      })
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

      Swal.fire({
        icon: 'success',
        title: '¡Registro exitoso!',
        text: 'Cancelación de Mock Interview registrada con éxito.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
        timer: 2500,
        timerProgressBar: true,
      }).then(() => {
        setFormPhase('selection')
      })
      return // <-- Evita que siga ejecutando código después del SweetAlert
    } catch (err) {
      console.error('Error registrando cancelación de Mock Interview:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error al registrar cancelación de Mock Interview.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
        timer: 2500,
        timerProgressBar: true,
      }).then(() => {
        setFormPhase('selection')
      })
    } finally {
      setSaving(false)
    }
  }

  const handleMockInterviewResultChange = (event) => {
    setMockInterviewResult(event.target.value)
  }

  console.log(mentorInfo)

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '80vh',
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
          <Paper sx={{ p: 2, width: '100%', mb: 1 }}>
             <Typography variant="h5" fontWeight={700} gutterBottom>
          Buscar estudiante
        </Typography>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            label="Correo electrónico"
            variant="outlined"
            size="small"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            fullWidth
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Buscar'}
          </Button>
        </Box>
            {!student && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Asegúrate de usar el correo registrado en la academia. Si no
                encuentras al alumno, comunícate con el staff.
              </Alert>
            )}
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
                    <Paper sx={{ p: 3, width: '100%' }}>
                      <Typography variant="h6" gutterBottom>
                        Dejar Feedback
                      </Typography>

                      <StudentInfoBoxTrigger student={student} cohortInfo={cohortInfo} />

                      <Paper
                        elevation={0}
                        sx={{
                          paddingY: 1,
                          mb: 2,
                          backgroundColor: '#fff',
                          borderRadius: 2,
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
                  
                  <StudentInfoBoxTrigger student={student} cohortInfo={cohortInfo} />

                  {/* Campo Fecha y hora de cancelación */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      mb: 2,
                    }}
                  >
                    <TextField
                      label="Fecha de cancelación"
                      type="date"
                      value={cancellationDate.split('T')[0]}
                      onChange={(e) =>
                        setCancellationDate(
                          e.target.value + 'T' + cancellationDate.split('T')[1]
                        )
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Hora de cancelación"
                      type="time"
                      value={cancellationDate.split('T')[1]}
                      onChange={(e) =>
                        setCancellationDate(
                          cancellationDate.split('T')[0] + 'T' + e.target.value
                        )
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Box>
                  {/* Campo Fecha y hora de mentoría */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      mb: 2,
                    }}
                  >
                    <TextField
                      label="Fecha de sesión original"
                      type="date"
                      value={originalMentorshipDate.split('T')[0]}
                      onChange={(e) =>
                        setOriginalMentorshipDate(
                          e.target.value +
                            'T' +
                            originalMentorshipDate.split('T')[1]
                        )
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Hora de sesión original"
                      type="time"
                      value={originalMentorshipDate.split('T')[1]}
                      onChange={(e) =>
                        setOriginalMentorshipDate(
                          originalMentorshipDate.split('T')[0] +
                            'T' +
                            e.target.value
                        )
                      }
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Box>
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
                <Paper sx={{ p: 3, width: '100%', mb: 4 }}>
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
                    <StudentInfoBoxTrigger student={student} cohortInfo={cohortInfo} />

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
                    <StudentInfoBoxTrigger student={student} cohortInfo={cohortInfo} />

                    {/* Campo Fecha y hora de cancelación */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' },
                        mb: 2,
                      }}
                    >
                      <TextField
                        label="Fecha de cancelación"
                        type="date"
                        value={cancellationDate.split('T')[0]}
                        onChange={(e) =>
                          setCancellationDate(
                            e.target.value +
                              'T' +
                              cancellationDate.split('T')[1]
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        label="Hora de cancelación"
                        type="time"
                        value={cancellationDate.split('T')[1]}
                        onChange={(e) =>
                          setCancellationDate(
                            cancellationDate.split('T')[0] +
                              'T' +
                              e.target.value
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Box>
                    {/* Campo Fecha y hora de mentoría */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' },
                        mb: 2,
                      }}
                    >
                      <TextField
                        label="Fecha de sesión original"
                        type="date"
                        value={originalMentorshipDate.split('T')[0]}
                        onChange={(e) =>
                          setOriginalMentorshipDate(
                            e.target.value +
                              'T' +
                              originalMentorshipDate.split('T')[1]
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        label="Hora de sesión original"
                        type="time"
                        value={originalMentorshipDate.split('T')[1]}
                        onChange={(e) =>
                          setOriginalMentorshipDate(
                            originalMentorshipDate.split('T')[0] +
                              'T' +
                              e.target.value
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Box>
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
