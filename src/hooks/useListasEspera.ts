import { useState, useEffect } from 'react';

// Interfaces del Dominio
export interface Paciente {
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  direccion: string;
  telefono?: string;
  correo?: string;
  prevision?: 'FONASA' | 'ISAPRE' | 'PARTICULAR' | 'DIPRECA' | 'CAPREDENA';
  historialClinicoBasico?: string;
}

export type EstadoAtencion = 'EN_ESPERA' | 'AGENDADO' | 'ATENDIDO' | 'CANCELADO';
export type TipoAtencion = 'CONSULTA' | 'CIRUGIA' | 'EMERGENCIA';

export interface AtencionBase {
  id: number;
  paciente: Paciente;
  estado: EstadoAtencion;
  fechaSolicitud: string;
  prioridad: number; // 1 (Máxima) a 5 (Mínima)
  tipo: TipoAtencion;
  detalle: string; // Especialidad, tipo de cirugía o motivo de emergencia
}

export interface Reasignacion {
  id: number;
  atencionCanceladaId: number;
  atencionReasignadaId: number;
  rutPacienteOriginal: string;
  rutPacienteReasignado: string;
  especialidad: string;
  fechaReasignacion: string;
  estado: 'EXITOSA' | 'FALLIDA' | 'SIN_CANDIDATO';
  observaciones: string;
}

// Datos de Semilla Iniciales
const PACIENTES_MOCK: Paciente[] = [
  {
    rut: '12345678-9',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez López',
    fechaNacimiento: '1985-03-15',
    direccion: 'Av. Los Leones 1234, Providencia',
    telefono: '+56912345678',
    correo: 'juan.perez@email.com',
    prevision: 'FONASA',
    historialClinicoBasico: 'Hipertensión arterial controlada. Alergia a la penicilina.'
  },
  {
    rut: '98765432-1',
    nombres: 'María Fernanda',
    apellidos: 'González Rojas',
    fechaNacimiento: '1990-07-22',
    direccion: 'Calle Moneda 567, Santiago',
    telefono: '+56987654321',
    correo: 'maria.gonzalez@email.com',
    prevision: 'ISAPRE',
    historialClinicoBasico: 'Sin antecedentes de enfermedades crónicas conocidas.'
  },
  {
    rut: '11223344-5',
    nombres: 'Pedro Andrés',
    apellidos: 'Soto Martínez',
    fechaNacimiento: '1962-11-05',
    direccion: 'Paseo Altamar 89, Antofagasta',
    telefono: '+56944332211',
    correo: 'pedro.soto@email.com',
    prevision: 'DIPRECA',
    historialClinicoBasico: 'Diabetes Mellitus tipo 2. Post-operado de hernia inguinal.'
  },
  {
    rut: '15543321-K',
    nombres: 'Camila Ignacia',
    apellidos: 'Silva Valenzuela',
    fechaNacimiento: '1998-05-18',
    direccion: 'Av. Brasil 450, Iquique',
    telefono: '+56977889900',
    correo: 'camila.silva@email.com',
    prevision: 'FONASA',
    historialClinicoBasico: 'Asma bronquial leve en tratamiento con salbutamol.'
  }
];

const ATENCIONES_MOCK: AtencionBase[] = [
  {
    id: 1,
    paciente: PACIENTES_MOCK[0],
    estado: 'AGENDADO',
    fechaSolicitud: '2026-05-25T10:00:00Z',
    prioridad: 3,
    tipo: 'CONSULTA',
    detalle: 'Cardiología'
  },
  {
    id: 2,
    paciente: PACIENTES_MOCK[1],
    estado: 'EN_ESPERA',
    fechaSolicitud: '2026-05-26T09:30:00Z',
    prioridad: 1,
    tipo: 'CIRUGIA',
    detalle: 'Cirugía Cardiovascular'
  },
  {
    id: 3,
    paciente: PACIENTES_MOCK[2],
    estado: 'EN_ESPERA',
    fechaSolicitud: '2026-05-27T11:15:00Z',
    prioridad: 2,
    tipo: 'CONSULTA',
    detalle: 'Endocrinología'
  },
  {
    id: 4,
    paciente: PACIENTES_MOCK[3],
    estado: 'EN_ESPERA',
    fechaSolicitud: '2026-05-27T14:40:00Z',
    prioridad: 1,
    tipo: 'EMERGENCIA',
    detalle: 'Crisis de Asma Severa'
  }
];

