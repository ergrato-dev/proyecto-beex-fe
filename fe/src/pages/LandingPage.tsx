/**
 * Archivo: pages/LandingPage.tsx
 * Descripción: Página pública de inicio — presentación del sistema NN Auth.
 * ¿Para qué? Primera impresión del sistema para usuarios no autenticados:
 *   explica qué es y dirige al registro o al login.
 * ¿Impacto? Es el punto de entrada principal de la aplicación.
 */

import { Link } from 'react-router-dom';
import { Shield, Lock, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

export function LandingPage() {
  const { t } = useTranslation();

  // ¿Qué? FEATURES como constante local (no módulo-level) porque usa t().
  // ¿Para qué? t() solo funciona dentro del contexto de un componente React —
  //   fuera lanzaría un error o devolvería la clave sin traducir.
  const FEATURES = [
    {
      icon: Shield,
      title: t('landing.features.auth.title'),
      description: t('landing.features.auth.description'),
    },
    {
      icon: Lock,
      title: t('landing.features.passwords.title'),
      description: t('landing.features.passwords.description'),
    },
    {
      icon: Mail,
      title: t('landing.features.recovery.title'),
      description: t('landing.features.recovery.description'),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* ─── Hero ─── */}
      <section className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
          {t('landing.title')}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
          {t('landing.subtitle')}
        </p>

        {/* ¿Qué? Botones de acción alineados al centro en el hero (excepción justificada: CTA principal). */}
        <div className="flex items-center justify-center gap-3">
          <Link to="/register">
            <Button variant="primary">{t('landing.ctaRegister')}</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">{t('landing.ctaLogin')}</Button>
          </Link>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section aria-labelledby="features-heading">
        <h2
          id="features-heading"
          className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center mb-10"
        >
          {t('landing.featuresHeading')}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-3" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
