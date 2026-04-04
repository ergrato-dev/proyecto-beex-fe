/**
 * Archivo: api/auth.ts
 * Descripción: Funciones para cada endpoint de autenticación de la API.
 * ¿Para qué? Encapsular todas las llamadas HTTP de auth en un solo módulo —
 *   los componentes no saben nada de URLs, headers ni axios.
 * ¿Impacto? Si cambia la API, solo hay que actualizar este archivo,
 *   no buscar llamadas axios dispersas en decenas de componentes.
 */

import { apiClient } from './axios';
import type {
  ApiResponse,
  AuthTokens,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from '@/types/auth';

// ¿Qué? Registrar un nuevo usuario en el sistema.
export async function register(data: RegisterRequest): Promise<User> {
  const res = await apiClient.post<ApiResponse<User>>('/auth/register', data);
  return res.data.data;
}

// ¿Qué? Iniciar sesión y obtener el par de tokens JWT.
export async function login(data: LoginRequest): Promise<AuthTokens> {
  const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data);
  return res.data.data;
}

// ¿Qué? Renovar el access token a partir de un refresh token válido.
export async function refreshToken(data: RefreshTokenRequest): Promise<AuthTokens> {
  const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', data);
  return res.data.data;
}

// ¿Qué? Cambiar la contraseña del usuario autenticado.
// ¿Para qué? Requiere el access token en el header (inyectado por el interceptor).
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.post('/auth/change-password', data);
}

// ¿Qué? Solicitar el email de recuperación de contraseña.
// ¿Para qué? Inicia el flujo de reset — el backend envía un enlace por email.
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await apiClient.post('/auth/forgot-password', data);
}

// ¿Qué? Restablecer la contraseña usando el token del email de recuperación.
export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await apiClient.post('/auth/reset-password', data);
}

// ¿Qué? Obtener el perfil del usuario actualmente autenticado.
export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>('/users/me');
  return res.data.data;
}
