import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';

export default function CourseCard({ name, icon }) {
  return (
    <Card
      sx={{
        width: 350,
        height: 300,
        border: '1px solid #e0e0e0',
        bgcolor: '#fff',
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Box sx={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={600}>
          {name}
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="outlined" color="primary" fullWidth>
          Loading...
        </Button>
      </CardActions>
    </Card>
  );
} 