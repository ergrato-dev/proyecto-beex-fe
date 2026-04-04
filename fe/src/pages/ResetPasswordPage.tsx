/**
 * Archivo: pages/ResetPasswordPage.tsx
 * Descripción: Página para restablecer la contraseña usando el token del email.
 * ¿Para qué? Segundo paso del flujo de recuperación — el usuario llega aquí
 *   desde el enlace del email con el token como query parameter.
 * ¿Impacto? Si el token no está en la URL o es inválido, debe mostrar un error
 *   claro para que el usuario sepa que debe solicitar un nuevo enlace.
 */

import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as authApi from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Alert } from '@/components/ui/Alert';

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ¿Qué? Extraer el token del query param: /reset-password?token=xxxx
  const token = searchParams.get('token');

  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError(null);
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.newPassword)) {
      newErrors.newPassword = t('auth.resetPassword.validation.passwordWeak');
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.resetPassword.validation.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ¿Qué? Si no hay token en la URL, mostrar error de enlace inválido.
  if (!token) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-4">
          <Alert
            type="error"
            message={t('auth.resetPassword.invalidToken')}
          />
          <div className="flex justify-end">
            <Link to="/forgot-password">
              <Button variant="secondary">{t('auth.resetPassword.requestNewLink')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError(null);

    try {
      await authApi.resetPassword({ token, newPassword: formData.newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : t('auth.resetPassword.errorDefault'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Alert
            type="success"
            message={t('auth.resetPassword.successMessage')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('auth.resetPassword.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('auth.resetPassword.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {serverError && <Alert type="error" message={serverError} />}

          <InputField
            id="newPassword"
            name="newPassword"
            label={t('auth.resetPassword.newPasswordLabel')}
            type="password"
            autoComplete="new-password"
            required
            value={formData.newPassword}
            onChange={handleChange}
            placeholder={t('auth.passwordPlaceholder')}
            error={errors.newPassword}
          />

          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label={t('auth.resetPassword.confirmPasswordLabel')}
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
              {t('auth.resetPassword.submitButton')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
