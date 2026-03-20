import React from 'react'
import { Grid, Card, CardContent, Typography, Box, Tooltip } from '@mui/material'
import {
  TrendingUp,
  People,
  Assessment,
  Timeline,
  Star,
  Group,
  CheckCircle,
  Schedule,
  InfoOutlined,
} from '@mui/icons-material'
import { getScoreColor } from '../../services/mentorNpsService'

const KpiCard = ({ title, value, subtitle, icon, color, trend, tooltip }) => {
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <Typography color="textSecondary" gutterBottom variant="subtitle2">
                {title}
              </Typography>
              {tooltip && (
                <Tooltip title={tooltip}>
                  <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              )}
            </Box>
            <Typography
              variant="h4"
              component="div"
              fontWeight="bold"
              color={color}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
              >
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                <TrendingUp
                  sx={{
                    fontSize: 14,
                    color: trend > 0 ? 'success.main' : 'error.main',
                    mr: 0.5,
                  }}
                />
                <Typography
                  variant="caption"
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  sx={{ fontSize: '0.7rem' }}
                >
                  {trend > 0 ? '+' : ''}
                  {trend}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: '50%',
              p: 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: 1,
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: '1.2rem',
                ...icon.props.sx,
              },
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function NpsKpiCards({ kpis, roleTitle = 'Profesor' }) {
  if (!kpis) return null

  // Usar el campo correcto según el rol
  const averageScore =
    roleTitle === 'Asistente'
      ? kpis.overallTaAverage || kpis.overallTeacherAverage
      : kpis.overallTeacherAverage

  const kpiData = [
    {
      title: `Promedio General ${roleTitle}`,
      value: averageScore?.toFixed(1) || '0.0',
      subtitle: 'Puntuación promedio en todas las evaluaciones',
      tooltip: `Promedio simple de las puntuaciones NPS recibidas por el ${roleTitle.toLowerCase()} en el período filtrado.`,
      icon: <Star sx={{ color: getScoreColor(averageScore) }} />,
      color: getScoreColor(averageScore),
      trend: null,
    },
    {
      title: 'Participación Promedio',
      value: `${
        (kpis.averageParticipation || 0) <= 1
          ? (kpis.averageParticipation * 100).toFixed(2)
          : kpis.averageParticipation.toFixed(2)
      }%`,
      subtitle: 'Porcentaje promedio de participación',
      tooltip: 'Porcentaje promedio de estudiantes que respondieron las evaluaciones NPS.',
      icon: <People sx={{ color: 'success.main' }} />,
      color: 'success.main',
      trend: null,
    },
    {
      title: 'Total Evaluaciones',
      value: kpis.totalEvaluations?.toLocaleString() || '0',
      subtitle: 'Número total de evaluaciones recibidas',
      tooltip: 'Cantidad de evaluaciones NPS incluidas en la vista actual.',
      icon: <Assessment sx={{ color: 'primary.main' }} />,
      color: 'primary.main',
      trend: null,
    },
    {
      title: 'Total Cohortes',
      value: kpis.totalCohorts || '0',
      subtitle: `${kpis.activeCohorts || 0} activas, ${
        kpis.finishedCohorts || 0
      } finalizadas`,
      tooltip: 'Número de cohortes que tienen al menos una evaluación considerada en esta vista.',
      icon: <Group sx={{ color: 'info.main' }} />,
      color: 'info.main',
      trend: null,
    },
  ]

  return (
    <Grid container spacing={1} sx={{ mb: 4 }}>
      {kpiData.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} lg={2.5} key={index}>
          <KpiCard {...kpi} />
        </Grid>
      ))}
    </Grid>
  )
}
