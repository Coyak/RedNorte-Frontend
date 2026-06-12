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
    { value: '12', label: 'Centros de Atención', sub: 'hospitales y CESFAM conectados' },
    { value: '+45k', label: 'Pacientes Atendidos', sub: 'en la red asistencial RedNorte' },
    { value: '35%', label: 'Espera Reducida', sub: 'mediante optimización inteligente' },
    { value: '24', label: 'Especialidades Médicas', sub: 'disponibles para consulta' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.3) 50%, hsl(var(--background)) 100%)',
      color: 'hsl(var(--foreground))',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'hsl(var(--card) / 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid hsl(var(--border))',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px hsl(var(--primary) / 0.3)'
          }}>
            <HeartPulse size={20} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', color: 'hsl(var(--foreground))' }}>RedNorte</span>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))', padding: '2px 8px',
            borderRadius: '9999px', border: '1px solid hsl(var(--primary) / 0.3)'
          }}>Salud Pública</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={toggleTheme} 
            className="rn-btn rn-btn-icon"
            style={{
              borderRadius: '9999px', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))'
            }}
            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="rn-btn rn-btn-secondary"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => navigate('/register')} 
            className="rn-btn rn-btn-primary"
            style={{
              padding: '0.5rem 1.25rem', fontSize: '0.875rem',
              fontWeight: 700
            }}
          >
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
          background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'hsl(var(--primary) / 0.1)', border: '1px solid hsl(var(--primary) / 0.2)',
          borderRadius: '9999px', padding: '0.375rem 1rem',
          fontSize: '0.8125rem', color: 'hsl(var(--primary))', marginBottom: '2rem',
          fontWeight: 600
        }}>
          <Stethoscope size={14} />
          Servicio Público de Salud — RedNorte
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 900, lineHeight: 1.05,
          letterSpacing: '-0.04em', marginBottom: '1.5rem',
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #ffffff 40%, #93c5fd 100%)'
            : 'linear-gradient(135deg, hsl(var(--foreground)) 40%, hsl(var(--primary)) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Gestión Inteligente<br />de Listas de Espera
        </h1>

        <p style={{
          fontSize: '1.125rem', color: 'hsl(var(--muted-foreground))',
          maxWidth: '640px', margin: '0 auto 3rem',
          lineHeight: 1.7, fontWeight: 500
        }}>
          La plataforma oficial de RedNorte que optimiza la administración de atenciones médicas,
          reasigna turnos automáticamente y mantiene a los pacientes informados en tiempo real.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/register')} 
            className="rn-btn rn-btn-primary"
            style={{
              padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            Crear Cuenta Gratuita <ChevronRight size={18} />
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="rn-btn rn-btn-secondary"
            style={{
              padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 600
            }}
          >
            Ya tengo cuenta
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '2rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
      }}>
        {stats.map((s, i) => (
          <div key={i} className="rn-card" style={{
            textAlign: 'center', padding: '2rem 1.5rem',
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: 'var(--radius-xl)'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'hsl(var(--primary))', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', marginTop: '0.75rem', color: 'hsl(var(--foreground))' }}>{s.label}</div>
            <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1100px', margin: '6rem auto', padding: '0 2rem' }}>
        <h2 style={{
          textAlign: 'center', fontSize: '2rem', fontWeight: 800,
          marginBottom: '3rem', letterSpacing: '-0.03em', color: 'hsl(var(--foreground))'
        }}>
          ¿Por qué elegir RedNorte?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={i} className="rn-card" style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius-xl)', padding: '2rem'
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'hsl(var(--primary) / 0.1)',
                border: '1px solid hsl(var(--primary) / 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'hsl(var(--primary))', marginBottom: '1.25rem'
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.625rem', color: 'hsl(var(--foreground))' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.65, margin: 0 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ maxWidth: '700px', margin: '4rem auto 6rem', padding: '0 2rem', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.08))',
          border: '1px solid hsl(var(--primary) / 0.18)',
          borderRadius: 'var(--radius-2xl)', padding: '3.5rem 2rem'
        }}>
          <HeartPulse size={40} color="hsl(var(--primary))" style={{ marginBottom: '1.25rem', display: 'inline-block' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.03em', color: 'hsl(var(--foreground))' }}>
            Únete a la red de salud pública
          </h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Regístrate como paciente en minutos y comienza a gestionar tus atenciones médicas
            con la tecnología de RedNorte.
          </p>
          <button 
            onClick={() => navigate('/register')} 
            className="rn-btn rn-btn-primary"
            style={{
              padding: '0.875rem 2.5rem', fontSize: '1rem', fontWeight: 700
            }}
          >
            Registrarme Ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid hsl(var(--border))',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        color: 'hsl(var(--muted-foreground))',
        fontSize: '0.8125rem',
        backgroundColor: 'hsl(var(--card) / 0.4)'
      }}>
        © {new Date().getFullYear()} Servicio Público de Salud RedNorte. Plataforma de gestión hospitalaria.
      </footer>
    </div>
  );
};

export default HomePage;
