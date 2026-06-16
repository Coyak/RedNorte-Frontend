import { describe, test, expect, beforeEach, vi } from 'vitest';
import api from '../api';

describe('api service interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('debe agregar el token Authorization si está en localStorage', async () => {
    localStorage.setItem('rednorte_jwt_token', 'my-mock-token');

    // Forzar la ejecución del request interceptor
    const config: any = { headers: {} };
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBe('Bearer my-mock-token');
  });

  test('no debe agregar el token Authorization si no está en localStorage', async () => {
    const config: any = { headers: {} };
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  test('debe limpiar localStorage en caso de error 401', async () => {
    localStorage.setItem('rednorte_jwt_token', 'token');
    localStorage.setItem('rednorte_user_role', 'role');
    localStorage.setItem('rednorte_username', 'user');
    localStorage.setItem('rednorte_rut', 'rut');

    const error = {
      response: {
        status: 401
      }
    };

    // Forzar la ejecución del response interceptor error handler
    const responseInterceptorErr = (api.interceptors.response as any).handlers[0].rejected;
    
    await expect(responseInterceptorErr(error)).rejects.toEqual(error);

    expect(localStorage.getItem('rednorte_jwt_token')).toBeNull();
    expect(localStorage.getItem('rednorte_user_role')).toBeNull();
    expect(localStorage.getItem('rednorte_username')).toBeNull();
    expect(localStorage.getItem('rednorte_rut')).toBeNull();
  });

  test('no debe limpiar localStorage si el error no es 401', async () => {
    localStorage.setItem('rednorte_jwt_token', 'token');
    
    const error = {
      response: {
        status: 500
      }
    };

    const responseInterceptorErr = (api.interceptors.response as any).handlers[0].rejected;
    
    await expect(responseInterceptorErr(error)).rejects.toEqual(error);

    expect(localStorage.getItem('rednorte_jwt_token')).toBe('token');
  });

  test('debe rechazar el error en el request interceptor', async () => {
    const requestInterceptorErr = (api.interceptors.request as any).handlers[0].rejected;
    const error = new Error('request error');
    await expect(requestInterceptorErr(error)).rejects.toThrow('request error');
  });

  test('debe retornar el response sin modificar en el response interceptor', () => {
    const responseInterceptor = (api.interceptors.response as any).handlers[0].fulfilled;
    const mockResponse = { data: 'ok' };
    const result = responseInterceptor(mockResponse);
    expect(result).toBe(mockResponse);
  });

  test('no debe fallar ni limpiar si el error no tiene response', async () => {
    const error = {
      message: 'Network Error'
    };

    const responseInterceptorErr = (api.interceptors.response as any).handlers[0].rejected;
    await expect(responseInterceptorErr(error)).rejects.toEqual(error);
  });
});
