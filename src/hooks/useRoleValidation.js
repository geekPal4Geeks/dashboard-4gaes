import { useState, useCallback, useEffect } from 'react';
import useGlobalReducer from './useGlobalReducer';
import { getUserMe } from '../services/authService';
import { ALLOWED_ACADEMIES } from '../store';

const allowedRoles = ['teacher', 'assistant', 'academy_coordinator', 'country_manager', 'career_support', 'admin'];

export function useRoleValidation({ watch = false } = {}) {
  const { store, dispatch } = useGlobalReducer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateRole = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setError('No token');
      dispatch({ type: 'logout' });
      return false;
    }
    try {
      const user = await getUserMe(token);
      const roleObj = user.roles.find(
        r => r.academy && ALLOWED_ACADEMIES.includes(r.academy.id) && allowedRoles.includes(r.role)
      );
      const role = roleObj ? roleObj.role : 'spy';
      const userName = user.first_name + ' ' + user.last_name;

      if (role === 'spy') {
        localStorage.clear();
        dispatch({ type: 'logout' });
        setLoading(false);
        setError('No tienes permisos');
        return false;
      }

      dispatch({ type: 'set_user_info', payload: { userName, userRole: role } });
      setLoading(false);
      return true;
    } catch (err) {
      localStorage.clear();
      dispatch({ type: 'logout' });
      setLoading(false);
      setError('Error validando permisos');
      return false;
    }
  }, [dispatch]);

  useEffect(() => {
    if (watch && store.userRole) {
      validateRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.userRole, watch]);

  return { validateRole, loading, error };
} 