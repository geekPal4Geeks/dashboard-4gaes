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
import NpsKpiCards from '../components/nps/NpsKpiCards'
import NpsProgressionCharts from '../components/nps/NpsProgressionCharts'
import NpsCohortsTable from '../components/nps/NpsCohortsTable'
import NpsRecentEvaluationsTable from '../components/nps/NpsRecentEvaluationsTable'

export default function Profile() {
  const { store } = useGlobalReducer()
  const theme = useTheme()

  // Estados principales
  const [npsData, setNpsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  // Estados de filtros
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
      setLoading(true)
      setError(null)

      // Usar el token del store o el token por defecto
      const token = store.token || '0cf43584af6d720f3a08347e550cd09a48624445'
      localStorage.setItem('token', token)

      const data = await getCurrentMentorNpsData()
      setNpsData(data)
    } catch (err) {
      console.error('Error al cargar datos NPS:', err)
      setError(err.message || 'Error al cargar los datos NPS')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadNpsData()
  }, [])

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

  if (loading) {
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

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!npsData) {
    return (
      <Container maxWidth="xl">
        <Alert severity="warning" sx={{ mt: 2 }}>
          No se encontraron datos NPS para este mentor.
        </Alert>
      </Container>
    )
  }

  const filteredCohorts = getTimeFilteredCohorts()

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
              {npsData.mentorName}
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
          <Box display="flex" gap={1}>
            {/* <Tooltip title="Cambiar tema">
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip> */}
            <Tooltip title="Actualizar datos">
              <IconButton onClick={loadNpsData}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar datos">
              <IconButton onClick={handleExportData}>
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
      </Box>

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
              evaluations={npsData.visualizationData.tables.recentEvaluations}
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
    </Container>
  )
}
