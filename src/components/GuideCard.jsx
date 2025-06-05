import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function GuideCard() {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        width: 350,
        height: 300,
        border: '2px solid #1976d2',
        bgcolor: '#f5faff',
        boxShadow: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: '#1976d2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" color="white">📚</Typography>
        </Box>
        <Typography variant="h6" fontWeight={600}>
          Guides & Resources
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/documentation')}>
          Go to Documentation
        </Button>
      </CardActions>
    </Card>
  );
} 