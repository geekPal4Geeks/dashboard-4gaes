import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlobalReducer from './useGlobalReducer';
import { getUserMe } from '../services/authService';

const allowedRoles = ['teacher', 'assistant', 'academy_coordinator', 'country_manager', 'career_support'];

export function useFetchAndSetUser() {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  // Esta función puede ser llamada desde cualquier componente
  const fetchAndSetUser = useCallback(async (token, redirect = true) => {
    try {
      const user = await getUserMe(token);
      const roleObj = user.roles.find(
        r => r.academy && r.academy.id === 6 && allowedRoles.includes(r.role)
      );
      const role = roleObj ? roleObj.role : 'spy';
      const userName = user.first_name + ' ' + user.last_name;

      if (role === 'spy') {
        localStorage.clear();
        dispatch({ type: 'logout' });
        if (redirect) navigate('/');
        return false;
      }

      dispatch({ 
        type: 'set_user_info', 
        payload: { 
          userName, 
          userRole: role,
          token: token
        } 
      });
      return true;
    } catch (err) {
      localStorage.clear();
      dispatch({ type: 'logout' });
      if (redirect) navigate('/');
      return false;
    }
  }, [dispatch, navigate]);

  return fetchAndSetUser;
} 