import { Navigate } from "react-router-dom";
import useGlobalReducer from '../hooks/useGlobalReducer';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { store } = useGlobalReducer();
  const role = store.userRole;

  if (!allowedRoles.includes(role)) {
    // Redirige a home si no tiene permisos
    return <Navigate to="/home" replace />;
  }

  return children;
} 