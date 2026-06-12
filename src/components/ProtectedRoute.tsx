import React from 'react';
import { Navigate } from 'react-router-dom';
import { useListasEspera } from '../hooks/useListasEspera';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { token, userRole } = useListasEspera();

  // Si no hay token, redirigir a login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si se definen roles permitidos y el usuario no tiene ninguno de ellos
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    console.warn(`Acceso denegado a la ruta. Rol actual: ${userRole}. Roles requeridos:`, allowedRoles);
    
    // Redireccionar al dashboard correspondiente según el rol del usuario conectado
    if (userRole === 'ROLE_MEDICO') {
      return <Navigate to="/app/medico" replace />;
    } else if (userRole === 'ROLE_PACIENTE') {
      return <Navigate to="/app/paciente" replace />;
    } else if (userRole === 'ROLE_ADMIN') {
      return <Navigate to="/app/admin" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
