import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListaEsperaContainer } from '../ListaEsperaContainer';
import { AtencionBase } from '../../hooks/useListasEspera';
import { ListaEsperaTable } from '../../components/ListaEsperaTable';

// Mock del Presenter para aislar la lógica del Container
vi.mock('../../components/ListaEsperaTable', () => {
  const MockTable = vi.fn(({ atenciones, error, onErrorClose, onActualizarEstado, onCancelarYReasignar }) => (
    <div data-testid="table-mock">
      {error && <span data-testid="error-msg">{error}</span>}
      <button data-testid="btn-close-error" onClick={onErrorClose}>X</button>
    </div>
  ));
  return {
    ListaEsperaTable: MockTable,
    default: MockTable
  };
});

const mockRegistrarPaciente = vi.fn(() => Promise.resolve());
const mockRegistrarAtencion = vi.fn(() => Promise.resolve());
const mockPacientesData = [
  { rut: '12345678-9', nombres: 'Juan Carlos', apellidos: 'Pérez Soto', prevision: 'FONASA' as const }
];

const mockUseListasEspera = vi.fn(() => ({
  pacientes: mockPacientesData,
  registrarPaciente: mockRegistrarPaciente,
  registrarAtencion: mockRegistrarAtencion,
  atenciones: [],
  actualizarEstadoAtencion: vi.fn(),
  cancelarYReasignar: vi.fn(),
}));

vi.mock('../../hooks/useListasEspera', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../hooks/useListasEspera')>();
  return {
    ...original,
    useListasEspera: () => mockUseListasEspera()
  };
});

const mockAtenciones: AtencionBase[] = [
  {
    id: 1,
    paciente: {
      rut: '12345678-9',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez Soto',
      fechaNacimiento: '1985-05-12',
      direccion: 'Av. Libertador 123'
    },
    estado: 'EN_ESPERA',
    fechaSolicitud: '2026-06-10T10:30:00Z',
    prioridad: 3,
    tipo: 'CONSULTA',
    detalle: 'Consulta Cardiología'
  }
];

