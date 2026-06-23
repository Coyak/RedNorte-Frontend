import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useListasEspera } from '../hooks/useListasEspera';
import { HeartPulse, Moon, Sun, RotateCcw, LogOut, Activity, ShieldCheck, History } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { 
    username, 
    userRole, 
    userRut, 
    logout, 
    resetearDatos, 
    notificaciones, 
    fetchNotificaciones, 
    marcarNotificacionLeida 
  } = useListasEspera();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
  });
  const navigate = useNavigate();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    if (userRut && userRole === 'ROLE_PACIENTE') {
      fetchNotificaciones(userRut);
      const interval = setInterval(() => {
        fetchNotificaciones(userRut);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [userRut, userRole, fetchNotificaciones]);

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

  const unreadCount = notificaciones ? notificaciones.filter((n: any) => !n.leido).length : 0;

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
            onClick={() => navigate('/app')}
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
                to="/app/medico"
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
              to="/app/paciente"
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
                to="/app/admin"
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

            {/* Campana de Notificaciones (Solo para Pacientes) */}
            {userRole === 'ROLE_PACIENTE' && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="rn-btn rn-btn-icon"
                  style={{
                    borderRadius: '9999px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                  title="Notificaciones de Reasignación"
                >
                  <span style={{ fontSize: '1.2rem' }}>🔔</span>
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      backgroundColor: 'hsl(var(--danger))',
                      color: 'white',
                      fontSize: '0.625rem',
                      fontWeight: 'bold',
                      borderRadius: '9999px',
                      minWidth: '16px',
                      height: '16px',
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '42px',
                    width: '320px',
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.75rem',
                    zIndex: 100,
                    maxHeight: '360px',
                    overflowY: 'auto'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid hsl(var(--border))'
                    }}>
                      <strong style={{ fontSize: '0.875rem' }}>Mensajes y Alertas</strong>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                        {notificaciones.length} en total
                      </span>
                    </div>

                    {notificaciones.length === 0 ? (
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'hsl(var(--muted-foreground))',
                        textAlign: 'center',
                        margin: '1.5rem 0'
                      }}>
                        No tienes alertas de reasignación pendientes.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {notificaciones.map((n: any) => (
                          <div
                            key={n.id}
                            onClick={() => marcarNotificacionLeida(n.id)}
                            style={{
                              padding: '0.625rem',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: n.leido ? 'transparent' : 'hsl(var(--primary)/0.06)',
                              border: '1px solid ' + (n.leido ? 'transparent' : 'hsl(var(--primary)/0.15)'),
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              transition: 'all 0.2s ease',
                              textAlign: 'left'
                            }}
                          >
                            <div style={{
                              fontWeight: n.leido ? 500 : 700,
                              color: 'hsl(var(--foreground))',
                              lineHeight: 1.3
                            }}>
                              {n.mensaje}
                            </div>
                            <div style={{
                              fontSize: '0.625rem',
                              color: 'hsl(var(--muted-foreground))',
                              marginTop: '0.25rem',
                              textAlign: 'right'
                            }}>
                              {new Date(n.fechaCreacion).toLocaleTimeString('es-CL')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
