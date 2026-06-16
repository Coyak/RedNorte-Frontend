import React, { useState, useEffect } from 'react';
import { useListasEspera } from '../hooks/useListasEspera';
import { History, RefreshCw, BarChart3, Users, FileText, Database } from 'lucide-react';

interface UsuarioReg {
  username: string;
  role: string;
  rut: string;
}

interface EstadisticaPrio {
  prioridad: number;
  cantidad: number;
}

export const AdminDashboardPage: React.FC = () => {
  const { reasignaciones, obtenerUsuariosSistema, obtenerEstadisticasAuditoria } = useListasEspera();
  const [activeTab, setActiveTab] = useState<'reasignaciones' | 'estadisticas' | 'usuarios'>('reasignaciones');

  // Estados locales para datos dinámicos
  const [usuarios, setUsuarios] = useState<UsuarioReg[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticaPrio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDatosAuditoria = async () => {
    if (!obtenerUsuariosSistema || !obtenerEstadisticasAuditoria) return;
    setLoading(true);
    setError(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        obtenerUsuariosSistema(),
        obtenerEstadisticasAuditoria()
      ]);
      setUsuarios(usersRes || []);
      setEstadisticas(statsRes || []);
    } catch (err: any) {
      console.error('Error al cargar datos de auditoría:', err);
      setError(err.message || 'Error al conectar con los servicios de auditoría.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosAuditoria();
  }, []);

  const getPrioText = (prio: number) => {
    switch (prio) {
      case 1: return 'G1 - Gravedad Alta (Urgente)';
      case 2: return 'G2 - Prioritaria';
      case 3: return 'G3 - Moderada';
      case 4: return 'G4 - Baja Prioridad';
      case 5: return 'G5 - Control Normal';
      default: return `G${prio}`;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{
        background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)/0.25))',
        borderLeft: '4px solid hsl(var(--accent))',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Consola de Auditoría y Control del Sistema</h2>
          <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', margin: 0, marginTop: '0.25rem' }}>
            Acceso administrativo para auditoría de transacciones, métricas de prioridad clínica y control de credenciales.
          </p>
        </div>
        <button
          onClick={cargarDatosAuditoria}
          disabled={loading}
          className="rn-btn rn-btn-secondary"
          style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sincronizar Auditoría
        </button>
      </div>

      {/* Tabs Selector */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid hsl(var(--border))',
        marginBottom: '1.5rem',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('reasignaciones')}
          className={`rn-btn ${activeTab === 'reasignaciones' ? 'rn-btn-primary' : 'rn-btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
        >
          <History size={14} />
          Logs de Reasignación
        </button>

        <button
          onClick={() => setActiveTab('estadisticas')}
          className={`rn-btn ${activeTab === 'estadisticas' ? 'rn-btn-primary' : 'rn-btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
        >
          <BarChart3 size={14} />
          Estadísticas de Prioridad (ms-auditoria)
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`rn-btn ${activeTab === 'usuarios' ? 'rn-btn-primary' : 'rn-btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
        >
          <Users size={14} />
          Cuentas Registradas (ms-usuarios)
        </button>
      </div>

      {error && (
        <div className="rn-alert rn-alert-danger" style={{ marginBottom: '1.5rem' }}>
          <ShieldAlert size={16} />
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="animate-spin text-primary" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Cargando registros de auditoría...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* TAB 1: REASIGNACIONES */}
          {activeTab === 'reasignaciones' && (
            <div>
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
                              {r.estado === 'SIN_CANDIDATO' ? 'Sin candidatos en lista de espera.' : 'Falla de conexión inter-servicio o Circuit Breaker activado.'}
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

          {/* TAB 2: ESTADISTICAS (ms-auditoria) */}
          {activeTab === 'estadisticas' && (
            <div>
              <div className="rn-card" style={{
                background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)/0.15))',
                marginBottom: '1.5rem',
                borderLeft: '4px solid hsl(var(--primary))'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Database size={18} style={{ color: 'hsl(var(--primary))' }} />
                  <strong style={{ fontSize: '0.9375rem' }}>Reporte Ejecutado desde sp_calcular_estadisticas_espera()</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                  Este reporte consulta directamente el microservicio <code>ms-auditoria</code>, el cual ejecuta un Procedimiento Almacenado de PostgreSQL sobre los datos clínicos del hospital para extraer los pacientes en espera ordenados por su nivel de gravedad.
                </p>
              </div>

              {estadisticas.length === 0 ? (
                <div className="rn-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                  <BarChart3 size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                  <h4 style={{ color: 'hsl(var(--foreground))', fontWeight: 700 }}>Sin estadísticas clínicas</h4>
                  <p style={{ fontSize: '0.875rem' }}>No hay pacientes pendientes en lista de espera para procesar estadísticas.</p>
                </div>
              ) : (
                <div className="rn-card" style={{ padding: '0' }}>
                  <table className="rn-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Gravedad / Prioridad Clínica</th>
                        <th style={{ padding: '1rem' }}>Identificador</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Pacientes en Espera</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estadisticas.map((stat, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                          <td style={{ padding: '1rem', fontWeight: 700 }}>{getPrioText(stat.prioridad)}</td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`rn-badge rn-badge-prio-${stat.prioridad}`} style={{ fontSize: '0.75rem' }}>
                              Prioridad G{stat.prioridad}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 800, textAlign: 'right', fontSize: '1rem', color: 'hsl(var(--primary))' }}>
                            {stat.cantidad}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUENTAS REGISTRADAS (ms-usuarios) */}
          {activeTab === 'usuarios' && (
            <div>
              <div className="rn-card" style={{
                background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)/0.15))',
                marginBottom: '1.5rem',
                borderLeft: '4px solid hsl(var(--accent))'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Users size={18} style={{ color: 'hsl(var(--accent))' }} />
                  <strong style={{ fontSize: '0.9375rem' }}>Registro de Usuarios y Credenciales Activas</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
                  Lista de credenciales creadas en la base de datos de <code>ms-usuarios</code>. Muestra las cuentas registradas en el sistema (médicos, administradores y pacientes) con su respectiva vinculación de RUT.
                </p>
              </div>

              {usuarios.length === 0 ? (
                <div className="rn-card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                  <Users size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                  <h4 style={{ color: 'hsl(var(--foreground))', fontWeight: 700 }}>Sin cuentas de usuario</h4>
                  <p style={{ fontSize: '0.875rem' }}>No hay usuarios registrados en el sistema de seguridad.</p>
                </div>
              ) : (
                <div className="rn-card" style={{ padding: '0' }}>
                  <table className="rn-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Nombre de Usuario</th>
                        <th style={{ padding: '1rem' }}>RUT Asociado</th>
                        <th style={{ padding: '1rem' }}>Rol / Privilegio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((user, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{user.username}</td>
                          <td style={{ padding: '1rem' }}>{user.rut || <em style={{ color: 'hsl(var(--muted-foreground))' }}>Sin RUT (Interno)</em>}</td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`rn-badge ${
                              user.role === 'ROLE_ADMIN' ? 'rn-badge-cancelado' :
                              user.role === 'ROLE_MEDICO' ? 'rn-badge-agendado' : 'rn-badge-atendido'
                            }`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
