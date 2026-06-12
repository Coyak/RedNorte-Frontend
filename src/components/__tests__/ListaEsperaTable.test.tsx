import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListaEsperaTable } from '../ListaEsperaTable';
import { AtencionBase } from '../../hooks/useListasEspera';

const mockAtenciones: AtencionBase[] = [
  {
    id: 1,
    paciente: {
      rut: '12345678-9',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez Soto',
      fechaNacimiento: '1985-05-12',
      direccion: 'Av. Libertador 123',
      telefono: '987654321',
      correo: 'juan.perez@example.com',
      prevision: 'FONASA'
    },
    estado: 'EN_ESPERA',
    fechaSolicitud: '2026-06-10T10:30:00Z',
    prioridad: 1,
    tipo: 'EMERGENCIA',
    detalle: 'Dolor torácico agudo'
  },
  {
    id: 2,
    paciente: {
      rut: '98765432-1',
      nombres: 'María Inés',
      apellidos: 'González Vera',
      fechaNacimiento: '1990-09-20',
      direccion: 'Pje. Central 456',
      prevision: 'ISAPRE'
    },
    estado: 'AGENDADO',
    fechaSolicitud: '2026-06-11T14:00:00Z',
    prioridad: 3,
    tipo: 'CONSULTA',
    detalle: 'Consulta Cardiología'
  },
  {
    id: 3,
    paciente: {
      rut: '11111111-1',
      nombres: 'Pedro',
      apellidos: 'Rojas',
      fechaNacimiento: '1970-01-01',
      direccion: 'Calle Falsa 123'
    },
    estado: 'EN_ESPERA',
    fechaSolicitud: '2026-06-12T09:00:00Z',
    prioridad: 4,
    tipo: 'CIRUGIA',
    detalle: 'Apendicectomía'
  },
  {
    id: 4,
    paciente: {
      rut: '22222222-2',
      nombres: 'Diego',
      apellidos: 'Torres',
      fechaNacimiento: '1995-10-10',
      direccion: 'Santiago'
    },
    estado: 'ATENDIDO',
    fechaSolicitud: '2026-06-12T09:00:00Z',
    prioridad: 2,
    tipo: 'CONSULTA',
    detalle: 'Control cardiología'
  },
  {
    id: 5,
    paciente: {
      rut: '33333333-3',
      nombres: 'Gabriela',
      apellidos: 'Mistral',
      fechaNacimiento: '1998-05-05',
      direccion: 'Vicuna'
    },
    estado: 'CANCELADO',
    fechaSolicitud: '2026-06-12T09:00:00Z',
    prioridad: 5,
    tipo: 'CONSULTA',
    detalle: 'Chequeo general'
  },
  {
    id: 6,
    paciente: {
      rut: '44444444-4',
      nombres: 'Alexis',
      apellidos: 'Sánchez',
      fechaNacimiento: '1989-12-19',
      direccion: 'Tocopilla'
    },
    estado: 'EN_ESPERA',
    fechaSolicitud: '2026-06-12T09:00:00Z',
    prioridad: 9,
    tipo: 'CONSULTA',
    detalle: 'Evaluación deportólogo'
  }
];

