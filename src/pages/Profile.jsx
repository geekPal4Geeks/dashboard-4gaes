import { useState, useEffect, lazy, Suspense } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  TextField,
  Skeleton,
} from '@mui/material'
import {
  Download,
  Refresh,
  Info,
  AccountCircle,
  VisibilityOff,
} from '@mui/icons-material'
import useGlobalReducer from '../hooks/useGlobalReducer'
import {
  getCurrentMentorNpsData,
  getCurrentMentorNpsSummary,
  getMentorPreviewByEmail,
} from '../services/mentorNpsService'
import {
  getCurrentMentorMentorshipsData,
  getCurrentMentorMentorshipsSummary,
} from '../services/mentorMentorshipsService'
import {
  canImpersonateMentor,
  canSeeOwnProfile,
} from '../constants/permissions'

const NpsKpiCards = lazy(() => import('../components/nps/NpsKpiCards'))
const NpsProgressionCharts = lazy(() => import('../components/nps/NpsProgressionCharts'))
const NpsCohortsTable = lazy(() => import('../components/nps/NpsCohortsTable'))
const NpsRecentEvaluationsTable = lazy(
  () => import('../components/nps/NpsRecentEvaluationsTable')
)
const MentorshipsList = lazy(() => import('../components/mentorships/MentorshipsList'))
const MentorshipsSummaryCards = lazy(
  () => import('../components/mentorships/MentorshipsSummaryCards')
)

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function SectionFallback({ minHeight = '20vh' }) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={minHeight}>
      <CircularProgress size={36} />
    </Box>
  )
}

function KpiSkeletons() {
  return (
    <Grid container spacing={1} sx={{ mb: 4 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} lg={2.5} key={index}>
          <Paper sx={{ p: 2 }}>
            <Skeleton variant="text" width="55%" height={24} />
            <Skeleton variant="text" width="35%" height={44} />
            <Skeleton variant="text" width="80%" height={18} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

function NpsDetailsSkeleton() {
  return (
    <>
      <Grid
        container
        spacing={3}
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Grid item xs={12} md={8} sx={{ width: '100%' }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{ width: '100%' }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width="35%" height={32} sx={{ mb: 2 }} />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={44} sx={{ mb: 1 }} />
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8} sx={{ width: '100%' }}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width="28%" height={32} sx={{ mb: 2 }} />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={42} sx={{ mb: 1 }} />
            ))}
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

function MentorshipsSummarySkeleton() {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: 2 }).map((_, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width="42%" height={34} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="58%" height={20} sx={{ mb: 2 }} />
            {Array.from({ length: 4 }).map((__, rowIndex) => (
              <Box
                key={rowIndex}
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Skeleton variant="text" width="45%" height={20} />
                <Skeleton variant="text" width="12%" height={20} />
              </Box>
            ))}
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

function MentorshipsListSkeleton() {
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Skeleton variant="text" width="35%" height={34} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={42} sx={{ mb: 1 }} />
      ))}
    </Paper>
  )
}