describe('ListaEsperaContainer', () => {
  const defaultProps = {
    atenciones: mockAtenciones,
    onActualizarEstado: vi.fn(() => Promise.resolve()),
    onCancelarYReasignar: vi.fn(() => Promise.resolve()),
    onVerDetalle: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('debe renderizar el presenter ListaEsperaTable con mock', () => {
    render(<ListaEsperaContainer {...defaultProps} />);
    expect(screen.getByTestId('table-mock')).toBeInTheDocument();
  });

  test('debe ejecutar handleActualizarEstado correctamente', async () => {
    render(<ListaEsperaContainer {...defaultProps} />);
    
    const tableMock = vi.mocked(ListaEsperaTable);
    const lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    
    await act(async () => {
      await lastCallProps.onActualizarEstado(1, 'AGENDADO');
    });
    expect(defaultProps.onActualizarEstado).toHaveBeenCalledWith(1, 'AGENDADO');
  });

  test('debe capturar error al fallar onActualizarEstado', async () => {
    const errorMsg = 'Error temporal en servidor';
    const failedProps = {
      ...defaultProps,
      onActualizarEstado: vi.fn(() => Promise.reject(new Error(errorMsg)))
    };

    render(<ListaEsperaContainer {...failedProps} />);

    const tableMock = vi.mocked(ListaEsperaTable);
    const lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    
    await act(async () => {
      await expect(lastCallProps.onActualizarEstado(3, 'AGENDADO')).rejects.toThrow(errorMsg);
    });

    expect(await screen.findByTestId('error-msg')).toBeInTheDocument();
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  test('debe ejecutar handleCancelarYReasignar correctamente', async () => {
    render(<ListaEsperaContainer {...defaultProps} />);

    const tableMock = vi.mocked(ListaEsperaTable);
    const lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    
    await act(async () => {
      await lastCallProps.onCancelarYReasignar(2);
    });
    expect(defaultProps.onCancelarYReasignar).toHaveBeenCalledWith(2);
  });

  test('debe capturar error al fallar onCancelarYReasignar', async () => {
    const errorMsg = 'Falla de Circuit Breaker de Reasignación';
    const failedProps = {
      ...defaultProps,
      onCancelarYReasignar: vi.fn(() => Promise.reject(new Error(errorMsg)))
    };

    render(<ListaEsperaContainer {...failedProps} />);

    const tableMock = vi.mocked(ListaEsperaTable);
    const lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    
    await act(async () => {
      await expect(lastCallProps.onCancelarYReasignar(2)).rejects.toThrow(errorMsg);
    });

    expect(await screen.findByTestId('error-msg')).toBeInTheDocument();
    expect(screen.getByText(errorMsg)).toBeInTheDocument();
  });

  test('debe limpiar el error al llamar a onErrorClose', async () => {
    const errorMsg = 'Error temporal';
    const failedProps = {
      ...defaultProps,
      onActualizarEstado: vi.fn(() => Promise.reject(new Error(errorMsg)))
    };

    render(<ListaEsperaContainer {...failedProps} />);

    const tableMock = vi.mocked(ListaEsperaTable);
    let lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    
    await act(async () => {
      await expect(lastCallProps.onActualizarEstado(1, 'AGENDADO')).rejects.toThrow();
    });
    
    expect(await screen.findByTestId('error-msg')).toBeInTheDocument();

    lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    
    act(() => {
      lastCallProps.onErrorClose();
    });

    expect(screen.queryByTestId('error-msg')).not.toBeInTheDocument();
  });

  test('debe capturar error sin mensaje y mostrar fallback genérico al fallar onActualizarEstado', async () => {
    const failedProps = {
      ...defaultProps,
      onActualizarEstado: vi.fn(() => Promise.reject({}))
    };

    render(<ListaEsperaContainer {...failedProps} />);

    const tableMock = vi.mocked(ListaEsperaTable);
    const lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    
    await act(async () => {
      await expect(lastCallProps.onActualizarEstado(3, 'AGENDADO')).rejects.toEqual({});
    });

    expect(await screen.findByTestId('error-msg')).toBeInTheDocument();
    expect(screen.getByText('Error al intentar actualizar el estado de la atención.')).toBeInTheDocument();
  });

  test('debe capturar error sin mensaje y mostrar fallback genérico al fallar onCancelarYReasignar', async () => {
    const failedProps = {
      ...defaultProps,
      onCancelarYReasignar: vi.fn(() => Promise.reject({}))
    };

    render(<ListaEsperaContainer {...failedProps} />);

    const tableMock = vi.mocked(ListaEsperaTable);
    const lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    
    await act(async () => {
      await expect(lastCallProps.onCancelarYReasignar(2)).rejects.toEqual({});
    });

    expect(await screen.findByTestId('error-msg')).toBeInTheDocument();
    expect(screen.getByText('Error en el servidor al intentar reasignar el cupo.')).toBeInTheDocument();
  });

  // --- Nuevos tests para los Modales (Ingresos) ---

  test('debe abrir modal, rellenar y guardar un nuevo paciente con éxito', async () => {
    mockRegistrarPaciente.mockResolvedValueOnce(undefined);
    const { container } = render(<ListaEsperaContainer {...defaultProps} />);

    // Abrir modal de paciente
    const openBtn = screen.getByRole('button', { name: /registrar paciente/i });
    await userEvent.click(openBtn);

    expect(screen.getByText('Registrar Nuevo Paciente')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('12345678-9'), '98765432-1');
    await userEvent.type(screen.getByPlaceholderText('Juan Carlos'), 'Maria Paz');
    await userEvent.type(screen.getByPlaceholderText('Pérez López'), 'Gomez Silva');
    
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await userEvent.type(dateInput, '1990-08-20');
    
    await userEvent.type(screen.getByPlaceholderText('Av. Los Leones 1234, Santiago'), 'Av. Providencia 456');
    await userEvent.type(screen.getByPlaceholderText('+56912345678'), '+56988887777');
    await userEvent.type(screen.getByPlaceholderText('Antecedentes crónicos, alergias, etc...'), 'Alergia a la penicilina');

    const previsionSelect = container.querySelector('select') as HTMLSelectElement;
    await userEvent.selectOptions(previsionSelect, 'ISAPRE');

    const submitBtn = screen.getByRole('button', { name: /guardar paciente/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegistrarPaciente).toHaveBeenCalledWith({
        rut: '98765432-1',
        nombres: 'Maria Paz',
        apellidos: 'Gomez Silva',
        fechaNacimiento: '1990-08-20',
        direccion: 'Av. Providencia 456',
        telefono: '+56988887777',
        correo: '',
        prevision: 'ISAPRE',
        historialClinicoBasico: 'Alergia a la penicilina'
      });
    });

    expect(screen.queryByText('Registrar Nuevo Paciente')).not.toBeInTheDocument();
    expect(screen.getByText('Paciente registrado exitosamente en listas de espera.')).toBeInTheDocument();
  });

  test('debe mostrar error de validación local si faltan campos en el formulario de paciente', async () => {
    const { container } = render(<ListaEsperaContainer {...defaultProps} />);

    const openBtn = screen.getByRole('button', { name: /registrar paciente/i });
    await userEvent.click(openBtn);

    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(screen.getByText('Por favor rellene todos los campos obligatorios (*)')).toBeInTheDocument();
    expect(mockRegistrarPaciente).not.toHaveBeenCalled();
  });

  test('debe mostrar error de API si registrarPaciente falla', async () => {
    const errorMsg = 'El RUT ya está registrado';
    mockRegistrarPaciente.mockRejectedValueOnce(new Error(errorMsg));
    const { container } = render(<ListaEsperaContainer {...defaultProps} />);

    const openBtn = screen.getByRole('button', { name: /registrar paciente/i });
    await userEvent.click(openBtn);

    await userEvent.type(screen.getByPlaceholderText('12345678-9'), '98765432-1');
    await userEvent.type(screen.getByPlaceholderText('Juan Carlos'), 'Maria Paz');
    await userEvent.type(screen.getByPlaceholderText('Pérez López'), 'Gomez Silva');
    
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await userEvent.type(dateInput, '1990-08-20');
    
    await userEvent.type(screen.getByPlaceholderText('Av. Los Leones 1234, Santiago'), 'Av. Providencia 456');

    const submitBtn = screen.getByRole('button', { name: /guardar paciente/i });
    await userEvent.click(submitBtn);

    expect(await screen.findByText(errorMsg)).toBeInTheDocument();
  });

  test('debe abrir modal, rellenar y guardar una nueva solicitud de atención', async () => {
    mockRegistrarAtencion.mockResolvedValueOnce(undefined);
    const { container } = render(<ListaEsperaContainer {...defaultProps} />);

    const openBtn = screen.getByRole('button', { name: /nueva solicitud/i });
    await userEvent.click(openBtn);

    expect(screen.getByText('Ingresar a Lista de Espera')).toBeInTheDocument();

    const selects = container.querySelectorAll('select');
    const pacienteSelect = selects[0] as HTMLSelectElement;
    const tipoSelect = selects[1] as HTMLSelectElement;
    const prioridadSelect = selects[2] as HTMLSelectElement;

    await userEvent.selectOptions(pacienteSelect, '12345678-9');
    await userEvent.selectOptions(tipoSelect, 'CIRUGIA');
    await userEvent.selectOptions(prioridadSelect, '2');

    await userEvent.type(screen.getByPlaceholderText(/ej\. cardiología/i), 'Cirugía de bypass gástrico');

    const submitBtn = screen.getByRole('button', { name: /confirmar ingreso/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegistrarAtencion).toHaveBeenCalledWith(
        '12345678-9',
        'CIRUGIA',
        2,
        'Cirugía de bypass gástrico'
      );
    });

    expect(screen.queryByText('Ingresar a Lista de Espera')).not.toBeInTheDocument();
    expect(screen.getByText('Derivación de atención agregada exitosamente a la lista de espera.')).toBeInTheDocument();
  });

  test('debe mostrar error de validación local si faltan campos en el formulario de atención', async () => {
    const { container } = render(<ListaEsperaContainer {...defaultProps} />);

    const openBtn = screen.getByRole('button', { name: /nueva solicitud/i });
    await userEvent.click(openBtn);

    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(screen.getByText('Por favor ingrese el RUT del paciente y el detalle de la solicitud.')).toBeInTheDocument();
    expect(mockRegistrarAtencion).not.toHaveBeenCalled();
  });

  test('debe mostrar error de API si registrarAtencion falla', async () => {
    const errorMsg = 'El paciente ya cuenta con una cirugía activa en espera';
    mockRegistrarAtencion.mockRejectedValueOnce(new Error(errorMsg));
    const { container } = render(<ListaEsperaContainer {...defaultProps} />);

    const openBtn = screen.getByRole('button', { name: /nueva solicitud/i });
    await userEvent.click(openBtn);

    const selects = container.querySelectorAll('select');
    const pacienteSelect = selects[0] as HTMLSelectElement;

    await userEvent.selectOptions(pacienteSelect, '12345678-9');
    await userEvent.type(screen.getByPlaceholderText(/ej\. cardiología/i), 'Cirugía de bypass gástrico');

    const form = container.querySelector('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(await screen.findByText(errorMsg)).toBeInTheDocument();
  });

  test('debe cerrar el modal de paciente al hacer clic en cancelar o en la X', async () => {
    const { container } = render(<ListaEsperaContainer {...defaultProps} />);

    const openBtn = screen.getByRole('button', { name: /registrar paciente/i });
    await userEvent.click(openBtn);

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await userEvent.click(cancelBtn);

    expect(screen.queryByText('Registrar Nuevo Paciente')).not.toBeInTheDocument();

    await userEvent.click(openBtn);
    expect(screen.getByText('Registrar Nuevo Paciente')).toBeInTheDocument();

    const closeIconBtn = container.querySelector('.rn-modal button.rn-btn-icon') as HTMLButtonElement;
    await userEvent.click(closeIconBtn);
    expect(screen.queryByText('Registrar Nuevo Paciente')).not.toBeInTheDocument();
  });

  test('debe cerrar el modal de atención al hacer clic en cancelar o en la X', async () => {
    const { container } = render(<ListaEsperaContainer {...defaultProps} />);

    const openBtn = screen.getByRole('button', { name: /nueva solicitud/i });
    await userEvent.click(openBtn);

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    await userEvent.click(cancelBtn);

    expect(screen.queryByText('Ingresar a Lista de Espera')).not.toBeInTheDocument();

    await userEvent.click(openBtn);
    expect(screen.getByText('Ingresar a Lista de Espera')).toBeInTheDocument();

    const closeIconBtn = container.querySelector('.rn-modal button.rn-btn-icon') as HTMLButtonElement;
    await userEvent.click(closeIconBtn);
    expect(screen.queryByText('Ingresar a Lista de Espera')).not.toBeInTheDocument();
  });

  test('debe cambiar filtro de estado y filtrar atenciones al presionar los botones de pestañas', async () => {
    const atencionesMixtas: AtencionBase[] = [
      {
        id: 1,
        paciente: { rut: '12345678-9', nombres: 'Juan', apellidos: 'Perez', fechaNacimiento: '1990-01-01', direccion: 'Dir' },
        estado: 'EN_ESPERA',
        fechaSolicitud: '2026-06-10T10:30:00Z',
        prioridad: 3,
        tipo: 'CONSULTA',
        detalle: 'Consulta'
      },
      {
        id: 2,
        paciente: { rut: '98765432-1', nombres: 'Maria', apellidos: 'Gomez', fechaNacimiento: '1990-01-01', direccion: 'Dir' },
        estado: 'AGENDADO',
        fechaSolicitud: '2026-06-10T10:30:00Z',
        prioridad: 1,
        tipo: 'CIRUGIA',
        detalle: 'Cirugia'
      },
      {
        id: 3,
        paciente: { rut: '87654321-0', nombres: 'Carlos', apellidos: 'Diaz', fechaNacimiento: '1990-01-01', direccion: 'Dir' },
        estado: 'ATENDIDO',
        fechaSolicitud: '2026-06-10T10:30:00Z',
        prioridad: 2,
        tipo: 'EMERGENCIA',
        detalle: 'Emergencia'
      }
    ];

    const propsWithMix = {
      ...defaultProps,
      atenciones: atencionesMixtas
    };

    render(<ListaEsperaContainer {...propsWithMix} />);
    
    const tableMock = vi.mocked(ListaEsperaTable);
    let lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    expect(lastCallProps.atenciones.length).toBe(3);

    // Filtrar por En Espera
    const enEsperaTab = screen.getByRole('button', { name: /En Espera \(1\)/i });
    await userEvent.click(enEsperaTab);

    lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    expect(lastCallProps.atenciones.length).toBe(1);
    expect(lastCallProps.atenciones[0].estado).toBe('EN_ESPERA');

    // Filtrar por Agendados
    const agendadosTab = screen.getByRole('button', { name: /Agendados \(1\)/i });
    await userEvent.click(agendadosTab);

    lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    expect(lastCallProps.atenciones.length).toBe(1);
    expect(lastCallProps.atenciones[0].estado).toBe('AGENDADO');

    // Filtrar por Atendidos/Cancelados
    const atendidosTab = screen.getByRole('button', { name: /Atendidos\/Cancelados \(1\)/i });
    await userEvent.click(atendidosTab);

    lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    expect(lastCallProps.atenciones.length).toBe(1);
    expect(lastCallProps.atenciones[0].estado).toBe('ATENDIDO');

    // Volver a Todos
    const todosTab = screen.getByRole('button', { name: /Todos \(3\)/i });
    await userEvent.click(todosTab);

    lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    expect(lastCallProps.atenciones.length).toBe(3);
  });
});
