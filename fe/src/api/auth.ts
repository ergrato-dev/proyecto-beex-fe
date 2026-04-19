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
  VerifyEmailRequest,
  UpdateLocaleRequest,
  User,
} from '@/types/auth';

// ¿Qué? Registrar un nuevo usuario en el sistema.
// ¿Para qué? Crea la cuenta con los datos validados por el backend (zod) y devuelve el User creado.
// ¿Impacto? Si el email ya existe el backend responde 409 Conflict — el contexto de auth
//   captura el error y lo muestra al usuario como feedback.
export async function register(data: RegisterRequest): Promise<User> {
  const res = await apiClient.post<ApiResponse<User>>('/auth/register', data);
  return res.data.data;
}

// ¿Qué? Iniciar sesión y obtener el par de tokens JWT.
// ¿Para qué? Autenticar al usuario y recibir los tokens que permiten
//   llamar a los endpoints protegidos (Authorization: Bearer <accessToken>).
// ¿Impacto? Los tokens se guardan en localStorage desde el AuthContext;
//   este módulo solo se ocupa del transporte HTTP, no del almacenamiento.
export async function login(data: LoginRequest): Promise<AuthTokens> {
  const res = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data);
  return res.data.data;
}

// ¿Qué? Renovar el access token a partir de un refresh token válido.
// ¿Para qué? El access token dura solo 15 min para limitar la ventana de ataque;
//   el refresh token (7 días) permite renovarlo sin que el usuario inicie sesión de nuevo.
// ¿Impacto? Si el refresh también expiró, el interceptor de axios cierra la sesión automáticamente.
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
// ¿Para qué? Permite al usuario crear una nueva contraseña sin conocer la anterior,
//   usando como autorización el token de un solo uso enviado por email.
// ¿Impacto? Si el token ya fue usado o expiró, el backend responde 400/401.
export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await apiClient.post('/auth/reset-password', data);
}

// ¿Qué? Obtener el perfil del usuario actualmente autenticado.
// ¿Para qué? Restaurar la sesión al recargar la página — si hay un accessToken en
//   localStorage, el AuthProvider llama a getMe() para saber si sigue siendo válido.
// ¿Impacto? Si falla (token expirado o inválido), el AuthProvider limpia la sesión
//   y el usuario es redirigido al login.
export async function getMe(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>('/users/me');
  return res.data.data;
}

// ¿Qué? Verificar el email usando el token del enlace de activación.
// ¿Para qué? Activar la cuenta del usuario para que pueda iniciar sesión (RF-003).
export async function verifyEmail(data: VerifyEmailRequest): Promise<void> {
  await apiClient.post('/auth/verify-email', data);
}

// ¿Qué? Actualizar el idioma preferido del usuario en la BD.
// ¿Para qué? Persistir la preferencia de locale para sincronización multi-dispositivo.
export async function updateLocale(data: UpdateLocaleRequest): Promise<User> {
  const res = await apiClient.patch<ApiResponse<User>>('/users/me/locale', data);
  return res.data.data;
}
