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
      'Registration, login, email verification, password change and recovery. A complete system built with Express, React and security best practices.',
    ctaRegister: 'Get started',
    ctaLogin: 'Sign in',
    featuresHeading: 'System features',
    featuresSubtitle: 'Everything you need for a robust and educational authentication system.',
    features: {
      register: {
        title: 'Secure registration',
        description:
          'Real-time data validation. Passwords are stored hashed with bcrypt — never in plain text.',
      },
      auth: {
        title: 'JWT authentication',
        description:
          '15-min access tokens and 7-day refresh tokens. Stateless, efficient and industry-standard.',
      },
      emailVerification: {
        title: 'Email verification',
        description:
          'Confirms identity before activating the account. Single-use link sent automatically on registration.',
      },
      passwords: {
        title: 'Password change',
        description:
          'Authenticated users can change their password by providing the current one. Strict backend validation.',
      },
      recovery: {
        title: 'Email recovery',
        description: 'Full forgot/reset flow with a single-use token that expires in 1 hour.',
      },
      owasp: {
        title: 'OWASP security',
        description:
          'Security-first design: no SQL injection, CORS configured, inputs validated with Zod and headers secured with Helmet.',
      },
    },
    stepsHeading: 'How it works',
    stepsSubtitle: 'Three steps to start using the system.',
    steps: {
      step1: {
        number: '01',
        title: 'Create your account',
        description:
          'Register your email and password. You will receive an email to verify and activate your account.',
      },
      step2: {
        number: '02',
        title: 'Sign in',
        description:
          'Authenticate with your credentials. The system will issue an access token and a refresh token.',
      },
      step3: {
        number: '03',
        title: 'Access the system',
        description: 'With your active session, manage your profile and password from the dashboard.',
      },
    },
    stackHeading: 'Tech stack',
    stackSubtitle: 'Modern, typed and industry-proven tools.',
    ctaFinalHeading: 'Ready to start',
    ctaFinalSubtitle:
      'Create your account and explore the complete authentication system. Learn by building.',
    ctaFinalButton: 'Create free account',
    logoAriaLabel: 'NN Auth System — go to home',
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
