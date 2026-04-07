/**
 * Archivo: i18n/locales/en.ts
 * Descripción: Traducciones en inglés del sistema NN Auth.
 * ¿Para qué? Permitir que usuarios angloparlantes usen el sistema en su idioma.
 * ¿Impacto? Cada clave aquí debe ser paralela a las de es.ts.
 *   Si se añade una clave nueva, debe añadirse en AMBOS archivos.
 */

import type { TranslationKeys } from './es';

// ¿Qué? `satisfies TranslationKeys` garantiza en compilación que EN tiene
// TODAS las claves definidas en ES — TypeScript avisa si falta alguna.
export const en = {
  nav: {
    brand: 'NN Auth',
    login: 'Sign in',
    register: 'Sign up',
    dashboard: 'Dashboard',
    changePassword: 'Change password',
    logout: 'Sign out',
    logoutAriaLabel: 'Sign out',
    mainNavAriaLabel: 'Main navigation',
    legalNavAriaLabel: 'Legal links',
  },

  footer: {
    copyright: '© {{year}} NN Company. All rights reserved.',
    terms: 'Terms of use',
    privacy: 'Privacy',
    cookies: 'Cookies',
    contact: 'Contact',
  },

  landing: {
    title: 'NN Auth System',
    subtitle:
      'Complete authentication system — registration, login, password change and recovery. Secure by default.',
    ctaRegister: 'Create account',
    ctaLogin: 'Sign in',
    featuresHeading: 'Features',
    features: {
      auth: {
        title: 'Secure authentication',
        description: 'JWT with 15-minute access tokens and 7-day refresh tokens.',
      },
      passwords: {
        title: 'Protected passwords',
        description: 'Hashed with bcrypt — we never store passwords in plain text.',
      },
      recovery: {
        title: 'Email recovery',
        description: 'Reset your password securely via email.',
      },
    },
  },

  auth: {
    emailLabel: 'Email address',
    emailPlaceholder: 'you@company.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',

    login: {
      title: 'Sign in',
      noAccount: "Don't have an account?",
      registerLink: 'Sign up',
      forgotPassword: 'Forgot your password?',
      submitButton: 'Sign in',
      errorDefault: 'Invalid credentials.',
    },

    register: {
      title: 'Create account',
      hasAccount: 'Already have an account?',
      loginLink: 'Sign in',
      fullNameLabel: 'Full name',
      fullNamePlaceholder: 'Ana García',
      confirmPasswordLabel: 'Confirm password',
      submitButton: 'Create account',
      errorDefault: 'Error creating account.',
      successTitle: 'Account created!',
      successMessage:
        'We sent you a verification email. Check your inbox (and spam folder) to activate your account.',
      validation: {
        fullNameMin: 'Name must be at least 2 characters.',
        emailInvalid: 'Enter a valid email address.',
        passwordWeak:
          'Minimum 8 characters, one uppercase, one lowercase and one number.',
        passwordMismatch: 'Passwords do not match.',
      },
    },

    forgotPassword: {
      title: 'Reset password',
      subtitle:
        'Enter your email and we will send you a link to reset your password.',
      submitButton: 'Send link',
      backButton: 'Back',
      successMessage:
        "If your email is registered, you'll receive a recovery link shortly. Also check your spam folder.",
      backToLogin: 'Back to sign in',
      validation: {
        emailInvalid: 'Enter a valid email address.',
      },
    },

    verifyEmail: {
      title: 'Verify email address',
      processing: 'Verifying your email, please wait...',
      successTitle: 'Account activated!',
      successMessage:
        'Your email has been verified successfully. You can now sign in.',
      goToLogin: 'Go to sign in',
      errorTitle: 'Invalid link',
      invalidToken:
        'The verification link is invalid or has expired. Please try registering again.',
      errorDefault: 'Could not verify email. Please try again later.',
      missingToken:
        'Verification token not found in the link. Make sure you use the link from the email.',
    },

    resetPassword: {
      title: 'New password',
      subtitle: 'Choose a secure password for your account.',
      newPasswordLabel: 'New password',
      confirmPasswordLabel: 'Confirm password',
      submitButton: 'Reset password',
      successMessage:
        'Password reset successfully. Redirecting to sign in...',
      invalidToken: 'The recovery link is invalid or has expired.',
      requestNewLink: 'Request new link',
      errorDefault: 'The link expired or was already used. Request a new one.',
      validation: {
        passwordWeak:
          'Minimum 8 characters, one uppercase, one lowercase and one number.',
        passwordMismatch: 'Passwords do not match.',
      },
    },

    changePassword: {
      title: 'Change password',
      subtitle: 'Enter your current password and the new one.',
      currentPasswordLabel: 'Current password',
      newPasswordLabel: 'New password',
      confirmNewPasswordLabel: 'Confirm new password',
      submitButton: 'Change password',
      cancelButton: 'Cancel',
      successMessage: 'Password updated successfully. Redirecting...',
      errorDefault: 'Could not change password.',
      validation: {
        currentRequired: 'Enter your current password.',
        newPasswordWeak:
          'Minimum 8 characters, one uppercase, one lowercase and one number.',
        sameAsCurrent: 'New password cannot be the same as the current one.',
        passwordMismatch: 'Passwords do not match.',
      },
    },
  },

  dashboard: {
    welcome: 'Welcome, {{name}}',
    sessionActive: 'Your session is active.',
    accountData: 'Account details',
    nameLabel: 'Name',
    emailLabel: 'Email address',
    memberSince: 'Member since',
    changePasswordButton: 'Change password',
    logoutButton: 'Sign out',
  },

  contact: {
    title: 'Contact',
    subtitle: 'Do you have any questions or comments? We are here to help.',
    infoHeading: 'Information',
    emailInfoLabel: 'Email address',
    phoneLabel: 'Phone',
    addressLabel: 'Address',
    hoursLabel: 'Office hours',
    sendMessage: 'Send us a message',
    nameLabel: 'Full name',
    subjectLabel: 'Subject',
    messageLabel: 'Message',
    submitButton: 'Send message',
    successMessage: 'Message sent. We will get back to you within 24 hours.',
  },

  legal: {
    terms: { title: 'Terms of use' },
    privacy: { title: 'Privacy policy' },
    cookies: { title: 'Cookie policy' },
    langNote: 'This document is only available in Spanish.',
  },

  common: {
    loading: 'Loading...',
    back: 'Back',
    language: 'Language',
  },
} satisfies TranslationKeys;
