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
  Avatar,
} from '@mui/material'
import { Star } from '@mui/icons-material'
import {
  formatEvaluationDate,
  getScoreColor,
} from '../../services/mentorNpsService'

export default function NpsRecentEvaluationsTable({ evaluations }) {
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
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
