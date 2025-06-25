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
  Tooltip,
} from '@mui/material'
import { updateStudentComment } from '../services/studentService'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { getTeamSlackId } from '../utils/cohortHelpers'
import { getStudentInfo } from '../services/notionService'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

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
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Typography sx={{ fontSize: '3em' }}>🎓</Typography>
            <Typography variant="h4" fontWeight={700}>
              {student?.properties?.['Student'].title[0]?.text?.content ||
                'Sin nombre'}
            </Typography>
            {student?.properties?.['Slack ID']?.rich_text?.[0]?.text
              ?.content && (
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  window.open(
                    `slack://user?team=T0BFXMWMV&id=${student.properties['Slack ID'].rich_text[0].text.content}`,
                    '_blank'
                  )
                }
              >
                Slack
              </Button>
            )}
            <Typography color="gray">
              ({' '}
              {student?.properties?.['Cohort name for Zapier']?.formula
                ?.string || 'Se desconoce'}{' '}
              )
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Tooltip
              title="Si necesita cambiar información no editable por favor comuníquese con el Program manager de la cohorte"
              arrow
            >
              <InfoOutlinedIcon
                sx={{
                  fontSize: 24,
                  color: 'text.secondary',
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
          </Box>
        </Box>
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
          <Divider />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 4,
            }}
            alignItems={'center'}
          >
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {student?.properties?.Email?.email || 'Se desconoce'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                GitHub profile
              </Typography>
              <Link
                href={student?.properties?.['Github profile']?.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {student?.properties?.['Github profile']?.url || 'Se desconoce'}
              </Link>
            </Box>
            {/* Prework Advisor */}
            {student?.properties?.['Cohort Status']?.rollup?.array?.[0]?.select
              ?.name === 'Prework' &&
              student?.properties?.['Prework Advisor']?.select?.name && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prework Advisor
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const advisorSlackId = getTeamSlackId(
                        student.properties['Prework Advisor'].select.name
                      )
                      if (advisorSlackId) {
                        window.open(
                          `slack://user?team=T0BFXMWMV&id=${advisorSlackId}`,
                          '_blank'
                        )
                      }
                    }}
                  >
                    {student?.properties?.['Prework Advisor']?.select?.name}
                  </Button>
                </Box>
              )}
          </Box>
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            Información del alumno
          </Typography>
          <Typography variant="body1">
            {student?.properties?.['Información para Dashboard']?.rich_text?.[0]
              ?.text?.content ||
              'No hay información disponible de ser necesario contacta al PM'}
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
          {/* Mensaje si el alumno no ha completado la encuesta */}
          {!student?.properties?.['Synced?']?.checkbox && (
            <Alert severity="info" sx={{ my: 2 }}>
              El alumno no ha completado aún la encuesta de información
              personal.
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  )
}