export default function Profile() {
  const { store } = useGlobalReducer()

  const canSelfProfile = canSeeOwnProfile(store.userRole)
  const canUseImpersonation = canImpersonateMentor(store.userRole)

  const [tabValue, setTabValue] = useState(0)
  const [npsData, setNpsData] = useState(null)
  const [npsLoading, setNpsLoading] = useState(true)
  const [npsDetailsLoading, setNpsDetailsLoading] = useState(false)
  const [npsError, setNpsError] = useState(null)

  const [mentorshipsData, setMentorshipsData] = useState(null)
  const [mentorshipsLoading, setMentorshipsLoading] = useState(false)
  const [mentorshipsDetailsLoading, setMentorshipsDetailsLoading] = useState(false)
  const [mentorshipsError, setMentorshipsError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('current')
  const [periodType, setPeriodType] = useState('academic')

  const [selectedCohort, setSelectedCohort] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('1year')

  const [impersonationEmail, setImpersonationEmail] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [impersonatedMentor, setImpersonatedMentor] = useState(null)

  const isImpersonating = Boolean(impersonatedMentor?.email)
  const readOnly = isImpersonating
  const showMentorshipTab = canSelfProfile || isImpersonating

  const getRoleTitle = () => {
    const effectiveRole = npsData?.effectiveRole || impersonatedMentor?.effectiveRole || null

    if (effectiveRole === 'assistant') return 'Asistente'
    if (effectiveRole === 'teacher') return 'Mentor'

    switch (store.userRole) {
      case 'assistant':
        return 'Asistente'
      case 'teacher':
        return 'Mentor'
      default:
        return 'Profesor'
    }
  }

  const loadNpsData = async (email = impersonatedMentor?.email || null) => {
    try {
      setNpsLoading(true)
      setNpsError(null)
      const summaryData = await getCurrentMentorNpsSummary(email)
      setNpsData(summaryData)
    } catch (err) {
      setNpsError(err.message || 'Error al cargar los datos NPS')
    } finally {
      setNpsLoading(false)
    }
  }

  const loadNpsDetails = async (email = impersonatedMentor?.email || null) => {
    try {
      setNpsDetailsLoading(true)
      setNpsError(null)
      const data = await getCurrentMentorNpsData(email)
      setNpsData(data)
    } catch (err) {
      setNpsError(err.message || 'Error al cargar el detalle NPS')
    } finally {
      setNpsDetailsLoading(false)
    }
  }

  const loadMentorshipsData = async (signal) => {
    if (!showMentorshipTab) return

    try {
      setMentorshipsLoading(true)
      setMentorshipsError(null)
      const data = await getCurrentMentorMentorshipsSummary(periodType, {
        signal,
        email: isImpersonating ? impersonatedMentor?.email : null,
        memberId: isImpersonating ? impersonatedMentor?.memberId || null : null,
        impersonationToken: isImpersonating
          ? impersonatedMentor?.impersonationToken || null
          : null,
      })
      setMentorshipsData(data)
    } catch (err) {
      if (err.name === 'CanceledError' || signal?.aborted) return
      setMentorshipsError(err.message || 'Error al cargar los datos de mentorías')
    } finally {
      if (!signal?.aborted) {
        setMentorshipsLoading(false)
      }
    }
  }

  const loadMentorshipsDetails = async (signal) => {
    if (!showMentorshipTab) return

    try {
      setMentorshipsDetailsLoading(true)
      setMentorshipsError(null)
      const data = await getCurrentMentorMentorshipsData(periodType, {
        signal,
        email: isImpersonating ? impersonatedMentor?.email : null,
        memberId: isImpersonating ? impersonatedMentor?.memberId || null : null,
        impersonationToken: isImpersonating
          ? impersonatedMentor?.impersonationToken || null
          : null,
      })
      setMentorshipsData(data)
    } catch (err) {
      if (err.name === 'CanceledError' || signal?.aborted) return
      setMentorshipsError(err.message || 'Error al cargar el detalle de mentorías')
    } finally {
      if (!signal?.aborted) {
        setMentorshipsDetailsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!canSelfProfile && !canUseImpersonation) {
      setNpsLoading(false)
      setNpsError('No tienes permisos para acceder a esta vista.')
      return
    }

    if (canSelfProfile) {
      loadNpsData()
      return
    }

    setNpsLoading(false)
    setNpsData(null)
    setNpsError(null)
  }, [canSelfProfile, canUseImpersonation])

  useEffect(() => {
    if (!npsData?.summaryOnly) return

    loadNpsDetails(impersonatedMentor?.email || null)
  }, [npsData?.summaryOnly, impersonatedMentor?.email])

  useEffect(() => {
    if (tabValue !== 1 || !showMentorshipTab) return

    const abortController = new AbortController()
    loadMentorshipsData(abortController.signal)

    return () => abortController.abort()
  }, [tabValue, periodType, showMentorshipTab, isImpersonating, impersonatedMentor?.email])

  useEffect(() => {
    if (tabValue !== 1 || !mentorshipsData?.summaryOnly) return

    const abortController = new AbortController()
    loadMentorshipsDetails(abortController.signal)

    return () => abortController.abort()
  }, [
    tabValue,
    mentorshipsData?.summaryOnly,
    periodType,
    showMentorshipTab,
    isImpersonating,
    impersonatedMentor?.email,
  ])

  useEffect(() => {
    if (!showMentorshipTab && tabValue === 1) {
      setTabValue(0)
    }
  }, [showMentorshipTab, tabValue])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleStartImpersonation = async () => {
    if (!impersonationEmail.trim()) return

    const normalizedEmail = impersonationEmail.trim().toLowerCase()

    try {
      setPreviewLoading(true)
      setNpsError(null)
      setImpersonatedMentor({
        id: null,
        email: normalizedEmail,
        name: normalizedEmail,
        effectiveRole: null,
        memberId: null,
      })
      setMentorshipsData(null)
      loadNpsData(normalizedEmail)

      const preview = await getMentorPreviewByEmail(normalizedEmail)
      setImpersonatedMentor((currentValue) => ({
        ...(currentValue || {}),
        ...preview,
        email: preview?.email || normalizedEmail,
      }))
    } catch (err) {
      setNpsError(err.message || 'No se pudo cargar el mentor solicitado')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleExitImpersonation = async () => {
    setImpersonatedMentor(null)
    setImpersonationEmail('')
    setMentorshipsData(null)
    setMentorshipsDetailsLoading(false)
    setTabValue(0)
    setNpsDetailsLoading(false)

    if (canSelfProfile) {
      await loadNpsData(null)
      return
    }

    setNpsData(null)
    setNpsError(null)
    setNpsLoading(false)
  }

  const handleExportData = () => {
    if (!npsData) return

    const csvContent = generateCsvData(npsData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `nps_mentor_${npsData.mentorName}_${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateCsvData = (data) => {
    const roleTitle = getRoleTitle()
    const headers = [
      'Cohorte',
      'Estado',
      `Promedio ${roleTitle}`,
      'Promedio Cohorte',
      'Participación',
      'Total Evaluaciones',
    ]
    const rows = data.visualizationData.cohorts.map((cohort) => [
      cohort.name,
      cohort.status,
      roleTitle === 'Asistente'
        ? cohort.metrics.tas.average
        : cohort.metrics.teacher.average,
      cohort.metrics.cohort.average,
      cohort.metrics.participation.average * 100 + '%',
      cohort.totalEvaluations,
    ])

    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  }

  const getFilteredCohorts = () => {
    if (!npsData?.visualizationData?.cohorts) return []

    let filtered = npsData.visualizationData.cohorts

    if (selectedCohort !== 'all') {
      filtered = filtered.filter((cohort) => cohort.id === selectedCohort)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((cohort) => cohort.status === statusFilter)
    }

    return filtered
  }

  const getTimeFilteredCohorts = () => {
    const filteredCohorts = getFilteredCohorts()
    if (timeFilter === 'all') return filteredCohorts

    const now = new Date()
    let cutoffDate

    switch (timeFilter) {
      case '3months':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        break
      case '6months':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
        break
      case '1year':
      default:
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
    }

    return filteredCohorts.map((cohort) => {
      const filteredProgression = {}

      Object.keys(cohort.progression).forEach((type) => {
        filteredProgression[type] = cohort.progression[type].filter((point) => {
          const pointDate = new Date(point.date)
          return pointDate >= cutoffDate
        })
      })

      return {
        ...cohort,
        progression: filteredProgression,
      }
    })
  }

  const getCohortOptions = () => {
    if (!npsData?.visualizationData?.cohorts) return []
    return npsData.visualizationData.cohorts.map((cohort) => ({
      value: cohort.id,
      label: cohort.name,
    }))
  }

  const getStatusOptions = () => [
    { value: 'all', label: 'Todos los estados' },
    { value: 'Active', label: 'Activas' },
    { value: 'Final Project', label: 'Proyecto Final' },
    { value: 'Finished', label: 'Finalizadas' },
  ]

  const handleEvaluationUpdate = (evaluationId, newSeenValue) => {
    if (readOnly) return

    setNpsData((prevData) => {
      if (!prevData?.visualizationData?.tables?.recentEvaluations) {
        return prevData
      }

      const updatedEvaluations =
        prevData.visualizationData.tables.recentEvaluations.map((evaluation) => {
          if (evaluation.npsId === evaluationId) {
            return { ...evaluation, visto: newSeenValue }
          }
          return evaluation
        })

      return {
        ...prevData,
        visualizationData: {
          ...prevData.visualizationData,
          tables: {
            ...prevData.visualizationData.tables,
            recentEvaluations: updatedEvaluations,
          },
        },
      }
    })
  }

  const mentorName =
    npsData?.mentorName ||
    impersonatedMentor?.name ||
    mentorshipsData?.mentorName ||
    'Mentor'

  const getFilteredMentorships = () => {
    if (!mentorshipsData?.mentorships) return []
    if (!mentorshipsData.monthlySummaries?.length) return mentorshipsData.mentorships

    const selectedSummary = mentorshipsData.monthlySummaries.find(
      (summary) => summary.month === selectedMonth
    )

    if (!selectedSummary?.period) {
      return mentorshipsData.mentorships
    }

    const periodStart = new Date(selectedSummary.period.start)
    const periodEnd = new Date(selectedSummary.period.end)
    periodEnd.setHours(23, 59, 59, 999)

    return mentorshipsData.mentorships.filter((mentorship) => {
      if (!mentorship.startTime) return false
      const mentorshipDate = new Date(mentorship.startTime)
      return mentorshipDate >= periodStart && mentorshipDate <= periodEnd
    })
  }

  if (npsLoading && tabValue === 0 && !isImpersonating && !npsData) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    )
  }

  const filteredCohorts = npsData ? getTimeFilteredCohorts() : []

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              display="flex"
              alignItems="center"
            >
              <AccountCircle fontSize="large" sx={{ color: 'primary.main', mr: 1 }} />
              {mentorName}
            </Typography>
            <Tooltip
              title="Aquí encontrarás la información de NPS y mentorías del mentor seleccionado."
              placement="right"
              arrow
            >
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {canUseImpersonation && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Impersonar por correo"
                value={impersonationEmail}
                onChange={(e) => setImpersonationEmail(e.target.value)}
                placeholder="mentor@correo.com"
                size="small"
                sx={{ minWidth: 280 }}
              />
              <Button
                variant="contained"
                onClick={handleStartImpersonation}
                disabled={previewLoading || !impersonationEmail.trim()}
              >
                {previewLoading ? <CircularProgress size={22} /> : 'Buscar mentor'}
              </Button>
              {isImpersonating && (
                <>
                  <Alert severity="warning" sx={{ flex: 1, minWidth: 240 }}>
                    Vista impersonada en modo solo lectura para {impersonatedMentor.email}.
                  </Alert>
                  <Button
                    color="inherit"
                    startIcon={<VisibilityOff />}
                    onClick={handleExitImpersonation}
                  >
                    Salir de impersonación
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs de perfil">
            <Tab label="NPS" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
            {showMentorshipTab && (
              <Tab label="Mentorías" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
            )}
          </Tabs>
        </Paper>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {npsLoading && isImpersonating && !npsData && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Cargando resumen del mentor impersonado. La vista básica ya está disponible y el resto llegará por partes.
          </Alert>
        )}

        {npsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {npsError}
          </Alert>
        )}

        {!npsData && !npsLoading && (
          <Alert
            severity={canSelfProfile || isImpersonating ? 'warning' : 'info'}
            sx={{ mb: 2 }}
          >
            {canSelfProfile || isImpersonating
              ? 'No se encontraron datos NPS para este mentor.'
              : 'Ingresa un correo para impersonar a un mentor o asistente.'}
          </Alert>
        )}

        {npsData && (
          <>
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
              <Box display="flex" gap={1}>
                <Tooltip title="Actualizar datos">
                  <IconButton
                    onClick={() => loadNpsData()}
                    disabled={npsLoading || (!canSelfProfile && !isImpersonating)}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Exportar datos">
                  <IconButton onClick={handleExportData} disabled={!npsData}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
              <Box
                display="flex"
                gap={2}
                alignItems="center"
                flexWrap="wrap"
                justifyContent="space-between"
              >
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" flex={1}>
                  <FormControl size="small" sx={{ minWidth: 200, flex: 1, maxWidth: 300 }}>
                    <InputLabel>Cohorte específica</InputLabel>
                    <Select
                      value={selectedCohort}
                      onChange={(e) => setSelectedCohort(e.target.value)}
                      label="Cohorte específica"
                    >
                      <MenuItem value="all">Todas las cohortes</MenuItem>
                      {getCohortOptions().map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150, flex: 1, maxWidth: 200 }}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Estado"
                    >
                      {getStatusOptions().map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150, flex: 1, maxWidth: 200 }}>
                    <InputLabel>Período</InputLabel>
                    <Select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      label="Período"
                    >
                      <MenuItem value="3months">Últimos 3 meses</MenuItem>
                      <MenuItem value="6months">Últimos 6 meses</MenuItem>
                      <MenuItem value="1year">Último año</MenuItem>
                      <MenuItem value="all">Todo el historial</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Paper>

            <Suspense fallback={<SectionFallback minHeight="30vh" />}>
              {npsData.visualizationData?.kpis ? (
                <NpsKpiCards kpis={npsData.visualizationData.kpis} roleTitle={getRoleTitle()} />
              ) : (
                <KpiSkeletons />
              )}

              {!npsData.summaryOnly && (
                <>
                  <Grid
                    container
                    spacing={3}
                    sx={{
                      mb: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Grid item xs={12} md={8} sx={{ width: '100%' }}>
                      <Paper sx={{ p: 3, height: 400 }}>
                        <NpsProgressionCharts
                          cohorts={filteredCohorts}
                          type="teacher"
                          roleTitle={getRoleTitle()}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ width: '100%' }}>
                      <Paper sx={{ p: 3, height: 400 }}>
                        <NpsProgressionCharts
                          cohorts={filteredCohorts}
                          type="cohort"
                          roleTitle={getRoleTitle()}
                        />
                      </Paper>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Evaluaciones Recientes
                        </Typography>
                        <NpsRecentEvaluationsTable
                          evaluations={npsData.visualizationData.tables.recentEvaluations}
                          onEvaluationUpdate={handleEvaluationUpdate}
                          roleTitle={getRoleTitle()}
                          readOnly={readOnly}
                          impersonatedEmail={isImpersonating ? impersonatedMentor?.email : null}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8} sx={{ width: '100%' }}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Tabla de Cohortes
                        </Typography>
                        <NpsCohortsTable cohorts={filteredCohorts} roleTitle={getRoleTitle()} />
                      </Paper>
                    </Grid>
                  </Grid>
                </>
              )}

              {npsDetailsLoading && npsData.summaryOnly && <NpsDetailsSkeleton />}
            </Suspense>
          </>
        )}
      </TabPanel>

      {showMentorshipTab && (
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body1" fontWeight="medium">
                Tipo de período:
              </Typography>
              <Tooltip title="Período académico usa las fechas de corte internas de la academia. Mes calendario usa del día 1 al último día del mes.">
                <Info />
              </Tooltip>
              <FormControl size="small">
                <RadioGroup row value={periodType} onChange={(e) => setPeriodType(e.target.value)}>
                  <FormControlLabel
                    value="academic"
                    control={<Radio size="small" />}
                    label="Período académico"
                  />
                  <FormControlLabel
                    value="monthly"
                    control={<Radio size="small" />}
                    label="Mes calendario"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Paper>

          {mentorshipsLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
              <CircularProgress size={60} />
            </Box>
          )}

          {mentorshipsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mentorshipsError}
            </Alert>
          )}

          {!mentorshipsLoading && !mentorshipsError && mentorshipsData && (
            <Suspense fallback={<SectionFallback minHeight="24vh" />}>
              <>
                {mentorshipsData.monthlySummaries?.length ? (
                  <MentorshipsSummaryCards
                    summaries={mentorshipsData.monthlySummaries}
                    selectedMonth={selectedMonth}
                    onMonthSelect={setSelectedMonth}
                  />
                ) : (
                  <MentorshipsSummarySkeleton />
                )}

                {!mentorshipsData.summaryOnly && (
                  <Box sx={{ mt: 3 }}>
                    <MentorshipsList
                      mentorships={getFilteredMentorships()}
                      selectedMonth={selectedMonth}
                    />
                  </Box>
                )}

                {mentorshipsDetailsLoading && mentorshipsData.summaryOnly && (
                  <MentorshipsListSkeleton />
                )}
              </>
            </Suspense>
          )}

          {!mentorshipsLoading && !mentorshipsError && !mentorshipsData && tabValue === 1 && (
            <Alert severity="info">
              No se encontraron datos de mentorías para este mentor.
            </Alert>
          )}
        </TabPanel>
      )}
    </Container>
  )
}
