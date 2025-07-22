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
  Tabs,
  Tab,
} from '@mui/material'
import { updateStudentComment } from '../services/studentService'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { getTeamSlackId } from '../utils/cohortHelpers'
import {
  getStudentInfo,
  getStudentComments,
  getNotionUser,
} from '../services/notionService'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import {
  parseCohortData,
  parseCurrentModuleLabel,
} from '../utils/studentHelpers'
import GitHubIcon from '@mui/icons-material/GitHub'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import StudentHeaderBox from '../components/StudentHeaderBox'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

export default function StudentDetail({ studentData, cohort }) {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { store } = useGlobalReducer()
  // Permitir recibir { student, cohort } como studentData o desde location.state
  const locationStudent = location.state?.student
  const locationCohort = location.state?.cohort
  const initialStudent =
    locationStudent ||
    (studentData && studentData.student ? studentData.student : studentData)
  const initialCohort =
    locationCohort ||
    (studentData && studentData.cohort ? studentData.cohort : cohort)
  const [student, setStudent] = useState(initialStudent || null)
  const [localCohort, setLocalCohort] = useState(initialCohort || null)
  const [loading, setLoading] = useState(initialStudent ? false : true)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [studentComments, setStudentComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [authors, setAuthors] = useState({})

  useEffect(() => {
    // Si studentData es el nuevo formato { student, cohort }
    if (studentData && studentData.student && studentData.cohort) {
      setStudent(studentData.student)
      setLocalCohort(studentData.cohort)
      setLoading(false)
      setComment(
        studentData.student?.properties?.Comments?.rich_text?.[0]?.plain_text ||
          ''
      )
      return
    }
    // Si es el formato anterior
    if (studentData) {
      setStudent(studentData)
      setLoading(false)
      setComment(
        studentData?.properties?.Comments?.rich_text?.[0]?.plain_text || ''
      )
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
          setComment(
            data.student?.properties?.Comments?.rich_text?.[0]?.plain_text || ''
          )
        } else {
          setStudent(data)
          setComment(
            data?.properties?.Comments?.rich_text?.[0]?.plain_text || ''
          )
        }
      } catch (err) {
        setError('No se pudo cargar la información del alumno.')
      } finally {
        setLoading(false)
      }
    }
    if (studentId) fetchStudent()
  }, [studentId, studentData])

  useEffect(() => {
    const fetchComments = async () => {
      if (studentId) {
        setCommentsLoading(true)
        try {
          const commentsData = await getStudentComments(studentId)
          setStudentComments(commentsData || [])
        } catch (err) {
          console.error('Error fetching comments:', err)
        } finally {
          setCommentsLoading(false)
        }
      }
    }
    fetchComments()
  }, [studentId])

  useEffect(() => {
    const fetchAuthors = async () => {
      if (studentComments.length > 0) {
        const authorIds = [
          ...new Set(studentComments.map((c) => c.created_by.id)),
        ]
        const authorPromises = authorIds.map((id) => getNotionUser(id))
        const authorResults = await Promise.all(authorPromises)

        const authorsMap = authorResults.reduce((acc, author) => {
          if (author) {
            acc[author.id] = author.name
          }
          return acc
        }, {})
        setAuthors(authorsMap)
      }
    }
    fetchAuthors()
  }, [studentComments])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

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
    const mentorsCohortStr =
      cohortToUse?.properties?.['Mentors in this cohort']?.formula?.string
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
  const currentModuleArr =
    student?.properties?.['Cohort current module']?.rollup?.array
  const currentModuleLabel = parseCurrentModuleLabel(currentModuleArr)

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
          <StudentHeaderBox
            student={student}
            cohortInfo={localCohort || cohort}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              marginTop: 1,
            }}
          >
            <Divider />
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Información del alumno
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {student?.properties?.['Información para Dashboard']
                ?.rich_text?.[0]?.text?.content ||
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
            <Box
              display="flex"
              justifyContent="flex-end"
              gap={2}
              sx={{ mb: 2 }}
            >
              <Button
                onClick={handleSaveComment}
                variant="contained"
                color="primary"
                disabled={saving || comment.trim() === ''}
              >
                {saving ? <CircularProgress size={24} /> : 'Guardar'}
              </Button>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="basic tabs example"
              >
                {student?.properties?.['Synced?']?.checkbox && (
                  <Tab label="Información adicional" />
                )}
                <Tab label="Comentarios" />
              </Tabs>
            </Box>
            {student?.properties?.['Synced?']?.checkbox && (
              <TabPanel value={tabValue} index={0}>
                <Box
                  sx={{
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
                    {student?.properties?.['Why do this course?']
                      ?.rich_text?.[0]?.text?.content || 'Se desconoce'}
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
                    {student?.properties?.[
                      'Programming Experience or Knowledge'
                    ]?.rich_text?.[0]?.text?.content || 'Se desconoce'}
                  </Typography>
                  <Typography
                    sx={{ marginTop: 2, fontSize: '12px' }}
                    variant="body1"
                    color="gray"
                  >
                    * Previo al ingreso
                  </Typography>
                </Box>
              </TabPanel>
            )}
            <TabPanel
              value={tabValue}
              index={student?.properties?.['Synced?']?.checkbox ? 1 : 0}
            >
              {(() => {
                if (commentsLoading) {
                  return (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress />
                    </Box>
                  )
                }

                const filteredComments = studentComments.filter(
                  (comment) =>
                    authors[comment.created_by.id] === '4Geeks Academy Spain'
                )

                if (filteredComments.length > 0) {
                  return filteredComments.map((comment) => (
                    <Paper
                      key={comment.id}
                      sx={{
                        p: 2,
                        mb: 2,
                      }}
                      elevation={1}
                    >
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {comment.rich_text.map((t) => t.plain_text).join('')}
                      </Typography>
                      {comment.attachments &&
                        comment.attachments.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {comment.attachments.map((attachment, index) =>
                              attachment.file?.url ? (
                                <img
                                  key={index}
                                  src={attachment.file.url}
                                  alt="Comment attachment"
                                  style={{
                                    maxWidth: '100%',
                                    borderRadius: '4px',
                                    marginTop: '8px',
                                  }}
                                />
                              ) : null
                            )}
                          </Box>
                        )}
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ display: 'block', textAlign: 'right', mt: 1 }}
                      >
                        {authors[comment.created_by.id] ||
                          'Usuario desconocido'}{' '}
                        - {new Date(comment.created_time).toLocaleString()}
                      </Typography>
                    </Paper>
                  ))
                }

                return (
                  <Typography>
                    No se han encontrado comentarios de 4Geeks Academy Spain.
                  </Typography>
                )
              })()}
            </TabPanel>
            {/* Mensaje si el alumno no ha completado la encuesta */}
            {!student?.properties?.['Synced?']?.checkbox && tabValue === 1 && (
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
