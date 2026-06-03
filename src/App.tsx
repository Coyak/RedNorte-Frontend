import { useState, useEffect } from 'react';
import { useListasEspera, Paciente, TipoAtencion } from './hooks/useListasEspera';
import { ListaEsperaContainer, CitasDashboardContainer } from './containers';
import { 
  Plus, Sun, Moon, RotateCcw, Activity, ShieldCheck, HeartPulse, 
  UserPlus, CheckCircle2, History, RefreshCw, Key
} from 'lucide-react';

function App() {
  const {
    pacientes,
    atenciones,
    reasignaciones,
    loading,
    token,
    userRole,
    username,
    userRut,
    login,
    logout,
    registrarPaciente,
    registrarAtencion,
    actualizarEstadoAtencion,
    cancelarYReasignar,
    obtenerCitasPaciente,
    obtenerPerfilPaciente,
    resetearDatos
  } = useListasEspera();

  const [activeTab, setActiveTab] = useState<'admin' | 'portal' | 'auditoria'>('admin');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Modales
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showAtencionModal, setShowAtencionModal] = useState(false);

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Formulario Nuevo Paciente
  const [nuevoPaciente, setNuevoPaciente] = useState<Paciente>({
    rut: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    direccion: '',
    telefono: '',
    correo: '',
    prevision: 'FONASA',
    historialClinicoBasico: ''
  });

  // Formulario Nueva Atención
  const [nuevaAtencion, setNuevaAtencion] = useState({
    rutPaciente: '',
    tipo: 'CONSULTA' as TipoAtencion,
    prioridad: 3,
    detalle: ''
  });

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Toggle Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Redirect role-specific landing tabs
  useEffect(() => {
    if (userRole === 'ROLE_PACIENTE') {
      setActiveTab('portal');
    } else {
      setActiveTab('admin');
    }
  }, [userRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginUsername || !loginPassword) {
      setLoginError('Por favor ingrese su usuario y contraseña.');
      return;
    }
    try {
      await login(loginUsername, loginPassword);
      setLoginUsername('');
      setLoginPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Error de autenticación.');
    }
  };

  const handleCrearPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    if (!nuevoPaciente.rut || !nuevoPaciente.nombres || !nuevoPaciente.apellidos || !nuevoPaciente.fechaNacimiento || !nuevoPaciente.direccion) {
      setErrorForm('Por favor rellene todos los campos obligatorios (*)');
      return;
    }
    try {
      await registrarPaciente(nuevoPaciente);
      mostrarAlertaExito('Paciente registrado exitosamente en listas de espera.');
      setShowPacienteModal(false);
      // Reset form
      setNuevoPaciente({
        rut: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        direccion: '',
        telefono: '',
        correo: '',
        prevision: 'FONASA',
        historialClinicoBasico: ''
      });
    } catch (err: any) {
      setErrorForm(err.message);
    }
  };

  const handleCrearAtencion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);
    if (!nuevaAtencion.rutPaciente || !nuevaAtencion.detalle) {
      setErrorForm('Por favor ingrese el RUT del paciente y el detalle de la solicitud.');
      return;
    }
    try {
      await registrarAtencion(
        nuevaAtencion.rutPaciente,
        nuevaAtencion.tipo,
        nuevaAtencion.prioridad,
        nuevaAtencion.detalle
      );
      mostrarAlertaExito('Derivación de atención agregada exitosamente a la lista de espera.');
      setShowAtencionModal(false);
      // Reset form
      setNuevaAtencion({
        rutPaciente: '',
        tipo: 'CONSULTA',
        prioridad: 3,
        detalle: ''
      });
    } catch (err: any) {
      setErrorForm(err.message);
    }
  };

  const mostrarAlertaExito = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => {
      setMensajeExito(null);
    }, 4000);
  };

  // Render Login Screen if not authenticated
  if (!token) {
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
        {/* Theme Toggle Button */}
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
          {/* Logo / Header */}
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
              Plataforma de Integración y Lista de Espera
            </p>
          </div>

          {loginError && (
            <div className="rn-alert rn-alert-warning" style={{ padding: '0.75rem', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
              <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>{loginError}</div>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="rn-form-group">
              <label className="rn-label">Usuario / RUT</label>
              <input
                type="text"
                className="rn-input"
                placeholder="Ej: admin o paciente"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
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
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
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

          {/* Demo credentials info */}
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
              <Key size={12} /> Credenciales de Demostración
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Administrador:</span>
                <span style={{ color: 'hsl(var(--primary))' }}>admin / admin123</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Médico:</span>
                <span style={{ color: 'hsl(var(--primary))' }}>medico / medico123</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Paciente:</span>
                <span style={{ color: 'hsl(var(--primary))' }}>paciente / paciente123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Authenticated Console
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
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

          {/* Acciones Rápidas Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* User Badge */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              marginRight: '0.5rem',
              fontSize: '0.75rem'
            }}>
              <span style={{ fontWeight: 700, color: 'hsl(var(--foreground))' }}>{username}</span>
              <span style={{ color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontSize: '0.625rem' }}>
                {userRole?.replace('ROLE_', '')}
              </span>
            </div>

            {/* Botón de Reset (Only Admins / Doctors) */}
            {userRole !== 'ROLE_PACIENTE' && (
              <button
                onClick={resetearDatos}
                className="rn-btn rn-btn-secondary"
                style={{ padding: '0.5rem 0.875rem', fontSize: '0.8125rem' }}
                title="Restablecer base de datos a valores de fábrica"
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

            {/* Cerrar Sesión */}
            <button
              onClick={logout}
              className="rn-btn rn-btn-secondary"
              style={{
                padding: '0.5rem 0.875rem',
                fontSize: '0.8125rem',
                backgroundColor: 'hsl(var(--danger) / 0.1)',
                color: 'hsl(var(--danger))',
                borderColor: 'hsl(var(--danger) / 0.2)'
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 Navegación y Cuerpo */}
      <main className="rn-container" style={{ flex: 1 }}>
        
        {/* Banner de Mensaje de Éxito */}
        {mensajeExito && (
          <div className="rn-alert rn-alert-success animate-slide-in">
            <CheckCircle2 size={18} style={{ color: 'hsl(var(--success))' }} />
            <div>{mensajeExito}</div>
          </div>
        )}

        {/* 🧭 Tabs de Navegación y Botones del Portal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid hsl(var(--border))',
          paddingBottom: '0.75rem'
        }}>
          {/* Navegación de Pestañas */}
          {userRole !== 'ROLE_PACIENTE' ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('admin')}
                className="rn-btn"
                style={{
                  backgroundColor: activeTab === 'admin' ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                  color: activeTab === 'admin' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.5rem 1rem'
                }}
              >
                <Activity size={16} />
                Lista de Espera
              </button>

              <button
                onClick={() => setActiveTab('portal')}
                className="rn-btn"
                style={{
                  backgroundColor: activeTab === 'portal' ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                  color: activeTab === 'portal' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.5rem 1rem'
                }}
              >
                <ShieldCheck size={16} />
                Portal de Pacientes (BFF)
              </button>

              <button
                onClick={() => setActiveTab('auditoria')}
                className="rn-btn"
                style={{
                  backgroundColor: activeTab === 'auditoria' ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                  color: activeTab === 'auditoria' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.5rem 1rem'
                }}
              >
                <History size={16} />
                Logs de Reasignación
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="rn-badge rn-badge-agendado" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                <ShieldCheck size={16} style={{ marginRight: '0.375rem' }} />
                Portal del Paciente
              </span>
            </div>
          )}

          {/* Botones de Registro rápido */}
          {activeTab === 'admin' && userRole !== 'ROLE_PACIENTE' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setShowPacienteModal(true)}
                className="rn-btn rn-btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              >
                <UserPlus size={14} />
                Paciente
              </button>

              <button
                onClick={() => setShowAtencionModal(true)}
                className="rn-btn rn-btn-primary"
                style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
              >
                <Plus size={14} />
                Nueva Solicitud
              </button>
            </div>
          )}
        </div>

        {/* 💻 Vistas correspondientes a cada Tab */}
        <div>
          {/* TAB 1: Consola Administrativa (Lista de Espera) */}
          {activeTab === 'admin' && userRole !== 'ROLE_PACIENTE' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Consola de Gestión de Derivaciones</h2>
                <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                  Centraliza las derivaciones médicas del hospital. Asigna horas disponibles o reasigna citas canceladas automáticamente.
                </p>
              </div>
              <ListaEsperaContainer
                atenciones={atenciones}
                onActualizarEstado={actualizarEstadoAtencion}
                onCancelarYReasignar={cancelarYReasignar}
              />
            </div>
          )}

          {/* TAB 2: Portal de Paciente (BFF) */}
          {activeTab === 'portal' && (
            <CitasDashboardContainer
              pacientes={pacientes}
              userRole={userRole}
              currentUserRut={userRut}
              reasignaciones={reasignaciones}
              onCancelarYReasignar={cancelarYReasignar}
              obtenerCitasPaciente={obtenerCitasPaciente}
              obtenerPerfilPaciente={obtenerPerfilPaciente}
            />
          )}

          {/* TAB 3: Historial y Logs de Reasignación (ms-reasignacion Auditoría) */}
          {activeTab === 'auditoria' && userRole !== 'ROLE_PACIENTE' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Auditoría del Motor de Reasignación Automática</h2>
                <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                  Historial de transacciones procesadas automáticamente por <code>ms-reasignacion</code> cuando se cancela una hora médica prioritaria.
                </p>
              </div>

              {reasignaciones.length === 0 ? (
                <div className="rn-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                  <History size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                  <h4 style={{ color: 'hsl(var(--foreground))', fontWeight: 700 }}>Sin transacciones registradas</h4>
                  <p style={{ fontSize: '0.875rem' }}>Aún no se han generado cancelaciones que detonen el motor.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reasignaciones.map((r) => (
                    <div key={r.id} className="rn-card" style={{
                      borderLeft: `4px solid ${
                        r.estado === 'EXITOSA' ? 'hsl(var(--success))' :
                        r.estado === 'SIN_CANDIDATO' ? 'hsl(var(--warning))' : 'hsl(var(--danger))'
                      }`,
                      padding: '1.25rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9375rem' }}>Transacción #{r.id}</span>
                          <span className={`rn-badge ${
                            r.estado === 'EXITOSA' ? 'rn-badge-atendido' :
                            r.estado === 'SIN_CANDIDATO' ? 'rn-badge-espera' : 'rn-badge-cancelado'
                          }`} style={{ fontSize: '0.625rem' }}>
                            {r.estado}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                          {new Date(r.fechaReasignacion).toLocaleString('es-CL')}
                        </span>
                      </div>

                      <div className="rn-grid-cols-2" style={{ gap: '1rem', marginTop: '0.75rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.75rem' }}>
                        <div>
                          <div className="rn-label" style={{ fontSize: '0.6875rem' }}>Detalle de Cita Cancelada</div>
                          <p style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                            Atención ID: #{r.atencionCanceladaId} ({r.especialidad})
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                            Paciente Canceló: RUT {r.rutPacienteOriginal}
                          </span>
                        </div>

                        <div>
                          <div className="rn-label" style={{ fontSize: '0.6875rem' }}>Detalle de Paciente Reasignado</div>
                          {r.estado === 'EXITOSA' ? (
                            <>
                              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'hsl(var(--success))' }}>
                                Cita ID: #{r.atencionReasignadaId} (Agendada exitosamente)
                              </p>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                Paciente Asignado: RUT {r.rutPacienteReasignado}
                              </span>
                            </>
                          ) : (
                            <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>
                              {r.estado === 'SIN_CANDIDATO' ? 'Sin candidatos en lista de espera.' : 'Falla de conexión inter-servicio.'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{
                        marginTop: '0.75rem',
                        backgroundColor: 'hsl(var(--muted)/0.2)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem'
                      }}>
                        <strong>Observaciones del motor:</strong> {r.observaciones}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 📦 MODAL 1: REGISTRAR PACIENTE NUEVO */}
        {showPacienteModal && (
          <div className="rn-modal-overlay" onClick={() => setShowPacienteModal(false)}>
            <div className="rn-modal" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
                Registrar Nuevo Paciente
              </h3>

              {errorForm && (
                <div className="rn-alert rn-alert-warning" style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
                  {errorForm}
                </div>
              )}

              <form onSubmit={handleCrearPaciente}>
                <div className="rn-grid-cols-2" style={{ gap: '0.75rem' }}>
                  <div className="rn-form-group">
                    <label className="rn-label">RUT *</label>
                    <input
                      type="text"
                      className="rn-input"
                      placeholder="12345678-9"
                      value={nuevoPaciente.rut}
                      onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, rut: e.target.value })}
                      required
                    />
                  </div>

                  <div className="rn-form-group">
                    <label className="rn-label">Previsión *</label>
                    <select
                      className="rn-select"
                      value={nuevoPaciente.prevision}
                      onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, prevision: e.target.value as any })}
                      required
                    >
                      <option value="FONASA">FONASA</option>
                      <option value="ISAPRE">ISAPRE</option>
                      <option value="PARTICULAR">PARTICULAR</option>
                      <option value="DIPRECA">DIPRECA</option>
                      <option value="CAPREDENA">CAPREDENA</option>
                    </select>
                  </div>
                </div>

                <div className="rn-form-group">
                  <label className="rn-label">Nombres *</label>
                  <input
                    type="text"
                    className="rn-input"
                    placeholder="Juan Carlos"
                    value={nuevoPaciente.nombres}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombres: e.target.value })}
                    required
                  />
                </div>

                <div className="rn-form-group">
                  <label className="rn-label">Apellidos *</label>
                  <input
                    type="text"
                    className="rn-input"
                    placeholder="Pérez López"
                    value={nuevoPaciente.apellidos}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, apellidos: e.target.value })}
                    required
                  />
                </div>

                <div className="rn-grid-cols-2" style={{ gap: '0.75rem' }}>
                  <div className="rn-form-group">
                    <label className="rn-label">F. Nacimiento *</label>
                    <input
                      type="date"
                      className="rn-input"
                      value={nuevoPaciente.fechaNacimiento}
                      onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, fechaNacimiento: e.target.value })}
                      required
                    />
                  </div>

                  <div className="rn-form-group">
                    <label className="rn-label">Teléfono</label>
                    <input
                      type="text"
                      className="rn-input"
                      placeholder="+56912345678"
                      value={nuevoPaciente.telefono || ''}
                      onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div className="rn-form-group">
                  <label className="rn-label">Dirección *</label>
                  <input
                    type="text"
                    className="rn-input"
                    placeholder="Av. Los Leones 1234, Santiago"
                    value={nuevoPaciente.direccion}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, direccion: e.target.value })}
                    required
                  />
                </div>

                <div className="rn-form-group">
                  <label className="rn-label">Ficha / Antecedentes Clínicos</label>
                  <textarea
                    className="rn-textarea"
                    rows={2}
                    placeholder="Antecedentes crónicos, alergias, etc..."
                    value={nuevoPaciente.historialClinicoBasico || ''}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, historialClinicoBasico: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPacienteModal(false)}
                    className="rn-btn rn-btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rn-btn rn-btn-primary"
                  >
                    Guardar Paciente
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 📦 MODAL 2: CREAR NUEVA SOLICITUD DE ATENCIÓN */}
        {showAtencionModal && (
          <div className="rn-modal-overlay" onClick={() => setShowAtencionModal(false)}>
            <div className="rn-modal" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
                Ingresar a Lista de Espera
              </h3>

              {errorForm && (
                <div className="rn-alert rn-alert-warning" style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
                  {errorForm}
                </div>
              )}

              <form onSubmit={handleCrearAtencion}>
                <div className="rn-form-group">
                  <label className="rn-label">Seleccionar Paciente *</label>
                  <select
                    className="rn-select"
                    value={nuevaAtencion.rutPaciente}
                    onChange={(e) => setNuevaAtencion({ ...nuevaAtencion, rutPaciente: e.target.value })}
                    required
                  >
                    <option value="">-- Elegir Paciente Registrado --</option>
                    {pacientes.map((p) => (
                      <option key={p.rut} value={p.rut}>
                        {p.nombres} {p.apellidos} ({p.rut})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rn-grid-cols-2" style={{ gap: '0.75rem' }}>
                  <div className="rn-form-group">
                    <label className="rn-label">Tipo de Atención *</label>
                    <select
                      className="rn-select"
                      value={nuevaAtencion.tipo}
                      onChange={(e) => setNuevaAtencion({ ...nuevaAtencion, tipo: e.target.value as TipoAtencion })}
                      required
                    >
                      <option value="CONSULTA">Consulta de Especialidad</option>
                      <option value="CIRUGIA">Cirugía / Pabellón</option>
                      <option value="EMERGENCIA">Emergencia / Urgencia</option>
                    </select>
                  </div>

                  <div className="rn-form-group">
                    <label className="rn-label">Gravedad / Prioridad *</label>
                    <select
                      className="rn-select"
                      value={nuevaAtencion.prioridad}
                      onChange={(e) => setNuevaAtencion({ ...nuevaAtencion, prioridad: parseInt(e.target.value) })}
                      required
                    >
                      <option value="1">G1 - Gravedad Alta (Urgente)</option>
                      <option value="2">G2 - Prioritaria</option>
                      <option value="3">G3 - Moderada</option>
                      <option value="4">G4 - Baja Prioridad</option>
                      <option value="5">G5 - Control Médico Normal</option>
                    </select>
                  </div>
                </div>

                <div className="rn-form-group">
                  <label className="rn-label">Especialidad / Detalle Médico *</label>
                  <input
                    type="text"
                    className="rn-input"
                    placeholder="Ej. Cardiología, Cirugía Vascular, Trauma Craneal"
                    value={nuevaAtencion.detalle}
                    onChange={(e) => setNuevaAtencion({ ...nuevaAtencion, detalle: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAtencionModal(false)}
                    className="rn-btn rn-btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rn-btn rn-btn-primary"
                  >
                    Confirmar Ingreso
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
}

export default App;
