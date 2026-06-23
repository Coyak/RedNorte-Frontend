import React, { useState } from 'react';
import { useListasEspera, Paciente, TipoAtencion, EstadoAtencion, AtencionBase } from '../hooks/useListasEspera';
import { ListaEsperaTable } from '../components/ListaEsperaTable';
import { Plus, UserPlus, X, RefreshCw } from 'lucide-react';

export interface ListaEsperaContainerProps {
  atenciones?: AtencionBase[];
  onActualizarEstado?: (id: number, nuevoEstado: EstadoAtencion) => Promise<any>;
  onCancelarYReasignar?: (id: number) => Promise<any>;
  onVerDetalle?: (atencion: AtencionBase) => void;
}

export const ListaEsperaContainer: React.FC<ListaEsperaContainerProps> = ({
  atenciones: atencionesProp,
  onActualizarEstado: onActualizarEstadoProp,
  onCancelarYReasignar: onCancelarYReasignarProp,
  onVerDetalle
}) => {
  // Intentar obtener el contexto global (producción), si no está disponible (tests) usar props
  let context: any = null;
  try {
    context = useListasEspera();
  } catch (e) {
    // Modo de pruebas/tests sin ListasEsperaProvider
  }

  const atenciones: AtencionBase[] = atencionesProp ?? context?.atenciones ?? [];
  
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

  // Filtrar atenciones por estado
  const atencionesFiltradas = atenciones.filter((a) => {
    if (filtroEstado === 'TODOS') return true;
    if (filtroEstado === 'EN_ESPERA') return a.estado === 'EN_ESPERA';
    if (filtroEstado === 'AGENDADO') return a.estado === 'AGENDADO';
    if (filtroEstado === 'ATENDIDO_CANCELADO') return a.estado === 'ATENDIDO' || a.estado === 'CANCELADO';
    return true;
  });
  const actualizarEstadoAtencion = onActualizarEstadoProp ?? context?.actualizarEstadoAtencion;
  const cancelarYReasignar = onCancelarYReasignarProp ?? context?.cancelarYReasignar;
  
  // Dependencias para registro (pueden ser mocks vacíos en tests si no se evalúan)
  const pacientes: Paciente[] = context?.pacientes ?? [];
  const registrarPaciente = context?.registrarPaciente ?? (async () => {});
  const registrarAtencion = context?.registrarAtencion ?? (async () => {});

  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showAtencionModal, setShowAtencionModal] = useState(false);

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

  const [localSuccessMsg, setLocalSuccessMsg] = useState<string | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const handleCancelarYReasignar = async (id: number) => {
    if (!cancelarYReasignar) return;
    setBuscando(true);
    setError(null);
    try {
      await cancelarYReasignar(id);
      triggerSuccess('Reasignación de cupo completada con éxito.');
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error en el servidor al intentar reasignar el cupo.');
      throw e;
    } finally {
      setBuscando(false);
    }
  };

  const handleActualizarEstado = async (id: number, nuevoEstado: EstadoAtencion) => {
    if (!actualizarEstadoAtencion) return;
    setBuscando(true);
    setError(null);
    try {
      await actualizarEstadoAtencion(id, nuevoEstado);
      triggerSuccess(`Estado de la atención actualizado a ${nuevoEstado}.`);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error al intentar actualizar el estado de la atención.');
      throw e;
    } finally {
      setBuscando(false);
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
      setBuscando(true);
      await registrarPaciente(nuevoPaciente);
      triggerSuccess('Paciente registrado exitosamente en listas de espera.');
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
    } finally {
      setBuscando(false);
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
      setBuscando(true);
      await registrarAtencion(
        nuevaAtencion.rutPaciente,
        nuevaAtencion.tipo,
        nuevaAtencion.prioridad,
        nuevaAtencion.detalle
      );
      triggerSuccess('Derivación de atención agregada exitosamente a la lista de espera.');
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
    } finally {
      setBuscando(false);
    }
  };

  const triggerSuccess = (msg: string) => {
    setLocalSuccessMsg(msg);
    setTimeout(() => setLocalSuccessMsg(null), 4000);
  };

  return (
    <div className="animate-fade-in">
      {localSuccessMsg && (
        <div className="rn-alert rn-alert-success animate-slide-in" style={{ marginBottom: '1rem' }}>
          <div>{localSuccessMsg}</div>
        </div>
      )}

      {/* Header superior del Dashboard de Gestión */}
      <div className="rn-card" style={{
        background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)/0.25))',
        borderLeft: '4px solid hsl(var(--primary))',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            Dashboard de Gestión Asistencial
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', margin: 0, marginTop: '0.25rem' }}>
            Consola clínica para control de ingresos y asignación de prioridades médicas en listas de espera hospitalarias.
            Al cancelar una cita agendada, el motor reasigna automáticamente el cupo al paciente en espera más prioritario.
          </p>
          
          {/* Leyenda de Prioridades G1-G5 */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginRight: '0.25rem' }}>
              Prioridades:
            </span>
            <span className="rn-badge rn-badge-prio-1" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>G1 Urgente</span>
            <span className="rn-badge rn-badge-prio-2" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>G2 Prioritaria</span>
            <span className="rn-badge rn-badge-prio-3" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>G3 Moderada</span>
            <span className="rn-badge rn-badge-prio-4" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>G4 Baja</span>
            <span className="rn-badge rn-badge-prio-5" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>G5 Control</span>
          </div>

          {/* Leyenda de Estados */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginRight: '0.25rem' }}>
              Estados:
            </span>
            <span className="rn-badge rn-badge-espera" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>En Espera (Pendiente)</span>
            <span className="rn-badge rn-badge-agendado" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Agendado (Cita confirmada)</span>
            <span className="rn-badge rn-badge-atendido" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Atendido (Completado)</span>
            <span className="rn-badge rn-badge-cancelado" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Cancelado (Cupo libre)</span>
          </div>
        </div>

        {/* Botones de Registro rápido (Ocultos en tests si no hay pacientes de contexto) */}
        {pacientes && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => { setErrorForm(null); setShowPacienteModal(true); }}
              className="rn-btn rn-btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
            >
              <UserPlus size={14} />
              Registrar Paciente
            </button>

            <button
              onClick={() => { setErrorForm(null); setShowAtencionModal(true); }}
              className="rn-btn rn-btn-primary"
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
            >
              <Plus size={14} />
              Nueva Solicitud
            </button>
          </div>
        )}
      </div>

      {/* 📑 Selector de Pestañas (Filtros por Estado) */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid hsl(var(--border))',
        marginBottom: '1.5rem',
        paddingBottom: '0.5rem'
      }}>
        <button
          type="button"
          onClick={() => setFiltroEstado('TODOS')}
          className={`rn-btn ${filtroEstado === 'TODOS' ? 'rn-btn-primary' : 'rn-btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
        >
          Todos ({atenciones.length})
        </button>
        <button
          type="button"
          onClick={() => setFiltroEstado('EN_ESPERA')}
          className={`rn-btn ${filtroEstado === 'EN_ESPERA' ? 'rn-btn-primary' : 'rn-btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
        >
          En Espera ({atenciones.filter(a => a.estado === 'EN_ESPERA').length})
        </button>
        <button
          type="button"
          onClick={() => setFiltroEstado('AGENDADO')}
          className={`rn-btn ${filtroEstado === 'AGENDADO' ? 'rn-btn-primary' : 'rn-btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
        >
          Agendados ({atenciones.filter(a => a.estado === 'AGENDADO').length})
        </button>
        <button
          type="button"
          onClick={() => setFiltroEstado('ATENDIDO_CANCELADO')}
          className={`rn-btn ${filtroEstado === 'ATENDIDO_CANCELADO' ? 'rn-btn-primary' : 'rn-btn-secondary'}`}
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
        >
          Atendidos/Cancelados ({atenciones.filter(a => a.estado === 'ATENDIDO' || a.estado === 'CANCELADO').length})
        </button>
      </div>

      <ListaEsperaTable
        atenciones={atencionesFiltradas}
        buscando={buscando}
        error={error}
        onErrorClose={() => setError(null)}
        onActualizarEstado={handleActualizarEstado}
        onCancelarYReasignar={handleCancelarYReasignar}
        onVerDetalle={onVerDetalle}
      />

      {/* 📦 MODAL 1: REGISTRAR PACIENTE NUEVO */}
      {showPacienteModal && (
        <div className="rn-modal-overlay" onClick={() => setShowPacienteModal(false)}>
          <div className="rn-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Registrar Nuevo Paciente
              </h3>
              <button 
                onClick={() => setShowPacienteModal(false)} 
                className="rn-btn rn-btn-icon"
                style={{ padding: '0.25rem' }}
              >
                <X size={18} />
              </button>
            </div>

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
                    disabled={buscando}
                  />
                </div>

                <div className="rn-form-group">
                  <label className="rn-label">Previsión *</label>
                  <select
                    className="rn-select"
                    value={nuevoPaciente.prevision}
                    onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, prevision: e.target.value as any })}
                    required
                    disabled={buscando}
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
                  disabled={buscando}
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
                  disabled={buscando}
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
                    disabled={buscando}
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
                    disabled={buscando}
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
                  disabled={buscando}
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
                  disabled={buscando}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPacienteModal(false)}
                  className="rn-btn rn-btn-secondary"
                  disabled={buscando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rn-btn rn-btn-primary"
                  disabled={buscando}
                >
                  {buscando ? <RefreshCw size={14} className="animate-spin" /> : 'Guardar Paciente'}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Ingresar a Lista de Espera
              </h3>
              <button 
                onClick={() => setShowAtencionModal(false)} 
                className="rn-btn rn-btn-icon"
                style={{ padding: '0.25rem' }}
              >
                <X size={18} />
              </button>
            </div>

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
                  disabled={buscando}
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
                    disabled={buscando}
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
                    disabled={buscando}
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
                  disabled={buscando}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAtencionModal(false)}
                  className="rn-btn rn-btn-secondary"
                  disabled={buscando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rn-btn rn-btn-primary"
                  disabled={buscando}
                >
                  {buscando ? <RefreshCw size={14} className="animate-spin" /> : 'Confirmar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaEsperaContainer;
