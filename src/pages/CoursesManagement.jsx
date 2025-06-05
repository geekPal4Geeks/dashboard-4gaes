import { Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function CoursesManagement() {
  const navigate = useNavigate();

  // Redirección si no hay token
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Gestión de Cursos
        </Typography>
        <Typography variant="body1">Bienvenido al módulo de Gestión de Cursos.</Typography>
      </Box>
    </Container>
  );
} 