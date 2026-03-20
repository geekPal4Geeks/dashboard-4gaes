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
import { Star, Visibility, InfoOutlined } from '@mui/icons-material'
import {
  formatEvaluationDate,
  getNpsComments,
  getScoreColor,
  updateNpsEvaluationSeen,
} from '../../services/mentorNpsService'
import CommentModal from './CommentModal'

export default function NpsRecentEvaluationsTable({
  evaluations,
  onEvaluationUpdate,
  roleTitle = 'Profesor',
  readOnly = false,
  impersonatedEmail = null,
}) {
  const [updatingSeen, setUpdatingSeen] = useState({})
  const [localSeenState, setLocalSeenState] = useState({})
  const [selectedEvaluation, setSelectedEvaluation] = useState(null)
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsByEvaluation, setCommentsByEvaluation] = useState({})

  const shouldShowSeenColumn = () => roleTitle !== 'Asistente'

  useEffect(() => {
    if (!evaluations || evaluations.length === 0) return

    const initialSeenState = {}
    evaluations.forEach((evaluation) => {
      if (evaluation.npsId) {
        initialSeenState[evaluation.npsId] = evaluation.visto ?? false
      }
    })
    setLocalSeenState((prev) => ({ ...initialSeenState, ...prev }))
  }, [evaluations])

  const handleSeenChange = async (evaluationId, newSeenValue) => {
    if (readOnly) return

    setLocalSeenState((prev) => ({
      ...prev,
      [evaluationId]: newSeenValue,
    }))

    try {
      setUpdatingSeen((prev) => ({ ...prev, [evaluationId]: true }))
      await updateNpsEvaluationSeen(evaluationId, newSeenValue)
      if (onEvaluationUpdate) {
        onEvaluationUpdate(evaluationId, newSeenValue)
      }
    } catch {
      setLocalSeenState((prev) => ({
        ...prev,
        [evaluationId]: !newSeenValue,
      }))
    } finally {
      setUpdatingSeen((prev) => ({ ...prev, [evaluationId]: false }))
    }
  }

  const getCurrentSeenState = (evaluation) => {
    const evaluationId = evaluation.npsId
    if (localSeenState[evaluationId] !== undefined) {
      return localSeenState[evaluationId]
    }
    return evaluation.visto ?? false
  }

  const handleOpenCommentModal = async (evaluation) => {
    setSelectedEvaluation(evaluation)
    setIsCommentModalOpen(true)

    if (commentsByEvaluation[evaluation.npsId]) {
      return
    }

    try {
      setCommentsLoading(true)
      const comments = await getNpsComments(evaluation.npsId, impersonatedEmail)
      setCommentsByEvaluation((prev) => ({
        ...prev,
        [evaluation.npsId]: comments,
      }))
    } catch {
      setCommentsByEvaluation((prev) => ({
        ...prev,
        [evaluation.npsId]: [],
      }))
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false)
    setSelectedEvaluation(null)
    setCommentsLoading(false)
  }

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
        <Typography color="text.secondary">No hay evaluaciones recientes</Typography>
      </Box>
    )
  }

  const recentEvaluations = evaluations.slice(0, 10)

  const getScoreBackgroundColor = (score) => {
    if (score >= 9) return '#4caf5020'
    if (score >= 7) return '#ff980020'
    return '#f4433620'
  }

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
              <TableCell colSpan={shouldShowSeenColumn() ? 6 : 5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Lista las evaluaciones NPS más recientes y permite abrir su
                    reporte detallado.
                  </Typography>
                  <Tooltip title="La puntuación mostrada corresponde al rol visible en esta vista: mentor o asistente.">
                    <InfoOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cohorte</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  Puntuación
                  <Tooltip title="Nota obtenida en esa evaluación NPS para el rol actual mostrado.">
                    <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  Estado
                  <Tooltip title="Clasificación rápida de la puntuación: excelente, bueno o mejorable.">
                    <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  Reporte
                  <Tooltip title="Abre comentarios y observaciones asociados a esa evaluación.">
                    <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              {shouldShowSeenColumn() && (
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                    Visto
                    <Tooltip title="Marca si ese reporte ya fue revisado.">
                      <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {recentEvaluations.map((evaluation, index) => {
              const score =
                roleTitle === 'Asistente'
                  ? evaluation.taScores || 0
                  : evaluation.teacherScore || 0
              const date = evaluation.date
                ? formatEvaluationDate(evaluation.date)
                : 'N/A'
              const cohortName =
                evaluation.cohortName || evaluation.cohort || 'N/A'
              const evaluationId = evaluation.npsId
              const seen = getCurrentSeenState(evaluation)

              return (
                <TableRow key={evaluationId || index} hover>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
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
                  </TableCell>

                  {shouldShowSeenColumn() && (
                    <TableCell align="center">
                      {updatingSeen[evaluationId] ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Checkbox
                          checked={seen}
                          disabled={readOnly}
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
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <CommentModal
        open={isCommentModalOpen}
        onClose={handleCloseCommentModal}
        evaluation={selectedEvaluation}
        comments={
          selectedEvaluation ? commentsByEvaluation[selectedEvaluation.npsId] || [] : []
        }
        loading={commentsLoading}
        readOnly={readOnly}
        onSeenChange={handleSeenChangeFromModal}
        getCurrentSeenState={getCurrentSeenState}
      />
    </>
  )
}
