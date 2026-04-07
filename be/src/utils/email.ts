/**
 * Archivo: utils/email.ts
 * Descripción: Utilidades para el envío de correos electrónicos vía nodemailer.
 * ¿Para qué? Abstraer el envío de emails en funciones reutilizables y testeables.
 * ¿Impacto? Si falla, los flujos de verificación de email y recuperación de contraseña
 *   quedan inutilizables — el usuario no puede activar su cuenta ni recuperar acceso.
 */

import nodemailer from 'nodemailer';
import { config } from '../config.js';

// ¿Qué? Crea el transporter de nodemailer con la configuración SMTP del entorno.
// ¿Para qué? Reutilizar una sola instancia de conexión SMTP en todo el servidor.
// ¿Impacto? En desarrollo apunta a Mailpit (:1025); en producción debe ser un SMTP real.
const transporter = nodemailer.createTransport({
  host: config.MAIL_HOST,
  port: config.MAIL_PORT,
  // ¿Qué? secure:false es correcto para Mailpit (STARTTLS) y muchos providers en port 587.
  secure: false,
  // ¿Para qué? No usar TLS en desarrollo facilita el testeo local con Mailpit.
  ignoreTLS: config.NODE_ENV === 'development',
});

// ¿Qué? Envía el email de recuperación de contraseña.
// ¿Para qué? Entregar al usuario un enlace con token temporal para restablecer su contraseña.
// ¿Impacto? El enlace expira en 1 hora — si no se envía, el usuario queda bloqueado.
export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string,
): Promise<void> {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: config.MAIL_FROM,
    to: toEmail,
    subject: 'NN Auth System — Recuperación de contraseña',
    // ¿Qué? Se envía tanto texto plano como HTML para máxima compatibilidad.
    text: `Haz clic en el siguiente enlace para restablecer tu contraseña:\n\n${resetUrl}\n\nEste enlace expira en 1 hora.\nSi no solicitaste este cambio, ignora este mensaje.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el botón para restablecer tu contraseña:</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#2563eb;
                  color:#fff;text-decoration:none;border-radius:6px;">
          Restablecer contraseña
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:14px;">
          Este enlace expira en <strong>1 hora</strong>.<br>
          Si no solicitaste este cambio, ignora este mensaje.
        </p>
      </div>
    `,
  });
}

// ¿Qué? Envía el email de verificación de cuenta al usuario recién registrado.
// ¿Para qué? Confirmar que el usuario es el propietario real del email antes de
//   permitirle iniciar sesión — requisito de seguridad fundamental (RF-003).
// ¿Impacto? Sin verificación de email, cualquiera puede registrarse con el email de
//   otra persona y acceder en su nombre. El enlace expira en 24 horas.
export async function sendVerificationEmail(
  toEmail: string,
  verificationToken: string,
): Promise<void> {
  const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  await transporter.sendMail({
    from: config.MAIL_FROM,
    to: toEmail,
    subject: 'NN Auth System — Verifica tu cuenta',
    // ¿Qué? Se envía tanto texto plano como HTML para máxima compatibilidad.
    text: `Haz clic en el siguiente enlace para verificar tu cuenta:\n\n${verificationUrl}\n\nEste enlace expira en 24 horas.\nSi no creaste esta cuenta, ignora este mensaje.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verifica tu cuenta</h2>
        <p>Gracias por registrarte. Haz clic en el botón para activar tu cuenta:</p>
        <a href="${verificationUrl}"
           style="display:inline-block;padding:12px 24px;background:#16a34a;
                  color:#fff;text-decoration:none;border-radius:6px;">
          Verificar cuenta
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:14px;">
          Este enlace expira en <strong>24 horas</strong>.<br>
          Si no creaste esta cuenta, ignora este mensaje.
        </p>
      </div>
    `,
  });
}
