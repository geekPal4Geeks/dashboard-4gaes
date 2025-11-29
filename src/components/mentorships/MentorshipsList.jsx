import { useState, useMemo } from 'react'
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Checkbox,
  Tooltip,
  Box,
  IconButton,
  TableSortLabel,
  CircularProgress,
} from '@mui/material'
import {
  formatDateTime,
  formatDuration,
  getStatusColor,
  getStatusDescription,
  getServiceColor,
  requestMentorshipReview,
} from '../../services/mentorMentorshipsService'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import CloseIcon from '@mui/icons-material/Close'
import Swal from 'sweetalert2'

export default function MentorshipsList({ mentorships, selectedMonth }) {
  // Estados que permiten solicitud de revisión
  const reviewableStatuses = ['No corresponde', 'No realizada']

  // Estado para el ordenamiento
  const [orderBy, setOrderBy] = useState('startTime')
  const [order, setOrder] = useState('desc') // 'asc' o 'desc'

  // Estado para tracking de solicitudes en proceso
  const [requestingIds, setRequestingIds] = useState(new Set())
  const [requestedIds, setRequestedIds] = useState(new Set())

  const handleReviewRequest = async (mentorship, checked) => {
    if (!checked) {
      // Si se desmarca, no hacemos nada por ahora
      return
    }

    // Si ya se solicitó, no hacer nada
    if (requestedIds.has(mentorship.id)) {
      return
    }

    // Marcar como en proceso
    setRequestingIds((prev) => new Set(prev).add(mentorship.id))

    try {
      // Preparar datos para la solicitud
      const reviewData = {
        mentorshipId: mentorship.isCancelled
          ? mentorship.mentorshipId || mentorship.id || ''
          : mentorship.id,
        student: mentorship.student,
        service: mentorship.service,
        startTime: mentorship.startTime,
        status: mentorship.status,
      }

      // Si tiene endTime, agregarlo
      if (mentorship.endTime) {
        reviewData.endTime = mentorship.endTime
      }

      // Si tiene duration, agregarlo
      if (mentorship.duration) {
        reviewData.duration = mentorship.duration
      }

      // Si es cancelada, agregar cancellationId (el id es el ID de Notion)
      if (mentorship.isCancelled && mentorship.id) {
        reviewData.cancellationId = mentorship.id
      }

      // Llamar al endpoint
      const result = await requestMentorshipReview(reviewData)

      // Marcar como solicitado
      setRequestedIds((prev) => new Set(prev).add(mentorship.id))

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: result.created
          ? 'Solicitud de revisión creada correctamente'
          : 'Solicitud de revisión actualizada correctamente',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
        timer: 3000,
        timerProgressBar: true,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error.message ||
          'Error al solicitar revisión. Por favor, intenta nuevamente.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
      })
    } finally {
      // Remover del set de en proceso
      setRequestingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(mentorship.id)
        return newSet
      })
    }
  }

  // Función para manejar el ordenamiento
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // Función para obtener la fecha de inicio para ordenamiento
  const getStartTimeForSort = (mentorship) => {
    if (mentorship.isCancelled && mentorship.cancellationDate) {
      return new Date(mentorship.cancellationDate)
    }
    return mentorship.startTime ? new Date(mentorship.startTime) : new Date(0)
  }

  // Ordenar mentorías
  const sortedMentorships = useMemo(() => {
    if (!mentorships || mentorships.length === 0) return []

    const sorted = [...mentorships].sort((a, b) => {
      const dateA = getStartTimeForSort(a)
      const dateB = getStartTimeForSort(b)

      if (order === 'asc') {
        return dateA - dateB
      } else {
        return dateB - dateA
      }
    })

    return sorted
  }, [mentorships, order])

  if (!mentorships || mentorships.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Listado de Mentorías registradas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No hay mentorías registradas para el período seleccionado.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Listado de Mentorías registradas
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Estudiante</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Servicio</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <TableSortLabel
                  active={orderBy === 'startTime'}
                  direction={orderBy === 'startTime' ? order : 'asc'}
                  onClick={() => handleRequestSort('startTime')}
                >
                  Hora de inicio
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                Hora de finalización
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Duración total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">
                Solicitud de revisión
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMentorships.map((mentorship) => {
              const isCancelled = mentorship.isCancelled
              const tooltipText = isCancelled
                ? `Cancelada${
                    mentorship.cancellationReason
                      ? ` - ${mentorship.cancellationReason}`
                      : ''
                  }${mentorship.notes ? `\nNotas: ${mentorship.notes}` : ''}`
                : getStatusDescription(mentorship.status)

              return (
                <TableRow key={mentorship.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {mentorship.student}
                      {isCancelled && (
                        <Tooltip
                          title="Mentoría cancelada o reprogramada"
                          arrow
                        >
                          <IconButton
                            size="small"
                            sx={{
                              color: '#f44336',
                              p: 0.5,
                              '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={mentorship.service || 'N/A'}
                      size="small"
                      sx={{
                        backgroundColor: getServiceColor(mentorship.service),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {isCancelled && mentorship.cancellationDate
                      ? formatDateTime(mentorship.cancellationDate)
                      : formatDateTime(mentorship.startTime)}
                  </TableCell>
                  <TableCell>
                    {isCancelled
                      ? '--'
                      : formatDateTime(mentorship.endTime) || '--'}
                  </TableCell>
                  <TableCell>
                    {isCancelled
                      ? '--'
                      : formatDuration(mentorship.duration) || '--'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={mentorship.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(mentorship.status),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                      <Tooltip title={tooltipText} arrow>
                        <IconButton size="small" sx={{ p: 0.5 }}>
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {reviewableStatuses.includes(mentorship.status) &&
                      mentorship.canRequestReview && (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          {requestingIds.has(mentorship.id) ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Checkbox
                              checked={
                                requestedIds.has(mentorship.id) ||
                                mentorship.reviewRequested ||
                                false
                              }
                              onChange={(e) =>
                                handleReviewRequest(
                                  mentorship,
                                  e.target.checked
                                )
                              }
                              size="small"
                              disabled={requestedIds.has(mentorship.id)}
                            />
                          )}
                        </Box>
                      )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
