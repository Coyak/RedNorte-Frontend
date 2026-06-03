import React, { useState, useEffect, useCallback } from 'react';
import { Paciente, AtencionBase, Reasignacion } from '../hooks/useListasEspera';
import { CitasDashboard } from '../components/CitasDashboard';

export interface CitasDashboardContainerProps {
  pacientes: Paciente[];
  userRole: string | null;
  currentUserRut: string | null;
  reasignaciones: Reasignacion[];
  onCancelarYReasignar: (id: number) => Promise<any>;
  obtenerCitasPaciente: (rut: string) => Promise<any>;
  obtenerPerfilPaciente: (rut: string) => Promise<any>;
}

export const CitasDashboardContainer: React.FC<CitasDashboardContainerProps> = ({
  pacientes,
  userRole,
  currentUserRut,
  reasignaciones,
  onCancelarYReasignar,
  obtenerCitasPaciente,
  obtenerPerfilPaciente
}) => {
  const [selectedPacienteRut, setSelectedPacienteRut] = useState<string>('');
  const [pacienteActivo, setPacienteActivo] = useState<Paciente | null>(null);
  const [citas, setCitas] = useState<AtencionBase[]>([]);
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
    if (!rut) return;
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
      if (res.isFallback) {
        setIsBffFallback(true);
        setBffFallbackMsg(res.mensaje);
        setCitas([]);
      } else {
        setCitas(res.data);
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
