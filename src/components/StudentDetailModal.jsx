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
import { useState, useEffect } from 'react'
import { updateStudentComment } from '../services/studentService'
import useGlobalReducer from '../hooks/useGlobalReducer'
import { getTeamSlackId } from '../utils/cohortHelpers'

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
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setComment(student?.properties?.Comments?.rich_text?.[0]?.plain_text || '')
    setAttachments([])
    setError(null)
  }, [student, open])

  const preworkAdvisorName =
    student?.properties?.['Prework Advisor']?.select?.name
  const advisorSlackId = preworkAdvisorName
    ? getTeamSlackId(preworkAdvisorName)
    : null

  const handleSaveComment = async () => {
    if (comment.trim() === '' && attachments.length === 0) {
      setError('Debes agregar un comentario o al menos una imagen.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await updateStudentComment(student.id, comment, store.userName, null, attachments)
      setComment('')
      setAttachments([])
      onClose()
    } catch {
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
            Información del alumno
          </Typography>
          <Typography variant="subtitle1">
            {student?.properties?.['Información para Dashboard']?.rich_text?.[0]
              ?.plain_text || 'No hay información disponible'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
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
          <Button component="label" variant="outlined">
            Adjuntar imágenes
            <input
              hidden
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            />
          </Button>
          {attachments.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {attachments.length} imagen(es) seleccionada(s)
            </Typography>
          )}
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
          disabled={loading || (comment.trim() === '' && attachments.length === 0)}
        >
          {loading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
