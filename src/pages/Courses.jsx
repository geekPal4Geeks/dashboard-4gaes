import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material'
import useGlobalReducer from '../hooks/useGlobalReducer'
import GuideCard from '../components/GuideCard'
import CourseCard from '../components/CourseCard'
import { getActiveCohorts } from '../services/cohortService'
import { useNavigate } from 'react-router-dom'

export default function Courses() {
  const { store } = useGlobalReducer()
  const [cohorts, setCohorts] = useState([])
  const [loadingCohorts, setLoadingCohorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMoreCohorts, setLoadingMoreCohorts] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const activeAcademyId = store.activeAcademy?.id

  useEffect(() => {
    if (!activeAcademyId) return

    const fetchCohorts = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          navigate('/', { replace: true })
          return
        }

        setCohorts([])
        setLoadingCohorts([])
        setLoading(true)
        setError(null)

        const activeCohorts = await getActiveCohorts(token, {
          academyId: activeAcademyId,
          onProgress: (newCohorts, pendingCohorts) => {
            setCohorts((prev) => {
              const existingIds = new Set(prev.map((c) => c.cohort?.id))
              const uniqueNewCohorts = newCohorts.filter(
                (c) => !existingIds.has(c.cohort?.id)
              )
              return [...prev, ...uniqueNewCohorts]
            })
            setLoadingCohorts(pendingCohorts)
            if (newCohorts.length > 0) {
              setLoading(false)
              setLoadingMoreCohorts(pendingCohorts.length > 0)
            }
          },
        })

        setLoadingCohorts([])
        setLoadingMoreCohorts(false)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
        setLoadingMoreCohorts(false)
      }
    }

    fetchCohorts()
  }, [navigate, activeAcademyId])

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Hola, {store.userName || 'User'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
          Tus programas activos
        </Typography>

        {loading && cohorts.length === 0 ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              {/* Mostrar cohorts completados */}
              {cohorts.map((cohort) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={`completed-${cohort.cohort?.id}`}
                >
                  <CourseCard cohort={cohort} />
                </Grid>
              ))}
              {/* Mostrar placeholders para cohorts que están cargando */}
              {loadingCohorts.map((cohort, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={`loading-${cohort.cohort?.id || `index-${index}`}`}
                >
                  <CourseCard cohort={{ ...cohort, isLoading: true }} />
                </Grid>
              ))}
            </Grid>

            {loadingMoreCohorts && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                mt={3}
              >
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Cargando más cohortes...
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  )
}
