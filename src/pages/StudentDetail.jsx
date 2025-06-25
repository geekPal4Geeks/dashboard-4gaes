import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Divider,
  Link,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Container,
  Paper,
} from '@mui/material'
import { updateStudentComment } from '../services/studentService'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { getTeamSlackId } from '../utils/cohortHelpers'
import { getStudentInfo } from '../services/notionService'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function StudentDetail() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { store } = useGlobalReducer()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchStudent() {
      setLoading(true)
      try {
        const data = await getStudentInfo(studentId)
        setStudent(data)
        setComment(data?.properties?.Comments?.rich_text?.[0]?.plain_text || '')
      } catch (err) {
        setError('No se pudo cargar la información del alumno.')
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [studentId])

  const preworkAdvisorName =
    student?.properties?.['Prework Advisor']?.select?.name
  const advisorSlackId = preworkAdvisorName
    ? getTeamSlackId(preworkAdvisorName)
    : null

  const handleSaveComment = async () => {
    if (comment.trim() === '') {
      setError('El comentario no puede estar vacío.')
      return
    }
    try {
      setSaving(true)
      setError(null)
      await updateStudentComment(student.id, comment, store.userName)
      setComment('')
      navigate(-1) // Vuelve a la página anterior
    } catch (err) {
      setError('Error al guardar el comentario')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    )
  if (!student) return <Alert severity="error">No se encontró el alumno.</Alert>

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Volver
      </Button>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {student?.properties?.Name?.title?.[0]?.plain_text ||
            'Detalles del Estudiante'}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            marginTop: 4,
          }}
        >
          {student?.isPrework && (
            <>
              <Typography variant="subtitle2" color="text.secondary">
                Prework Advisor
              </Typography>
              <Typography variant="body1">
                {preworkAdvisorName ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <span>{preworkAdvisorName}</span>
                    {advisorSlackId && (
                      <Link
                        href={`slack://user?team=${'T0BFXMWMV'}&id=${advisorSlackId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          verticalAlign: 'middle',
                          textDecoration: 'none',
                        }}
                      >
                        <Button variant="outlined">Slack</Button>
                      </Link>
                    )}
                  </Box>
                ) : (
                  'No asignado'
                )}
              </Typography>
              <Divider />
            </>
          )}
          <Typography variant="subtitle2" color="text.secondary">
            Nombre
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {student?.properties?.['Student'].title[0]?.text?.content ||
              'Se desconoce'}
          </Typography>
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            Cohorte
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {student?.properties?.['Cohort name for Zapier']?.formula?.string ||
              'Se desconoce'}
          </Typography>
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            Email
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {student?.properties?.Email?.email || 'Se desconoce'}
          </Typography>
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            Slack
          </Typography>
          {student?.properties?.['Slack ID']?.rich_text?.[0]?.text?.content ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                window.open(
                  `slack://user?team=${'T0BFXMWMV'}&id=${
                    student.properties['Slack ID'].rich_text[0].text.content
                  }`,
                  '_blank'
                )
              }
              sx={{ mb: 1, alignSelf: 'flex-start' }}
            >
              Slack
            </Button>
          ) : (
            <Typography variant="body1" sx={{ mb: 1 }}>
              Se desconoce
            </Typography>
          )}
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            GitHub Profile
          </Typography>
          <Link
            href={student?.properties?.['Github profile']?.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {student?.properties?.['Github profile']?.url || 'Se desconoce'}
          </Link>
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            Información del alumno
          </Typography>
          <Typography variant="body1">
            {student?.properties?.['Información para Dashboard']?.rich_text?.[0]
              ?.text?.content || 'No hay información disponible'}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ marginTop: 2 }}
          >
            Deja comentarios
          </Typography>
          <TextField
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Agregar un comentario sobre el estudiante..."
            fullWidth
          />
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={() => navigate(-1)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveComment}
              variant="contained"
              color="primary"
              disabled={saving || comment.trim() === ''}
            >
              {saving ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
          </Box>
          {/* Información adicional si Synced? es true */}
          {student?.properties?.['Synced?']?.checkbox && (
            <Box
              sx={{
                mt: 3,
                mb: 2,
                p: 2,
                background: 'rgba(0,0,0,0.03)',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Información adicional del estudiante
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                ¿Por qué hace este curso?
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {student?.properties?.['Why do this course?']?.rich_text?.[0]
                  ?.text?.content || 'Se desconoce'}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Área de estudios*
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {student?.properties?.['Studies area']?.select?.name ||
                  'Se desconoce'}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Experiencia o conocimientos en programación*
              </Typography>
              <Typography variant="body1">
                {student?.properties?.['Programming Experience or Knowledge']
                  ?.rich_text?.[0]?.text?.content || 'Se desconoce'}
              </Typography>
              <Typography
                sx={{ marginTop: 2, fontSize: '12px' }}
                variant="body1"
                color="gray"
              >
                * Previo al ingreso
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  )
}
