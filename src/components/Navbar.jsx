import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import useGlobalReducer from '../hooks/useGlobalReducer'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import logo from '../assets/logo-4geeks.ico'
import AccountCircle from '@mui/icons-material/AccountCircle'

export const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { store, dispatch } = useGlobalReducer()
  const role = store.userRole

  const canSeeManagement =
    role === 'academy_coordinator' || role === 'country_manager'

  const canSeeProfile = role === 'teacher' || role === 'assistant'

  const handleLogout = () => {
    localStorage.clear()
    dispatch({ type: 'logout' })
    navigate('/')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const buttonStyles = (path) => ({
    color: isActive(path) ? 'primary.main' : 'inherit',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    transition: 'all 0.2s ease',
  })

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img
            src={logo}
            alt="4Geeks Logo"
            style={{ height: '30px', width: 'auto' }}
          />
          <Typography
            variant="h5"
            component={RouterLink}
            to="/home"
            sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
          >
            4Geeks Spain Dashboard
          </Typography>
        </Box>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/courses"
            sx={buttonStyles('/courses')}
          >
            Cursos
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/mentorships"
            sx={buttonStyles('/mentorships')}
          >
            Mentorías
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/students"
            sx={buttonStyles('/students')}
          >
            Estudiantes
          </Button>
          {canSeeManagement && (
            <Button
              color="inherit"
              component={RouterLink}
              to="/courses-management"
              sx={buttonStyles('/courses-management')}
            >
              Gestión de cursos
            </Button>
          )}
          {canSeeProfile && (
            <Button
              color="inherit"
              startIcon={<AccountCircle />}
              component={RouterLink}
              to="/profile"
              sx={buttonStyles('/profile')}
            >
              Mi perfil
            </Button>
          )}
          <Button
            color="error"
            variant="outlined"
            onClick={handleLogout}
            sx={{ ml: 2 }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
