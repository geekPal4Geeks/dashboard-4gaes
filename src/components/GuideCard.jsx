import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function GuideCard() {
  const navigate = useNavigate()

  return (
    <Card
      sx={{
        width: 350,
        minHeight: 150,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardContent sx={{ pb: 0, flexGrow: 1, flexShrink: 1, flexBasis: 'auto' }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              bgcolor: '#1976d2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1
            }}
          >
            <Typography variant="h6" color="white">
              📚
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Guías y Recursos
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Accede a documentación, tutoriales y recursos útiles para potenciar tu experiencia en la plataforma.
        </Typography>
      </CardContent>
      <CardActions sx={{ pt: 0, mt: '10px' }}>
        <Button
          variant="text"
          color="primary"
          onClick={() => navigate('/documentation')}
        >
          Ver documentación &rarr;
        </Button>
      </CardActions>
    </Card>
  )
}
