/**
 * Archivo: pages/RegisterPage.tsx
 * Descripción: Página de registro de nuevo usuario.
 * ¿Para qué? Permitir que nuevos usuarios creen una cuenta en el sistema.
 * ¿Impacto? Sin esta página no hay forma de incorporar usuarios al sistema.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Alert } from '@/components/ui/Alert';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // ¿Qué? Estado que indica que el registro fue exitoso y el email fue enviado.
  // ¿Para qué? Mostrar el mensaje "revisa tu correo" en lugar de redirigir al dashboard,
  //   ya que el usuario debe verificar su email antes de poder iniciar sesión.
  // ¿Impacto? Sin este estado el usuario iría al dashboard y encontraría un bloqueo (403).
  const [registered, setRegistered] = useState(false);

  // ¿Qué? Actualiza el campo correspondiente en formData usando el atributo name del input.
  // ¿Para qué? Manejar los cuatro campos del formulario con un solo handler genérico,
  //   limpiando simultáneamente el error del campo que el usuario está corrigiendo.
  // ¿Impacto? Sin el borrado del error, el mensaje de error quedaría visible aunque
  //   el usuario ya haya corregido el campo, creando confusión.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError(null);
  };

  // ¿Qué? Validación del lado cliente antes de llamar a la API.
  // ¿Para qué? Feedback inmediato al usuario sin esperar el round-trip al servidor.
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t('auth.register.validation.fullNameMin');
    }
    if (!formData.email.includes('@')) {
      newErrors.email = t('auth.register.validation.emailInvalid');
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
      newErrors.password = t('auth.register.validation.passwordWeak');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.validation.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError(null);

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email,
        password: formData.password,
      });
      setRegistered(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('auth.register.errorDefault'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* ─── Estado de éxito: email de verificación enviado ─── */}
        {registered ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {t('auth.register.successTitle')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t('auth.register.successMessage')}
            </p>
            <Link
              to="/login"
              className="inline-block text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              {t('auth.login.title')} →
            </Link>
          </div>
        ) : (
          <>
        {/* ─── Cabecera ─── */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-1">
            {t('auth.register.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('auth.register.hasAccount')}{' '}
            <Link
              to="/login"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              {t('auth.register.loginLink')}
            </Link>
          </p>
        </div>

        {/* ─── Formulario ─── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {serverError && <Alert type="error" message={serverError} />}

          <InputField
            id="fullName"
            name="fullName"
            label={t('auth.register.fullNameLabel')}
            type="text"
            autoComplete="name"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder={t('auth.register.fullNamePlaceholder')}
            error={errors.fullName}
          />

          <InputField
            id="email"
            name="email"
            label={t('auth.emailLabel')}
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder={t('auth.emailPlaceholder')}
            error={errors.email}
          />

          <InputField
            id="password"
            name="password"
            label={t('auth.passwordLabel')}
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder={t('auth.passwordPlaceholder')}
            error={errors.password}
          />

          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label={t('auth.register.confirmPasswordLabel')}
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t('auth.passwordPlaceholder')}
            error={errors.confirmPassword}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isLoading}>
              {t('auth.register.submitButton')}
            </Button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
