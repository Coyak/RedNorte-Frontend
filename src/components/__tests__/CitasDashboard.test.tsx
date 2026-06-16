import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CitasDashboard } from '../CitasDashboard';
import { Paciente, AtencionBase, Reasignacion } from '../../hooks/useListasEspera';

const mockPacientes: Paciente[] = [
  {
    rut: '12345678-9',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez Soto',
    fechaNacimiento: '1985-05-12',
    direccion: 'Av. Libertador 123',
    telefono: '987654321',
    correo: 'juan.perez@example.com',
    prevision: 'FONASA',
    historialClinicoBasico: 'Alergia a la penicilina.'
  },
  {
    rut: '98765432-1',
    nombres: 'María Inés',
    apellidos: 'González Vera',
    fechaNacimiento: '1990-09-20',
    direccion: 'Pje. Central 456',
    prevision: 'ISAPRE'
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
  },
  {
    id: 11,
    paciente: mockPacientes[0],
    estado: 'EN_ESPERA',
    fechaSolicitud: '2026-06-11T14:00:00Z',
    prioridad: 1,
    tipo: 'EMERGENCIA',
    detalle: 'Dolor Torácico'
  },
  {
    id: 12,
    paciente: mockPacientes[0],
    estado: 'CANCELADO',
    fechaSolicitud: '2026-06-12T09:00:00Z',
    prioridad: 4,
    tipo: 'CIRUGIA',
    detalle: 'Hernioplastía'
  }
];

const mockReasignaciones: Reasignacion[] = [
  {
    id: 100,
    atencionCanceladaId: 9,
    atencionReasignadaId: 10,
    rutPacienteOriginal: '98765432-1',
    rutPacienteReasignado: '12345678-9',
    especialidad: 'Cardiología',
    fechaReasignacion: '2026-06-12T12:00:00Z',
    estado: 'EXITOSA',
    observaciones: 'Paciente Juan Carlos reasignado con éxito en cupo liberado por María Inés.'
  }
];

