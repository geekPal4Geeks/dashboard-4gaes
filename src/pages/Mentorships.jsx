import { Container, Typography, Box } from '@mui/material';

export default function Mentorships() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Mentorships
        </Typography>
        <Typography variant="body1">Bienvenido al módulo de Mentorships.</Typography>
      </Box>
    </Container>
  );
} 