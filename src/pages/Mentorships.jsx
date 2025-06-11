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
} from '@mui/material'
import {
  findStudentByEmail,
  updateStudentComment,
  cancelStudentMentorship,
} from '../services/studentService'
import { getCohortNotionInfo } from '../services/notionService'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { useNavigate } from 'react-router-dom'

// Motivos de reprogramación
const cancellationReasons = [
  'No asistió a la mentoría (no notifica)',
  'Reprograma',
  'No necesita mentoría',
  'No puede concurrir (notifica)',
  'Se le rompió el ordenador',
  'Penso que era mas tarde',
  'Tiene problemas con codespace',
  'No especifica',
  'Cancelada por mentor/a'
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
  const [cancellationDate, setCancellationDate] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [originalMentorshipDate, setOriginalMentorshipDate] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [supliedWithOtherStudent, setSupliedWithOtherStudent] = useState(false)
  const [cancellationNotes, setCancellationNotes] = useState('')
  const [cohortInfo, setCohortInfo] = useState(null) // Nuevo estado para info de la cohorte
  const [mentorInfo, setMentorInfo] = useState(null) // Nuevo estado para info del mentor
  const [taInfo, setTaInfo] = useState(null) // Nuevo estado para info del TA
  const navigate = useNavigate()

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
    setCohortInfo(null) // Limpiar info anterior
    setMentorInfo(null) // Limpiar info anterior
    setTaInfo(null) // Limpiar info anterior

    try {
      const foundStudent = await findStudentByEmail(email)
      if (foundStudent) {
        setStudent(foundStudent)
        setShowQuestion(true)

        // Obtener información de la cohorte si está disponible
        if (foundStudent.properties?.['Cohort']?.relation?.length > 0) {
          const cohortId = foundStudent.properties['Cohort'].relation[0].id
          console.log(cohortId)
          try {
            const cohortDetails = await getCohortNotionInfo(cohortId)
            setCohortInfo(cohortDetails)
            console.log(cohortDetails)
            // Asumiendo que cohortDetails tiene la estructura para mentor y TA
            // Deberás ajustar los nombres de las propiedades según la respuesta real de la API
            // Ejemplo basado en la fórmula de Notion que viste:
            const teacherRelation = cohortDetails.properties?.[
              'Teacher / TA'
            ]?.relation.find(
              (person) => person.object === 'user' // Asumiendo que Teacher/TA son usuarios relacionados
              // Podrías necesitar lógica adicional para distinguir entre Teacher y TA si ambos están en la misma propiedad
            )
            const taRelation = cohortDetails.properties?.[
              'Teacher / TA'
            ]?.relation.find(
              (person) =>
                person.object === 'user' && person.id !== teacherRelation?.id // Asumiendo que Teacher/TA son usuarios relacionados y diferentes
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

  const handleMentorshipQuestion = (held) => {
    setMentorshipHeld(held)
    setShowQuestion(false)
  }

  const handleSaveFeedback = async () => {
    if (!student) {
      setError('No hay estudiante seleccionado para guardar feedback.')
      return
    }
    if (!feedback.trim()) {
      setError('Por favor, ingrese el feedback.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await updateStudentComment(student.id, feedback, store.userName)
      setFeedback('')
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
        supliedWithOtherStudent
      )

      setError('Cancelación registrada con éxito.')
      // Opcional: Limpiar campos y resetear estados relevantes
      setCancellationDate('')
      setOriginalMentorshipDate('')
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

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 4,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Registro de Feedback de Mentoría
        </Typography>

        <Paper sx={{ p: 3, width: '100%', mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Buscar Estudiante por Correo Electrónico
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
          {error && (
            <Alert severity={error.includes('éxito') ? 'success' : 'error'}>
              {error}
            </Alert>
          )}
        </Paper>

        {/* Sección para la pregunta */}
        {student && showQuestion && (
          <Paper sx={{ p: 3, width: '100%', mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
              ¿Se llevó a cabo la mentoría?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleMentorshipQuestion(true)}
              >
                Sí
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleMentorshipQuestion(false)}
              >
                No
              </Button>
            </Box>
          </Paper>
        )}

        {/* Sección para Información del Estudiante y Feedback (si la mentoría se llevó a cabo) */}
        {student && mentorshipHeld === true && (
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
                {student?.properties?.['Student']?.title?.[0]?.plain_text ? (
                  <Chip
                    label={student.properties['Student'].title[0].plain_text}
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
                      student.properties?.['Cohort name for Zapier'].formula
                        ?.string || 'N/A'
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
                  {mentorInfo.slack !== 'N/A' ? `(${mentorInfo.slack})` : ''}
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
                {student.properties?.['Program Manager']?.rollup?.array?.[0] ? (
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
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Tema presentado:</strong> Describir el problema o
                    tema que el estudiante trajo a la mentoría.
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Desarrollo:</strong> Explicar brevemente cómo se
                    abordó el tema y qué soluciones se propusieron.
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Dificultades:</strong> Mencionar si el estudiante
                    presentó dificultades específicas y cómo se manejaron.
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Resultado:</strong> Describir el resultado final y
                    si el estudiante logró resolver su problema.
                  </Typography>
                  <Typography component="li" variant="body2">
                    <strong>Recomendaciones:</strong> Sugerir próximos pasos o
                    recursos adicionales si es necesario.
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
                {saving ? <CircularProgress size={24} /> : 'Guardar Feedback'}
              </Button>
            </Paper>
          </>
        )}

        {/* Sección para Cancelar Mentoría (si la mentoría NO se llevó a cabo) */}
        {student && mentorshipHeld === false && (
          <Paper sx={{ p: 3, width: '100%', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Registrar Mentoría Cancelada
            </Typography>

            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}
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
                label="Fecha y hora de mentoría original"
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
                label="Motivo de reprogramación"
                fullWidth
                value={cancellationReason}
                onChange={handleCancellationReasonChange}
              >
                {/* <MenuItem value="">Seleccionar motivo</MenuItem> */}
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
                label="¿Ha suplido con otro alumno la hora de mentoría?"
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
              <Typography variant="body1">
                <strong>Mentor:</strong> {store.userName || 'Cargando...'}{' '}
              </Typography>
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
      </Box>
    </Container>
  )
}
