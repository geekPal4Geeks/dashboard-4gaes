import { Link as RouterLink, useNavigate } from "react-router-dom";
import useGlobalReducer from '../hooks/useGlobalReducer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export const Navbar = () => {
	const navigate = useNavigate();
	const { store, dispatch } = useGlobalReducer();
	const role = store.userRole;

	const canSeeManagement = role === 'academy_coordinator' || role === 'country_manager';

	const handleLogout = () => {
		localStorage.clear();
		dispatch({ type: 'logout' });
		navigate('/');
	};

	return (
		<AppBar position="static" color="default" elevation={1}>
			<Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
				<Typography
					variant="h6"
					component={RouterLink}
					to="/"
					sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
				>
					4Geeks Spain Dashboard
				</Typography>
				<Box>
					<Button color="inherit" component={RouterLink} to="/curses">
						Curses
					</Button>
					<Button color="inherit" component={RouterLink} to="/mentorships">
						Mentorships
					</Button>
					{canSeeManagement && (
						<Button color="inherit" component={RouterLink} to="/courses-management">
							Courses Management
						</Button>
					)}
					<Button color="error" variant="outlined" onClick={handleLogout} sx={{ ml: 2 }}>
						Logout
					</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
};