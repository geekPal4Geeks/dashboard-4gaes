import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Box, Typography } from '@mui/material'
import { getScoreColor } from '../../services/mentorNpsService'

export default function NpsComparisonCharts({ data, filteredCohorts }) {
  if (!data || data.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <Typography color="textSecondary">
          No hay datos de comparación disponibles
        </Typography>
      </Box>
    )
  }

  // Preparar datos para el gráfico de barras
  const chartData = data.map((item) => ({
    cohort: item.cohortName,
    teacher: item.teacherAverage,
    cohort: item.cohortAverage,
    participation: item.participation * 100, // Convertir a porcentaje
    totalEvaluations: item.totalEvaluations,
  }))

  // Filtrar datos si hay cohortes filtradas
  const displayData =
    filteredCohorts && filteredCohorts.length > 0
      ? chartData.filter((item) =>
          filteredCohorts.some((cohort) => cohort.name === item.cohort)
        )
      : chartData

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name === 'teacher'
                ? 'Profesor'
                : entry.name === 'cohort'
                ? 'Cohorte'
                : 'Participación'}
              : {entry.value}
              {entry.name === 'participation' ? '%' : ''}
            </Typography>
          ))}
        </Box>
      )
    }
    return null
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={displayData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="cohort"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 12 }}
            label={{
              value: 'Puntuación',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Bar
            dataKey="teacher"
            name="Profesor"
            fill="#2196f3"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="cohort"
            name="Cohorte"
            fill="#ff9800"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Resumen estadístico */}
      <Box
        display="flex"
        justifyContent="space-around"
        mt={3}
        flexWrap="wrap"
        gap={2}
      >
        {displayData.length > 0 && (
          <>
            <Box textAlign="center">
              <Typography variant="h6" color="primary">
                {displayData.reduce((sum, item) => sum + item.teacher, 0) /
                  displayData.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Promedio Profesor
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="warning.main">
                {displayData.reduce((sum, item) => sum + item.cohort, 0) /
                  displayData.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Promedio Cohorte
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="success.main">
                {displayData.reduce(
                  (sum, item) => sum + item.participation,
                  0
                ) / displayData.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Participación Promedio (%)
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" color="info.main">
                {displayData.reduce(
                  (sum, item) => sum + item.totalEvaluations,
                  0
                )}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Evaluaciones
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
