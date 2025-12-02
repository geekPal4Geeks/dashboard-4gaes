import { Paper, Typography, Box, Grid, Chip } from '@mui/material'

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
              <Typography variant="h6" fontWeight="bold">
                Mes en curso
              </Typography>
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
                <Typography variant="body2">Realizadas a pagar:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {currentMonthSummary.realizadasAPagar || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">No realizadas a pagar:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {currentMonthSummary.noRealizadasAPagar || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {currentMonthSummary.total || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">No corresponden:</Typography>
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
              <Typography variant="h6" fontWeight="bold">
                Mes anterior
              </Typography>
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
                <Typography variant="body2">Realizadas a pagar:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {previousMonthSummary.realizadasAPagar || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">No realizadas a pagar:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {previousMonthSummary.noRealizadasAPagar || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {previousMonthSummary.total || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">No corresponden:</Typography>
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

