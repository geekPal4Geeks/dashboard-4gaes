import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
  Chip,
} from '@mui/material'
import { updateStudentComment } from '../services/studentService'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { getTeamSlackId } from '../utils/cohortHelpers'
import { getStudentInfo } from '../services/notionService'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { parseCohortData, parseCurrentModuleLabel } from '../utils/studentHelpers'
import GitHubIcon from '@mui/icons-material/GitHub'

export default function StudentDetail({ studentData, cohort }) {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { store } = useGlobalReducer()
  // Permitir recibir { student, cohort } como studentData o desde location.state
  const locationStudent = location.state?.student
  const locationCohort = location.state?.cohort
  const initialStudent = locationStudent || (studentData && studentData.student ? studentData.student : studentData)
  const initialCohort = locationCohort || (studentData && studentData.cohort ? studentData.cohort : cohort)
  const [student, setStudent] = useState(initialStudent || null)
  const [localCohort, setLocalCohort] = useState(initialCohort || null)
  const [loading, setLoading] = useState(initialStudent ? false : true)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Si studentData es el nuevo formato { student, cohort }
    if (studentData && studentData.student && studentData.cohort) {
      setStudent(studentData.student)
      setLocalCohort(studentData.cohort)
      setLoading(false)
      setComment(studentData.student?.properties?.Comments?.rich_text?.[0]?.plain_text || '')
      return
    }
    // Si es el formato anterior
    if (studentData) {
      setStudent(studentData)
      setLoading(false)
      setComment(studentData?.properties?.Comments?.rich_text?.[0]?.plain_text || '')
      return
    }
    async function fetchStudent() {
      setLoading(true)
      try {
        const data = await getStudentInfo(studentId)
        // Si el endpoint retorna { student, cohort }
        if (data && data.student && data.cohort) {
          setStudent(data.student)
          setLocalCohort(data.cohort)
          setComment(data.student?.properties?.Comments?.rich_text?.[0]?.plain_text || '')
        } else {
          setStudent(data)
          setComment(data?.properties?.Comments?.rich_text?.[0]?.plain_text || '')
        }
      } catch (err) {
        setError('No se pudo cargar la información del alumno.')
      } finally {
        setLoading(false)
      }
    }
    if (studentId) fetchStudent()
  }, [studentId, studentData])

  const preworkAdvisorName =
    student?.properties?.['Prework Advisor']?.select?.name
  const advisorSlackId = preworkAdvisorName
    ? getTeamSlackId(preworkAdvisorName)
    : null

  let mentors = []
  let tas = []
  let pm = null
  let pmSlackId = null
  const cohortToUse = localCohort || cohort
  if (cohortToUse) {
    const mentorsCohortStr = cohortToUse?.properties?.['Mentors in this cohort']?.formula?.string
    const parsed = parseCohortData(mentorsCohortStr)
    mentors = parsed.mentors
    tas = parsed.tas
    pm = cohortToUse?.properties?.['Program Manager']?.select?.name
    pmSlackId = pm ? getTeamSlackId(pm) : null
  }

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

  const studentEmail = student?.properties?.Email?.email
  const github = student?.properties?.['Github profile']?.url

  // Obtener módulo actual de la cohorte usando util
  const currentModuleArr = student?.properties?.['Cohort current module']?.rollup?.array;
  const currentModuleLabel = parseCurrentModuleLabel(currentModuleArr);

  return (
    <Box sx={{ mt: 4, mb: 4, px: studentData ? 0 : undefined }}>
      {!studentData && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Volver
        </Button>
      )}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography sx={{ fontSize: '3em' }}>🎓</Typography>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {student?.properties?.['Student'].title[0]?.text?.content || 'Sin nombre'}
                  {currentModuleLabel && (
                    <Chip
                      label={currentModuleLabel}
                      size="small"
                      sx={{ ml: 1, bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500, fontSize: '0.8rem', height: 24 }}
                    />
                  )}
                  {student?.properties?.['Cohort name for Zapier']?.formula?.string && (
                    <Chip
                      label={student.properties['Cohort name for Zapier'].formula.string}
                      size="small"
                      sx={{ ml: 1, bgcolor: '#f5f5f5', color: '#757575', fontWeight: 400, fontSize: '0.75rem', height: 22 }}
                    />
                  )}
                </Typography>
                {/* Email y GitHub debajo del nombre, uno debajo del otro */}
                {studentEmail && (
                  <Box>
                    <Button
                      variant="text"
                      size="small"
                      sx={{ textTransform: 'none', p: 0, minWidth: 0, fontSize: 16, color: 'text.secondary' }}
                      onClick={() => {
                        navigator.clipboard.writeText(studentEmail)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 1200)
                      }}
                      title="Copiar correo"
                    >
                      {studentEmail}
                    </Button>
                    {copied && (
                      <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                        Copiado
                      </Typography>
                    )}
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  {github ? (
                    <a href={github} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none', wordBreak: 'break-all', fontSize: 15, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <GitHubIcon sx={{ fontSize: 18, mr: 0.5 }} />
                      {github.replace('https://github.com/', '')}
                    </a>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'row' }}>
                      <GitHubIcon sx={{ fontSize: 18, mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        No disponible, solicitar al PM
                      </Typography>
                    </Box>
                  )}
                  {student?.properties?.['Slack ID']?.rich_text?.[0]?.text?.content && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.open(`slack://user?team=T0BFXMWMV&id=${student.properties['Slack ID'].rich_text[0].text.content}`, '_blank')}
                      sx={{ ml: 1 }}
                    >
                      Slack
                    </Button>
                  )}
                </Box>
              </Box>
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
              marginTop: 1,
            }}
          >
            
            <Divider />
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 3,
              }}
              alignItems={'center'}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' }, mb: 2 }}>
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
                {/* Prework Advisor */}
                {cohort?.properties?.['Status']?.select?.name === 'Prework' && preworkAdvisorName && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
                      <FiberManualRecordIcon sx={{ color: '#e8f5e9', fontSize: 16, mr: 0.5 }} /> Prework Advisor
                    </Typography>
                    <Chip
                      label={preworkAdvisorName}
                      clickable={!!advisorSlackId}
                      component={advisorSlackId ? 'a' : undefined}
                      href={advisorSlackId ? `slack://user?team=T0BFXMWMV&id=${advisorSlackId}` : undefined}
                      target={advisorSlackId ? '_blank' : undefined}
                      rel={advisorSlackId ? 'noopener noreferrer' : undefined}
                      sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 2, py: 0.5, bgcolor: '#e8f5e9', color: '#388e3c' }}
                    />
                  </Box>
                )}
                {/* Mentores */}
                {mentors.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', mb: 0.5 }}>
                      <FiberManualRecordIcon sx={{ color: '#f3e5f5', fontSize: 16, mr: 0.5 }} /> Mentor
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {mentors.map((m, i) => (
                        <Chip
                          key={i}
                          label={m.firstName}
                          clickable={!!m.slackId}
                          component={m.slackId ? 'a' : undefined}
                          href={m.slackId ? `slack://user?team=T0BFXMWMV&id=${m.slackId}` : undefined}
                          target={m.slackId ? '_blank' : undefined}
                          rel={m.slackId ? 'noopener noreferrer' : undefined}
                          sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 1, px: 2, py: 0.5, bgcolor: '#f3e5f5', color: '#7b1fa2' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {/* TAs */}
                {tas.length > 0 && (
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
        </Box>
      </Paper>
    </Box>
  )
}
