import { Container, Typography, Box } from '@mui/material'
import useGlobalReducer from '../hooks/useGlobalReducer'
function Home() {
    const { store } = useGlobalReducer();
    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    mt: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h2" component="h1" gutterBottom>
                    Bienvenido al Dashboard 4Geeks
                </Typography>
                <Typography variant="h4" component="h2" gutterBottom>
                    ¡Hola {useGlobalReducer().store.userName || 'Invitado'}!
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom>
                    Tu aplicación moderna de dashboard en React
                </Typography>
            </Box>
        </Container>
    )
}

export default Home 