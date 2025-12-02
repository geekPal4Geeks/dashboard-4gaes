import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Chip,
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
} from '@mui/material'
import {
  FilterList,
  Download,
  Refresh,
  Info,
  AccountCircle,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { getCurrentMentorNpsData } from '../services/mentorNpsService'
import {
  getCurrentMentorMentorshipsData,
  getCurrentMentorCancelledMentorshipsData,
} from '../services/mentorMentorshipsService'
import NpsKpiCards from '../components/nps/NpsKpiCards'
import NpsProgressionCharts from '../components/nps/NpsProgressionCharts'
import NpsCohortsTable from '../components/nps/NpsCohortsTable'
import NpsRecentEvaluationsTable from '../components/nps/NpsRecentEvaluationsTable'
import MentorshipsList from '../components/mentorships/MentorshipsList'
import MentorshipsSummaryCards from '../components/mentorships/MentorshipsSummaryCards'

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

export default function Profile() {
  const { store } = useGlobalReducer()
  const theme = useTheme()

  // Estado del tab activo
  const [tabValue, setTabValue] = useState(0)

  // Estados principales NPS
  const [npsData, setNpsData] = useState(null)
  const [npsLoading, setNpsLoading] = useState(true)
  const [npsError, setNpsError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  // Estados principales Mentorías
  const [mentorshipsData, setMentorshipsData] = useState(null)
  const [mentorshipsLoading, setMentorshipsLoading] = useState(false)
  const [mentorshipsError, setMentorshipsError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState('current')
  const [periodType, setPeriodType] = useState('academic') // 'academic' | 'monthly'

  // Estados de filtros NPS
  const [selectedCohort, setSelectedCohort] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('1year') // 1year, 6months, all

  // Función para obtener el título según el rol del usuario
  const getRoleTitle = () => {
    const role = store.userRole
    switch (role) {
      case 'assistant':
        return 'Asistente'
      case 'teacher':
        return 'Mentor'
      default:
        return 'Profesor'
    }
  }

  // Cargar datos NPS del mentor
  const loadNpsData = async () => {
    try {
      setNpsLoading(true)
      setNpsError(null)

      // Usar el token del store o el token por defecto
      const token = store.token || '0cf43584af6d720f3a08347e550cd09a48624445'
      localStorage.setItem('token', token)

      const data = await getCurrentMentorNpsData()
      setNpsData(data)
    } catch (err) {
      console.error('Error al cargar datos NPS:', err)
      setNpsError(err.message || 'Error al cargar los datos NPS')
    } finally {
      setNpsLoading(false)
    }
  }

  // Cargar datos de mentorías
  const loadMentorshipsData = async () => {
    try {
      setMentorshipsLoading(true)
      setMentorshipsError(null)

      const token = store.token || '0cf43584af6d720f3a08347e550cd09a48624445'
      localStorage.setItem('token', token)

      // Cargar ambos endpoints en paralelo con el mismo periodType
      const [mentorshipsData, cancelledData] = await Promise.all([
        getCurrentMentorMentorshipsData(periodType).catch((err) => {
          console.warn('Error al cargar mentorías realizadas:', err)
          return null
        }),
        getCurrentMentorCancelledMentorshipsData(periodType).catch((err) => {
          // Retornar estructura vacía en lugar de null
          return { mentorName: null, cancelledMentorships: [] }
        }),
      ])

      // Si no hay datos de mentorías, no podemos continuar
      if (!mentorshipsData) {
        throw new Error('No se pudieron cargar los datos de mentorías')
      }

      // Normalizar servicio de canceladas (Mock interview -> Mock Interview)
      const normalizeService = (service) => {
        if (!service) return service
        if (service.toLowerCase() === 'mock interview') {
          return 'Mock Interview'
        }
        return service
      }

      // Mapear canceladas a formato compatible
      const mappedCancelled =
        cancelledData?.cancelledMentorships?.map((cancelled) => ({
          id: cancelled.id,
          student: cancelled.student,
          service: normalizeService(cancelled.service),
          startTime: cancelled.mentorshipDate, // Usar mentorshipDate como startTime
          endTime: null, // Las canceladas no tienen endTime
          duration: null, // Las canceladas no tienen duration
          status: cancelled.status,
          canRequestReview: cancelled.canRequestReview,
          period: cancelled.period,
          isCancelled: true, // Flag para identificar canceladas
          cancellationDate: cancelled.cancellationDate,
          cancellationReason: cancelled.cancellationReason,
          notes: cancelled.notes,
        })) || []

      // Combinar mentorías realizadas y canceladas
      const allMentorships = [
        ...(mentorshipsData.mentorships || []),
        ...mappedCancelled,
      ]

      // Actualizar resúmenes mensuales con canceladas
      const updatedSummaries =
        mentorshipsData.monthlySummaries?.map((summary) => {
          const period = summary.month

          // Contar canceladas para este período
          const cancelledAPagar = mappedCancelled.filter(
            (c) => c.period === period && c.status === 'A pagar'
          ).length

          const cancelledNoCorresponden = mappedCancelled.filter(
            (c) => c.period === period && c.status === 'No corresponde'
          ).length

          return {
            ...summary,
            noRealizadasAPagar:
              (summary.noRealizadasAPagar || 0) + cancelledAPagar,
            noCorresponden:
              (summary.noCorresponden || 0) + cancelledNoCorresponden,
            total:
              (summary.realizadasAPagar || 0) +
              (summary.noRealizadasAPagar || 0) +
              cancelledAPagar,
          }
        }) || []

      const combinedData = {
        mentorName:
          mentorshipsData.mentorName || cancelledData?.mentorName || 'Mentor',
        mentorships: allMentorships,
        monthlySummaries: updatedSummaries,
      }

      setMentorshipsData(combinedData)
    } catch (err) {
      console.error('Error al cargar datos de mentorías:', err)
      setMentorshipsError(
        err.message || 'Error al cargar los datos de mentorías'
      )
    } finally {
      setMentorshipsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadNpsData()
  }, [])

  // Cargar datos de mentorías cuando se cambia al tab o al tipo de periodo
  useEffect(() => {
    if (tabValue === 1) {
      loadMentorshipsData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, periodType])

  // Manejar cambio de tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Función para exportar datos
  const handleExportData = () => {
    if (!npsData) return

    const csvContent = generateCsvData(npsData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `nps_mentor_${npsData.mentorName}_${
        new Date().toISOString().split('T')[0]
      }.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para generar datos CSV
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
      cohort.metrics.teacher.average,
      cohort.metrics.cohort.average,
      cohort.metrics.participation.average * 100 + '%',
      cohort.totalEvaluations,
    ])

    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  }

  // Obtener cohortes filtradas
  const getFilteredCohorts = () => {
    if (!npsData?.visualizationData?.cohorts) return []

    let filtered = npsData.visualizationData.cohorts

    // Filtrar por cohorte específica
    if (selectedCohort !== 'all') {
      filtered = filtered.filter((cohort) => cohort.id === selectedCohort)
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter((cohort) => cohort.status === statusFilter)
    }

    return filtered
  }

  // Filtrar datos por tiempo
  const getTimeFilteredCohorts = () => {
    const filteredCohorts = getFilteredCohorts()

    if (timeFilter === 'all') return filteredCohorts

    const now = new Date()
    let cutoffDate

    switch (timeFilter) {
      case '3months':
        cutoffDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        )
        break
      case '6months':
        cutoffDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate()
        )
        break
      case '1year':
      default:
        cutoffDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        )
        break
    }

    return filteredCohorts.map((cohort) => {
      const filteredProgression = {}

      // Filtrar datos de progresión por tiempo
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

  // Obtener opciones de cohortes para el selector
  const getCohortOptions = () => {
    if (!npsData?.visualizationData?.cohorts) return []
    return npsData.visualizationData.cohorts.map((cohort) => ({
      value: cohort.id,
      label: cohort.name,
    }))
  }

  // Obtener opciones de estados para el filtro
  const getStatusOptions = () => [
    { value: 'all', label: 'Todos los estados' },
    { value: 'Active', label: 'Activas' },
    { value: 'Final Project', label: 'Proyecto Final' },
    { value: 'Finished', label: 'Finalizadas' },
  ]

  // Función para manejar actualizaciones de evaluaciones
  const handleEvaluationUpdate = (evaluationId, newSeenValue) => {
    // Actualizar el estado local de los datos NPS
    setNpsData((prevData) => {
      if (!prevData?.visualizationData?.tables?.recentEvaluations) {
        return prevData
      }

      const updatedEvaluations =
        prevData.visualizationData.tables.recentEvaluations.map(
          (evaluation) => {
            // Buscar por npsId que es el campo que estás usando
            if (evaluation.npsId === evaluationId) {
              return { ...evaluation, visto: newSeenValue }
            }
            return evaluation
          }
        )

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

  // Obtener nombre del mentor (de NPS o Mentorías)
  const mentorName =
    npsData?.mentorName || mentorshipsData?.mentorName || 'Mentor'

  // Obtener mentorías filtradas por mes
  const getFilteredMentorships = () => {
    if (!mentorshipsData?.mentorships) return []

    // Si no hay resúmenes mensuales, retornar todas las mentorías
    if (
      !mentorshipsData.monthlySummaries ||
      mentorshipsData.monthlySummaries.length === 0
    ) {
      return mentorshipsData.mentorships
    }

    // Obtener el resumen del mes seleccionado
    const selectedSummary = mentorshipsData.monthlySummaries.find(
      (summary) => summary.month === selectedMonth
    )

    if (!selectedSummary || !selectedSummary.period) {
      return mentorshipsData.mentorships
    }

    // Filtrar mentorías que estén dentro del período del mes seleccionado
    const periodStart = new Date(selectedSummary.period.start)
    const periodEnd = new Date(selectedSummary.period.end)
    periodEnd.setHours(23, 59, 59, 999) // Incluir todo el día final

    return mentorshipsData.mentorships.filter((mentorship) => {
      if (!mentorship.startTime) return false
      const mentorshipDate = new Date(mentorship.startTime)
      return mentorshipDate >= periodStart && mentorshipDate <= periodEnd
    })
  }

  if (npsLoading && tabValue === 0) {
    return (
      <Container maxWidth="xl">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    )
  }

  const filteredCohorts = npsData ? getTimeFilteredCohorts() : []

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              display="flex"
              alignItems="center"
            >
              <AccountCircle
                fontSize="large"
                sx={{ color: 'primary', mr: 1 }}
              />
              {mentorName}
            </Typography>
            <Tooltip
              title="Aquí encontrarás toda la información de las encuestas de satisfacción realizadas a tus alumnos, scores, reportes y feedback."
              placement="right"
              arrow
            >
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="tabs de perfil"
          >
            <Tab
              label="NPS"
              id="profile-tab-0"
              aria-controls="profile-tabpanel-0"
            />
            <Tab
              label="Mentorías"
              id="profile-tab-1"
              aria-controls="profile-tabpanel-1"
            />
          </Tabs>
        </Paper>
      </Box>

      {/* Tab Panel NPS */}
      <TabPanel value={tabValue} index={0}>
        {npsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {npsError}
          </Alert>
        )}

        {!npsData && !npsLoading && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No se encontraron datos NPS para este mentor.
          </Alert>
        )}

        {npsData && (
          <>
            {/* Header del tab NPS con iconos */}
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              mb={2}
            >
              <Box display="flex" gap={1}>
                <Tooltip title="Actualizar datos">
                  <IconButton onClick={loadNpsData} disabled={npsLoading}>
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

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box
                display="flex"
                gap={2}
                alignItems="center"
                flexWrap="wrap"
                justifyContent="space-between"
              >
                <Box
                  display="flex"
                  gap={2}
                  alignItems="center"
                  flexWrap="wrap"
                  flex={1}
                >
                  <FormControl
                    size="small"
                    sx={{ minWidth: 200, flex: 1, maxWidth: 300 }}
                  >
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

                  <FormControl
                    size="small"
                    sx={{ minWidth: 150, flex: 1, maxWidth: 200 }}
                  >
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

                  <FormControl
                    size="small"
                    sx={{ minWidth: 150, flex: 1, maxWidth: 200 }}
                  >
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

            {/* KPIs Cards */}
            <NpsKpiCards
              kpis={npsData.visualizationData.kpis}
              roleTitle={getRoleTitle()}
            />

            {/* Gráficos de progresión */}
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

            {/* Tablas */}
            <Grid
              container
              spacing={3}
              sx={{ display: 'flex', flexDirection: 'column' }}
            >
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Evaluaciones Recientes
                  </Typography>
                  <NpsRecentEvaluationsTable
                    evaluations={
                      npsData.visualizationData.tables.recentEvaluations
                    }
                    onEvaluationUpdate={handleEvaluationUpdate}
                    roleTitle={getRoleTitle()}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={8} sx={{ width: '100%' }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tabla de Cohortes
                  </Typography>
                  <NpsCohortsTable
                    cohorts={filteredCohorts}
                    roleTitle={getRoleTitle()}
                  />
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>

      {/* Tab Panel Mentorías */}
      <TabPanel value={tabValue} index={1}>
        {/* Selector de tipo de periodo */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1" fontWeight="medium">
              Tipo de período:
            </Typography>
            <FormControl size="small">
              <RadioGroup
                row
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
              >
                <FormControlLabel
                  value="academic"
                  control={<Radio size="small" />}
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      Período Académico
                      <Tooltip
                        title={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              La semana de corte de mes del mes anterior hasta
                              la semana de corte del mes en curso
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontStyle: 'italic' }}
                            >
                              Corresponde para quienes cobran por nómina.
                            </Typography>
                          </Box>
                        }
                        arrow
                        placement="right"
                      >
                        <IconButton
                          size="small"
                          sx={{ color: 'primary.main', p: 0.25 }}
                        >
                          <Info fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
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
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="40vh"
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {mentorshipsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {mentorshipsError}
          </Alert>
        )}

        {!mentorshipsLoading && !mentorshipsError && mentorshipsData && (
          <>
            <MentorshipsSummaryCards
              summaries={mentorshipsData.monthlySummaries}
              selectedMonth={selectedMonth}
              onMonthSelect={setSelectedMonth}
            />

            <Box sx={{ mt: 3 }}>
              <MentorshipsList
                mentorships={getFilteredMentorships()}
                selectedMonth={selectedMonth}
              />
            </Box>
          </>
        )}

        {!mentorshipsLoading &&
          !mentorshipsError &&
          !mentorshipsData &&
          tabValue === 1 && (
            <Alert severity="info">
              No se encontraron datos de mentorías para este mentor.
            </Alert>
          )}
      </TabPanel>
    </Container>
  )
}
