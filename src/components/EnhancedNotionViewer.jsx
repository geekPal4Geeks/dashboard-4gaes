import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Chip,
  useTheme,
} from '@mui/material';
import HierarchicalNotionMenu from './HierarchicalNotionMenu';
import NotionRenderer from './NotionRenderer';
import { useParams, useNavigate } from 'react-router-dom';

// Mapeo de IDs de página a componentes personalizados

export default function EnhancedNotionViewer({ menuItems, token, title = "Documentación" }) {
  const theme = useTheme();
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedSubPageId, setSelectedSubPageId] = useState(null);
  const { pageId } = useParams();
  const navigate = useNavigate();

  const homePageId = "c9e6a7bbd0324cd7a7a29603e635ecfb";

  // Permitir obtener el pageId desde el path
  useEffect(() => {
    if (pageId && pageId !== selectedPageId) {
      setSelectedPageId(pageId);
      setSelectedSubPageId(null);
    }
    if (!pageId) {
      // Si no hay pageId, selecciona la página de Inicio (category === 'Inicio')
      const homePage = menuItems.find(item => item.category === 'Inicio');
      if (homePage && selectedPageId !== homePage.id) {
        setSelectedPageId(homePage.id);
        setSelectedSubPageId(null);
      }
    }
  }, [pageId, menuItems]);

  // Sincronizar selección con la URL
  const handleSelectPage = (pageId) => {
    const page = menuItems.find(item => item.id === pageId);
    setSelectedPageId(pageId);
    setSelectedSubPageId(null);
    if (page && page.category === 'Inicio') {
      navigate('/documentation');
    } else {
      navigate(`/documentation/${pageId}`);
    }
  };

  const handleSelectSubPage = (subPageId) => {
    setSelectedSubPageId(subPageId);
  };

  const selectedItem = menuItems?.find(item => item.id === selectedPageId);

  const renderContent = () => {
    if (selectedItem?.category === "Inicio") {
      return (
        <NotionRenderer
          pageId={homePageId}
          token={token}
        />
      );
    }
    if (selectedSubPageId) {
      return (
        <NotionRenderer
          pageId={selectedSubPageId}
          token={token}
        />
      );
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
            p: 4
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            👋 ¡Bienvenido a la documentación!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona una página del menú lateral para comenzar a explorar nuestras guías y recursos.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip label="📚 Proyectos" color="primary" variant="outlined" />
            <Chip label="👨‍🏫 Mentorías" color="secondary" variant="outlined" />
            <Chip label="🎯 Guías prácticas" color="default" variant="outlined" />
          </Box>
        </Box>
      );
    }
    return (
      <NotionRenderer
        pageId={selectedPageId}
        token={token}
      />
    );
  };

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
      {/* Sidebar */}
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

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header con título dinámico */}
        {(selectedSubPageId || selectedItem) && (
          <Box sx={{ mb: 3, pt: 3, px: 4 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{ fontWeight: 'bold', textAlign: 'center' }}
            >
              {selectedSubPageId
                ? menuItems?.find(item => item.id === selectedSubPageId)?.title
                : selectedItem?.title}
            </Typography>
          </Box>
        )}

        {/* Contenido */}
        <Box
          sx={{
            flex: 1,
            px: 0,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            mx: 0
          }}
        >
          {renderContent()}
        </Box>

        {/* Footer informativo */}
        <Box sx={{ mt: 'auto', p: 3, backgroundColor: 'primary.light', borderRadius: 2, mx: 4, mb: 3 }}>
          <Typography variant="body2" color="primary.contrastText" align="center">
            💡 ¿No encuentras lo que buscas? Contacta con tu coordinador académico o revisa el canal de Slack correspondiente.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
} 