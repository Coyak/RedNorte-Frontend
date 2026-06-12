import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, UserPlus, ShieldAlert, RefreshCw, CheckCircle2, Moon, Sun } from 'lucide-react';
import api from '../services/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
  });

  // Cambiar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('El usuario y la contraseña son obligatorios.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/v1/auth/register', {
        username: username.trim(),
        password,
        role: 'ROLE_PACIENTE'
      });
      setSuccess(true);
      // Redirigir al login tras 2 segundos
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al registrar usuario.';
      setError(msg);
    } finally {
      setLoading(false);
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Crear Cuenta</h2>
          <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
            Únete a la red de salud pública RedNorte
          </p>
        </div>

        {/* Éxito */}
        {success && (
          <div className="rn-alert rn-alert-success" style={{ padding: '0.75rem', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div>¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rn-alert rn-alert-warning" style={{ padding: '0.75rem', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Formulario */}
        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="rn-form-group">
              <label className="rn-label">Nombre de usuario</label>
              <input
                type="text"
                className="rn-input"
                placeholder="ej: juan.perez"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="rn-form-group">
              <label className="rn-label">Contraseña</label>
              <input
                type="password"
                className="rn-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="rn-form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="rn-label">Confirmar contraseña</label>
              <input
                type="password"
                className="rn-input"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
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
                  <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Registrando...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Crear Cuenta
                </>
              )}
            </button>
          </form>
        )}

        {/* Enlace de Inicio de Sesión */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              style={{ color: 'hsl(var(--primary))', fontWeight: 700, textDecoration: 'none' }}
            >
              Iniciar Sesión
            </Link>
          </span>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/" style={{
              fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))',
              textDecoration: 'none'
            }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
