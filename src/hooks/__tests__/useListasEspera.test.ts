import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useListasEsperaState as useListasEspera, mapAtencion } from '../useListasEspera';
import api from '../../services/api';

// Mock del servicio API Axios
vi.mock('../../services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn()
    }
  };
});

describe('useListasEspera Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('debe inicializarse con estados vacíos si no hay token', () => {
    const { result } = renderHook(() => useListasEspera());

    expect(result.current.token).toBeNull();
    expect(result.current.userRole).toBeNull();
    expect(result.current.username).toBeNull();
    expect(result.current.userRut).toBeNull();
    expect(result.current.pacientes).toEqual([]);
    expect(result.current.atenciones).toEqual([]);
    expect(result.current.reasignaciones).toEqual([]);
  });

  test('debe iniciar sesión correctamente (login)', async () => {
    const mockLoginResponse = {
      data: {
        token: 'fake-jwt-token',
        role: 'ROLE_MEDICO',
        username: 'drhouse'
      }
    };
    vi.mocked(api.post).mockResolvedValueOnce(mockLoginResponse);

    const { result } = renderHook(() => useListasEspera());

    let loginRes;
    await act(async () => {
      loginRes = await result.current.login('drhouse', 'password123');
    });

    expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', { username: 'drhouse', password: 'password123' });
    expect(loginRes).toEqual(mockLoginResponse.data);
    expect(result.current.token).toBe('fake-jwt-token');
    expect(result.current.userRole).toBe('ROLE_MEDICO');
    expect(result.current.username).toBe('drhouse');
    expect(result.current.userRut).toBe(''); // No es paciente, queda vacío
    expect(localStorage.getItem('rednorte_jwt_token')).toBe('fake-jwt-token');
  });

  test('debe fallar al iniciar sesión con credenciales inválidas', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Usuario o contraseña incorrectos'
        }
      }
    };
    vi.mocked(api.post).mockRejectedValueOnce(errorResponse);

    const { result } = renderHook(() => useListasEspera());

    await act(async () => {
      await expect(result.current.login('drhouse', 'bad-pass')).rejects.toThrow('Usuario o contraseña incorrectos');
    });

    expect(result.current.error).toBe('Usuario o contraseña incorrectos');
    expect(result.current.token).toBeNull();
  });

  test('debe cerrar sesión correctamente (logout)', () => {
    localStorage.setItem('rednorte_jwt_token', 'token-123');
    localStorage.setItem('rednorte_user_role', 'ROLE_PACIENTE');
    localStorage.setItem('rednorte_username', 'paciente_test');

    const { result } = renderHook(() => useListasEspera());

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.userRole).toBeNull();
    expect(result.current.username).toBeNull();
    expect(localStorage.getItem('rednorte_jwt_token')).toBeNull();
  });

  test('debe sincronizar pacientes, atenciones y reasignaciones (refreshData)', async () => {
    localStorage.setItem('rednorte_jwt_token', 'valid-token');
    
    const mockPacientes = [{ rut: '12345678-9', nombres: 'Juan', apellidos: 'Perez' }];
    const mockPerfil = { rut: '12345678-9', prevision: 'FONASA', correo: 'juan@example.com' };
    const mockAtencionesRaw = [
      { id: 1, paciente: mockPacientes[0], estado: 'EN_ESPERA', tipo: 'CONSULTA', detalle: 'Cardiologia', prioridad: 2 }
    ];
    const mockReasignaciones = [{ id: 100, estado: 'EXITOSA', observaciones: 'Reasignado' }];

    vi.mocked(api.get).mockImplementation((url) => {
      if (url === '/api/listas-espera/pacientes') {
        return Promise.resolve({ data: mockPacientes });
      }
      if (url.startsWith('/api/portal-paciente/perfil/')) {
        return Promise.resolve({ data: mockPerfil });
      }
      if (url === '/api/listas-espera/atenciones') {
        return Promise.resolve({ data: mockAtencionesRaw });
      }
      if (url === '/api/reasignacion/historial') {
        return Promise.resolve({ data: mockReasignaciones });
      }
      return Promise.reject(new Error('Unknown URL: ' + url));
    });

    const { result } = renderHook(() => useListasEspera());

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.pacientes).toHaveLength(1);
    expect(result.current.pacientes[0].correo).toBe('juan@example.com');
    expect(result.current.atenciones).toHaveLength(1);
    expect(result.current.atenciones[0].detalle).toBe('Cardiologia');
    expect(result.current.reasignaciones).toEqual(mockReasignaciones);
  });

  test('debe registrar un nuevo paciente y su perfil en el portal', async () => {
    const nuevoPaciente = {
      rut: '12345678-9',
      nombres: 'Juan',
      apellidos: 'Perez',
      fechaNacimiento: '1990-01-01',
      direccion: 'Santiago',
      prevision: 'FONASA' as const
    };

    vi.mocked(api.post).mockImplementation((url) => {
      if (url === '/api/listas-espera/pacientes') {
        return Promise.resolve({ data: { id: 1 } });
      }
      if (url === '/api/portal-paciente/perfil') {
        return Promise.resolve({ data: { id: 10, ...nuevoPaciente } });
      }
      return Promise.reject(new Error('Unknown URL: ' + url));
    });
    
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useListasEspera());

    let res: any;
    await act(async () => {
      res = await result.current.registrarPaciente(nuevoPaciente);
    });

    expect(api.post).toHaveBeenCalledWith('/api/listas-espera/pacientes', {
      rut: nuevoPaciente.rut,
      nombres: nuevoPaciente.nombres,
      apellidos: nuevoPaciente.apellidos,
      fechaNacimiento: nuevoPaciente.fechaNacimiento,
      direccion: nuevoPaciente.direccion
    });
    expect(api.post).toHaveBeenCalledWith('/api/portal-paciente/perfil', nuevoPaciente);
    expect(res).toEqual({ id: 10, ...nuevoPaciente });
  });

  test('debe registrar una nueva atencion en listas de espera', async () => {
    const mockAtencion = {
      id: 5,
      paciente: { rut: '123' },
      estado: 'EN_ESPERA',
      fechaSolicitud: '2026-06-12',
      prioridad: 3,
      tipo: 'CONSULTA',
      detalle: 'Pediatría'
    };

    vi.mocked(api.post).mockResolvedValueOnce({ data: mockAtencion });
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useListasEspera());

    let res: any;
    await act(async () => {
      res = await result.current.registrarAtencion('123', 'CONSULTA', 3, 'Pediatría');
    });

    expect(api.post).toHaveBeenCalledWith('/api/listas-espera/atenciones', {
      rutPaciente: '123',
      tipo: 'CONSULTA',
      prioridad: 3,
      detalle: 'Pediatría'
    });
    expect(res.detalle).toBe('Pediatría');
    expect(res.tipo).toBe('CONSULTA');
  });

  test('debe actualizar el estado de una atencion', async () => {
    const mockAtencion = {
      id: 8,
      paciente: { rut: '123' },
      estado: 'AGENDADO',
      tipo: 'CONSULTA',
      detalle: 'Oftalmología'
    };

    vi.mocked(api.put).mockResolvedValueOnce({ data: mockAtencion });
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useListasEspera());

    let res: any;
    await act(async () => {
      res = await result.current.actualizarEstadoAtencion(8, 'AGENDADO');
    });

    expect(api.put).toHaveBeenCalledWith('/api/listas-espera/atenciones/8/estado?nuevoEstado=AGENDADO');
    expect(res.estado).toBe('AGENDADO');
  });

  test('debe cancelar una cita y activar la reasignacion automatica', async () => {
    const mockReasignacionResult = {
      id: 50,
      estado: 'EXITOSA',
      observaciones: 'Cita reasignada'
    };

    vi.mocked(api.post).mockResolvedValueOnce({ data: mockReasignacionResult });
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useListasEspera());

    let res: any;
    await act(async () => {
      res = await result.current.cancelarYReasignar(20);
    });

    expect(api.post).toHaveBeenCalledWith('/api/reasignacion/procesar/20');
    expect(res).toEqual(mockReasignacionResult);
  });

  test('debe filtrar y ordenar localmente la lista de espera', async () => {
    const pacientesMock = { rut: '123', nombres: 'A', apellidos: 'B', fechaNacimiento: '1990' };
    
    // Let's call the mapper and test sorting on custom array
    const dummyAtenciones = [
      { id: 1, paciente: pacientesMock, estado: 'EN_ESPERA' as const, fechaSolicitud: '2026-06-12T10:00:00Z', prioridad: 3, tipo: 'CONSULTA' as const, detalle: 'A' },
      { id: 2, paciente: pacientesMock, estado: 'EN_ESPERA' as const, fechaSolicitud: '2026-06-12T09:00:00Z', prioridad: 3, tipo: 'CONSULTA' as const, detalle: 'B' },
      { id: 3, paciente: pacientesMock, estado: 'EN_ESPERA' as const, fechaSolicitud: '2026-06-12T10:00:00Z', prioridad: 1, tipo: 'CONSULTA' as const, detalle: 'C' },
      { id: 4, paciente: pacientesMock, estado: 'AGENDADO' as const, fechaSolicitud: '2026-06-12T10:00:00Z', prioridad: 2, tipo: 'CONSULTA' as const, detalle: 'D' }
    ];

    // Seteamos directamente el estado atenciones simulando la carga
    // Para testear obtenerListaEspera() podemos mockear el retorno de fetchAtenciones o setear state
    // Pero como no tenemos un setAtenciones expuesto, mockeamos la respuesta de api.get para atenciones
    // y corremos refreshData para poblar el hook
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === '/api/listas-espera/atenciones') {
        return Promise.resolve({ data: dummyAtenciones });
      }
      return Promise.resolve({ data: [] });
    });

    // Simular token para que refreshData pase
    localStorage.setItem('rednorte_jwt_token', 'valid');
    const { result: hookWithData } = renderHook(() => useListasEspera());

    // Esperar a que cargue
    await waitFor(() => {
      expect(hookWithData.current.atenciones).toHaveLength(4);
    });

    const lista = hookWithData.current.obtenerListaEspera();
    
    // Debe haber 3 atenciones (ID 1, 2, 3) porque la 4 está AGENDADO
    expect(lista).toHaveLength(3);
    // Debe estar ordenado primero por prioridad (1 antes que 3) -> ID 3 es el primero
    expect(lista[0].id).toBe(3);
    // Luego por fecha de solicitud ascendente (ID 2 es a las 09:00, ID 1 a las 10:00) -> ID 2 va antes que ID 1
    expect(lista[1].id).toBe(2);
    expect(lista[2].id).toBe(1);
  });

  test('debe obtener citas del paciente (obtenerCitasPaciente) y mapearlas', async () => {
    const rawCitas = [
      { id: 1, paciente: { rut: '123' }, estado: 'AGENDADO', tipo: 'CONSULTA', detalle: 'Pediatría' }
    ];
    vi.mocked(api.get).mockResolvedValueOnce({ data: rawCitas });

    const { result } = renderHook(() => useListasEspera());

    let res: any;
    await act(async () => {
      res = await result.current.obtenerCitasPaciente('123');
    });

    expect(api.get).toHaveBeenCalledWith('/api/portal-paciente/perfil/123/citas');
    expect(res.isFallback).toBe(false);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].id).toBe(1);
  });

  test('debe manejar fallback en obtenerCitasPaciente si el BFF retorna mensaje de contingencia', async () => {
    const fallbackResponse = [{ mensaje: 'Base de datos temporal activa' }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: fallbackResponse });

    const { result } = renderHook(() => useListasEspera());

    let res: any;
    await act(async () => {
      res = await result.current.obtenerCitasPaciente('123');
    });

    expect(res.isFallback).toBe(true);
    expect(res.mensaje).toBe('Base de datos temporal activa');
  });

  test('debe obtener el perfil del paciente (obtenerPerfilPaciente)', async () => {
    const perfilMock = { rut: '123', nombres: 'Juan' };
    vi.mocked(api.get).mockResolvedValueOnce({ data: perfilMock });

    const { result } = renderHook(() => useListasEspera());

    let res: any;
    await act(async () => {
      res = await result.current.obtenerPerfilPaciente('123');
    });

    expect(api.get).toHaveBeenCalledWith('/api/portal-paciente/perfil/123');
    expect(res).toEqual(perfilMock);
  });

  test('debe resetear los datos del sistema (resetearDatos)', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    localStorage.setItem('rednorte_jwt_token', 'valid');

    const { result } = renderHook(() => useListasEspera());

    await act(async () => {
      await result.current.resetearDatos();
    });

    expect(api.get).toHaveBeenCalled();
  });

  test('debe mapear correctamente atenciones de tipo CIRUGIA, CONSULTA y EMERGENCIA con campos alternativos', () => {
    const pacientesMock = { rut: '1' };

    // 1. Tipo cirugia
    const cirugiaRaw = { id: 10, tipoCirugia: 'Apendicectomía', prioridad: 2, paciente: pacientesMock };
    const cirugiaMapped = mapAtencion(cirugiaRaw);
    expect(cirugiaMapped.tipo).toBe('CIRUGIA');
    expect(cirugiaMapped.detalle).toBe('Apendicectomía');

    // 2. Tipo consulta
    const consultaRaw = { id: 20, especialidad: 'Pediatría', paciente: pacientesMock };
    const consultaMapped = mapAtencion(consultaRaw);
    expect(consultaMapped.tipo).toBe('CONSULTA');
    expect(consultaMapped.detalle).toBe('Pediatría');

    // 3. Tipo emergencia
    const emergenciaRaw = { id: 30, motivoEmergencia: 'Fiebre', paciente: pacientesMock };
    const emergenciaMapped = mapAtencion(emergenciaRaw);
    expect(emergenciaMapped.tipo).toBe('EMERGENCIA');
    expect(emergenciaMapped.detalle).toBe('Fiebre');

    // 4. Paciente vacío
    const vacioRaw = { id: 40 };
    const vacioMapped = mapAtencion(vacioRaw);
    expect(vacioMapped.paciente.rut).toBe('');
    expect(vacioMapped.prioridad).toBe(3); // default
  });

  test('debe iniciar sesión correctamente con rol de paciente', async () => {
    const mockLoginResponse = {
      data: {
        token: 'fake-jwt-token-paciente',
        role: 'ROLE_PACIENTE',
        username: 'juan_perez'
      }
    };
    vi.mocked(api.post).mockResolvedValueOnce(mockLoginResponse);

    const { result } = renderHook(() => useListasEspera());

    await act(async () => {
      await result.current.login('juan_perez', 'password123');
    });

    expect(result.current.userRole).toBe('ROLE_PACIENTE');
    expect(result.current.userRut).toBe('12345678-9');
  });

  test('debe manejar error de login sin respuesta del servidor', async () => {
    const errorNoResponse = new Error('Network Error');
    vi.mocked(api.post).mockRejectedValueOnce(errorNoResponse);

    const { result } = renderHook(() => useListasEspera());

    await act(async () => {
      await expect(result.current.login('drhouse', 'password123')).rejects.toThrow('Network Error');
    });

    expect(result.current.error).toBe('Network Error');
  });

  test('debe manejar error de login completamente vacío', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({});

    const { result } = renderHook(() => useListasEspera());

    await act(async () => {
      await expect(result.current.login('drhouse', 'password123')).rejects.toThrow('Credenciales inválidas');
    });

    expect(result.current.error).toBe('Credenciales inválidas');
  });

  test('debe registrar fallback de previsión si falla la carga del perfil del portal', async () => {
    localStorage.setItem('rednorte_jwt_token', 'valid-token');
    
    const mockPacientes = [
      { rut: '1', nombres: 'Juan', apellidos: 'Perez', prevision: 'ISAPRE' },
      { rut: '2', nombres: 'Pedro', apellidos: 'Rojas' }
    ];

    vi.mocked(api.get).mockImplementation((url) => {
      if (url === '/api/listas-espera/pacientes') {
        return Promise.resolve({ data: mockPacientes });
      }
      if (url.startsWith('/api/portal-paciente/perfil/')) {
        return Promise.reject(new Error('Profile Service Down'));
      }
      return Promise.resolve({ data: [] });
    });

    const { result } = renderHook(() => useListasEspera());

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.pacientes).toHaveLength(2);
    expect(result.current.pacientes[0].prevision).toBe('ISAPRE');
    expect(result.current.pacientes[1].prevision).toBe('FONASA');
  });

  test('debe manejar errores en registrarPaciente', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Post Error'));
    const { result } = renderHook(() => useListasEspera());
    await act(async () => {
      await expect(result.current.registrarPaciente({ rut: '1' } as any)).rejects.toThrow('Post Error');
    });
    expect(result.current.error).toBe('Post Error');
  });

  test('debe manejar errores en registrarAtencion', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Post Error'));
    const { result } = renderHook(() => useListasEspera());
    await act(async () => {
      await expect(result.current.registrarAtencion('1', 'CONSULTA', 3, 'detalle')).rejects.toThrow('Post Error');
    });
    expect(result.current.error).toBe('Post Error');
  });

  test('debe manejar errores en actualizarEstadoAtencion', async () => {
    vi.mocked(api.put).mockRejectedValueOnce(new Error('Put Error'));
    const { result } = renderHook(() => useListasEspera());
    await act(async () => {
      await expect(result.current.actualizarEstadoAtencion(1, 'AGENDADO')).rejects.toThrow('Put Error');
    });
    expect(result.current.error).toBe('Put Error');
  });

  test('debe manejar errores en cancelarYReasignar con respuesta estructurada y genérica', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({ response: { data: { message: 'Cola llena' } } });
    const { result } = renderHook(() => useListasEspera());
    await act(async () => {
      await expect(result.current.cancelarYReasignar(1)).rejects.toThrow('Cola llena');
    });
    expect(result.current.error).toBe('Cola llena');

    vi.mocked(api.post).mockRejectedValueOnce({});
    await act(async () => {
      await expect(result.current.cancelarYReasignar(1)).rejects.toThrow('Error en reasignación automática');
    });
    expect(result.current.error).toBe('Error en reasignación automática');
  });

  test('debe propagar errores en obtenerCitasPaciente', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('503 Service Unavailable'));
    const { result } = renderHook(() => useListasEspera());
    await act(async () => {
      await expect(result.current.obtenerCitasPaciente('123')).rejects.toThrow('503 Service Unavailable');
    });
  });
});
