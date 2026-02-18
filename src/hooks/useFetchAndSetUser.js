import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlobalReducer from './useGlobalReducer';
import { getUserMe } from '../services/authService';
import { ALLOWED_ACADEMIES } from '../store';

const allowedRoles = ['teacher', 'assistant', 'academy_coordinator', 'country_manager', 'career_support'];

function extractUserAcademies(roles) {
  const seen = new Set();
  return roles
    .filter(r => r.academy && ALLOWED_ACADEMIES.includes(r.academy.id) && allowedRoles.includes(r.role))
    .reduce((acc, r) => {
      const key = `${r.academy.id}-${r.role}`;
      if (!seen.has(r.academy.id)) {
        seen.add(r.academy.id);
        acc.push({
          id: r.academy.id,
          name: r.academy.name,
          slug: r.academy.slug,
          role: r.role,
        });
      }
      return acc;
    }, []);
}

export function useFetchAndSetUser() {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const fetchAndSetUser = useCallback(async (token, redirect = true) => {
    try {
      const user = await getUserMe(token);
      const academies = extractUserAcademies(user.roles);

      if (academies.length === 0) {
        localStorage.clear();
        dispatch({ type: 'logout' });
        if (redirect) navigate('/');
        return false;
      }

      const defaultAcademy = academies[0];
      const userName = user.first_name + ' ' + user.last_name;

      dispatch({
        type: 'set_user_info',
        payload: {
          userName,
          userRole: defaultAcademy.role,
          userAcademies: academies,
          activeAcademy: defaultAcademy,
          token: token,
        },
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