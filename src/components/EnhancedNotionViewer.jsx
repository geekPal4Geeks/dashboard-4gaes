import { useState, useEffect, useMemo } from 'react'
import { Typography, Box, Chip, CircularProgress } from '@mui/material'
import HierarchicalNotionMenu from './HierarchicalNotionMenu'
import DocPageView from './DocPageView'
import NotionRenderer from './NotionRenderer'
import { useParams, useNavigate } from 'react-router-dom'
import {
  isLegacyNotionPageIdParam,
  LEGACY_NOTION_ID_TO_SLUG,
  getNotionPageIdForSlug,
} from '../config/documentationMenu'

/**
 * Documentación: todas las guías con pageId usan Notion; resto, Markdown (DocPageView).
 */
export default function EnhancedNotionViewer({ menuItems, token }) {
  const [selectedPageId, setSelectedPageId] = useState(null)
  const { pageId: routeParam } = useParams()
  const navigate = useNavigate()

  const homePage = useMemo(
    () => menuItems.find((item) => item.category === 'Inicio'),
    [menuItems]
  )
  const homeId = homePage?.id

  useEffect(() => {
    if (!homeId) return
    if (!routeParam) {
      setSelectedPageId(homeId)
      return
    }
    if (isLegacyNotionPageIdParam(routeParam)) {
      const legacyKey = routeParam.toLowerCase()
      const next = LEGACY_NOTION_ID_TO_SLUG[legacyKey] ?? LEGACY_NOTION_ID_TO_SLUG[routeParam]
      navigate(next ? `/documentation/${next}` : '/documentation', {
        replace: true,
      })
      return
    }
    setSelectedPageId(routeParam)
  }, [routeParam, homeId, navigate])

  const handleSelectPage = (slug) => {
    const page = menuItems.find((item) => item.id === slug)
    setSelectedPageId(slug)
    if (page && page.category === 'Inicio') {
      navigate('/documentation')
    } else {
      navigate(`/documentation/${slug}`)
    }
  }

  const contentSlug = useMemo(() => {
    if (!homeId) return null
    if (!routeParam) return homeId
    if (isLegacyNotionPageIdParam(routeParam)) return null
    return routeParam
  }, [routeParam, homeId])

  const renderNotionOrMarkdown = (slug) => {
    const notionPageId = getNotionPageIdForSlug(slug)
    if (notionPageId) {
      return (
        <NotionRenderer
          key={notionPageId}
          pageId={notionPageId}
          token={token}
        />
      )
    }
    return <DocPageView slug={slug} />
  }

  const renderContent = () => {
    if (routeParam && isLegacyNotionPageIdParam(routeParam)) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="320px"
        >
          <CircularProgress />
        </Box>
      )
    }
    if (contentSlug) {
      return renderNotionOrMarkdown(contentSlug)
    }
    if (!selectedPageId) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '500px',
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'grey.300',
            textAlign: 'center',
            p: 4,
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            ¡Bienvenido a la documentación!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona una página del menú lateral.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Chip label="Proyectos" color="primary" variant="outlined" />
            <Chip label="Mentorías" color="secondary" variant="outlined" />
            <Chip label="Guías" color="default" variant="outlined" />
          </Box>
        </Box>
      )
    }
    return renderNotionOrMarkdown(selectedPageId)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        height: 'calc(100vh - 64px)',
        width: '100%',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          width: 320,
          height: '100%',
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          overflowY: 'auto',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <HierarchicalNotionMenu
          menuItems={menuItems}
          onSelectPage={handleSelectPage}
          selectedPageId={selectedPageId}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          overflow: 'hidden',
        }}
      >
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: 0,
            py: 1,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {renderContent()}
        </Box>

        <Box
          role="complementary"
          sx={{
            flexShrink: 0,
            p: 3,
            backgroundColor: 'primary.light',
            borderRadius: 2,
            mx: { xs: 2, sm: 4 },
            mb: 2,
            mt: 0,
          }}
        >
          <Typography
            variant="body2"
            color="primary.contrastText"
            align="center"
          >
            ¿Dudas? Escribe a tu coordinador o al canal de Slack del programa.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
