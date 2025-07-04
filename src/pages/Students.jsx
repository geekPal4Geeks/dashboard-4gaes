import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material'
import { findStudentByEmail } from '../services/studentService'
import { getStudentInfo } from '../services/notionService'
import StudentDetail from './StudentDetail'

export default function Students() {
  const [email, setEmail] = useState('')
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cohort, setCohort] = useState(null)  
  
  const handleSearch = async () => {
    if (!email) {
      setError('Por favor, ingrese un correo electrónico.')
      return
    }
    setLoading(true)
    setError(null)
    setStudent(null)
    setCohort(null)
    try {
      const response = await findStudentByEmail(email)
      if (response && response.student && response.cohort) {
        setStudent(response.student)
        setCohort(response.cohort)
      } else {
        setError('Estudiante no encontrado.')
      }
    } catch (err) {
      setError('Error al buscar estudiante.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Buscar estudiante
        </Typography>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            label="Correo electrónico"
            variant="outlined"
            size="small"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            fullWidth
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Buscar'}   
          </Button>

        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
      {student && cohort && (
        <Box mt={0} sx={{ px: 0 }}>
          <StudentDetail studentData={student} cohort={cohort} />
        </Box>
      )}
    </Container>
  )
} 