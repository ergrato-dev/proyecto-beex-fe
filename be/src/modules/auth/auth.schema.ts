/**
 * Archivo: modules/auth/auth.schema.ts
 * Descripción: Schemas de validación zod para todos los endpoints de autenticación.
 * ¿Para qué? Centralizar las reglas de validación y los tipos inferidos de los requests.
 * ¿Impacto? Si la validación es laxa, datos malformados llegan al service y a la BD.
 */

import { z } from 'zod';

// ¿Qué? Regex que verifica la fortaleza mínima de una contraseña.
// ¿Para qué? Cumplir el RNF de contraseñas: ≥8 chars, 1 mayúscula, 1 minúscula, 1 número.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PASSWORD_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.';

// --- Schema de registro ---
export const registerSchema = z.object({
  email: z.string().email('El email no tiene un formato válido.').toLowerCase().trim(),
  fullName: z
    .string()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres.')
    .max(255)
    .trim(),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// --- Schema de login ---
export const loginSchema = z.object({
  email: z.string().email('El email no tiene un formato válido.').toLowerCase().trim(),
  password: z.string().min(1, 'La contraseña es requerida.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// --- Schema de refresh token ---
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'El refresh token es requerido.'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// --- Schema de cambio de contraseña ---
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida.'),
    newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña no puede ser igual a la actual.',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// --- Schema de solicitud de recuperación de contraseña ---
export const forgotPasswordSchema = z.object({
  email: z.string().email('El email no tiene un formato válido.').toLowerCase().trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// --- Schema de restablecimiento de contraseña ---
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido.'),
  newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// --- Schema de verificación de email ---
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'El token de verificación es requerido.'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// --- Schema de actualización de idioma (locale) ---
// ¿Qué? Solo admite 'es' y 'en' — los dos idiomas soportados por el sistema.
// ¿Para qué? Rechazar en el servidor cualquier valor de locale no soportado.
// ¿Impacto? Evita almacenar locales inválidos que romperían la lógica de i18n en el FE.
export const updateLocaleSchema = z.object({
  locale: z.enum(['es', 'en'], {
    errorMap: () => ({ message: "El idioma debe ser 'es' o 'en'." }),
  }),
});

export type UpdateLocaleInput = z.infer<typeof updateLocaleSchema>;
