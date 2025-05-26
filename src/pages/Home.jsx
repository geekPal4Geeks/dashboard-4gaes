import { Container, Typography, Box } from '@mui/material'

function Home() {
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
          Welcome to Dashboard 4Geeks
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your modern React dashboard application
        </Typography>
      </Box>
    </Container>
  )
}

export default Home 