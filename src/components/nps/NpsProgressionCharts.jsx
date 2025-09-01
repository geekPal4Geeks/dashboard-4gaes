import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Box, Typography, Chip } from '@mui/material'
import {
  formatEvaluationDate,
  getScoreColor,
} from '../../services/mentorNpsService'

export default function NpsProgressionCharts({
  cohorts,
  type = 'teacher',
  roleTitle = 'Profesor',
}) {
  if (!cohorts || cohorts.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography color="textSecondary">
          No hay datos de progresión disponibles
        </Typography>
      </Box>
    )
  }

  // Recopilar todos los datos de progresión de todas las cohortes
  const allProgressionData = []

  cohorts.forEach((cohort) => {
    // Para asistentes, usar taScores en lugar de teacher
    const progressionType =
      roleTitle === 'Asistente' && type === 'teacher' ? 'tas' : type
    const progression = cohort.progression[progressionType] || []

    progression.forEach((point) => {
      allProgressionData.push({
        date: point.date,
        dateFormatted: formatEvaluationDate(point.date),
        score: point.score,
        evaluationId: point.evaluationId,
        cohortName: cohort.name,
        cohortId: cohort.id,
        status: cohort.status,
        isActive: cohort.isActive,
      })
    })
  })

  // Ordenar todos los datos por fecha cronológicamente
  allProgressionData.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateA - dateB
  })

  // Crear datos para el gráfico principal (evolución general)
  const mainChartData = allProgressionData.map((point) => ({
    date: point.dateFormatted,
    dateOriginal: point.date,
    score: point.score,
    cohortName: point.cohortName,
    evaluationId: point.evaluationId,
  }))

  // Calcular estadísticas para mostrar en el gráfico
  const totalEvaluations = allProgressionData.length
  const averageScore =
    allProgressionData.reduce((sum, point) => sum + point.score, 0) /
    totalEvaluations
  const trend =
    totalEvaluations > 1
      ? allProgressionData[totalEvaluations - 1].score -
        allProgressionData[0].score
      : 0

  // Colores para las líneas
  const colors = [
    '#2196f3',
    '#f50057',
    '#ff9800',
    '#4caf50',
    '#9c27b0',
    '#00bcd4',
    '#ff5722',
    '#795548',
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: payload[0].color }}>
            Puntuación: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Cohorte: {data.cohortName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Evaluación: {data.evaluationId}
          </Typography>
        </Box>
      )
    }
    return null
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Información de resumen */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          {type === 'teacher'
            ? `Progresión del ${roleTitle} (Último Año)`
            : 'Progresión de la Cohorte (Último Año)'}
        </Typography>
        <Box display="flex" gap={2}>
          <Chip
            label={`${totalEvaluations} evaluaciones`}
            size="small"
            color="primary"
          />
          <Chip
            label={`Promedio: ${averageScore.toFixed(1)}`}
            size="small"
            color="secondary"
          />
          <Chip
            label={`Tendencia: ${trend > 0 ? '+' : ''}${trend.toFixed(1)}`}
            size="small"
            color={trend >= 0 ? 'success' : 'error'}
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mainChartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[5, 10]}
              tick={{ fontSize: 12 }}
              label={{
                value:
                  type === 'teacher'
                    ? `Puntuación ${roleTitle}`
                    : 'Puntuación Cohorte',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Línea principal de progresión */}
            <Line
              type="monotone"
              dataKey="score"
              name="Progresión"
              stroke="#2196f3"
              strokeWidth={3}
              dot={{ r: 5, fill: '#2196f3' }}
              activeDot={{ r: 7, fill: '#1976d2' }}
              connectNulls={false}
            />

            {/* Línea de promedio */}
            <Line
              type="monotone"
              dataKey={() => averageScore}
              name="Promedio"
              stroke="#ff9800"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Información adicional */}
      <Box mt={2} mb={1} pb={1}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          <strong>Interpretación:</strong> La línea azul muestra la evolución
          cronológica de las puntuaciones. La línea naranja punteada representa
          el promedio general ({averageScore.toFixed(1)}).
        </Typography>
      </Box>
    </Box>
  )
}
