/**
 * Archivo: pages/LandingPage.tsx
 * Descripción: Página de aterrizaje pública del sistema NN Auth.
 * ¿Para qué? Presentar el proyecto, sus características y guiar al usuario hacia el registro
 *            o el inicio de sesión con una experiencia visual clara y profesional.
 * ¿Impacto? Es la primera impresión del sistema — define la percepción de calidad y confianza.
 */

import { Link } from 'react-router-dom';
import { ShieldCheck, KeyRound, Mail, RefreshCw, Lock, UserCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ─────────────────────────────────────────────────────────────
// LOGO COMPONENT
// ─────────────────────────────────────────────────────────────

/**
 * ¿Qué? Logo SVG del sistema — dos letras N dentro de un badge cuadrado redondeado.
 * ¿Para qué? Identidad visual única en el hero sin depender de fuentes externas ni imágenes.
 * ¿Impacto? Refuerza la marca del sistema en la primera sección que ve el usuario.
 */
interface NNAuthLogoProps {
  readonly size?: number;
}

export function NNAuthLogo({ size = 36 }: NNAuthLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* Fondo: badge cuadrado con bordes redondeados y borde del color de marca */}
      <rect x="1" y="1" width="34" height="34" rx="8" fill="#0f172a" stroke="var(--color-brand-500)" strokeWidth="1.5" />
      {/* Primera letra N (izquierda) — trazos en color de marca claro */}
      <polyline points="7,27 7,9 15,27 15,9" fill="none" stroke="var(--color-brand-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Segunda letra N (derecha) — misma proporción, desplazada 12px */}
      <polyline points="21,27 21,9 29,27 29,9" fill="none" stroke="var(--color-brand-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────

/**
 * ¿Qué? Íconos para cada feature — separados de las claves i18n porque los íconos
 *   son técnicos (no se traducen).
 * ¿Para qué? Permiten indexar el ícono correcto al renderizar las tarjetas.
 * ¿Impacto? Si se añade un feature nuevo, agregar su ícono aquí y su clave en i18n.
 */
const featureIcons = {
  register: UserCheck,
  auth: KeyRound,
  emailVerification: Mail,
  passwords: Lock,
  recovery: RefreshCw,
  owasp: ShieldCheck,
} as const;

type FeatureKey = keyof typeof featureIcons;

/**
 * ¿Qué? Stack tecnológico del proyecto — lista de badges para la sección visual.
 * ¿Para qué? Transparencia técnica: el usuario puede ver qué herramientas se usaron.
 * ¿Impacto? Establece credibilidad técnica ante el usuario y el evaluador del proyecto.
 */
const techStack = [
  'Node.js 20',
  'Express.js 5',
  'TypeScript',
  'PostgreSQL 17',
  'Drizzle ORM',
  'JWT',
  'bcryptjs',
  'Zod',
  'React 18',
  'Vite',
  'TailwindCSS 4',
  'Docker',
  'Vitest',
] as const;

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

/**
 * ¿Qué? Componente de página para la ruta raíz "/".
 * ¿Para qué? Servir como punto de entrada público que presenta el sistema, sus características,
 *   el flujo de uso y el stack tecnológico, dirigiendo al usuario a registrarse o iniciar sesión.
 * ¿Impacto? Primera impresión del sistema — define confianza, claridad y propuesta de valor.
 */
export function LandingPage() {
  const { t } = useTranslation();

  const featureKeys: FeatureKey[] = ['register', 'auth', 'emailVerification', 'passwords', 'recovery', 'owasp'];
  const stepKeys = ['step1', 'step2', 'step3'] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      {/* ══════════════════════════════════════════════════════
          HERO — propuesta de valor principal
          ══════════════════════════════════════════════════════ */}
      <section
        className="border-b border-gray-200 dark:border-slate-800 px-2 py-24 text-center"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto max-w-3xl">
          {/* Logo grande en el hero */}
          <div className="mb-8 flex justify-center" aria-hidden="true">
            <NNAuthLogo size={72} />
          </div>

          <h1
            id="hero-heading"
            className="mb-5 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-slate-100"
          >
            {t('landing.title')}{' '}
            <span className="text-brand-600 dark:text-brand-500">Express</span>
          </h1>

          <p className="mb-10 text-lg sm:text-xl leading-relaxed text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>

          {/* ¿Por qué justify-center? Los botones CTA en el hero son el punto focal —
              centrarlos maximiza la visibilidad y el ratio de acción. */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-7 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              {t('landing.ctaRegister')}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-slate-700 px-7 py-3 text-base font-medium text-gray-700 dark:text-slate-300 transition-colors duration-200 hover:border-gray-400 dark:hover:border-slate-500 hover:text-gray-900 dark:hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              {t('landing.ctaLogin')}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES — 6 tarjetas de características
          ══════════════════════════════════════════════════════ */}
      <section
        className="border-b border-gray-200 dark:border-slate-800 px-2 py-20"
        aria-labelledby="features-heading"
      >
        <header className="mb-12 text-center">
          <h2
            id="features-heading"
            className="text-3xl font-bold text-gray-900 dark:text-slate-100"
          >
            {t('landing.featuresHeading')}
          </h2>
          <p className="mt-3 text-gray-500 dark:text-slate-400">
            {t('landing.featuresSubtitle')}
          </p>
        </header>

        {/* Grid: 1 col mobile → 2 tablet → 3 desktop */}
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key) => {
            const Icon = featureIcons[key];
            return (
              <li key={key}>
                <article className="h-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-colors duration-200 hover:border-gray-300 dark:hover:border-slate-700">
                  {/* Ícono con fondo sutil */}
                  <div
                    className="mb-4 inline-flex rounded-lg bg-gray-100 dark:bg-slate-800 p-3"
                    aria-hidden="true"
                  >
                    <Icon size={22} className="text-brand-600 dark:text-brand-500" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-slate-100">
                    {t(`landing.features.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                    {t(`landing.features.${key}.description`)}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — flujo en 3 pasos
          ══════════════════════════════════════════════════════ */}
      <section
        className="border-b border-gray-200 dark:border-slate-800 px-2 py-20"
        aria-labelledby="how-heading"
      >
        <header className="mb-14 text-center">
          <h2
            id="how-heading"
            className="text-3xl font-bold text-gray-900 dark:text-slate-100"
          >
            {t('landing.stepsHeading')}
          </h2>
          <p className="mt-3 text-gray-500 dark:text-slate-400">
            {t('landing.stepsSubtitle')}
          </p>
        </header>

        <ol className="m-0 grid list-none grid-cols-1 gap-10 p-0 sm:grid-cols-3">
          {stepKeys.map((stepKey, index) => (
            <li key={stepKey} className="relative">
              {/* Línea conectora entre pasos (solo visible en desktop) */}
              {index < stepKeys.length - 1 && (
                <div
                  className="absolute top-7 left-full hidden h-px w-full -translate-x-5 bg-gray-200 dark:bg-slate-800 sm:block"
                  aria-hidden="true"
                />
              )}

              <div className="flex flex-col items-center text-center">
                {/* Número del paso con estilo de badge */}
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950 text-xl font-bold text-brand-600 dark:text-brand-400"
                  aria-hidden="true"
                >
                  {t(`landing.steps.${stepKey}.number`)}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {t(`landing.steps.${stepKey}.title`)}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                  {t(`landing.steps.${stepKey}.description`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ══════════════════════════════════════════════════════
          TECH STACK — badges de tecnologías
          ══════════════════════════════════════════════════════ */}
      <section
        className="border-b border-gray-200 dark:border-slate-800 px-2 py-20"
        aria-labelledby="stack-heading"
      >
        <div className="text-center">
          <h2
            id="stack-heading"
            className="mb-3 text-3xl font-bold text-gray-900 dark:text-slate-100"
          >
            {t('landing.stackHeading')}
          </h2>
          <p className="mb-10 text-gray-500 dark:text-slate-400">
            {t('landing.stackSubtitle')}
          </p>

          <ul
            className="m-0 flex list-none flex-wrap justify-center gap-3 p-0"
            aria-label={t('landing.stackHeading')}
          >
            {techStack.map((tech) => (
              <li key={tech}>
                <span className="rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-1.5 text-sm text-gray-600 dark:text-slate-300">
                  {tech}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA FINAL — llamada a la acción de cierre
          ══════════════════════════════════════════════════════ */}
      <section className="px-2 py-24 text-center" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-2xl">
          <h2
            id="cta-heading"
            className="mb-5 text-4xl font-bold text-gray-900 dark:text-slate-100"
          >
            {t('landing.ctaFinalHeading')}
          </h2>
          <p className="mb-10 text-lg text-gray-500 dark:text-slate-400">
            {t('landing.ctaFinalSubtitle')}
          </p>

          <div className="flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-3.5 text-base font-medium text-white transition-colors duration-200 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              {t('landing.ctaFinalButton')}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
