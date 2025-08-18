import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Visibility,
} from '@mui/icons-material'
import {
  getScoreColor,
  getCohortStatusText,
  getCohortStatusColor,
} from '../../services/mentorNpsService'

export default function NpsCohortsTable({ cohorts }) {
  if (!cohorts || cohorts.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="200px"
      >
        <Typography color="textSecondary">
          No hay cohortes disponibles
        </Typography>
      </Box>
    )
  }

  // Función para obtener el ícono de tendencia
  const getTrendIcon = (teacherScore, cohortScore) => {
    const difference = teacherScore - cohortScore
    if (difference > 0.5) return <TrendingUp color="success" />
    if (difference < -0.5) return <TrendingDown color="error" />
    return <Remove color="action" />
  }

  // Función para obtener el color del score
  const getScoreBackgroundColor = (score) => {
    if (score >= 9) return '#4caf5020'
    if (score >= 7) return '#ff980020'
    return '#f4433620'
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Cohorte</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Promedio Profesor
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Promedio Cohorte
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Participación
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Evaluaciones
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Comparación
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cohorts.map((cohort) => {
            const teacherScore = cohort.metrics.teacher.average
            const cohortScore = cohort.metrics.cohort.average
            const participation = cohort.metrics.participation.average * 100
            const totalEvaluations = cohort.totalEvaluations

            return (
              <TableRow key={cohort.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {cohort.name}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={getCohortStatusText(cohort.status)}
                    size="small"
                    sx={{
                      backgroundColor: `${getCohortStatusColor(
                        cohort.status
                      )}20`,
                      color: getCohortStatusColor(cohort.status),
                      border: `1px solid ${getCohortStatusColor(
                        cohort.status
                      )}`,
                    }}
                  />
                </TableCell>

                <TableCell align="center">
                  <Box
                    sx={{
                      backgroundColor: getScoreBackgroundColor(teacherScore),
                      borderRadius: 1,
                      p: 1,
                      display: 'inline-block',
                      minWidth: 60,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={getScoreColor(teacherScore)}
                    >
                      {teacherScore.toFixed(1)}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Box
                    sx={{
                      backgroundColor: getScoreBackgroundColor(cohortScore),
                      borderRadius: 1,
                      p: 1,
                      display: 'inline-block',
                      minWidth: 60,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={getScoreColor(cohortScore)}
                    >
                      {cohortScore.toFixed(1)}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Typography
                    variant="body2"
                    color={
                      participation >= 80
                        ? 'success.main'
                        : participation >= 60
                        ? 'warning.main'
                        : 'error.main'
                    }
                    fontWeight="medium"
                  >
                    {participation.toFixed(1)}%
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2" color="textSecondary">
                    {totalEvaluations}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Tooltip
                    title={
                      teacherScore > cohortScore
                        ? `El profesor supera a la cohorte por ${(
                            teacherScore - cohortScore
                          ).toFixed(1)} puntos`
                        : teacherScore < cohortScore
                        ? `La cohorte supera al profesor por ${(
                            cohortScore - teacherScore
                          ).toFixed(1)} puntos`
                        : 'Puntuaciones similares'
                    }
                  >
                    <Box display="flex" justifyContent="center">
                      {getTrendIcon(teacherScore, cohortScore)}
                    </Box>
                  </Tooltip>
                </TableCell>

                <TableCell align="center">
                  <Tooltip title="Ver detalles">
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
