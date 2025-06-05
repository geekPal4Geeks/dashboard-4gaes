import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#c51162',
    },
    tertiary: {
      main: '#e2ac22', // amarillo puro (Gold)
      contrastText: '#000', // texto negro sobre fondo amarillo
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      fontFamily: 'Roboto',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      fontFamily: 'Roboto',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      fontFamily: 'Roboto',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      fontFamily: 'Roboto',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      fontFamily: 'Roboto',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      fontFamily: 'Roboto',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      fontFamily: 'Roboto',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      fontFamily: 'Roboto',
    },
    button: {
      fontWeight: 500,
      fontFamily: 'Roboto',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
})
