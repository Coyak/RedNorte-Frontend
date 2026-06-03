import React, { useState } from 'react';
import { AtencionBase, EstadoAtencion } from '../hooks/useListasEspera';
import { Search, Filter, Clock, Activity, AlertCircle, RefreshCw, Eye } from 'lucide-react';

export interface ListaEsperaTableProps {
  atenciones: AtencionBase[];
  buscando: boolean;
  error: string | null;
  onErrorClose: () => void;
  onActualizarEstado: (id: number, nuevoEstado: EstadoAtencion) => void;
  onCancelarYReasignar: (id: number) => void;
  onVerDetalle?: (atencion: AtencionBase) => void;
}

export const ListaEsperaTable: React.FC<ListaEsperaTableProps> = ({
  atenciones,
  buscando,
  error,
  onErrorClose,
  onActualizarEstado,
  onCancelarYReasignar,
  onVerDetalle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('TODOS');
  const [prioridadFilter, setPrioridadFilter] = useState<string>('TODOS');

  // Filtrar las atenciones
  const atencionesFiltradas = atenciones.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      a.paciente.rut.toLowerCase().includes(term) ||
      a.paciente.nombres.toLowerCase().includes(term) ||
      a.paciente.apellidos.toLowerCase().includes(term) ||
      a.detalle.toLowerCase().includes(term);

    const matchesTipo = tipoFilter === 'TODOS' || a.tipo === tipoFilter;
    const matchesPrioridad =
      prioridadFilter === 'TODOS' || a.prioridad.toString() === prioridadFilter;

    return matchesSearch && matchesTipo && matchesPrioridad;
  });

  // Estadísticas rápidas para la cabecera
  const totalEspera = atenciones.filter((a) => a.estado === 'EN_ESPERA').length;
  const totalAgendado = atenciones.filter((a) => a.estado === 'AGENDADO').length;
  const urgenciasActivas = atenciones.filter(
    (a) => a.estado === 'EN_ESPERA' && a.prioridad === 1
  ).length;

  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerNombrePrioridad = (prioridad: number) => {
    switch (prioridad) {
      case 1: return 'G1 - Gravedad Alta';
      case 2: return 'G2 - Alta Prioridad';
      case 3: return 'G3 - Moderada';
      case 4: return 'G4 - Baja Prioridad';
      case 5: return 'G5 - Control General';
      default: return `Prioridad ${prioridad}`;
    }
  };

  return (
    <div className="rn-table-section animate-fade-in">
      {/* 📊 Cards de Resumen Analítico */}
      <div className="rn-grid-cols-3 mb-6" style={{ marginBottom: '1.5rem' }}>
        <div className="rn-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            background: 'hsl(var(--warning) / 0.12)',
            color: 'hsl(var(--warning))',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="rn-label">Lista de Espera</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalEspera}</div>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Pacientes pendientes</span>
          </div>
        </div>

        <div className="rn-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            background: 'hsl(var(--primary) / 0.12)',
            color: 'hsl(var(--primary))',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="rn-label">Citas Agendadas</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalAgendado}</div>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Cupos confirmados</span>
          </div>
        </div>

        <div className="rn-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            background: 'hsl(var(--danger) / 0.12)',
            color: 'hsl(var(--danger))',
            padding: '0.75rem',
            borderRadius: 'var(--radius-lg)'
          }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="rn-label">Urgencias (G1)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--danger))' }}>{urgenciasActivas}</div>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Atención inmediata</span>
          </div>
        </div>
      </div>

      {/* ⚠️ Alerta de Error de Operación */}
      {error && (
        <div className="rn-alert rn-alert-danger animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} style={{ color: 'hsl(var(--danger))', flexShrink: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              <strong style={{ fontWeight: 700 }}>Error de Operación:</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', opacity: 0.9 }}>{error}</p>
            </div>
            <button 
              onClick={onErrorClose} 
              style={{ 
                background: 'transparent', 
                border: 0, 
                color: 'inherit', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                padding: '0.25rem 0.5rem'
              }}
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* 🔍 Controles de Búsqueda y Filtros */}
      <div className="rn-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Campo de Búsqueda */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'hsl(var(--muted-foreground) / 0.7)'
            }} />
            <input
              type="text"
              placeholder="Buscar por paciente, RUT o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rn-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="rn-select"
                style={{ padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.875rem', minWidth: '140px' }}
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="CONSULTA">Consulta Médica</option>
                <option value="CIRUGIA">Procedimiento / Cirugía</option>
                <option value="EMERGENCIA">Emergencia Urgente</option>
              </select>
            </div>

            <div>
              <select
                value={prioridadFilter}
                onChange={(e) => setPrioridadFilter(e.target.value)}
                className="rn-select"
                style={{ padding: '0.5rem 2rem 0.5rem 0.75rem', fontSize: '0.875rem', minWidth: '140px' }}
              >
                <option value="TODOS">Prioridades</option>
                <option value="1">G1 - Alta Gravedad</option>
                <option value="2">G2 - Prioritaria</option>
                <option value="3">G3 - Moderada</option>
                <option value="4">G4 - Baja</option>
                <option value="5">G5 - Control</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Tabla de Resultados */}
      <div className="rn-table-container">
        {atencionesFiltradas.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '0.25rem' }}>
              No se encontraron registros
            </h3>
            <p style={{ fontSize: '0.875rem' }}>Prueba modificando los filtros o el texto de búsqueda.</p>
          </div>
        ) : (
          <table className="rn-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>RUT</th>
                <th>Fecha Solicitud</th>
                <th>Tipo / Detalle</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {atencionesFiltradas.map((atencion) => (
                <tr key={atencion.id} className="animate-fade-in">
                  <td style={{ fontWeight: 'bold', color: 'hsl(var(--muted-foreground))' }}>
                    #{atencion.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{atencion.paciente.nombres}</div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                      {atencion.paciente.apellidos}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{atencion.paciente.rut}</td>
                  <td style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {formatearFecha(atencion.fechaSolicitud)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{atencion.detalle}</span>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                        {atencion.tipo === 'CONSULTA' ? 'Consulta Especialidad' : atencion.tipo === 'CIRUGIA' ? 'Pabellón/Cirugía' : 'Atención Urgencia'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`rn-badge rn-badge-prio-${atencion.prioridad}`}>
                      {obtenerNombrePrioridad(atencion.prioridad).split(' - ')[0]}
                    </span>
                  </td>
                  <td>
                    <span className={`rn-badge ${
                      atencion.estado === 'EN_ESPERA' ? 'rn-badge-espera' :
                      atencion.estado === 'AGENDADO' ? 'rn-badge-agendado' :
                      atencion.estado === 'ATENDIDO' ? 'rn-badge-atendido' : 'rn-badge-cancelado'
                    }`}>
                      {atencion.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.37rem', justifyContent: 'flex-end' }}>
                      {onVerDetalle && (
                        <button
                          onClick={() => onVerDetalle(atencion)}
                          className="rn-btn rn-btn-icon"
                          title="Ver Ficha Clínica / Detalle"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      
                      {atencion.estado === 'AGENDADO' && (
                        <button
                          onClick={() => onCancelarYReasignar(atencion.id)}
                          disabled={buscando}
                          className="rn-btn rn-btn-secondary"
                          style={{
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.75rem',
                            borderColor: 'hsl(var(--danger) / 0.3)',
                            color: 'hsl(var(--danger))'
                          }}
                          title="Cancelar y activar reasignación"
                        >
                          <RefreshCw size={12} className={buscando ? 'animate-spin' : ''} />
                          Reasignar
                        </button>
                      )}

                      {atencion.estado === 'EN_ESPERA' && (
                        <button
                          onClick={() => onActualizarEstado(atencion.id, 'AGENDADO')}
                          disabled={buscando}
                          className="rn-btn rn-btn-primary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          {buscando ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              Agendando
                            </>
                          ) : (
                            'Agendar'
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default ListaEsperaTable;
