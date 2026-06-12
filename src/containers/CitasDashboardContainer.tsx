import React, { useState, useEffect, useCallback } from 'react';
import { useListasEspera, Paciente, Reasignacion } from '../hooks/useListasEspera';
import { CitasDashboard } from '../components/CitasDashboard';

export interface CitasDashboardContainerProps {
  pacientes?: Paciente[];
  userRole?: string | null;
  currentUserRut?: string | null;
  reasignaciones?: Reasignacion[];
  onCancelarYReasignar?: (id: number) => Promise<any>;
  obtenerCitasPaciente?: (rut: string) => Promise<any>;
  obtenerPerfilPaciente?: (rut: string) => Promise<any>;
}

export const CitasDashboardContainer: React.FC<CitasDashboardContainerProps> = ({
  pacientes: pacientesProp,
  userRole: userRoleProp,
  currentUserRut: currentUserRutProp,
  reasignaciones: reasignacionesProp,
  onCancelarYReasignar: onCancelarYReasignarProp,
  obtenerCitasPaciente: obtenerCitasPacienteProp,
  obtenerPerfilPaciente: obtenerPerfilPacienteProp
}) => {
  // Intentar obtener el contexto global (producción), si no está disponible (tests) usar props
  let context: any = null;
  try {
    context = useListasEspera();
  } catch (e) {
    // Modo de pruebas/tests sin ListasEsperaProvider
  }

  const pacientes: Paciente[] = pacientesProp ?? context?.pacientes ?? [];
  const userRole = userRoleProp ?? context?.userRole ?? null;
  const currentUserRut = currentUserRutProp ?? context?.userRut ?? null;
  const reasignaciones: Reasignacion[] = reasignacionesProp ?? context?.reasignaciones ?? [];
  const onCancelarYReasignar = onCancelarYReasignarProp ?? context?.cancelarYReasignar;
  const obtenerCitasPaciente = obtenerCitasPacienteProp ?? context?.obtenerCitasPaciente;
  const obtenerPerfilPaciente = obtenerPerfilPacienteProp ?? context?.obtenerPerfilPaciente;

  const [selectedPacienteRut, setSelectedPacienteRut] = useState<string>('');
  const [pacienteActivo, setPacienteActivo] = useState<Paciente | null>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [citasError, setCitasError] = useState<string | null>(null);
  const [isBffFallback, setIsBffFallback] = useState(false);
  const [bffFallbackMsg, setBffFallbackMsg] = useState('');
  const [procesando, setProcesando] = useState<number | null>(null);

  // Set initial selected patient RUT
  useEffect(() => {
    if (userRole === 'ROLE_PACIENTE' && currentUserRut) {
      setSelectedPacienteRut(currentUserRut);
    } else if (pacientes.length > 0) {
      setSelectedPacienteRut(pacientes[0].rut);
    }
  }, [userRole, currentUserRut, pacientes]);

  // Load patient data and appointments from BFF
  const cargarDatosPaciente = useCallback(async (rut: string) => {
    if (!rut || !obtenerPerfilPaciente || !obtenerCitasPaciente) return;
    setLoadingCitas(true);
    setCitasError(null);
    setIsBffFallback(false);
    setBffFallbackMsg('');
    try {
      // 1. Fetch profile from portal-paciente
      try {
        const perfil = await obtenerPerfilPaciente(rut);
        setPacienteActivo(perfil);
      } catch (e) {
        console.warn('Failed to load profile from portal microservice, using local list fallback:', e);
        const local = pacientes.find((p) => p.rut === rut);
        setPacienteActivo(local || null);
      }

      // 2. Fetch appointments from BFF (portal-paciente orquestador)
      const res = await obtenerCitasPaciente(rut);
      if (res && res.isFallback) {
        setIsBffFallback(true);
        setBffFallbackMsg(res.mensaje);
        setCitas([]);
      } else if (res) {
        setCitas(res.data || []);
      }
    } catch (err: any) {
      console.error('Error in portal communication:', err);
      if (err.response?.status === 503) {
        setCitasError('[Resilience4j - Circuit Breaker] El API Gateway reporta 503 Service Unavailable. El microservicio ms-listas-espera no responde.');
      } else {
        setCitasError(err.message || 'Error de conexión con el API Gateway / BFF');
      }
      setCitas([]);
    } finally {
      setLoadingCitas(false);
    }
  }, [pacientes, obtenerCitasPaciente, obtenerPerfilPaciente]);

  // Trigger load when selected patient changes
  useEffect(() => {
    if (selectedPacienteRut) {
      cargarDatosPaciente(selectedPacienteRut);
    }
  }, [selectedPacienteRut, cargarDatosPaciente]);

  const handleCancelarCita = async (id: number) => {
    if (!onCancelarYReasignar) return;
    setProcesando(id);
    try {
      await onCancelarYReasignar(id);
      if (selectedPacienteRut) {
        await cargarDatosPaciente(selectedPacienteRut);
      }
    } catch (e: any) {
      alert(`[Resilience4j - Circuit Breaker] Error en reasignación automática: ${e.message}`);
    } finally {
      setProcesando(null);
    }
  };

  const reasignacionesPaciente = reasignaciones.filter(
    (r) => r.rutPacienteOriginal === selectedPacienteRut || r.rutPacienteReasignado === selectedPacienteRut
  );

  return (
    <CitasDashboard
      pacientes={pacientes}
      userRole={userRole}
      selectedPacienteRut={selectedPacienteRut}
      onSelectedPacienteRutChange={setSelectedPacienteRut}
      pacienteActivo={pacienteActivo}
      citas={citas}
      loadingCitas={loadingCitas}
      citasError={citasError}
      isBffFallback={isBffFallback}
      bffFallbackMsg={bffFallbackMsg}
      procesando={procesando}
      onCancelarCita={handleCancelarCita}
      reasignacionesPaciente={reasignacionesPaciente}
    />
  );
};

export default CitasDashboardContainer;
