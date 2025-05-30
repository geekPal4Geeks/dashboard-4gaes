import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Divider,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useState } from 'react'
import { updateStudentComment } from '../services/studentService'
import useGlobalReducer from '../hooks/useGlobalReducer'

export default function StudentDetailModal({
  open,
  onClose,
  student,
  isPrework,
}) {
  const { store } = useGlobalReducer()
  const [comment, setComment] = useState(
    student?.properties?.Comments?.rich_text?.[0]?.plain_text || ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSaveComment = async () => {
    try {
      setLoading(true)
      setError(null)
      await updateStudentComment(student.id, comment, store.userName)
      onClose()
    } catch (err) {
      setError('Error al guardar el comentario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {student?.basicInfo?.full_name || 'Detalles del Estudiante'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {isPrework && (
            <>
              <Typography variant="subtitle1" color="text.secondary">
                Prework Advisor
              </Typography>
              <Typography variant="body1">
                {student?.properties?.['Prework Advisor']?.select?.name ||
                  'No asignado'}
              </Typography>
              <Divider />
            </>
          )}

          <Typography variant="subtitle1" color="text.secondary">
            GitHub Profile
          </Typography>
          <Link
            href={student?.properties?.['Github profile']?.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {student?.properties?.['Github profile']?.url || 'No disponible'}
          </Link>
          <Divider />

          <Typography variant="subtitle1" color="text.secondary">
            Comentarios
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSaveComment}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
