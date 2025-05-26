import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('expires_at');
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