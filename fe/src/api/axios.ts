/**
 * Archivo: api/axios.ts
 * Descripción: Instancia de Axios configurada para la API del backend.
 * ¿Para qué? Centralizar la configuración HTTP: baseURL, headers, y el interceptor
 *   que inyecta automáticamente el JWT en cada request autenticado.
 * ¿Impacto? Si se usa axios directamente en los componentes, cada uno tendría
 *   que gestionar el token manualmente — este módulo lo hace una sola vez.
 */

import axios from 'axios';

// ¿Qué? URL base de la API leída desde variables de entorno de Vite.
// ¿Para qué? Permite cambiar la URL del backend sin modificar código (dev vs prod).
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ¿Qué? Instancia de Axios con configuración base del proyecto.
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ¿Qué? Interceptor de request que inyecta el Bearer token en cada llamada.
// ¿Para qué? Las rutas protegidas del backend requieren el header Authorization.
// ¿Impacto? Sin este interceptor habría que añadir el header manualmente en
//   cada llamada a endpoints protegidos — propenso a errores y código repetido.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
