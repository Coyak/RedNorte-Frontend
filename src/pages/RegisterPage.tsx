import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, UserPlus, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      background: 'linear-gradient(160deg, hsl(220, 70%, 5%) 0%, hsl(200, 60%, 10%) 50%, hsl(220, 70%, 5%) 100%)',
      padding: '1.5rem',
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif'
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 8px 24px rgba(59,130,246,0.35)'
          }}>
            <HeartPulse size={30} color="white" />
          </div>
          <h1 style={{
            fontSize: '1.625rem', fontWeight: 900, color: 'white',
            letterSpacing: '-0.03em', margin: '0 0 0.375rem'
          }}>
            Crear Cuenta
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Únete a la red de salud pública RedNorte
          </p>
        </div>

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '12px', padding: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginBottom: '1.5rem', color: '#6ee7b7', fontSize: '0.875rem'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            ¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '0.875rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
            marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.875rem'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            {error}
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{
                display: 'block', color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem'
              }}>
                Nombre de usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ej: juan.perez"
                disabled={loading}
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px', color: 'white',
                  fontSize: '0.9375rem', outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{
                display: 'block', color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px', color: 'white',
                  fontSize: '0.9375rem', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{
                display: 'block', color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem'
              }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                disabled={loading}
                required
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px', color: 'white',
                  fontSize: '0.9375rem', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.875rem',
                background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                border: 'none', borderRadius: '12px', color: 'white',
                fontSize: '0.9375rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Registrando...</>
              ) : (
                <><UserPlus size={16} /> Crear Cuenta</>
              )}
            </button>
          </form>
        )}

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 0.5rem' }}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={{
              color: '#60a5fa', fontWeight: 700, textDecoration: 'none'
            }}>
              Iniciar Sesión
            </Link>
          </p>
          <Link to="/" style={{
            fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)',
            textDecoration: 'none'
          }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(59,130,246,0.5) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
      `}</style>
    </div>
  );
};

export default RegisterPage;
