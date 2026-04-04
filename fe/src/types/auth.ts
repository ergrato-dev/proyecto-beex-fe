/**
 * Archivo: types/auth.ts
 * Descripción: Tipos TypeScript para todo el dominio de autenticación.
 * ¿Para qué? Centralizar los tipos evita duplicación y garantiza consistencia
 *   entre la capa de API, el contexto y los componentes.
 * ¿Impacto? Si un tipo cambia aquí, TypeScript detecta inmediatamente
 *   todos los lugares que necesitan actualizarse.
 */

// ¿Qué? Datos del usuario autenticado (sin contraseña).
export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

// ¿Qué? Tokens devueltos al hacer login o refresh.
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'bearer';
}

// ¿Qué? Request body para el registro de un nuevo usuario.
export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
}

// ¿Qué? Request body para el login.
export interface LoginRequest {
  email: string;
  password: string;
}

// ¿Qué? Request body para renovar el access token.
export interface RefreshTokenRequest {
  refreshToken: string;
}

// ¿Qué? Request body para cambiar la contraseña (usuario autenticado).
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ¿Qué? Request body para solicitar el email de recuperación.
export interface ForgotPasswordRequest {
  email: string;
}

// ¿Qué? Request body para restablecer la contraseña con el token del email.
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ¿Qué? Estructura genérica de respuesta exitosa de la API.
export interface ApiResponse<T> {
  success: true;
  data: T;
}

// ¿Qué? Estructura genérica de respuesta de error de la API.
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}
