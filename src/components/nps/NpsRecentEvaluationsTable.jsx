import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Checkbox,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Star, Visibility } from '@mui/icons-material'
import {
  formatEvaluationDate,
  getScoreColor,
  updateNpsEvaluationSeen,
} from '../../services/mentorNpsService'
import CommentModal from './CommentModal'

export default function NpsRecentEvaluationsTable({
  evaluations,
  onEvaluationUpdate,
}) {
  const [updatingSeen, setUpdatingSeen] = useState({})
  const [localSeenState, setLocalSeenState] = useState({})
  const [selectedEvaluation, setSelectedEvaluation] = useState(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)

  // Inicializar el estado local con los datos de las evaluaciones
  useEffect(() => {
    if (evaluations && evaluations.length > 0) {
      const initialSeenState = {}
      let hasChanges = false

      evaluations.forEach((evaluation) => {
        if (evaluation.npsId) {
          const vistoValue = evaluation.visto ?? false

          // Solo actualizar si el valor es diferente al actual
          if (localSeenState[evaluation.npsId] !== vistoValue) {
            initialSeenState[evaluation.npsId] = vistoValue
            hasChanges = true
          } else {
            // Mantener el valor actual si no ha cambiado
            initialSeenState[evaluation.npsId] =
              localSeenState[evaluation.npsId]
          }
        }
      })

      // Solo actualizar el estado si hay cambios reales
      if (hasChanges) {
        setLocalSeenState(initialSeenState)
      }
    }
  }, [evaluations, localSeenState])

  // Función para manejar el cambio del checkbox con optimistic updates
  const handleSeenChange = async (evaluationId, newSeenValue) => {
    // Optimistic update - actualizar inmediatamente la UI
    setLocalSeenState((prev) => ({
      ...prev,
      [evaluationId]: newSeenValue,
    }))

    try {
      setUpdatingSeen((prev) => ({ ...prev, [evaluationId]: true }))

      await updateNpsEvaluationSeen(evaluationId, newSeenValue)

      // Notificar al componente padre sobre el cambio exitoso
      if (onEvaluationUpdate) {
        onEvaluationUpdate(evaluationId, newSeenValue)
      }
    } catch (error) {
      console.error('Error al actualizar estado visto:', error)

      // Revertir el cambio si falla
      setLocalSeenState((prev) => ({
        ...prev,
        [evaluationId]: !newSeenValue,
      }))

      // Aquí podrías mostrar un toast o alert de error
    } finally {
      setUpdatingSeen((prev) => ({ ...prev, [evaluationId]: false }))
    }
  }

  // Función para obtener el estado actual del checkbox
  const getCurrentSeenState = (evaluation) => {
    const evaluationId = evaluation.npsId

    // Si hay un estado local, usarlo (para optimistic updates)
    if (localSeenState[evaluationId] !== undefined) {
      return localSeenState[evaluationId]
    }

    // Si no, usar el estado del prop con fallback a false
    const resultado = evaluation.visto ?? false
    return resultado
  }

  // Función para abrir el modal de comentarios
  const handleOpenCommentModal = (evaluation) => {
    setSelectedEvaluation(evaluation)
    setIsCommentModalOpen(true)
  }

  // Función para cerrar el modal de comentarios
  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false)
    setSelectedEvaluation(null)
  }

  // Función para manejar el cambio de estado visto desde el modal
  const handleSeenChangeFromModal = async (evaluationId, newSeenValue) => {
    await handleSeenChange(evaluationId, newSeenValue)
  }

  if (!evaluations || evaluations.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <Typography color="textSecondary">
          No hay evaluaciones recientes
        </Typography>
      </Box>
    )
  }

  // Limitar a las últimas 10 evaluaciones
  const recentEvaluations = evaluations.slice(0, 10)

  // Función para obtener el color del score
  const getScoreBackgroundColor = (score) => {
    if (score >= 9) return '#4caf5020'
    if (score >= 7) return '#ff980020'
    return '#f4433620'
  }

  // Función para obtener el texto del score
  const getScoreText = (score) => {
    if (score >= 9) return 'Excelente'
    if (score >= 7) return 'Bueno'
    return 'Mejorable'
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cohorte</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Puntuación
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Estado
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Reporte
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Visto
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentEvaluations.map((evaluation, index) => {
              const score = evaluation.teacherScore || 0
              const date = evaluation.date
                ? formatEvaluationDate(evaluation.date)
                : 'N/A'
              const cohortName =
                evaluation.cohortName || evaluation.cohort || 'N/A'
              const status = evaluation.status || 'Completada'
              const evaluationId = evaluation.npsId
              const seen = getCurrentSeenState(evaluation)

              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {date}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {cohortName}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Box
                      sx={{
                        backgroundColor: getScoreBackgroundColor(score),
                        borderRadius: 1,
                        p: 0.5,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        minWidth: 80,
                      }}
                    >
                      <Star
                        sx={{
                          fontSize: 16,
                          color: getScoreColor(score),
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={getScoreColor(score)}
                      >
                        {score.toFixed(1)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={getScoreText(score)}
                      size="small"
                      sx={{
                        backgroundColor: `${getScoreColor(score)}20`,
                        color: getScoreColor(score),
                        border: `1px solid ${getScoreColor(score)}`,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    {evaluation.comments && evaluation.comments.length > 0 ? (
                      <Tooltip title="Ver comentarios">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenCommentModal(evaluation)}
                          sx={{
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#1976d220',
                            },
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Sin comentarios
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {updatingSeen[evaluationId] ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Checkbox
                        checked={seen}
                        onChange={(e) =>
                          handleSeenChange(evaluationId, e.target.checked)
                        }
                        sx={{
                          color: seen ? '#4caf50' : 'gray',
                          '&.Mui-checked': {
                            color: '#4caf50',
                          },
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de comentarios */}
      <CommentModal
        open={isCommentModalOpen}
        onClose={handleCloseCommentModal}
        evaluation={selectedEvaluation}
        onSeenChange={handleSeenChangeFromModal}
        getCurrentSeenState={getCurrentSeenState}
      />
    </>
  )
}
