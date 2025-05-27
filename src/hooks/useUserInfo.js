import { useEffect } from 'react';
import useGlobalReducer from './useGlobalReducer';
import { useFetchAndSetUser } from './useFetchAndSetUser';

export function useUserInfo() {
  const { store } = useGlobalReducer();
  const fetchAndSetUser = useFetchAndSetUser();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && (!store.userName || !store.userRole)) {
      fetchAndSetUser(token, true); // true para redirigir si es spy o error
    }
  }, [store.userName, store.userRole, fetchAndSetUser]);
} 