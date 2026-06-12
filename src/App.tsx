import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { ListasEsperaProvider, useListasEspera } from './hooks/useListasEspera';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ListaEsperaContainer } from './containers/ListaEsperaContainer';
import { CitasDashboardContainer } from './containers/CitasDashboardContainer';

// Componente auxiliar para redirección dinámica basada en roles
const HomeRedirect: React.FC = () => {
  const { userRole, token } = useListasEspera();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole === 'ROLE_MEDICO') {
    return <Navigate to="/medico" replace />;
  } else if (userRole === 'ROLE_PACIENTE') {
    return <Navigate to="/paciente" replace />;
  } else if (userRole === 'ROLE_ADMIN') {
    return <Navigate to="/admin" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <ListasEsperaProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas Protegidas bajo MainLayout */}
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            {/* Índice: Redirección dinámica según el rol */}
            <Route index element={<HomeRedirect />} />

            {/* Consola del Médico (Gestión de lista de espera) */}
            <Route 
              path="medico" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_MEDICO', 'ROLE_ADMIN']}>
                  <ListaEsperaContainer />
                </ProtectedRoute>
              } 
            />

            {/* Portal del Paciente (Dashboard BFF) */}
            <Route 
              path="paciente" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_PACIENTE', 'ROLE_MEDICO', 'ROLE_ADMIN']}>
                  <CitasDashboardContainer />
                </ProtectedRoute>
              } 
            />

            {/* Consola de Administración (Historial de reasignación) */}
            <Route 
              path="admin" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Redirección por defecto a la raíz */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ListasEsperaProvider>
  );
}

export default App;
