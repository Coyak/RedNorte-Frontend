import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    
    // Obtener las props del componente mock
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
    
    // Invocamos el callback directamente para poder capturar el rechazo en el test
    await act(async () => {
      await expect(lastCallProps.onActualizarEstado(3, 'AGENDADO')).rejects.toThrow(errorMsg);
    });

    // Debe mostrar la alerta de error con el mensaje
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
    
    // Verificamos que el error se muestra
    expect(await screen.findByTestId('error-msg')).toBeInTheDocument();

    // Recuperamos las props nuevamente ya que el estado cambió y el componente se re-renderizó
    lastCallProps = tableMock.mock.calls[tableMock.mock.calls.length - 1][0];
    
    // Ejecutamos la acción de cerrar error
    act(() => {
      lastCallProps.onErrorClose();
    });

    // Verificamos que ya no se muestra el error
    expect(screen.queryByTestId('error-msg')).not.toBeInTheDocument();
  });

  test('debe capturar error sin mensaje y mostrar fallback genérico al fallar onActualizarEstado', async () => {
    const failedProps = {
      ...defaultProps,
      onActualizarEstado: vi.fn(() => Promise.reject({})) // Sin e.message
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
      onCancelarYReasignar: vi.fn(() => Promise.reject({})) // Sin e.message
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
});

// Helper simple para soportar act de React en pruebas unitarias de callbacks directos
import { act } from '@testing-library/react';
