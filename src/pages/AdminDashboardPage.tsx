import React from 'react';
import { useListasEspera } from '../hooks/useListasEspera';
import { History, RefreshCw } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { reasignaciones } = useListasEspera();

  return (
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
  );
};

export default AdminDashboardPage;
