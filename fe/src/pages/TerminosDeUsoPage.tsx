/**
 * Archivo: pages/TerminosDeUsoPage.tsx
 * Descripción: Página estática con los términos y condiciones de uso del sistema.
 * ¿Para qué? Informar a los usuarios sobre las reglas y responsabilidades
 *   al usar la plataforma NN Auth System.
 * ¿Impacto? Requerimiento legal — protege a la empresa y establece obligaciones
 *   claras para el usuario.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function TerminosDeUsoPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
          Última actualización: enero de 2026
        </p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-slate-100">
          {t('legal.terms.title')}
        </h1>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
            1. Aceptación de los términos
          </h2>
          <p>
            Al acceder y utilizar NN Auth System, aceptas quedar vinculado por
            estos Términos de Uso. Si no estás de acuerdo con alguna parte de
            estos términos, no debes usar el servicio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
            2. Uso del servicio
          </h2>
          <p>
            NN Auth System es un sistema de gestión de credenciales de acceso.
            Te comprometes a:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Proporcionar información veraz y actualizada al registrarte.</li>
            <li>
              Mantener la confidencialidad de tus credenciales de acceso.
            </li>
            <li>
              No compartir tu cuenta con terceros ni usarla para actividades no
              autorizadas.
            </li>
            <li>
              Notificar de inmediato cualquier uso no autorizado de tu cuenta.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
            3. Cuentas de usuario
          </h2>
          <p>
            Eres responsable de todas las actividades realizadas bajo tu cuenta.
            NN se reserva el derecho de suspender o eliminar cuentas que violen
            estos términos, sin previo aviso.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
            4. Propiedad intelectual
          </h2>
          <p>
            Todo el contenido, código fuente y diseño del sistema son propiedad
            de NN. Queda prohibida su reproducción total o parcial sin
            autorización expresa.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
            5. Limitación de responsabilidad
          </h2>
          <p>
            NN no será responsable de daños indirectos, incidentales o
            consecuentes derivados del uso o la imposibilidad de usar el
            servicio, siempre que no sean atribuibles a negligencia grave de
            nuestra parte.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
            6. Modificaciones
          </h2>
          <p>
            Podemos actualizar estos términos en cualquier momento. Los cambios
            entrarán en vigor al ser publicados en esta página. El uso continuo
            del servicio implica la aceptación de los nuevos términos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-slate-100">
            7. Contacto
          </h2>
          <p>
            Para preguntas sobre estos términos, contáctanos en{' '}
            <Link
              to="/contacto"
              className="text-brand-600 dark:text-brand-400 hover:underline"
            >
              nuestra página de contacto
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
