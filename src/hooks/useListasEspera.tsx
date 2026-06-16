import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import api from '../services/api';

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

// Mapper helper to translate backend subclasses back into AtencionBase
export function mapAtencion(a: any): AtencionBase {
  const tipo = a.tipo || (a.especialidad ? 'CONSULTA' : a.tipoCirugia ? 'CIRUGIA' : 'EMERGENCIA');
  const detalle = a.detalle || a.especialidad || a.tipoCirugia || a.motivoEmergencia || '';
  
  // Format patient properties
  const paciente: Paciente = {
    rut: a.paciente?.rut || '',
    nombres: a.paciente?.nombres || '',
    apellidos: a.paciente?.apellidos || '',
    fechaNacimiento: a.paciente?.fechaNacimiento || '',
    direccion: a.paciente?.direccion || '',
    telefono: a.paciente?.telefono,
    correo: a.paciente?.correo,
    prevision: a.paciente?.prevision,
    historialClinicoBasico: a.paciente?.historialClinicoBasico,
  };

  return {
    id: a.id,
    paciente,
    estado: a.estado || 'EN_ESPERA',
    fechaSolicitud: a.fechaSolicitud || new Date().toISOString(),
    prioridad: a.prioridad || 3,
    tipo: tipo as TipoAtencion,
    detalle: detalle
  };
}

