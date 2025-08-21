import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
} from '@mui/material'
import { formatEvaluationDate } from '../../services/mentorNpsService'

export default function CommentModal({
  open,
  onClose,
  evaluation,
  onSeenChange,
  getCurrentSeenState,
}) {
  // Función para formatear el texto del comentario
  const formatCommentText = (comment) => {
    if (comment.rich_text && Array.isArray(comment.rich_text)) {
      return comment.rich_text.map((text) => text.plain_text || '').join('')
    }
    return comment.text || 'Sin texto'
  }

  // Función para formatear la fecha del comentario
  const formatCommentDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Reporte de evaluación - {evaluation?.cohortName || 'Cohorte'}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="textSecondary">
              Estado:
            </Typography>
            <Checkbox
              checked={evaluation ? getCurrentSeenState(evaluation) : false}
              onChange={(e) => {
                if (evaluation) {
                  onSeenChange(evaluation.npsId, e.target.checked)
                }
              }}
              sx={{
                color: '#4caf50',
                '&.Mui-checked': {
                  color: '#4caf50',
                },
              }}
            />
            <Typography variant="body2">
              {evaluation && getCurrentSeenState(evaluation)
                ? 'Visto'
                : 'No visto'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {evaluation?.comments && evaluation.comments.length > 0 ? (
          <Box>
            {evaluation.comments.map((comment, index) => (
              <Box
                key={comment.id || index}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {formatCommentText(comment)}
                </Typography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  {/* <Typography variant="subtitle2" fontWeight="bold">
                    {comment.author?.name || 'Usuario anónimo'}
                  </Typography> */}
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ mt: '14px' }}
                  >
                    {formatCommentDate(comment.created_time)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="textSecondary">
            No hay comentarios disponibles para esta evaluación.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
