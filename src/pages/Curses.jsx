import { Container, Typography, Box, Grid, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ComputerIcon from '@mui/icons-material/Computer';
import useGlobalReducer from '../hooks/useGlobalReducer';
import GuideCard from '../components/GuideCard';
import CourseCard from '../components/CourseCard';

const courses = [
  { id: 1, name: 'Caracas Pre-Work', icon: <SchoolIcon sx={{ fontSize: 40, color: '#3f51b5' }} /> },
  { id: 2, name: 'Madrid PT Prueba', icon: <ComputerIcon sx={{ fontSize: 40, color: '#03a9f4' }} /> },
  { id: 3, name: 'Madrid Prework', icon: <SchoolIcon sx={{ fontSize: 40, color: '#3f51b5' }} /> },
  { id: 4, name: 'Introduction to Data Science', icon: <ComputerIcon sx={{ fontSize: 40, color: '#03a9f4' }} /> },
];

export default function Curses() {
  const { store } = useGlobalReducer();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Welcome, {store.userName || 'User'}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
          Your active programs
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <GuideCard />
          </Grid>
          {courses.map((course) => (
            <Grid item xs={12} md={6} key={course.id}>
              <CourseCard name={course.name} icon={course.icon} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
} 