/**
 * Archivo: pages/PoliticaPrivacidadPage.tsx
 * Descripción: Página estática con la política de privacidad y tratamiento de datos.
 * ¿Para qué? Cumplir con la Ley 1581 de 2012 (Colombia) y el RGPD en cuanto
 *   a transparencia sobre el tratamiento de datos personales.
 * ¿Impacto? Obligación legal — ausencia de esta política puede acarrear sanciones.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function PoliticaPrivacidadPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Última actualización: enero de 2026
        </p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {t('legal.privacy.title')}
        </h1>
      </div>

      <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            1. Responsable del tratamiento
          </h2>
          <p>
            NN es responsable del tratamiento de los datos personales
            recopilados a través de NN Auth System. Para ejercer tus derechos,
            contáctanos a través de{' '}
            <Link
              to="/contacto"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              nuestra página de contacto
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            2. Datos que recopilamos
          </h2>
          <p>Al registrarte y usar el servicio, recopilamos:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong className="text-gray-900 dark:text-gray-100">
                Datos de identificación:
              </strong>{' '}
              nombre completo y dirección de correo electrónico.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-100">
                Datos de seguridad:
              </strong>{' '}
              contraseña (almacenada únicamente como hash bcrypt, nunca en texto
              plano).
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-100">
                Datos técnicos:
              </strong>{' '}
              fecha de creación de la cuenta y estado de la misma.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            3. Finalidad del tratamiento
          </h2>
          <p>Usamos tus datos exclusivamente para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gestionar el acceso autenticado al sistema.</li>
            <li>Enviar correos de recuperación de contraseña cuando los solicitas.</li>
            <li>Mantener la seguridad de tu cuenta.</li>
          </ul>
          <p className="mt-2">
            <strong className="text-gray-900 dark:text-gray-100">
              No vendemos ni compartimos tus datos con terceros
            </strong>{' '}
            con fines comerciales.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            4. Base legal
          </h2>
          <p>
            El tratamiento de tus datos se realiza con base en el consentimiento
            otorgado al aceptar estos términos (Art. 6.1.a RGPD / Ley 1581 de
            2012), y en la ejecución del contrato de uso del servicio (Art.
            6.1.b RGPD).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            5. Conservación de datos
          </h2>
          <p>
            Conservamos tus datos mientras mantengas una cuenta activa. Puedes
            solicitar la eliminación de tu cuenta y datos en cualquier momento.
            Los tokens de recuperación de contraseña se eliminan automáticamente
            al ser usados o expirar (1 hora).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            6. Seguridad
          </h2>
          <p>
            Implementamos medidas técnicas para proteger tus datos: contraseñas
            hasheadas con bcrypt (12 rounds), comunicación HTTPS, tokens JWT de
            corta duración, y rate limiting para prevenir ataques de fuerza
            bruta. Sin embargo, ningún sistema es 100% seguro.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            7. Tus derechos
          </h2>
          <p>
            Tienes derecho a acceder, rectificar, suprimir, limitar el
            tratamiento y portabilidad de tus datos. Para ejercerlos,
            contáctanos.
          </p>
        </section>
      </div>
    </div>
  );
}
