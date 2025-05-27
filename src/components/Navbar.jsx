import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from '../hooks/useGlobalReducer';

export const Navbar = () => {
	const navigate = useNavigate();
	const { dispatch } = useGlobalReducer();

	const handleLogout = () => {
		localStorage.clear();
		dispatch({ type: 'logout' });
		navigate('/');
	};

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container d-flex justify-content-between align-items-center">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">4Geeks Spain Dashboard</span>
				</Link>
				<button className="btn btn-outline-danger" onClick={handleLogout}>
					Logout
				</button>
			</div>
		</nav>
	);
};