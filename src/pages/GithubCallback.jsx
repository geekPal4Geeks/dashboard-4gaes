import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchAndSetUser } from '../hooks/useFetchAndSetUser';
import useGlobalReducer from '../hooks/useGlobalReducer';

function getNextMidnightUTC() {
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return nextMidnight.toISOString();
}

const allowedRoles = ['teacher', 'assistant', 'academy_coordinator', 'country_manager'];

export default function GithubCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useGlobalReducer();
  const fetchAndSetUser = useFetchAndSetUser();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Set expiration to next 00:00 UTC
      localStorage.setItem('expires_at', getNextMidnightUTC());
      // Usar el hook para obtener y setear el usuario
      fetchAndSetUser(token, true); // true para redirigir si es spy o error
    } else {
      localStorage.clear();
      dispatch({ type: 'logout' });
      navigate('/');
    }
  }, [location, navigate, dispatch, fetchAndSetUser]);

  return <div>Autenticando con Github...</div>;
} 