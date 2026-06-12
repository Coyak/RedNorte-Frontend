import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Clock, Users, ChevronRight, Activity, Stethoscope, Moon, Sun } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (document.documentElement.getAttribute('data-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const features = [
    {
      icon: <Clock size={28} />,
      title: 'Gestión en Tiempo Real',
      description: 'Monitorea el estado de tu atención médica en tiempo real. Actualizaciones automáticas sin necesidad de recargar la página.'
    },
    {
      icon: <Activity size={28} />,
      title: 'Reasignación Automática',
      description: 'Ante una cancelación, nuestro sistema reasigna automáticamente al siguiente paciente prioritario de la lista de espera.'
    },
    {
      icon: <ShieldCheck size={28} />,
      title: 'Acceso Seguro y Privado',
      description: 'Tu información médica está protegida mediante cifrado JWT. Solo tú y los profesionales autorizados pueden ver tus datos.'
    },
    {
      icon: <Users size={28} />,
      title: 'Perfil del Paciente',
      description: 'Accede a tu historial de citas, previsión de salud y datos demográficos desde un portal centralizado e intuitivo.'
    }
  ];

  const stats = [
    { value: '6', label: 'Microservicios', sub: 'activos en la red' },
    { value: '99.9%', label: 'Disponibilidad', sub: 'garantizada 24/7' },
    { value: '<2s', label: 'Tiempo de respuesta', sub: 'promedio del sistema' },
    { value: '>85%', label: 'Cobertura de tests', sub: 'garantía de calidad' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, hsl(220, 70%, 5%) 0%, hsl(200, 60%, 10%) 50%, hsl(220, 70%, 5%) 100%)',
      color: 'white',
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      overflowX: 'hidden'
    }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 20, 40, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(59,130,246,0.4)'
          }}>
            <HeartPulse size={20} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>RedNorte</span>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'rgba(59,130,246,0.15)', color: '#93c5fd', padding: '2px 8px',
            borderRadius: '9999px', border: '1px solid rgba(59,130,246,0.3)'
          }}>Salud Pública</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={toggleTheme} style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'white', borderRadius: '9999px', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button onClick={() => navigate('/login')} style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', borderRadius: '8px', padding: '0.5rem 1.25rem',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Iniciar Sesión
          </button>
          <button onClick={() => navigate('/register')} style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            border: 'none', color: 'white', borderRadius: '8px',
            padding: '0.5rem 1.25rem', fontSize: '0.875rem',
            fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
            transition: 'all 0.2s ease'
          }}>
            Registrarse
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '7rem 2rem 5rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: '9999px', padding: '0.375rem 1rem',
          fontSize: '0.8125rem', color: '#93c5fd', marginBottom: '2rem',
          fontWeight: 600
        }}>
          <Stethoscope size={14} />
          Servicio Público de Salud — RedNorte
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 900, lineHeight: 1.05,
          letterSpacing: '-0.04em', marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 40%, #93c5fd 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Gestión Inteligente<br />de Listas de Espera
        </h1>

        <p style={{
          fontSize: '1.125rem', color: 'rgba(255,255,255,0.6)',
          maxWidth: '640px', margin: '0 auto 3rem',
          lineHeight: 1.7, fontWeight: 400
        }}>
          La plataforma oficial de RedNorte que optimiza la administración de atenciones médicas,
          reasigna turnos automáticamente y mantiene a los pacientes informados en tiempo real.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            border: 'none', color: 'white', borderRadius: '12px',
            padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
            transition: 'all 0.25s ease'
          }}>
            Crear Cuenta Gratuita <ChevronRight size={18} />
          </button>
          <button onClick={() => navigate('/login')} style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', borderRadius: '12px',
            padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.25s ease'
          }}>
            Ya tengo cuenta
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '2rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden'
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '2rem 1.5rem',
            background: 'rgba(10, 20, 40, 0.6)'
          }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#60a5fa', letterSpacing: '-0.04em' }}>{s.value}</div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '0.25rem' }}>{s.label}</div>
            <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.125rem' }}>{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1100px', margin: '6rem auto', padding: '0 2rem' }}>
        <h2 style={{
          textAlign: 'center', fontSize: '2rem', fontWeight: 800,
          marginBottom: '3rem', letterSpacing: '-0.03em'
        }}>
          ¿Por qué elegir RedNorte?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '2rem',
              transition: 'all 0.25s ease'
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))',
                border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#60a5fa', marginBottom: '1.25rem'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.625rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ maxWidth: '700px', margin: '4rem auto 6rem', padding: '0 2rem', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.12))',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '24px', padding: '3.5rem 2rem'
        }}>
          <HeartPulse size={40} color="#60a5fa" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
            Únete a la red de salud pública
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Regístrate como paciente en minutos y comienza a gestionar tus atenciones médicas
            con la tecnología de RedNorte.
          </p>
          <button onClick={() => navigate('/register')} style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            border: 'none', color: 'white', borderRadius: '12px',
            padding: '0.875rem 2.5rem', fontSize: '1rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 8px 32px rgba(59,130,246,0.4)'
          }}>
            Registrarme Ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '2rem',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '0.8125rem'
      }}>
        © {new Date().getFullYear()} Servicio Público de Salud RedNorte. Plataforma de gestión hospitalaria.
      </footer>
    </div>
  );
};

export default HomePage;