describe('ListaEsperaTable', () => {
  const defaultProps = {
    atenciones: mockAtenciones,
    buscando: false,
    error: null,
    onErrorClose: vi.fn(),
    onActualizarEstado: vi.fn(),
    onCancelarYReasignar: vi.fn(),
    onVerDetalle: vi.fn()
  };

  test('debe renderizar la tabla con atenciones y las tarjetas analíticas de resumen', () => {
    render(<ListaEsperaTable {...defaultProps} />);

    // Verificar tarjetas de resumen
    expect(screen.getByText('Lista de Espera')).toBeInTheDocument();
    expect(screen.getByText('Citas Agendadas')).toBeInTheDocument();
    expect(screen.getByText('Urgencias (G1)')).toBeInTheDocument();

    // Las cantidades estimadas de las tarjetas
    expect(screen.getAllByText('3').length).toBeGreaterThan(0); // total en espera: ID 1, ID 3 e ID 6
    expect(screen.getAllByText('1').length).toBeGreaterThan(0); // total agendado: ID 2 (también prioridad G1 es 1)

    // Verificar que los pacientes se listan en el DOM
    expect(screen.getByText('Juan Carlos')).toBeInTheDocument();
    expect(screen.getByText('Dolor torácico agudo')).toBeInTheDocument();
    expect(screen.getByText('María Inés')).toBeInTheDocument();
    expect(screen.getByText('Consulta Cardiología')).toBeInTheDocument();
    expect(screen.getByText('Pedro')).toBeInTheDocument();
    expect(screen.getByText('Apendicectomía')).toBeInTheDocument();
  });

  test('debe filtrar los datos en la tabla por término de búsqueda', async () => {
    render(<ListaEsperaTable {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Buscar por paciente, RUT o especialidad...');
    
    // Buscar por RUT específico
    await userEvent.type(searchInput, '98765432-1');

    expect(screen.queryByText('Juan Carlos')).not.toBeInTheDocument();
    expect(screen.getByText('María Inés')).toBeInTheDocument();

    // Limpiar búsqueda y buscar por detalle
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'Apendicectomía');

    expect(screen.queryByText('Juan Carlos')).not.toBeInTheDocument();
    expect(screen.getByText('Pedro')).toBeInTheDocument();
  });

  test('debe filtrar los datos por tipo de atención', () => {
    render(<ListaEsperaTable {...defaultProps} />);
    
    // Seleccionar "Consulta Médica"
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'CONSULTA' } });

    expect(screen.queryByText('Juan Carlos')).not.toBeInTheDocument(); // Emergencia
    expect(screen.getByText('María Inés')).toBeInTheDocument(); // Consulta
    expect(screen.queryByText('Pedro')).not.toBeInTheDocument(); // Cirugia
  });

  test('debe filtrar los datos por prioridad', () => {
    render(<ListaEsperaTable {...defaultProps} />);

    // Seleccionar prioridad 1
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '1' } });

    expect(screen.getByText('Juan Carlos')).toBeInTheDocument(); // Prioridad 1
    expect(screen.queryByText('María Inés')).not.toBeInTheDocument(); // Prioridad 3
  });

  test('debe llamar a onActualizarEstado al hacer clic en "Agendar"', async () => {
    render(<ListaEsperaTable {...defaultProps} />);

    // Para el registro en espera (Pedro), debe haber un botón de "Agendar"
    const agendarButton = screen.getAllByRole('button', { name: 'Agendar' })[0];
    await userEvent.click(agendarButton);

    expect(defaultProps.onActualizarEstado).toHaveBeenCalledWith(1, 'AGENDADO');
  });

  test('debe llamar a onCancelarYReasignar al hacer clic en "Reasignar"', async () => {
    render(<ListaEsperaTable {...defaultProps} />);

    // Para el registro agendado (María Inés), debe haber un botón de "Reasignar"
    const reasignarButton = screen.getByRole('button', { name: 'Reasignar' });
    await userEvent.click(reasignarButton);

    expect(defaultProps.onCancelarYReasignar).toHaveBeenCalledWith(2);
  });

  test('debe llamar a onVerDetalle al hacer clic en el botón de ver detalle', async () => {
    render(<ListaEsperaTable {...defaultProps} />);

    // Obtener los botones de detalle (tienen el icono Eye)
    const viewButtons = screen.getAllByTitle('Ver Ficha Clínica / Detalle');
    await userEvent.click(viewButtons[0]);

    expect(defaultProps.onVerDetalle).toHaveBeenCalledWith(mockAtenciones[0]);
  });

  test('debe mostrar la alerta de error y cerrarla', async () => {
    const propsWithError = {
      ...defaultProps,
      error: 'Hubo un error de red imprevisto'
    };

    render(<ListaEsperaTable {...propsWithError} />);

    expect(screen.getByText('Error de Operación:')).toBeInTheDocument();
    expect(screen.getByText('Hubo un error de red imprevisto')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'X' });
    await userEvent.click(closeButton);

    expect(defaultProps.onErrorClose).toHaveBeenCalled();
  });

  test('debe mostrar el mensaje de no registros cuando no coincide la búsqueda', async () => {
    render(<ListaEsperaTable {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Buscar por paciente, RUT o especialidad...');
    await userEvent.type(searchInput, 'RUTInexistente999');

    expect(screen.getByText('No se encontraron registros')).toBeInTheDocument();
  });
});
