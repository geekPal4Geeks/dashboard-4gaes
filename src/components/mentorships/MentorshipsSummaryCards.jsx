import { Paper, Typography, Box, Grid, Chip, Tooltip } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

export default function MentorshipsSummaryCards({
  summaries,
  selectedMonth,
  onMonthSelect,
}) {
  if (!summaries || summaries.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No hay resúmenes mensuales disponibles.
        </Typography>
      </Paper>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch (error) {
      return dateString
    }
  }

  const currentMonthSummary = summaries.find((s) => s.month === 'current')
  const previousMonthSummary = summaries.find((s) => s.month === 'previous')

  const handleCardClick = (month) => {
    if (onMonthSelect) {
      onMonthSelect(month)
    }
  }

  return (
    <Grid container spacing={3}>
      {/* Card Mes en curso */}
      {currentMonthSummary && (
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              cursor: 'pointer',
              border: selectedMonth === 'current' ? 2 : 1,
              borderColor:
                selectedMonth === 'current' ? 'primary.main' : 'divider',
              '&:hover': {
                boxShadow: 4,
              },
            }}
            onClick={() => handleCardClick('current')}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight="bold">
                  Mes en curso
                </Typography>
                <Tooltip title="Resumen de mentorías del período actualmente abierto. Haz clic para filtrar la tabla inferior.">
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              {selectedMonth === 'current' && (
                <Chip label="Seleccionado" color="primary" size="small" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Plazo {formatDate(currentMonthSummary.period?.start)} al{' '}
              {formatDate(currentMonthSummary.period?.end)}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2">Realizadas a pagar:</Typography>
                  <Tooltip title="Mentorías completadas correctamente y que sí cuentan para pago.">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {currentMonthSummary.realizadasAPagar || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2">No realizadas a pagar:</Typography>
                  <Tooltip title="Mentorías no realizadas pero que igualmente deben pagarse según la regla de negocio.">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {currentMonthSummary.noRealizadasAPagar || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2" fontWeight="bold">
                    Total:
                  </Typography>
                  <Tooltip title="Suma de las mentorías del período que cuentan para pago.">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {currentMonthSummary.total || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2">No corresponden:</Typography>
                  <Tooltip title="Mentorías registradas que no deben pagarse.">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {currentMonthSummary.noCorresponden || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      )}

      {/* Card Mes anterior */}
      {previousMonthSummary && (
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              cursor: 'pointer',
              border: selectedMonth === 'previous' ? 2 : 1,
              borderColor:
                selectedMonth === 'previous' ? 'primary.main' : 'divider',
              '&:hover': {
                boxShadow: 4,
              },
            }}
            onClick={() => handleCardClick('previous')}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight="bold">
                  Mes anterior
                </Typography>
                <Tooltip title="Resumen del período inmediatamente anterior. Haz clic para filtrar la tabla inferior.">
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              {selectedMonth === 'previous' && (
                <Chip label="Seleccionado" color="primary" size="small" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Plazo {formatDate(previousMonthSummary.period?.start)} al{' '}
              {formatDate(previousMonthSummary.period?.end)}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2">Realizadas a pagar:</Typography>
                  <Tooltip title="Mentorías completadas correctamente y que sí cuentan para pago.">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {previousMonthSummary.realizadasAPagar || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2">No realizadas a pagar:</Typography>
                  <Tooltip title="Mentorías no realizadas pero que igualmente deben pagarse según la regla de negocio.">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {previousMonthSummary.noRealizadasAPagar || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2" fontWeight="bold">
                    Total:
                  </Typography>
                  <Tooltip title="Suma de las mentorías del período que cuentan para pago.">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {previousMonthSummary.total || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="body2">No corresponden:</Typography>
                  <Tooltip title="Mentorías registradas que no deben pagarse.">
                    <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {previousMonthSummary.noCorresponden || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  )
}

