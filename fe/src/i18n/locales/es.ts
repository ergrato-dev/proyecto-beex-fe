/**
 * Archivo: i18n/locales/es.ts
 * Descripción: Traducciones en español — idioma por defecto del sistema.
 * ¿Para qué? Centralizar todos los textos visibles al usuario en un solo archivo
 *   por idioma, separando contenido de presentación.
 * ¿Impacto? Si falta una clave aquí, i18next usa el fallbackLng (es) y evita
 *   textos vacíos. Cada clave nueva en EN debe tener su contraparte aquí.
 */

export const es = {
  // ─── Navegación ────────────────────────────────────────────────────────────
  nav: {
    brand: 'NN Auth',
    login: 'Iniciar sesión',
    register: 'Registrarse',
    dashboard: 'Dashboard',
    changePassword: 'Cambiar contraseña',
    logout: 'Cerrar sesión',
    logoutAriaLabel: 'Cerrar sesión',
    mainNavAriaLabel: 'Navegación principal',
    legalNavAriaLabel: 'Links legales',
  },

  // ─── Pie de página ──────────────────────────────────────────────────────────
  footer: {
    copyright: '© {{year}} NN Company. Todos los derechos reservados.',
    terms: 'Términos de uso',
    privacy: 'Privacidad',
    cookies: 'Cookies',
    contact: 'Contacto',
  },

  // ─── Landing page ───────────────────────────────────────────────────────────
  landing: {
    title: 'NN Auth System',
    subtitle:
      'Sistema de autenticación completo — registro, login, cambio y recuperación de contraseña. Seguro por defecto.',
    ctaRegister: 'Crear cuenta',
    ctaLogin: 'Iniciar sesión',
    featuresHeading: 'Características',
    features: {
      auth: {
        title: 'Autenticación segura',
        description:
          'JWT con access tokens de 15 minutos y refresh tokens de 7 días.',
      },
      passwords: {
        title: 'Contraseñas protegidas',
        description:
          'Hashing con bcrypt — nunca almacenamos contraseñas en texto plano.',
      },
      recovery: {
        title: 'Recuperación por email',
        description:
          'Restablece tu contraseña de forma segura desde tu correo electrónico.',
      },
    },
  },

  // ─── Autenticación (campos y mensajes compartidos) ─────────────────────────
  auth: {
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@empresa.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: '••••••••',

    login: {
      title: 'Iniciar sesión',
      noAccount: '¿No tienes cuenta?',
      registerLink: 'Regístrate',
      forgotPassword: '¿Olvidaste tu contraseña?',
      submitButton: 'Iniciar sesión',
      errorDefault: 'Credenciales incorrectas.',
    },

    register: {
      title: 'Crear cuenta',
      hasAccount: '¿Ya tienes cuenta?',
      loginLink: 'Inicia sesión',
      fullNameLabel: 'Nombre completo',
      fullNamePlaceholder: 'Ana García',
      confirmPasswordLabel: 'Confirmar contraseña',
      submitButton: 'Crear cuenta',
      errorDefault: 'Error al crear la cuenta.',
      successTitle: '¡Cuenta creada!',
      successMessage:
        'Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta.',
      validation: {
        fullNameMin: 'El nombre debe tener al menos 2 caracteres.',
        emailInvalid: 'Ingresa un correo electrónico válido.',
        passwordWeak:
          'Mínimo 8 caracteres, una mayúscula, una minúscula y un número.',
        passwordMismatch: 'Las contraseñas no coinciden.',
      },
    },

    forgotPassword: {
      title: 'Recuperar contraseña',
      subtitle:
        'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.',
      submitButton: 'Enviar enlace',
      backButton: 'Volver',
      successMessage:
        'Si tu correo está registrado, recibirás un enlace de recuperación en breve. Revisa también tu carpeta de spam.',
      backToLogin: 'Volver al inicio de sesión',
      validation: {
        emailInvalid: 'Ingresa un correo electrónico válido.',
      },
    },

    verifyEmail: {
      title: 'Verificar correo electrónico',
      processing: 'Verificando tu correo, por favor espera...',
      successTitle: '¡Cuenta activada!',
      successMessage:
        'Tu correo ha sido verificado correctamente. Ya puedes iniciar sesión.',
      goToLogin: 'Ir al inicio de sesión',
      errorTitle: 'Enlace inválido',
      invalidToken:
        'El enlace de verificación es inválido o ha expirado. Intenta registrarte nuevamente.',
      errorDefault: 'No se pudo verificar el correo. Inténtalo de nuevo más tarde.',
      missingToken:
        'No se encontró el token de verificación en el enlace. Asegúrate de usar el enlace del email.',
    },

    resetPassword: {
      title: 'Nueva contraseña',
      subtitle: 'Elige una contraseña segura para tu cuenta.',
      newPasswordLabel: 'Nueva contraseña',
      confirmPasswordLabel: 'Confirmar contraseña',
      submitButton: 'Restablecer contraseña',
      successMessage:
        'Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...',
      invalidToken: 'El enlace de recuperación es inválido o ha expirado.',
      requestNewLink: 'Solicitar nuevo enlace',
      errorDefault: 'El enlace expiró o ya fue utilizado. Solicita uno nuevo.',
      validation: {
        passwordWeak:
          'Mínimo 8 caracteres, una mayúscula, una minúscula y un número.',
        passwordMismatch: 'Las contraseñas no coinciden.',
      },
    },

    changePassword: {
      title: 'Cambiar contraseña',
      subtitle: 'Ingresa tu contraseña actual y la nueva.',
      currentPasswordLabel: 'Contraseña actual',
      newPasswordLabel: 'Nueva contraseña',
      confirmNewPasswordLabel: 'Confirmar nueva contraseña',
      submitButton: 'Cambiar contraseña',
      cancelButton: 'Cancelar',
      successMessage: 'Contraseña actualizada correctamente. Redirigiendo...',
      errorDefault: 'No se pudo cambiar la contraseña.',
      validation: {
        currentRequired: 'Ingresa tu contraseña actual.',
        newPasswordWeak:
          'Mínimo 8 caracteres, una mayúscula, una minúscula y un número.',
        sameAsCurrent: 'La nueva contraseña no puede ser igual a la actual.',
        passwordMismatch: 'Las contraseñas no coinciden.',
      },
    },
  },

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    welcome: 'Bienvenido, {{name}}',
    sessionActive: 'Tu sesión está activa.',
    accountData: 'Datos de la cuenta',
    nameLabel: 'Nombre',
    emailLabel: 'Correo electrónico',
    memberSince: 'Miembro desde',
    changePasswordButton: 'Cambiar contraseña',
    logoutButton: 'Cerrar sesión',
  },

  // ─── Contacto ───────────────────────────────────────────────────────────────
  contact: {
    title: 'Contacto',
    subtitle: '¿Tienes alguna pregunta o comentario? Estamos para ayudarte.',
    infoHeading: 'Información',
    emailInfoLabel: 'Correo electrónico',
    phoneLabel: 'Teléfono',
    addressLabel: 'Dirección',
    hoursLabel: 'Horario de atención',
    sendMessage: 'Envíanos un mensaje',
    nameLabel: 'Nombre completo',
    subjectLabel: 'Asunto',
    messageLabel: 'Mensaje',
    submitButton: 'Enviar mensaje',
    successMessage: 'Mensaje enviado. Te responderemos en un plazo de 24 horas.',
  },

  // ─── Páginas legales (título) ───────────────────────────────────────────────
  legal: {
    terms: { title: 'Términos de uso' },
    privacy: { title: 'Política de privacidad' },
    cookies: { title: 'Política de cookies' },
    langNote: 'Este documento solo está disponible en español.',
  },

  // ─── Común ─────────────────────────────────────────────────────────────────
  common: {
    loading: 'Cargando...',
    back: 'Volver',
    language: 'Idioma',
  },
} as const;

export type TranslationKeys = typeof es;
