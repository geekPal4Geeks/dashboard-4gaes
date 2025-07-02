import { Container, Typography, Box, Grid, Card, CardContent, CardActions, Button } from '@mui/material'
import useGlobalReducer from '../hooks/useGlobalReducer'
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import GuideCard from '../components/GuideCard'
import Masonry from '@mui/lab/Masonry'

function Home() {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const role = store.userRole;
    const canSeeManagement = role === 'academy_coordinator' || role === 'country_manager';
    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight={500} gutterBottom>
                    ¡Hola {store.userName || 'Invitado'}!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Descubre todo lo que puedes hacer en nuestra plataforma.
                </Typography>
                <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
                    <GuideCard />
                    <Card sx={{ width: 350, minHeight: 175, boxShadow: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <CardContent sx={{ pb: 0, flexGrow: 1, flexShrink: 1, flexBasis: 'auto' }}>
                            <Box display="flex" alignItems="center" mb={1}>
                                <SchoolIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />
                                <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center' }}>
                                    Cursos
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2, fontWeight: 400 }}>
                                        Supervisa tus cursos
                                    </Typography>
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                Visualiza información relevante de cada estudiante, su progreso y agrega comentarios sobre los alumnos.
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                Además, en estas etapas puedes:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <b>Prework:</b> Toma asistencia a los alumnos en su inicio.<br />
                                <b>Proyecto Final:</b> Completar el review de los alumnos.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ pt: 0, mt: '10px' }}>
                            <Button onClick={() => navigate('/courses')}>Supervisar curso &rarr;</Button>
                        </CardActions>
                    </Card>
                    <Card sx={{ width: 350, minHeight: 175, boxShadow: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <CardContent sx={{ pb: 0, flexGrow: 1, flexShrink: 1, flexBasis: 'auto' }}>
                            <Box display="flex" alignItems="center" mb={1}>
                                <GroupIcon color="secondary" sx={{ fontSize: 36, mr: 1 }} />
                                <Typography variant="h6" fontWeight={700}>Mentorías</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                Registra tus mentorías o entrevistas simuladas realizadas o canceladas.
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ pt: 0, mt: '10px' }}>
                            <Button onClick={() => navigate('/mentorships')} color="secondary">Registrar mentoría &rarr;</Button>
                        </CardActions>
                    </Card>
                    {canSeeManagement && (
                        <Card sx={{ width: 350, minHeight: 175, boxShadow: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <CardContent sx={{ pb: 0, flexGrow: 1, flexShrink: 1, flexBasis: 'auto' }}>
                                <Box display="flex" alignItems="center" mb={1}>
                                    <SettingsIcon sx={{ fontSize: 36, mr: 1, color: '#2ecc71' }} />
                                    <Typography variant="h6" fontWeight={700}>Gestión de cursos</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" mb={1}>
                                    Visualiza información de tus alumnos, pasa asistencia en prework, revisa proyectos pendientes y recibe alertas para completar reviews en proyecto final.
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ pt: 0, mt: '10px' }}>
                                <Button onClick={() => navigate('/courses-management')} sx={{ color: '#2ecc71' }}>Ir a gestión de cohortes &rarr;</Button>
                            </CardActions>
                        </Card>
                    )}
                </Masonry>
            </Box>
        </Container>
    )
}

export default Home 