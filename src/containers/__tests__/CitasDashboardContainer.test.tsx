import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CitasDashboardContainer } from '../CitasDashboardContainer';
import { Paciente, AtencionBase, Reasignacion } from '../../hooks/useListasEspera';

const mockPacientes: Paciente[] = [
  {
    rut: '12345678-9',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez Soto',
    fechaNacimiento: '1985-05-12',
    direccion: 'Av. Libertador 123',
    prevision: 'FONASA'
  }
];

const mockCitas: AtencionBase[] = [
  {
    id: 10,
    paciente: mockPacientes[0],
    estado: 'AGENDADO',
    fechaSolicitud: '2026-06-10T10:30:00Z',
    prioridad: 2,
    tipo: 'CONSULTA',
    detalle: 'Consulta Cardiología'
  }
];

const mockReasignaciones: Reasignacion[] = [
  {
    id: 100,
    atencionCanceladaId: 10,
    atencionReasignadaId: 11,
    rutPacienteOriginal: '12345678-9',
    rutPacienteReasignado: '98765432-1',
    especialidad: 'Cardiología',
    fechaReasignacion: '2026-06-12T12:00:00Z',
    estado: 'EXITOSA',
    observaciones: 'Reasignado con éxito.'
  }
];

describe('CitasDashboardContainer', () => {
  const defaultProps = {
    pacientes: mockPacientes,
    userRole: 'ROLE_MEDICO',
    currentUserRut: null,
    reasignaciones: mockReasignaciones,
    onCancelarYReasignar: vi.fn(() => Promise.resolve()),
    obtenerCitasPaciente: vi.fn(() => Promise.resolve({ isFallback: false, data: mockCitas })),
    obtenerPerfilPaciente: vi.fn(() => Promise.resolve(mockPacientes[0]))
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  test('debe cargar los datos del paciente y sus citas al montar', async () => {
    render(<CitasDashboardContainer {...defaultProps} />);

    // Esperar a que se quite el estado de carga y se muestren los datos
    await waitFor(() => {
      expect(defaultProps.obtenerPerfilPaciente).toHaveBeenCalledWith('12345678-9');
      expect(defaultProps.obtenerCitasPaciente).toHaveBeenCalledWith('12345678-9');
    });

    expect(screen.getByText('Juan Carlos')).toBeInTheDocument();
    expect(screen.getByText('Consulta Cardiología')).toBeInTheDocument();
  });

  test('debe usar el fallback local si obtenerPerfilPaciente falla', async () => {
    const propsWithFailedProfile = {
      ...defaultProps,
      obtenerPerfilPaciente: vi.fn(() => Promise.reject(new Error('Servicio de perfil caído')))
    };

    render(<CitasDashboardContainer {...propsWithFailedProfile} />);

    await waitFor(() => {
      expect(propsWithFailedProfile.obtenerPerfilPaciente).toHaveBeenCalledWith('12345678-9');
    });

    // A pesar del error de perfil, debe caer en el fallback y encontrar al paciente en la lista local
    expect(screen.getByText('Juan Carlos')).toBeInTheDocument();
  });

  test('debe mostrar alerta de fallback cuando obtenerCitasPaciente retorna isFallback true', async () => {
    const fallbackMsg = 'El microservicio principal está inactivo, mostrando caché local temporal.';
    const propsWithBffFallback = {
      ...defaultProps,
      obtenerCitasPaciente: vi.fn(() => Promise.resolve({ isFallback: true, mensaje: fallbackMsg }))
    };

    render(<CitasDashboardContainer {...propsWithBffFallback} />);

    await waitFor(() => {
      expect(screen.getByText('Resilience4j Circuit Breaker (BFF Degradado):')).toBeInTheDocument();
    });

    expect(screen.getAllByText(fallbackMsg)[0]).toBeInTheDocument();
  });

  test('debe manejar error HTTP 503 (Circuit Breaker activo en el Gateway)', async () => {
    const error503 = {
      response: {
        status: 503
      }
    };
    const propsWith503 = {
      ...defaultProps,
      obtenerCitasPaciente: vi.fn(() => Promise.reject(error503))
    };

    render(<CitasDashboardContainer {...propsWith503} />);

    await waitFor(() => {
      expect(screen.getByText('Servicio No Disponible (Error HTTP 503):')).toBeInTheDocument();
    });

    expect(screen.getByText(/El API Gateway reporta 503 Service Unavailable/)).toBeInTheDocument();
  });

  test('debe manejar error genérico al cargar citas', async () => {
    const propsWithGeneralError = {
      ...defaultProps,
      obtenerCitasPaciente: vi.fn(() => Promise.reject(new Error('Falla de red')))
    };

    render(<CitasDashboardContainer {...propsWithGeneralError} />);

    await waitFor(() => {
      expect(screen.getByText('Servicio No Disponible (Error HTTP 503):')).toBeInTheDocument();
    });

    expect(screen.getByText('Falla de red')).toBeInTheDocument();
  });

  test('debe ejecutar la cancelación de la cita con éxito y refrescar los datos', async () => {
    render(<CitasDashboardContainer {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancelar Hora' })).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar Hora' });
    await userEvent.click(cancelBtn);

    expect(defaultProps.onCancelarYReasignar).toHaveBeenCalledWith(10);
    
    // Debe haber llamado a cargarDatosPaciente de nuevo (lo que significa 2 llamadas en total a los endpoints)
    await waitFor(() => {
      expect(defaultProps.obtenerCitasPaciente).toHaveBeenCalledTimes(2);
    });
  });

  test('debe mostrar alerta nativa si la cancelación de cita falla', async () => {
    const errCancel = new Error('No hay médicos disponibles para la reasignación');
    const propsWithFailedCancel = {
      ...defaultProps,
      onCancelarYReasignar: vi.fn(() => Promise.reject(errCancel))
    };

    render(<CitasDashboardContainer {...propsWithFailedCancel} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancelar Hora' })).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar Hora' });
    await userEvent.click(cancelBtn);

    expect(window.alert).toHaveBeenCalledWith('[Resilience4j - Circuit Breaker] Error en reasignación automática: No hay médicos disponibles para la reasignación');
  });

  test('debe setear selectedPacienteRut directamente con el RUT del paciente si el rol es ROLE_PACIENTE', async () => {
    const propsPaciente = {
      ...defaultProps,
      userRole: 'ROLE_PACIENTE',
      currentUserRut: '12345678-9'
    };

    render(<CitasDashboardContainer {...propsPaciente} />);

    await waitFor(() => {
      expect(propsPaciente.obtenerPerfilPaciente).toHaveBeenCalledWith('12345678-9');
    });
    
    expect(screen.getByText('Juan Carlos')).toBeInTheDocument();
  });
});
