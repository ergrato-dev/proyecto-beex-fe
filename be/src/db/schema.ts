/**
 * Archivo: db/schema.ts
 * Descripción: Definición de tablas de la base de datos usando Drizzle ORM.
 * ¿Para qué? Centralizar el esquema de BD con tipos TypeScript inferidos automáticamente.
 * ¿Impacto? Este archivo es la fuente de verdad: la BD y el código TypeScript siempre
 *   están sincronizados gracias a los tipos inferidos de Drizzle.
 */

import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ¿Qué? Tabla de usuarios del sistema.
// ¿Para qué? Almacenar las cuentas de usuario con contraseña hasheada.
// ¿Impacto? Tabla central del sistema — todos los flujos de auth dependen de ella.
export const users = pgTable('users', {
  id:              uuid('id').primaryKey().defaultRandom(),
  email:           varchar('email', { length: 255 }).notNull().unique(),
  fullName:        varchar('full_name', { length: 255 }).notNull(),
  hashedPassword:  varchar('hashed_password', { length: 255 }).notNull(),
  isActive:        boolean('is_active').notNull().default(true),
  // ¿Qué? Flag de verificación de email — false hasta que el usuario haga clic en el enlace.
  // ¿Para qué? Garantizar que el email registrado pertenece realmente al usuario (OWASP A07).
  // ¿Impacto? Login retorna 403 si is_email_verified es false.
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  // ¿Qué? Idioma preferido del usuario para la interfaz (i18n).
  // ¿Para qué? Persistir la preferencia de idioma para restaurarla en cualquier dispositivo.
  // ¿Impacto? El frontend lee este campo al iniciar sesión y aplica el idioma guardado.
  locale:          varchar('locale', { length: 10 }).notNull().default('es'),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
  updatedAt:       timestamp('updated_at').notNull().defaultNow(),
});

// ¿Qué? Tabla de tokens de recuperación de contraseña.
// ¿Para qué? Gestionar el flujo de forgot-password con tokens de un solo uso.
// ¿Impacto? Sin esta tabla, no hay recuperación de contraseña. Los tokens tienen
//   expiración y se marcan como usados para prevenir reutilización.
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:     varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used:      boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ¿Qué? Tabla de tokens de verificación de email.
// ¿Para qué? Gestionar el flujo de verify-email: token enviado por email, válido 24h, uso único.
// ¿Impacto? Sin esta tabla, los usuarios no pueden verificar su email y no pueden hacer login.
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:     varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used:      boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ¿Qué? Relaciones entre tablas para consultas con joins en Drizzle.
// ¿Para qué? Habilitar consultas relacionales type-safe.
export const usersRelations = relations(users, ({ many }) => ({
  passwordResetTokens:     many(passwordResetTokens),
  emailVerificationTokens: many(emailVerificationTokens),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationTokens.userId],
    references: [users.id],
  }),
}));

// ¿Qué? Tipos TypeScript inferidos del schema.
// ¿Para qué? Tener tipos precisos sin escribirlos manualmente — fuente única de verdad.
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
