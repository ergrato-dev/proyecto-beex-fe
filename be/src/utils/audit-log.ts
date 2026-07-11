/**
 * Archivo: utils/audit-log.ts
 * Descripción: Módulo de auditoría de seguridad para registrar eventos críticos del sistema.
 * ¿Para qué? Cumplir el RNF-001.8 y OWASP A09 (Security Logging and Monitoring Failures).
 *   Un sistema sin logs de seguridad no puede detectar ni responder a incidentes.
 * ¿Impacto? Permite rastrear actividad sospechosa: intentos de login fallidos,
 *   cambios de contraseña, hits de rate limiting — esencial para auditorías y forense.
 */

// ¿Qué? Tipo de los nombres de eventos de auditoría admitidos.
// ¿Para qué? Garantizar que solo se registren eventos predefinidos — evitar typos y
//   facilitar búsquedas en logs en producción.
type AuditEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'EMAIL_VERIFIED'
  | 'RATE_LIMIT_HIT';

// ¿Qué? Estructura de un registro de auditoría.
// ¿Para qué? Normalizar el formato de todos los logs para facilitar su procesamiento
//   con herramientas externas (Splunk, Datadog, CloudWatch, etc.).
interface AuditLogEntry {
  timestamp: string;
  event: AuditEvent;
  userId?: string;
  ip?: string;
  endpoint?: string;
  reason?: string;
}

// ¿Qué? Función interna que serializa y emite el registro de auditoría.
// ¿Para qué? Centralizar la lógica de emisión — si en el futuro se migra a un
//   servicio externo (Datadog, Sentry), solo cambia esta función.
// ¿Impacto? Usa console.warn para diferenciarlo de logs de debug (console.log)
//   y errores de aplicación (console.error).
function writeAuditLog(entry: AuditLogEntry): void {
  console.warn('[AUDIT]', JSON.stringify(entry));
}

// ¿Qué? Registra un inicio de sesión exitoso.
// ¿Para qué? Detectar patrones anómalos (login desde IPs inusuales, horarios atípicos).
// ¿Impacto? Nunca registra la contraseña — solo userId e IP de origen.
export function logLoginSuccess(userId: string, ip: string): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'LOGIN_SUCCESS',
    userId,
    ip,
  });
}

// ¿Qué? Registra un intento de login fallido.
// ¿Para qué? Detectar ataques de fuerza bruta: múltiples fallos en poco tiempo.
// ¿Impacto? El campo reason es genérico — nunca revela si fue "email no encontrado"
//   o "contraseña incorrecta" para evitar user enumeration en los logs.
export function logLoginFailed(reason: string, ip?: string): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'LOGIN_FAILED',
    reason,
    ip,
  });
}

// ¿Qué? Registra un cambio de contraseña exitoso.
// ¿Para qué? Alertar al usuario o al equipo de seguridad si el cambio fue inesperado.
// ¿Impacto? Traza quién cambió su contraseña y cuándo — útil en investigaciones.
export function logPasswordChanged(userId: string): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'PASSWORD_CHANGED',
    userId,
  });
}

// ¿Qué? Registra que se solicitó un reset de contraseña.
// ¿Para qué? Detectar abuso del endpoint forgot-password (envío masivo de emails).
// ¿Impacto? No registra el email concreto para no facilitar enumeración de usuarios
//   en caso de filtración de logs.
export function logPasswordResetRequested(): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'PASSWORD_RESET_REQUESTED',
  });
}

// ¿Qué? Registra que un usuario verificó su email correctamente.
// ¿Para qué? Confirmar que el token de verificación fue consumido y la cuenta activada.
// ¿Impacto? Permite detectar si un token fue usado múltiples veces (indica ataque).
export function logEmailVerified(userId: string): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'EMAIL_VERIFIED',
    userId,
  });
}

// ¿Qué? Registra cuando un cliente alcanza el límite de tasa de un endpoint.
// ¿Para qué? Identificar IPs que realizan ataques de fuerza bruta o scraping.
// ¿Impacto? Los registros de rate limiting son clave para configurar reglas de firewall
//   y bloqueadores de IPs en producción.
export function logRateLimitHit(endpoint: string, ip: string): void {
  writeAuditLog({
    timestamp: new Date().toISOString(),
    event: 'RATE_LIMIT_HIT',
    endpoint,
    ip,
  });
}
