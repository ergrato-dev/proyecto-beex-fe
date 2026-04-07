/**
 * Archivo: pages/ChangePasswordPage.tsx
 * Descripción: Página para cambiar la contraseña del usuario autenticado.
 * ¿Para qué? Permitir que el usuario actualice su contraseña de forma segura
 *   verificando primero la contraseña actual.
 * ¿Impacto? Sin verificación de la contraseña actual, cualquiera con la sesión
 *   abierta podría cambiar la contraseña sin autorización.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as authApi from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Alert } from '@/components/ui/Alert';

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError(null);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = t('auth.changePassword.validation.currentRequired');
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.newPassword)) {
      newErrors.newPassword = t('auth.changePassword.validation.newPasswordWeak');
    }
    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = t('auth.changePassword.validation.sameAsCurrent');
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = t('auth.changePassword.validation.passwordMismatch');
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
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      // ¿Qué? Redirigir al dashboard tras cambio exitoso con pequeño delay para leer el mensaje.
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : t('auth.changePassword.errorDefault'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-1">
            {t('auth.changePassword.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('auth.changePassword.subtitle')}
          </p>
        </div>

        {success ? (
          <Alert
            type="success"
            message={t('auth.changePassword.successMessage')}
          />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {serverError && <Alert type="error" message={serverError} />}

            <InputField
              id="currentPassword"
              name="currentPassword"
              label={t('auth.changePassword.currentPasswordLabel')}
              type="password"
              autoComplete="current-password"
              required
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder={t('auth.passwordPlaceholder')}
              error={errors.currentPassword}
            />

            <InputField
              id="newPassword"
              name="newPassword"
              label={t('auth.changePassword.newPasswordLabel')}
              type="password"
              autoComplete="new-password"
              required
              value={formData.newPassword}
              onChange={handleChange}
              placeholder={t('auth.passwordPlaceholder')}
              error={errors.newPassword}
            />

            <InputField
              id="confirmNewPassword"
              name="confirmNewPassword"
              label={t('auth.changePassword.confirmNewPasswordLabel')}
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmNewPassword}
              onChange={handleChange}
              placeholder={t('auth.passwordPlaceholder')}
              error={errors.confirmNewPassword}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                {t('auth.changePassword.cancelButton')}
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {t('auth.changePassword.submitButton')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
