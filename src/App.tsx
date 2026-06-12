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

// Redirige a la sección correcta según el rol del usuario autenticado
const DashboardRedirect: React.FC = () => {
  const { userRole } = useListasEspera();

  if (userRole === 'ROLE_MEDICO') return <Navigate to="/app/medico" replace />;
  if (userRole === 'ROLE_PACIENTE') return <Navigate to="/app/paciente" replace />;
  if (userRole === 'ROLE_ADMIN') return <Navigate to="/app/admin" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ListasEsperaProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Rutas Públicas ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Rutas Protegidas bajo /app (evita colisión con la Landing Page) ── */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Índice: redirige automáticamente al panel del rol */}
            <Route index element={<DashboardRedirect />} />

            {/* Consola del Médico */}
            <Route
              path="medico"
              element={
                <ProtectedRoute allowedRoles={['ROLE_MEDICO', 'ROLE_ADMIN']}>
                  <ListaEsperaContainer />
                </ProtectedRoute>
              }
            />

            {/* Portal del Paciente */}
            <Route
              path="paciente"
              element={
                <ProtectedRoute allowedRoles={['ROLE_PACIENTE', 'ROLE_MEDICO', 'ROLE_ADMIN']}>
                  <CitasDashboardContainer />
                </ProtectedRoute>
              }
            />

            {/* Consola de Administración */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Cualquier ruta desconocida → Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ListasEsperaProvider>
  );
}

export default App;
