import { Alert } from '@mui/material'

const KeepPrivateVisualAlert = ({ student }) => {
  // Verificar si el estudiante tiene keep_private activado
  const isKeepPrivate = student?.keep_private || student?.basicInfo?.keep_private

  if (!isKeepPrivate) {
    return null
  }

  return (
    <Alert
      severity="warning"
      sx={{
        mt: 0.5,
        mb: 0.5,
        py: 0.5,
        px: 1,
        fontSize: '0.75rem',
        border: '1px solid #ed6c02',
        backgroundColor: 'rgba(237, 108, 2, 0.08)',
        '& .MuiAlert-icon': {
          fontSize: '1rem',
        },
        '& .MuiAlert-message': {
          padding: 0,
        },
      }}
    >
      📷 Este alumno no ha firmado los derechos de uso de imagen. No se le puede obligar a usar la cámara en clase.
    </Alert>
  )
}

export default KeepPrivateVisualAlert
