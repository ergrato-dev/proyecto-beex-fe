/**
 * Archivo: pages/VerifyEmailPage.tsx
 * Descripción: Página de verificación de email — procesa el token del enlace de activación.
 * ¿Para qué? Cuando el usuario hace clic en el enlace de su email de bienvenida, aterriza
 *   aquí. La página extrae el token del query param, llama a la API y muestra el resultado.
 * ¿Impacto? Si esta página no funciona, los usuarios no pueden activar su cuenta
 *   y quedan bloqueados en el login con un 403.
 */

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as authApi from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

// ¿Qué? Estados posibles del proceso de verificación.
// ¿Para qué? Controlar qué se muestra al usuario según la etapa del proceso.
type VerifyState = 'processing' | 'success' | 'error' | 'missingToken';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // ¿Qué? Extraer el token del query param: /verify-email?token=xxxx
  const token = searchParams.get('token');

  const [state, setState] = useState<VerifyState>(token ? 'processing' : 'missingToken');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // ¿Qué? Si no hay token, no intentar la llamada a la API.
    // ¿Para qué? Evitar una llamada sin datos que siempre fallaría.
    if (!token) return;

    // ¿Qué? Llamada automática al montar el componente — el usuario no necesita hacer click.
    // ¿Para qué? La experiencia es transparente: el usuario hace click en el email y la cuenta
    //   se activa sola, sin formularios adicionales.
    const verify = async () => {
      try {
        await authApi.verifyEmail({ token });
        setState('success');
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : t('auth.verifyEmail.errorDefault'),
        );
        setState('error');
      }
    };

    verify();
    // ¿Para qué? El array vacío garantiza que solo se ejecuta una vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">

        {/* ─── Procesando ─────────────────────────────────────────────── */}
        {state === 'processing' && (
          <div className="text-center space-y-4">
            {/* ¿Qué? Spinner simple con CSS — sin dependencias adicionales. */}
            <div
              aria-label={t('common.loading')}
              role="status"
              className="mx-auto w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
            />
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {t('auth.verifyEmail.processing')}
            </p>
          </div>
        )}

        {/* ─── Éxito ───────────────────────────────────────────────────── */}
        {state === 'success' && (
          <div className="space-y-4">
            <Alert
              type="success"
              message={
                <span>
                  <strong>{t('auth.verifyEmail.successTitle')}</strong>{' '}
                  {t('auth.verifyEmail.successMessage')}
                </span>
              }
            />
            <div className="flex justify-end">
              <Link to="/login">
                <Button variant="primary">{t('auth.verifyEmail.goToLogin')}</Button>
              </Link>
            </div>
          </div>
        )}

        {/* ─── Error de verificación ───────────────────────────────────── */}
        {state === 'error' && (
          <div className="space-y-4">
            <Alert
              type="error"
              message={
                <span>
                  <strong>{t('auth.verifyEmail.errorTitle')}</strong>{' '}
                  {errorMessage ?? t('auth.verifyEmail.invalidToken')}
                </span>
              }
            />
            <div className="flex justify-end">
              <Link to="/register">
                <Button variant="secondary">{t('auth.register.title')}</Button>
              </Link>
            </div>
          </div>
        )}

        {/* ─── Token ausente en la URL ──────────────────────────────────── */}
        {state === 'missingToken' && (
          <div className="space-y-4">
            <Alert
              type="error"
              message={t('auth.verifyEmail.missingToken')}
            />
            <div className="flex justify-end">
              <Link to="/register">
                <Button variant="secondary">{t('auth.register.title')}</Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