export function useListasEsperaState() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [atenciones, setAtenciones] = useState<AtencionBase[]>([]);
  const [reasignaciones, setReasignaciones] = useState<Reasignacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication states
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rednorte_jwt_token'));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('rednorte_user_role'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('rednorte_username'));
  const [userRut, setUserRut] = useState<string | null>(() => localStorage.getItem('rednorte_rut'));

  // Fetch all patients and optionally retrieve detailed profiles
  const fetchPacientes = useCallback(async () => {
    try {
      const res = await api.get('/api/listas-espera/pacientes');
      const basicPacientes = res.data;

      // Fetch profiles in parallel to fill portal-specific info
      const fullPacientes = await Promise.all(
        basicPacientes.map(async (p: any) => {
          try {
            const profileRes = await api.get(`/api/portal-paciente/perfil/${p.rut}`);
            return { ...p, ...profileRes.data };
          } catch {
            return { ...p, prevision: p.prevision || 'FONASA' };
          }
        })
      );
      setPacientes(fullPacientes);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
    }
  }, []);

  // Fetch all attentions
  const fetchAtenciones = useCallback(async () => {
    try {
      const res = await api.get('/api/listas-espera/atenciones');
      setAtenciones(res.data.map(mapAtencion));
    } catch (err: any) {
      console.error('Error fetching attentions:', err);
    }
  }, []);

  // Fetch reassignment logs
  const fetchReasignaciones = useCallback(async () => {
    try {
      const res = await api.get('/api/reasignacion/historial');
      setReasignaciones(res.data);
    } catch (err: any) {
      console.error('Error fetching reassignments:', err);
    }
  }, []);

  // Consolidate API refresh
  const refreshData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchPacientes(),
        fetchAtenciones(),
        fetchReasignaciones()
      ]);
    } catch (err: any) {
      setError(err.message || 'Error al sincronizar datos');
    } finally {
      setLoading(false);
    }
  }, [token, fetchPacientes, fetchAtenciones, fetchReasignaciones]);

  // Sincronizar datos automáticamente al montar o al cambiar de token
  useEffect(() => {
    if (token) {
      refreshData();
    } else {
      setPacientes([]);
      setAtenciones([]);
      setReasignaciones([]);
    }
  }, [token, refreshData]);

  // Auth: Login
  const login = async (user: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/v1/auth/login', { username: user, password: pass });
      const { token: jwtToken, role, username: resUser, rut: resRut } = res.data;
      
      localStorage.setItem('rednorte_jwt_token', jwtToken);
      localStorage.setItem('rednorte_user_role', role);
      localStorage.setItem('rednorte_username', resUser);
      
      let rut = resRut || '';
      if (!rut && role === 'ROLE_PACIENTE') {
        rut = '12345678-9';
      }
      localStorage.setItem('rednorte_rut', rut);
      
      setToken(jwtToken);
      setUserRole(role);
      setUsername(resUser);
      setUserRut(rut);
      
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Credenciales inválidas';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Auth: Logout
  const logout = () => {
    localStorage.removeItem('rednorte_jwt_token');
    localStorage.removeItem('rednorte_user_role');
    localStorage.removeItem('rednorte_username');
    localStorage.removeItem('rednorte_rut');
    setToken(null);
    setUserRole(null);
    setUsername(null);
    setUserRut(null);
  };

  // 1. Registrar un paciente en listas de espera y crear perfil de portal
  const registrarPaciente = async (nuevo: Paciente) => {
    setLoading(true);
    setError(null);
    try {
      // Registrar en listas-espera (campos mínimos obligatorios)
      await api.post('/api/listas-espera/pacientes', {
        rut: nuevo.rut,
        nombres: nuevo.nombres,
        apellidos: nuevo.apellidos,
        fechaNacimiento: nuevo.fechaNacimiento,
        direccion: nuevo.direccion
      });

      // Crear perfil completo en el portal
      const portalRes = await api.post('/api/portal-paciente/perfil', nuevo);
      
      // Refrescar pacientes
      await fetchPacientes();
      return portalRes.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al registrar paciente';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Registrar una atención
  const registrarAtencion = async (rutPaciente: string, tipo: TipoAtencion, prioridad: number, detalle: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/listas-espera/atenciones', {
        rutPaciente,
        tipo,
        prioridad,
        detalle
      });
      // Refrescar atenciones
      await fetchAtenciones();
      return mapAtencion(res.data);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al registrar atención';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Actualizar estado de una atención
  const actualizarEstadoAtencion = async (id: number, nuevoEstado: EstadoAtencion) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/api/listas-espera/atenciones/${id}/estado?nuevoEstado=${nuevoEstado}`);
      await fetchAtenciones();
      return mapAtencion(res.data);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al actualizar estado';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // 4. Cancelar una cita y ejecutar el Motor de Reasignación Automática (ms-reasignacion)
  const cancelarYReasignar = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/api/reasignacion/procesar/${id}`);
      // Refrescar tanto atenciones como historial de reasignación
      await Promise.all([fetchAtenciones(), fetchReasignaciones()]);
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error en reasignación automática';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // 5. Obtener lista de espera (ordenada localmente)
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

  // 6. Obtener citas del paciente usando el orquestador BFF
  const obtenerCitasPaciente = async (rut: string) => {
    try {
      const res = await api.get(`/api/portal-paciente/perfil/${rut}/citas`);
      if (res.data && Array.isArray(res.data) && res.data.length === 1 && res.data[0].mensaje) {
        return { isFallback: true, mensaje: res.data[0].mensaje };
      }
      return { isFallback: false, data: Array.isArray(res.data) ? res.data.map(mapAtencion) : [] };
    } catch (err: any) {
      // Propagar el error completo para capturar el 503
      throw err;
    }
  };

  // 7. Obtener perfil del paciente desde el portal
  const obtenerPerfilPaciente = async (rut: string) => {
    const res = await api.get(`/api/portal-paciente/perfil/${rut}`);
    return res.data;
  };

  // 8. Actualizar perfil del paciente en el portal
  const actualizarPerfilPaciente = async (rut: string, perfil: Paciente) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(`/api/portal-paciente/perfil/${rut}`, perfil);
      await fetchPacientes();
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al actualizar perfil';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // 9. Obtener todos los usuarios registrados (ms-usuarios)
  const obtenerUsuariosSistema = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/v1/usuarios');
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener usuarios';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // 10. Obtener estadísticas de prioridad (ms-auditoria)
  const obtenerEstadisticasAuditoria = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/v1/auditoria/estadisticas');
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener estadísticas';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Restablecer datos / Refrescar desde DB
  const resetearDatos = async () => {
    await refreshData();
  };

  return {
    pacientes,
    atenciones,
    reasignaciones,
    loading,
    error,
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
    obtenerListaEspera,
    obtenerCitasPaciente,
    obtenerPerfilPaciente,
    actualizarPerfilPaciente,
    obtenerUsuariosSistema,
    obtenerEstadisticasAuditoria,
    resetearDatos,
    refreshData
  };
}

export type ListasEsperaContextType = ReturnType<typeof useListasEsperaState>;

const ListasEsperaContext = createContext<ListasEsperaContextType | null>(null);

export const ListasEsperaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useListasEsperaState();
  return (
    <ListasEsperaContext.Provider value={value}>
      {children}
    </ListasEsperaContext.Provider>
  );
};

export function useListasEspera() {
  const context = useContext(ListasEsperaContext);
  if (!context) {
    throw new Error('useListasEspera must be used within a ListasEsperaProvider');
  }
  return context;
}