describe('CitasDashboard', () => {
  const defaultProps = {
    pacientes: mockPacientes,
    userRole: 'ROLE_MEDICO',
    selectedPacienteRut: '12345678-9',
    onSelectedPacienteRutChange: vi.fn(),
    pacienteActivo: mockPacientes[0],
    citas: mockCitas,
    loadingCitas: false,
    citasError: null,
    isBffFallback: false,
    bffFallbackMsg: '',
    procesando: null,
    onCancelarCita: vi.fn(),
    reasignacionesPaciente: mockReasignaciones
  };

  test('debe renderizar el dashboard con la ficha del paciente y sus citas', () => {
    render(<CitasDashboard {...defaultProps} />);

    // Ficha clínica del paciente
    expect(screen.getByText('Juan Carlos')).toBeInTheDocument();
    expect(screen.getByText('Pérez Soto')).toBeInTheDocument();
    expect(screen.getByText('12345678-9')).toBeInTheDocument();
    expect(screen.getByText('FONASA')).toBeInTheDocument();
    expect(screen.getByText('987654321')).toBeInTheDocument();
    expect(screen.getByText('juan.perez@example.com')).toBeInTheDocument();
    expect(screen.getByText('Av. Libertador 123')).toBeInTheDocument();
    expect(screen.getByText('Alergia a la penicilina.')).toBeInTheDocument();

    // Visualizar citas
    expect(screen.getByText('Consulta Cardiología')).toBeInTheDocument();
    expect(screen.getByText('Dolor Torácico')).toBeInTheDocument();
    expect(screen.getByText('Hernioplastía')).toBeInTheDocument();

    // Estados
    expect(screen.getByText('En Fila')).toBeInTheDocument();
    expect(screen.getByText('Cancelada')).toBeInTheDocument();

    // Reasignaciones
    expect(screen.getByText('Transacción EXITOSA')).toBeInTheDocument();
    expect(screen.getByText('Paciente Juan Carlos reasignado con éxito en cupo liberado por María Inés.')).toBeInTheDocument();
  });

  test('debe renderizar selector de pacientes si el rol es ROLE_MEDICO', async () => {
    render(<CitasDashboard {...defaultProps} />);

    expect(screen.getByText('Visualizar Paciente:')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    await userEvent.selectOptions(select, '98765432-1');
    expect(defaultProps.onSelectedPacienteRutChange).toHaveBeenCalledWith('98765432-1');
  });

  test('no debe renderizar selector de pacientes si el rol es ROLE_PACIENTE', () => {
    render(<CitasDashboard {...defaultProps} userRole="ROLE_PACIENTE" />);

    expect(screen.queryByText('Visualizar Paciente:')).not.toBeInTheDocument();
  });

  test('debe mostrar alerta de Circuit Breaker / BFF Fallback', () => {
    render(<CitasDashboard 
      {...defaultProps} 
      isBffFallback={true} 
      bffFallbackMsg="El portal está operando con base de datos de contingencia" 
    />);

    expect(screen.getByText('Resilience4j Circuit Breaker (BFF Degradado):')).toBeInTheDocument();
    expect(screen.getAllByText('El portal está operando con base de datos de contingencia')[0]).toBeInTheDocument();
    expect(screen.getByText('Servicio Temporalmente Interrumpido')).toBeInTheDocument();
  });

  test('debe mostrar alerta de error 503 del Gateway', () => {
    render(<CitasDashboard 
      {...defaultProps} 
      citasError="El microservicio ms-listas-espera no responde (503)" 
    />);

    expect(screen.getByText('Servicio No Disponible (Error HTTP 503):')).toBeInTheDocument();
    expect(screen.getByText('El microservicio ms-listas-espera no responde (503)')).toBeInTheDocument();
  });

  test('debe mostrar spinner al cargar citas', () => {
    render(<CitasDashboard {...defaultProps} loadingCitas={true} />);

    expect(screen.getByText('Sincronizando información médica...')).toBeInTheDocument();
  });

  test('debe llamar a onCancelarCita al hacer clic en "Cancelar Hora"', async () => {
    render(<CitasDashboard {...defaultProps} />);

    const cancelarButton = screen.getByRole('button', { name: 'Cancelar Hora' });
    await userEvent.click(cancelarButton);

    expect(defaultProps.onCancelarCita).toHaveBeenCalledWith(10);
  });

  test('debe mostrar estado "Cancelando" al procesar la cancelación', () => {
    render(<CitasDashboard {...defaultProps} procesando={10} />);

    expect(screen.getByRole('button', { name: 'Cancelando' })).toBeInTheDocument();
  });

  test('debe mostrar mensaje cuando no hay reasignaciones', () => {
    render(<CitasDashboard {...defaultProps} reasignacionesPaciente={[]} />);

    expect(screen.getByText('No se registran eventos de reasignación automática para este paciente en el sistema de salud.')).toBeInTheDocument();
  });

  test('debe abrir modal de edición, modificar campos y guardar cambios con éxito', async () => {
    const onActualizarPerfilMock = vi.fn(() => Promise.resolve());
    render(
      <CitasDashboard {...defaultProps} onActualizarPerfil={onActualizarPerfilMock} />
    );

    const editBtn = screen.getByRole('button', { name: 'Editar Información' });
    await userEvent.click(editBtn);

    expect(screen.getByText('Editar Mi Información de Paciente')).toBeInTheDocument();

    const addressInput = screen.getByDisplayValue('Av. Libertador 123');
    await userEvent.clear(addressInput);
    await userEvent.type(addressInput, 'Nueva Dirección 123');

    const saveBtn = screen.getByRole('button', { name: 'Guardar Cambios' });
    await userEvent.click(saveBtn);

    expect(onActualizarPerfilMock).toHaveBeenCalledWith('12345678-9', expect.objectContaining({
      direccion: 'Nueva Dirección 123'
    }));

    expect(screen.queryByText('Editar Mi Información de Paciente')).not.toBeInTheDocument();
  });

  test('debe manejar error de API al fallar onActualizarPerfil', async () => {
    const onActualizarPerfilMock = vi.fn(() => Promise.reject(new Error('Error al actualizar')));
    render(
      <CitasDashboard {...defaultProps} onActualizarPerfil={onActualizarPerfilMock} />
    );

    const editBtn = screen.getByRole('button', { name: 'Editar Información' });
    await userEvent.click(editBtn);

    const saveBtn = screen.getByRole('button', { name: 'Guardar Cambios' });
    await userEvent.click(saveBtn);

    expect(await screen.findByText('Error al actualizar')).toBeInTheDocument();
  });

  test('debe cerrar modal de edición al hacer clic en cancelar', async () => {
    const onActualizarPerfilMock = vi.fn(() => Promise.resolve());
    render(
      <CitasDashboard {...defaultProps} onActualizarPerfil={onActualizarPerfilMock} />
    );

    const editBtn = screen.getByRole('button', { name: 'Editar Información' });
    await userEvent.click(editBtn);

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await userEvent.click(cancelBtn);

    expect(screen.queryByText('Editar Mi Información de Paciente')).not.toBeInTheDocument();
  });
});
