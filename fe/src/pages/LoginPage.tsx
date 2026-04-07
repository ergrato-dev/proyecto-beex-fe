/**
 * Archivo: pages/LoginPage.tsx
 * Descripción: Página de inicio de sesión.
 * ¿Para qué? Permitir a usuarios registrados autenticarse con email y contraseña.
 * ¿Impacto? Es la puerta de entrada principal al sistema — un error aquí
 *   bloquea el acceso a todas las rutas protegidas.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Alert } from '@/components/ui/Alert';

interface FormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ¿Qué? Actualiza el campo correspondiente y limpia el error al escribir.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData);
      // ¿Qué? Redirigir al dashboard tras login exitoso.
      navigate('/dashboard');
    } catch (err) {
      // ¿Qué? Mensaje genérico — no revelar si el email existe (OWASP).
      setError(err instanceof Error ? err.message : t('auth.login.errorDefault'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* ─── Cabecera ─── */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-1">
            {t('auth.login.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('auth.login.noAccount')}{' '}
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('auth.login.registerLink')}
            </Link>
          </p>
        </div>

        {/* ─── Formulario ─── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && <Alert type="error" message={error} />}

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
          />

          <InputField
            id="password"
            name="password"
            label={t('auth.passwordLabel')}
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder={t('auth.passwordPlaceholder')}
          />

          {/* ¿Qué? Link de recuperación alineado a la derecha bajo el campo de contraseña. */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          {/* ¿Qué? Botón de acción alineado a la derecha — regla del design system. */}
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isLoading}>
              {t('auth.login.submitButton')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
