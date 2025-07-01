import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip,
  Divider,
  Skeleton,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import WarningIcon from '@mui/icons-material/Warning'
// import BookmarkIcon from '@mui/icons-material/Bookmark' // Eliminar importación
import {
  formatDate,
  getCourseCardStageColor,
  getCourseCardStageLabel,
  getCourseCardRoleLabel,
  getCourseCardBorderColor,
} from '../utils/cohortHelpers'

export default function CourseCard({ cohort }) {
  const navigate = useNavigate()

  if (!cohort || !cohort.cohort) {
    console.error("CourseCard recibió un prop 'cohort' inválido:", cohort)
    return null
  }

  // Si la card está cargando, mostrar skeleton
  if (cohort.isLoading) {
    return (
      <Card
        sx={{
          width: 350,
          height: 'auto',
          minHeight: 300,
          border: '1px solid #e0e0e0',
          bgcolor: '#f5f5f5',
          boxShadow: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          borderLeft: `8px solid ${getCourseCardBorderColor(
            cohort.cohort.stage?.toUpperCase()
          )}`,
          opacity: 0.7,
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Skeleton variant="rectangular" width={60} height={24} />
            <Skeleton variant="rectangular" width={80} height={24} />
          </Box>
          
          <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
          <Divider />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="85%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="70%" />
          </Box>
          
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="rectangular" width={30} height={24} />
          </Box>
        </CardContent>
        <CardActions>
          <Skeleton variant="rectangular" width="100%" height={36} />
        </CardActions>
      </Card>
    )
  }

  // Verificar si falta la información de Notion
  if (!cohort.notionInfo) {
    return (
      <Card
        sx={{
          width: 350,
          height: 'auto',
          minHeight: 350,
          border: '1px solid #e0e0e0',
          bgcolor: '#fff',
          boxShadow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'visible',
          borderLeft: `8px solid ${getCourseCardBorderColor(
            cohort.cohort.stage?.toUpperCase()
          )}`,
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: 2,
          }}
        >
          <WarningIcon color="warning" sx={{ fontSize: 60 }} />
          <Typography variant="h6" color="text.secondary">
            Información de Notion no disponible
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Por favor, contacte al equipo académico para más detalles sobre esta
            cohorte.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nombre de la cohorte: {cohort.cohort?.name || 'Sin nombre'}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Renderizar la tarjeta completa si la información de Notion está disponible
  return (
    <Card
      sx={{
        width: 350,
        height: 'auto',
        minHeight: 300,
        border: '1px solid #e0e0e0',
        bgcolor: '#fff',
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
        borderLeft: `8px solid ${getCourseCardBorderColor(
          cohort.cohort.stage?.toUpperCase()
        )}`,
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            {cohort.notionInfo?.properties?.['Projects in review']?.number >
              20 && (
              <Tooltip
                title={`${cohort.notionInfo?.properties['Projects in review'].number} proyectos pendientes`}
                arrow
              >
                <Chip
                  label={
                    cohort.cohort.stage === 'FINAL_PROJECT' ||
                    cohort.role === 'ASSISTANT' ||
                    cohort.role === 'ASISTANT'
                      ? `${cohort.notionInfo?.properties['Projects in review'].number} proyectos pend...`
                      : `${cohort.notionInfo?.properties['Projects in review'].number} proyectos pendientes`
                  }
                  color="warning"
                  variant="outlined"
                  icon={<WarningIcon />}
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    maxWidth:
                      cohort.cohort.stage === 'FINAL_PROJECT' ||
                      cohort.role === 'ASSISTANT'
                        ? 140
                        : 'none',
                    overflow:
                      cohort.cohort.stage === 'FINAL_PROJECT' ||
                      cohort.role === 'ASSISTANT'
                        ? 'hidden'
                        : 'visible',
                    textOverflow:
                      cohort.cohort.stage === 'FINAL_PROJECT' ||
                      cohort.role === 'ASSISTANT'
                        ? 'ellipsis'
                        : 'unset',
                    whiteSpace: 'nowrap',
                    '& .MuiChip-icon': {
                      color: 'inherit',
                    },
                  }}
                />
              </Tooltip>
            )}
            <Chip
              label={getCourseCardStageLabel(cohort.cohort.stage)}
              color={getCourseCardStageColor(cohort.cohort.stage)}
              size="small"
            />
            <Chip
              label={getCourseCardRoleLabel(cohort.role)}
              color="primary"
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <Typography variant="h5" color="text.primary">
          <strong>
            {(cohort.cohort?.name || 'Sin nombre')
              .replaceAll('-', ' ')
              .replace(/^./, (str) => str.toUpperCase())}
          </strong>
        </Typography>
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>Inicio Prework:</strong>{' '}
            {formatDate(
              cohort.notionInfo.properties?.['Start date (prework)']?.date
                ?.start
            )}
          </Typography>
          <Typography variant="body2">
            <strong>Inicio Contenido:</strong>{' '}
            {formatDate(
              cohort.notionInfo.properties?.['Start Date (content)']?.date
                ?.start
            )}
          </Typography>
          <Typography variant="body2">
            <strong>Finaliza:</strong>{' '}
            {formatDate(
              cohort.notionInfo.properties?.['End Date (course)']?.date?.start
            )}
          </Typography>
          <Typography variant="body2">
            <strong>Estudiantes:</strong>{' '}
            {cohort.notionInfo.properties?.['Active (#)']?.rollup?.number || 0}
          </Typography>
        </Box>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Proyectos pendientes de revisión:
          </Typography>
          <Typography
            variant="h6"
            color={
              cohort.notionInfo?.properties?.['Projects in review']?.number > 20
                ? 'warning.main'
                : 'text.primary'
            }
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {cohort.notionInfo?.properties?.['Projects in review']?.number || 0}
            {cohort.notionInfo?.properties?.['Projects in review']?.number >
              20 && <WarningIcon sx={{ ml: 0.5 }} color="warning" />}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="info"
          fullWidth
          onClick={() => navigate(`/cohort/${cohort.cohort.id}`)}
        >
          Ver detalles
        </Button>
      </CardActions>
    </Card>
  )
}
