import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchAndSetUser } from '../hooks/useFetchAndSetUser';
import useGlobalReducer from '../hooks/useGlobalReducer';

function getNextMidnightUTC() {
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return nextMidnight.toISOString();
}

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
      localStorage.setItem('expires_at', getNextMidnightUTC());
      // Manejar la promesa correctamente
      (async () => {
        const ok = await fetchAndSetUser(token, true);
        if (ok) navigate('/courses');
        // Si no, el hook ya hace logout y redirige
      })();
    } else {
      localStorage.clear();
      dispatch({ type: 'logout' });
      navigate('/');
    }
  }, [location, navigate, dispatch, fetchAndSetUser]);

  return <div>Autenticando con Github...</div>;
} 