const REASIGNACIONES_MOCK: Reasignacion[] = [
  {
    id: 1,
    atencionCanceladaId: 99,
    atencionReasignadaId: 1,
    rutPacienteOriginal: '18888777-6',
    rutPacienteReasignado: '12345678-9',
    especialidad: 'Cardiología',
    fechaReasignacion: '2026-05-26T16:00:00Z',
    estado: 'EXITOSA',
    observaciones: 'Reasignación automática por cancelación de cupo prioritario.'
  }
];

export function useListasEspera() {
  const [pacientes, setPacientes] = useState<Paciente[]>(() => {
    const saved = localStorage.getItem('rednorte_pacientes');
    return saved ? JSON.parse(saved) : PACIENTES_MOCK;
  });

  const [atenciones, setAtenciones] = useState<AtencionBase[]>(() => {
    const saved = localStorage.getItem('rednorte_atenciones');
    return saved ? JSON.parse(saved) : ATENCIONES_MOCK;
  });

  const [reasignaciones, setReasignaciones] = useState<Reasignacion[]>(() => {
    const saved = localStorage.getItem('rednorte_reasignaciones');
    return saved ? JSON.parse(saved) : REASIGNACIONES_MOCK;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guardar en LocalStorage cada vez que cambien los datos para mantener el estado entre recargas
  useEffect(() => {
    localStorage.setItem('rednorte_pacientes', JSON.stringify(pacientes));
  }, [pacientes]);

  useEffect(() => {
    localStorage.setItem('rednorte_atenciones', JSON.stringify(atenciones));
  }, [atenciones]);

  useEffect(() => {
    localStorage.setItem('rednorte_reasignaciones', JSON.stringify(reasignaciones));
  }, [reasignaciones]);

  // Simular latencia de red
  const simularCarga = () => {
    setLoading(true);
    setError(null);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setLoading(false);
        resolve();
      }, 600);
    });
  };

  // 1. Registrar un paciente
  const registrarPaciente = async (nuevo: Paciente) => {
    await simularCarga();
    if (pacientes.some((p) => p.rut.trim() === nuevo.rut.trim())) {
      throw new Error(`El paciente con RUT ${nuevo.rut} ya se encuentra registrado.`);
    }
    setPacientes((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  // 2. Registrar una atención (Factory Method en el lado de la lógica)
  const registrarAtencion = async (rutPaciente: string, tipo: TipoAtencion, prioridad: number, detalle: string) => {
    await simularCarga();
    const paciente = pacientes.find((p) => p.rut.trim() === rutPaciente.trim());
    if (!paciente) {
      throw new Error(`Paciente con RUT ${rutPaciente} no encontrado en el sistema.`);
    }

    const nuevaAtencion: AtencionBase = {
      id: atenciones.length > 0 ? Math.max(...atenciones.map((a) => a.id)) + 1 : 1,
      paciente,
      estado: 'EN_ESPERA',
      fechaSolicitud: new Date().toISOString(),
      prioridad,
      tipo,
      detalle
    };

    setAtenciones((prev) => [...prev, nuevaAtencion]);
    return nuevaAtencion;
  };

  // 3. Actualizar estado de una atención
  const actualizarEstadoAtencion = async (id: number, nuevoEstado: EstadoAtencion) => {
    await simularCarga();
    let atencionActualizada: AtencionBase | null = null;
    
    setAtenciones((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          atencionActualizada = { ...a, estado: nuevoEstado };
          return atencionActualizada;
        }
        return a;
      })
    );

    if (!atencionActualizada) {
      throw new Error(`Atención con ID ${id} no encontrada.`);
    }

    return atencionActualizada;
  };

  // 4. Cancelar una cita y ejecutar el Motor de Reasignación Automática (ms-reasignacion simulation)
  const cancelarYReasignar = async (id: number) => {
    await simularCarga();
    
    // Buscar la atención que se va a cancelar
    const original = atenciones.find((a) => a.id === id);
    if (!original) {
      throw new Error(`Atención con ID ${id} no encontrada.`);
    }

    // 1. Marcar atención original como CANCELADO
    setAtenciones((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado: 'CANCELADO' } : a))
    );

    // 2. Buscar candidatos en lista de espera (EN_ESPERA)
    // Se filtran por especialidad o tipo de atención similar (para consultas filtramos por mismo detalle/especialidad, para cirugías por cirugía, etc.)
    const candidatos = atenciones
      .filter((a) => a.estado === 'EN_ESPERA' && a.id !== id)
      .sort((a, b) => {
        // Ordenar por prioridad ascendente (1 es mayor prioridad)
        if (a.prioridad !== b.prioridad) {
          return a.prioridad - b.prioridad;
        }
        // Desempate por fecha de solicitud más antigua
        return new Date(a.fechaSolicitud).getTime() - new Date(b.fechaSolicitud).getTime();
      });

    const nuevoIdReasignacion = reasignaciones.length > 0 ? Math.max(...reasignaciones.map((r) => r.id)) + 1 : 1;

    if (candidatos.length === 0) {
      // Registrar reasignación fallida / sin candidato
      const sinMatch: Reasignacion = {
        id: nuevoIdReasignacion,
        atencionCanceladaId: id,
        atencionReasignadaId: 0,
        rutPacienteOriginal: original.paciente.rut,
        rutPacienteReasignado: 'N/A',
        especialidad: original.detalle,
        fechaReasignacion: new Date().toISOString(),
        estado: 'SIN_CANDIDATO',
        observaciones: 'Cita cancelada. No se encontraron pacientes candidatos en la lista de espera.'
      };
      setReasignaciones((prev) => [sinMatch, ...prev]);
      return { atencionOriginalId: id, reasignado: false, reasignacion: sinMatch };
    }

    // 3. Tomar el candidato prioritario
    const candidato = candidatos[0];

    // 4. Marcar al candidato como AGENDADO
    setAtenciones((prev) =>
      prev.map((a) => (a.id === candidato.id ? { ...a, estado: 'AGENDADO' } : a))
    );

    // 5. Registrar reasignación exitosa
    const reasignacionExitosa: Reasignacion = {
      id: nuevoIdReasignacion,
      atencionCanceladaId: id,
      atencionReasignadaId: candidato.id,
      rutPacienteOriginal: original.paciente.rut,
      rutPacienteReasignado: candidato.paciente.rut,
      especialidad: original.detalle,
      fechaReasignacion: new Date().toISOString(),
      estado: 'EXITOSA',
      observaciones: `Reasignación automática exitosa. El paciente ${candidato.paciente.nombres} ${candidato.paciente.apellidos} (RUT: ${candidato.paciente.rut}) ha sido asignado al cupo liberado en ${original.detalle}.`
    };

    setReasignaciones((prev) => [reasignacionExitosa, ...prev]);
    return { atencionOriginalId: id, reasignado: true, reasignacion: reasignacionExitosa, candidato };
  };

  // 5. Obtener lista de espera ordenada por prioridad y antigüedad (filtro de solo EN_ESPERA)
  const obtenerListaEspera = () => {
    return atenciones
      .filter((a) => a.estado === 'EN_ESPERA')
      .sort((a, b) => {
        if (a.prioridad !== b.prioridad) {
          return a.prioridad - b.prioridad;
        }
        return new Date(a.fechaSolicitud).getTime() - new Date(b.fechaSolicitud).getTime();
      });
  };

  // 6. Resetear datos a las semillas iniciales
  const resetearDatos = () => {
    localStorage.removeItem('rednorte_pacientes');
    localStorage.removeItem('rednorte_atenciones');
    localStorage.removeItem('rednorte_reasignaciones');
    setPacientes(PACIENTES_MOCK);
    setAtenciones(ATENCIONES_MOCK);
    setReasignaciones(REASIGNACIONES_MOCK);
  };

  return {
    pacientes,
    atenciones,
    reasignaciones,
    loading,
    error,
    registrarPaciente,
    registrarAtencion,
    actualizarEstadoAtencion,
    cancelarYReasignar,
    obtenerListaEspera,
    resetearDatos
  };
}
