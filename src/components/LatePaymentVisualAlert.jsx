import { Alert } from '@mui/material'

const LatePaymentVisualAlert = ({ student }) => {
  // Verificar si el estudiante tiene pagos pendientes
  const isLate = student?.properties?.['Late payment']?.checkbox

  if (!isLate) {
    return null
  }

  return (
    <Alert
      severity="warning"
      sx={{
        mt: 2,
        mb: 2,
        border: '2px solid #d32f2f',
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        '& .MuiAlert-icon': {
          fontSize: '1.5rem',
        },
      }}
    >
      <strong>⚠️ PAGOS PENDIENTES:</strong> Este alumno tiene pagos pendientes.
      Por favor, contacta al PM para su gestión.
    </Alert>
  )
}

export default LatePaymentVisualAlert
