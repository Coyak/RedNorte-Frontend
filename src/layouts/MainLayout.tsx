import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useListasEspera } from '../hooks/useListasEspera';
import { HeartPulse, Moon, Sun, RotateCcw, LogOut, Activity, ShieldCheck, History } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { username, userRole, logout, resetearDatos } = useListasEspera();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
  });
  const navigate = useNavigate();

  // Cambiar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetData = async () => {
    if (window.confirm('¿Desea restablecer y sincronizar la base de datos a sus valores de fábrica?')) {
      try {
        await resetearDatos();
        alert('Datos sincronizados correctamente.');
      } catch (err: any) {
        alert('Error al sincronizar datos: ' + err.message);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 🚀 Header Principal Premium */}
      <header style={{
        backgroundColor: 'hsl(var(--card))',
        borderBottom: '1px solid hsl(var(--border))',
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Logo y Branding */}
          <div 
            onClick={() => navigate('/')} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              color: 'white',
              padding: '0.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px hsl(var(--primary)/0.25)'
            }}>
              <HeartPulse size={24} />
            </div>
            <div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'hsl(var(--primary))',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                display: 'block',
                lineHeight: 1
              }}>
                Servicio de Salud Público
              </span>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'hsl(var(--foreground))',
                lineHeight: 1.2,
                margin: 0
              }}>
                RedNorte <span style={{ fontWeight: 400, color: 'hsl(var(--muted-foreground))', fontSize: '1rem' }}>| Plataforma Real</span>
              </h1>
            </div>
          </div>

          {/* Menú de Navegación Basado en Roles */}
          <nav style={{ display: 'flex', gap: '0.375rem' }}>
            {userRole !== 'ROLE_PACIENTE' && (
              <NavLink
                to="/medico"
                className={({ isActive }) => `rn-btn ${isActive ? 'active-nav-link' : ''}`}
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                  color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.5rem 1rem',
                  textDecoration: 'none'
                })}
              >
                <Activity size={16} />
                Lista de Espera
              </NavLink>
            )}

            <NavLink
              to="/paciente"
              className={({ isActive }) => `rn-btn ${isActive ? 'active-nav-link' : ''}`}
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                borderRadius: 'var(--radius-lg)',
                padding: '0.5rem 1rem',
                textDecoration: 'none'
              })}
            >
              <ShieldCheck size={16} />
              {userRole === 'ROLE_PACIENTE' ? 'Mi Portal de Paciente' : 'Portal de Pacientes'}
            </NavLink>

            {userRole === 'ROLE_ADMIN' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `rn-btn ${isActive ? 'active-nav-link' : ''}`}
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                  color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.5rem 1rem',
                  textDecoration: 'none'
                })}
              >
                <History size={16} />
                Auditoría
              </NavLink>
            )}
          </nav>

          {/* Acciones Rápidas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Información del Usuario */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              marginRight: '0.25rem',
              fontSize: '0.75rem'
            }}>
              <span style={{ fontWeight: 700, color: 'hsl(var(--foreground))' }}>{username}</span>
              <span style={{ color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontSize: '0.625rem' }}>
                {userRole?.replace('ROLE_', '')}
              </span>
            </div>

            {/* Sincronización (Solo Admins / Médicos) */}
            {userRole !== 'ROLE_PACIENTE' && (
              <button
                onClick={handleResetData}
                className="rn-btn rn-btn-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
                title="Sincronizar y restablecer base de datos"
              >
                <RotateCcw size={14} />
                Sincronizar
              </button>
            )}

            {/* Selector de Tema */}
            <button
              onClick={toggleTheme}
              className="rn-btn rn-btn-icon"
              style={{
                borderRadius: '9999px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rn-btn rn-btn-secondary"
              style={{
                padding: '0.5rem 0.875rem',
                fontSize: '0.8125rem',
                backgroundColor: 'hsl(var(--danger) / 0.1)',
                color: 'hsl(var(--danger))',
                borderColor: 'hsl(var(--danger) / 0.2)'
              }}
            >
              <LogOut size={14} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 Contenido de la Ruta Hija */}
      <main className="rn-container" style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* 🚀 Footer */}
      <footer style={{
        backgroundColor: 'hsl(var(--card))',
        borderTop: '1px solid hsl(var(--border))',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: 'hsl(var(--muted-foreground))',
        marginTop: '3rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p>
            Plataforma Inteligente RedNorte • Evaluación Semestral Fullstack III • Versión 1.0.0 (Library)
          </p>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
            Diseñado utilizando React, TypeScript, HSL Color Tokens, Custom CSS Grid, y Resilience4j Circuit Breaker.
          </span>
        </div>
      </footer>

    </div>
  );
};

export default MainLayout;
