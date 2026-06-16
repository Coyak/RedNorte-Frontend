import React, { useState, useEffect, useCallback } from 'react';
import { Paciente, AtencionBase, Reasignacion, EstadoAtencion } from '../hooks/useListasEspera';
import { 
  User, ShieldAlert, Heart, Calendar, Clock, CheckCircle, 
  XCircle, AlertTriangle, RefreshCw, FileText, Phone, Mail, MapPin, Database
} from 'lucide-react';

export interface CitasDashboardProps {
  pacientes: Paciente[];
  userRole: string | null;
  selectedPacienteRut: string;
  onSelectedPacienteRutChange: (rut: string) => void;
  pacienteActivo: Paciente | null;
  citas: AtencionBase[];
  loadingCitas: boolean;
  citasError: string | null;
  isBffFallback: boolean;
  bffFallbackMsg: string;
  procesando: number | null;
  onCancelarCita: (id: number) => void;
  reasignacionesPaciente: Reasignacion[];
  onActualizarPerfil?: (rut: string, perfil: Paciente) => Promise<any>;
}

export const CitasDashboard: React.FC<CitasDashboardProps> = ({
  pacientes,
  userRole,
  selectedPacienteRut,
  onSelectedPacienteRutChange,
  pacienteActivo,
  citas,
  loadingCitas,
  citasError,
  isBffFallback,
  bffFallbackMsg,
  procesando,
  onCancelarCita,
  reasignacionesPaciente,
  onActualizarPerfil
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Paciente>({
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
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleAbrirEditarModal = () => {
    if (!pacienteActivo) return;
    setEditForm({ ...pacienteActivo });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onActualizarPerfil || !pacienteActivo) return;
    setSubmittingEdit(true);
    setEditError(null);
    try {
      await onActualizarPerfil(pacienteActivo.rut, editForm);
      setShowEditModal(false);
    } catch (err: any) {
      setEditError(err.message || 'Error al guardar cambios.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularEdad = (fechaNacStr: string) => {
    if (!fechaNacStr) return 0;
    const nacimiento = new Date(fechaNacStr);
    const dif = Date.now() - nacimiento.getTime();
    const edadFecha = new Date(dif);
    return Math.abs(edadFecha.getUTCFullYear() - 1970);
  };

  const getIconoEstado = (estado: EstadoAtencion) => {
    switch (estado) {
      case 'EN_ESPERA': return <Clock size={16} className="text-warning" style={{ color: 'hsl(var(--warning))' }} />;
      case 'AGENDADO': return <Calendar size={16} className="text-primary" style={{ color: 'hsl(var(--primary))' }} />;
      case 'ATENDIDO': return <CheckCircle size={16} className="text-success" style={{ color: 'hsl(var(--success))' }} />;
      case 'CANCELADO': return <XCircle size={16} className="text-danger" style={{ color: 'hsl(var(--danger))' }} />;
    }
  };

  return (
    <div className="rn-dashboard animate-fade-in">
      {/* ⚡ Panel Informativo de Resiliencia Real */}
      <div className="rn-card animate-fade-in" style={{
        background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)/0.3))',
        borderLeft: '4px solid hsl(var(--primary))',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Database size={24} style={{ color: 'hsl(var(--primary))' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Portal de Integración de Pacientes (BFF)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
              Orquestación en tiempo real a través del API Gateway. Resiliencia monitoreada con Circuit Breakers.
            </p>
          </div>
        </div>

        {/* Solo mostrar selector si es administrador o médico */}
        {userRole !== 'ROLE_PACIENTE' && pacientes.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="rn-label" style={{ margin: 0 }}>Visualizar Paciente:</span>
              <select
                value={selectedPacienteRut}
                onChange={(e) => onSelectedPacienteRutChange(e.target.value)}
                className="rn-select"
                style={{ padding: '0.4rem 1.75rem 0.4rem 0.75rem', fontSize: '0.875rem', minWidth: '180px' }}
              >
                {pacientes.map((p) => (
                  <option key={p.rut} value={p.rut}>
                    {p.nombres.split(' ')[0]} {p.apellidos.split(' ')[0]} ({p.rut})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ⚠️ Alertas de Circuit Breaker / Falla Real */}
      {isBffFallback && (
        <div className="rn-alert rn-alert-warning animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <ShieldAlert size={20} style={{ color: 'hsl(var(--warning))', flexShrink: 0 }} />
          <div>
            <strong style={{ fontWeight: 700 }}>Resilience4j Circuit Breaker (BFF Degradado):</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', opacity: 0.9 }}>
              {bffFallbackMsg}
            </p>
          </div>
        </div>
      )}

      {citasError && (
        <div className="rn-alert rn-alert-danger animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <ShieldAlert size={20} style={{ color: 'hsl(var(--danger))', flexShrink: 0 }} />
          <div>
            <strong style={{ fontWeight: 700 }}>Servicio No Disponible (Error HTTP 503):</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', opacity: 0.9 }}>
              {citasError}
            </p>
          </div>
        </div>
      )}

      {loadingCitas && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <RefreshCw size={24} className="animate-spin text-primary" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Sincronizando información médica...</p>
        </div>
      )}

      {!loadingCitas && pacienteActivo ? (
        <div className="rn-grid-cols-3" style={{ gap: '1.5rem', gridTemplateColumns: '1fr 2fr' }}>
          {/* 👤 Columna Izquierda: Ficha Clínica del Paciente */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="rn-card animate-fade-in" style={{ padding: '1.75rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <User size={36} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2 }}>
                  {pacienteActivo.nombres}
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
                  {pacienteActivo.apellidos}
                </p>

                <div style={{ marginTop: '0.75rem' }}>
                  <span className="rn-badge rn-badge-agendado" style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.75rem',
                    fontWeight: 700
                  }}>
                    {pacienteActivo.prevision || 'FONASA'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <FileText size={16} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0, marginTop: '0.125rem' }} />
                  <div>
                    <div className="rn-label" style={{ fontSize: '0.6875rem' }}>Identificación</div>
                    <div style={{ fontWeight: 600 }}>{pacienteActivo.rut}</div>
                    {pacienteActivo.fechaNacimiento && (
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                        {calcularEdad(pacienteActivo.fechaNacimiento)} años ({pacienteActivo.fechaNacimiento})
                      </div>
                    )}
                  </div>
                </div>

                {pacienteActivo.telefono && (
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <Phone size={16} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                    <div>
                      <div className="rn-label" style={{ fontSize: '0.6875rem' }}>Teléfono</div>
                      <div style={{ fontWeight: 600 }}>{pacienteActivo.telefono}</div>
                    </div>
                  </div>
                )}

                {pacienteActivo.correo && (
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <Mail size={16} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                    <div style={{ wordBreak: 'break-all' }}>
                      <div className="rn-label" style={{ fontSize: '0.6875rem' }}>Correo Electrónico</div>
                      <div style={{ fontWeight: 600 }}>{pacienteActivo.correo}</div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <MapPin size={16} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                  <div>
                    <div className="rn-label" style={{ fontSize: '0.6875rem' }}>Dirección</div>
                    <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{pacienteActivo.direccion}</div>
                  </div>
                </div>

                {onActualizarPerfil && (
                  <button
                    onClick={handleAbrirEditarModal}
                    className="rn-btn rn-btn-secondary"
                    style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.8125rem', padding: '0.5rem' }}
                  >
                    Editar Información
                  </button>
                )}
              </div>
            </div>

            {/* Ficha Clínica Básica */}
            <div className="rn-card animate-fade-in" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <Heart size={18} style={{ color: 'hsl(var(--danger))' }} />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ficha Médica Básica
                </h4>
              </div>
              <p style={{
                fontSize: '0.8125rem',
                color: 'hsl(var(--card-foreground))',
                lineHeight: 1.4,
                backgroundColor: 'hsl(var(--muted) / 0.25)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed hsl(var(--border))'
              }}>
                {pacienteActivo.historialClinicoBasico || 'No se registran antecedentes clínicos de demostración.'}
              </p>
            </div>
          </div>

          {/* 📅 Columna Derecha: Citas Activas, Lista de Espera e Historial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Citas y Derivaciones */}
            <div className="rn-card animate-fade-in" style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Estado de Consultas y Solicitudes Pendientes
              </h3>

              {isBffFallback ? (
                // Vista de Fallback del Portal (BFF Resilience)
                <div style={{
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'hsl(var(--danger) / 0.05)',
                  border: '1px dashed hsl(var(--danger) / 0.2)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <AlertTriangle size={36} style={{ color: 'hsl(var(--danger))', margin: '0 auto 0.75rem', display: 'block' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--danger))', marginBottom: '0.25rem' }}>
                    Servicio Temporalmente Interrumpido
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', maxWidth: '380px', margin: '0 auto' }}>
                    {bffFallbackMsg}
                  </p>
                </div>
              ) : citas.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                  <Calendar size={36} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.5 }} />
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                    Sin solicitudes de atención activas
                  </h4>
                  <p style={{ fontSize: '0.8125rem' }}>El paciente no registra derivaciones activas a listas de espera.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {citas.map((cita) => (
                    <div key={cita.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--muted) / 0.1)',
                      transition: 'all 0.2s ease'
                    }} className="rn-citas-item">
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ marginTop: '0.125rem' }}>
                          {getIconoEstado(cita.estado)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{cita.detalle}</div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span>Tipo: {cita.tipo}</span>
                            <span>•</span>
                            <span>Solicitado: {formatearFecha(cita.fechaSolicitud)}</span>
                          </div>
                          
                          {/* Prioridad Badge */}
                          <div style={{ marginTop: '0.375rem' }}>
                            <span className={`rn-badge rn-badge-prio-${cita.prioridad}`} style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem' }}>
                              Prioridad G{cita.prioridad}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {cita.estado === 'AGENDADO' && (
                          <button
                            onClick={() => onCancelarCita(cita.id)}
                            disabled={procesando === cita.id}
                            className="rn-btn rn-btn-danger"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            {procesando === cita.id ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                Cancelando
                              </>
                            ) : (
                              'Cancelar Hora'
                            )}
                          </button>
                        )}
                        
                        {cita.estado === 'EN_ESPERA' && (
                          <span className="rn-badge rn-badge-espera">
                            En Fila
                          </span>
                        )}
                        
                        {cita.estado === 'CANCELADO' && (
                          <span className="rn-badge rn-badge-cancelado">
                            Cancelada
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 🔄 Logs del Motor de Reasignación Relacionados */}
            <div className="rn-card animate-fade-in" style={{
              background: 'hsl(var(--card))',
              borderLeft: '4px solid hsl(var(--accent))'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <RefreshCw size={14} style={{ color: 'hsl(var(--accent))' }} />
                Historial de Reasignación Automática
              </h4>

              {reasignacionesPaciente.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                  No se registran eventos de reasignación automática para este paciente en el sistema de salud.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {reasignacionesPaciente.map((log) => (
                    <div key={log.id} style={{
                      backgroundColor: 'hsl(var(--muted) / 0.15)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      border: '1px solid hsl(var(--border))'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 700 }}>
                        <span style={{
                          color: log.estado === 'EXITOSA' ? 'hsl(var(--success))' : 'hsl(var(--danger))'
                        }}>
                          Transacción {log.estado}
                        </span>
                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {new Date(log.fechaReasignacion).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, opacity: 0.9 }}>{log.observaciones}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        !loadingCitas && (
          <div className="rn-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            No hay información para mostrar del paciente seleccionado.
          </div>
        )
      )}

      {/* 📦 MODAL: EDITAR INFORMACIÓN DEL PACIENTE */}
      {showEditModal && (
        <div className="rn-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="rn-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Editar Mi Información de Paciente
              </h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="rn-btn rn-btn-icon"
                style={{ padding: '0.25rem' }}
              >
                <XCircle size={18} />
              </button>
            </div>

            {editError && (
              <div className="rn-alert rn-alert-warning" style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleGuardarPerfil}>
              <div className="rn-form-group">
                <label className="rn-label">Dirección Particular *</label>
                <input
                  type="text"
                  className="rn-input"
                  value={editForm.direccion}
                  onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                  required
                  disabled={submittingEdit}
                />
              </div>

              <div className="rn-grid-cols-2" style={{ gap: '0.75rem' }}>
                <div className="rn-form-group">
                  <label className="rn-label">Teléfono de Contacto</label>
                  <input
                    type="text"
                    className="rn-input"
                    value={editForm.telefono || ''}
                    onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                    disabled={submittingEdit}
                  />
                </div>

                <div className="rn-form-group">
                  <label className="rn-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="rn-input"
                    value={editForm.correo || ''}
                    onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                    disabled={submittingEdit}
                  />
                </div>
              </div>

              <div className="rn-form-group">
                <label className="rn-label">Previsión Médica *</label>
                <select
                  className="rn-select"
                  value={editForm.prevision}
                  onChange={(e) => setEditForm({ ...editForm, prevision: e.target.value as any })}
                  required
                  disabled={submittingEdit}
                >
                  <option value="FONASA">FONASA</option>
                  <option value="ISAPRE">ISAPRE</option>
                  <option value="PARTICULAR">PARTICULAR</option>
                  <option value="DIPRECA">DIPRECA</option>
                  <option value="CAPREDENA">CAPREDENA</option>
                </select>
              </div>

              <div className="rn-form-group">
                <label className="rn-label">Ficha / Historial Clínico Básico</label>
                <textarea
                  className="rn-textarea"
                  rows={3}
                  value={editForm.historialClinicoBasico || ''}
                  onChange={(e) => setEditForm({ ...editForm, historialClinicoBasico: e.target.value })}
                  disabled={submittingEdit}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rn-btn rn-btn-secondary"
                  disabled={submittingEdit}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rn-btn rn-btn-primary"
                  disabled={submittingEdit}
                >
                  {submittingEdit ? <RefreshCw size={14} className="animate-spin" /> : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CitasDashboard;
