import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Divider,
  Collapse,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Article, 
  ExpandMore, 
  FolderOpen, 
  School,
  SupervisorAccount,
  ArrowBack
} from '@mui/icons-material';

const COURSE_TYPES = [
  { label: 'FS', value: 'FS' },
  { label: 'DS', value: 'DS' },
  { label: 'CS', value: 'CS' }
];

const getCategoryIcon = (category) => {
  switch(category) {
    case 'Proyectos': return <School />;
    case 'Mentorías': return <SupervisorAccount />;
    default: return <Article />;
  }
};

const getCategoryColor = (category) => {
  switch(category) {
    case 'Proyectos': return 'primary';
    case 'Mentorías': return 'secondary';
    default: return 'default';
  }
};

const getCategoryDisplayName = (category) => {
  if (category === 'Proyectos') return 'Guías del Curso';
  return category;
};

export default function HierarchicalNotionMenu({ menuItems, onSelectPage, selectedPageId }) {
  const [expandedCategories, setExpandedCategories] = useState(['Mentorías', 'Proyectos']);
  const [selectedCourses, setSelectedCourses] = useState([]); // FS, DS, CS
  const navigate = useNavigate();

  if (!menuItems || menuItems.length === 0) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No hay elementos en el menú
        </Typography>
      </Paper>
    );
  }

  // Filtrar items por cursos seleccionados
  const filterByCourse = (item) => {
    if (!selectedCourses.length) return true;
    if (!item.courses) return false;
    // item.courses puede ser un string o array
    if (Array.isArray(item.courses)) {
      return item.courses.some(c => selectedCourses.includes(c));
    }
    return selectedCourses.includes(item.courses);
  };

  // Buscar la página de Inicio (Responsabilidades de los Mentores) - SIEMPRE visible
  const homePage = menuItems.find(item => item.category === 'Inicio');

  // Agrupar elementos por categoría y filtrar por curso (excepto Mentorías y Inicio)
  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'General';
    if (category === 'Mentorías') {
      // Siempre incluir Mentorías
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }
    if (category === 'Inicio') return acc; // No incluir Inicio en otras categorías
    if (!filterByCourse(item)) return acc;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Ordenar categorías: Proyectos, How to, Mentorías
  const categoryOrder = ['Proyectos', 'How to', 'Mentorías'];
  const sortedGroupedItems = Object.entries(groupedItems).sort((a, b) => {
    const idxA = categoryOrder.indexOf(a[0]);
    const idxB = categoryOrder.indexOf(b[0]);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const handleCategoryToggle = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleChipToggle = (course) => {
    setSelectedCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  return (
    <Paper sx={{ mb: 2 }}>
      <Box sx={{ p: 0 }}>
        {/* Botón de back */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ListItemButton
            onClick={() => navigate('/courses')}
            sx={{
              borderRadius: 1,
              px: 2,
              py: 1,
              minHeight: 40,
              color: 'primary.main',
              fontWeight: 'bold',
            }}
          >
            <ArrowBack sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Back
            </Typography>
          </ListItemButton>
        </Box>
        {/* Chips de cursos */}
        <Box sx={{ display: 'flex', gap: 1, px: 2, pt: 1, pb: 1 }}>
          {COURSE_TYPES.map(type => (
            <Chip
              key={type.value}
              label={type.label}
              color={selectedCourses.includes(type.value) ? 'primary' : 'default'}
              variant={selectedCourses.includes(type.value) ? 'filled' : 'outlined'}
              clickable
              onClick={() => handleChipToggle(type.value)}
            />
          ))}
        </Box>
        {/* Pestaña Inicio como elemento de lista */}
        {homePage && (
          <List sx={{ py: 0, mb: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => onSelectPage(homePage.id)}
                selected={selectedPageId === homePage.id}
                sx={{
                  pl: 3,
                  px: 3,
                  py: 1,
                  m: 0,
                  height: 48,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Article sx={{ mr: 2, opacity: 0.7, fontSize: 20 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Inicio
                        </Box>
                      }
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </Box>
                </Box>
              </ListItemButton>
            </ListItem>
          </List>
        )}
      </Box>
      <Divider />
      
      {sortedGroupedItems.map(([category, items]) => (
        <Accordion 
          key={category}
          expanded={expandedCategories.includes(category)}
          onChange={() => handleCategoryToggle(category)}
          sx={{ 
            boxShadow: 'none',
            '&:before': { display: 'none' },
            '&.MuiAccordion-root': { margin: 0 }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ 
              backgroundColor: 'grey.50',
              borderBottom: '1px solid',
              borderColor: 'divider',
              minHeight: 48,
              '&.Mui-expanded': { minHeight: 48 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getCategoryIcon(category)}
              <Typography variant="subtitle1" fontWeight="medium">
                {getCategoryDisplayName(category)}
              </Typography>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails sx={{ p: 0 }}>
            <List sx={{ py: 0 }}>
              {items.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={selectedPageId === item.id}
                    onClick={() => onSelectPage(item.id)}
                    sx={{
                      pl: 3,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Article sx={{ mr: 2, opacity: 0.7, fontSize: 20 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {item.title}
                            </Box>
                          }
                          secondary={item.description}
                          primaryTypographyProps={{ fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    
    </Paper>
  );
} 