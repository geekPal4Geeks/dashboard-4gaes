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
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Remove,
  InfoOutlined,
} from '@mui/icons-material'
import {
  getScoreColor,
  getCohortStatusText,
  getCohortStatusColor,
} from '../../services/mentorNpsService'

export default function NpsCohortsTable({ cohorts, roleTitle = 'Profesor' }) {
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
            <TableCell colSpan={7} sx={{ backgroundColor: 'background.paper' }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  Resume el rendimiento del mentor frente al promedio general de
                  cada cohorte.
                </Typography>
                <Tooltip title="La comparación se calcula entre el promedio del rol visible en esta vista y el promedio general de la cohorte.">
                  <InfoOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Cohorte</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>
              <Box display="flex" alignItems="center" gap={0.5}>
                Estado
                <Tooltip title="Estado actual de la cohorte: activa, proyecto final o finalizada.">
                  <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                Promedio {roleTitle}
                <Tooltip title={`Promedio de puntuación NPS del ${roleTitle.toLowerCase()} en esa cohorte.`}>
                  <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                Promedio Cohorte
                <Tooltip title="Promedio general que obtuvo la cohorte en las mismas evaluaciones consideradas.">
                  <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                Participación
                <Tooltip title="Porcentaje promedio de participación del alumnado en las evaluaciones NPS de esa cohorte.">
                  <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                Evaluaciones
                <Tooltip title="Cantidad de evaluaciones NPS que aportan datos a esa fila.">
                  <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                Comparación
                <Tooltip title="Indica si el promedio del mentor está por encima, por debajo o alineado con el promedio de la cohorte.">
                  <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cohorts.map((cohort) => {
            // Usar taScores para asistentes, teacher.average para otros roles
            const teacherScore =
              roleTitle === 'Asistente'
                ? cohort.metrics.tas?.average || 0
                : cohort.metrics.teacher.average || 0
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
                        ? `El ${roleTitle.toLowerCase()} supera a la cohorte por ${(
                            teacherScore - cohortScore
                          ).toFixed(1)} puntos`
                        : teacherScore < cohortScore
                        ? `La cohorte supera al ${roleTitle.toLowerCase()} por ${(
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
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
