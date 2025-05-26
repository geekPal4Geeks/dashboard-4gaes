import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function getNextMidnightUTC() {
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return nextMidnight.toISOString();
}

export default function GithubCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Set expiration to next 00:00 UTC
      localStorage.setItem('expires_at', getNextMidnightUTC());
      navigate('/home');
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  return <div>Autenticando con Github...</div>;
} 