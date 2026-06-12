import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useListasEspera } from '../hooks/useListasEspera';
import { HeartPulse, Key, Moon, Sun, RefreshCw, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, token, userRole, loading, error } = useListasEspera();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
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

  // Si ya está autenticado, redirigir dinámicamente según el rol
  if (token && userRole) {
    if (userRole === 'ROLE_MEDICO') {
      return <Navigate to="/medico" replace />;
    } else if (userRole === 'ROLE_PACIENTE') {
      return <Navigate to="/paciente" replace />;
    } else if (userRole === 'ROLE_ADMIN') {
      return <Navigate to="/admin" replace />;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!usernameInput || !passwordInput) {
      setLocalError('Por favor ingrese su usuario y contraseña.');
      return;
    }
    try {
      const res = await login(usernameInput, passwordInput);
      // Al loguearse exitosamente, redirigir por rol
      const role = res.role;
      if (role === 'ROLE_MEDICO') {
        navigate('/medico');
      } else if (role === 'ROLE_PACIENTE') {
        navigate('/paciente');
      } else if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/paciente');
      }
    } catch (err: any) {
      // El error ya lo maneja el hook, pero lo capturamos
      setLocalError(err.message || 'Error al conectar con el servidor.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)/0.4))',
      padding: '1.5rem',
      position: 'relative',
      transition: 'all 0.3s ease'
    }}>
      {/* Botón de alternancia de tema */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
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
      </div>

      <div className="rn-card animate-fade-in" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '2.5rem 2rem',
        backgroundColor: 'hsl(var(--card) / 0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-2xl)'
      }}>
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px hsl(var(--primary)/0.25)'
          }}>
            <HeartPulse size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>RedNorte</h2>
          <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
            Acceso unificado a la red asistencial
          </p>
        </div>

        {/* Alerta de Error */}
        {(localError || error) && (
          <div className="rn-alert rn-alert-warning" style={{ padding: '0.75rem', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div>{localError || error}</div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="rn-form-group">
            <label className="rn-label">Usuario</label>
            <input
              type="text"
              className="rn-input"
              placeholder="Ingrese su usuario (ej: medico, paciente)"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="rn-form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="rn-label">Contraseña</label>
            <input
              type="password"
              className="rn-input"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="rn-btn rn-btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', marginBottom: '1.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Conectando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Credenciales de Demostración */}
        <div style={{
          backgroundColor: 'hsl(var(--muted)/0.2)',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsl(var(--border))'
        }}>
          <h4 style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'hsl(var(--muted-foreground))',
            marginBottom: '0.5rem',
            display: 'flex',
            gap: '0.375rem',
            alignItems: 'center'
          }}>
            <Key size={12} /> Cuentas de Demostración
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Administrador:</span>
              <span style={{ color: 'hsl(var(--primary))' }}>admin / admin123</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Médico Asistencial:</span>
              <span style={{ color: 'hsl(var(--primary))' }}>medico / medico123</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Paciente / Beneficiario:</span>
              <span style={{ color: 'hsl(var(--primary))' }}>paciente / paciente123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
