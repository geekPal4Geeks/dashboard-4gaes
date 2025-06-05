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

export default function Courses() {
  const { store } = useGlobalReducer()
  const [cohorts, setCohorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No hay token de autenticación')

        const activeCohorts = await getActiveCohorts(token)
        setCohorts(activeCohorts)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCohorts()
  }, [])

  // console.log(cohorts)

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

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <GuideCard />
            </Grid>
            {cohorts.map((cohort) => (
              <Grid item xs={12} sm={6} md={4} key={cohort.cohort?.id}>
                <CourseCard cohort={cohort} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  )
}
