/**
 * Archivo: pages/PoliticaCookiesPage.tsx
 * Descripción: Página estática con la política de uso de cookies.
 * ¿Para qué? Cumplir con la normativa de privacidad e informar al usuario
 *   qué datos persisten en su navegador y con qué propósito.
 * ¿Impacto? NN Auth System usa localStorage para tokens JWT — es importante
 *   que el usuario entienda por qué y qué riesgos implica.
 */

import { useTranslation } from 'react-i18next';

export function PoliticaCookiesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-12 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Última actualización: enero de 2026
        </p>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {t('legal.cookies.title')}
        </h1>
      </div>

      <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            1. ¿Qué usamos?
          </h2>
          <p>
            NN Auth System almacena información en el{' '}
            <strong className="text-gray-900 dark:text-gray-100">
              localStorage
            </strong>{' '}
            de tu navegador, no en cookies tradicionales. Esta distinción es
            técnicamente relevante: el localStorage no se envía automáticamente
            en cada petición HTTP y es accesible solo desde el origen del sitio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            2. Datos almacenados en localStorage
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                    Clave
                  </th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">
                    Contenido
                  </th>
                  <th className="text-left py-2 font-medium text-gray-900 dark:text-gray-100">
                    Duración
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                    accessToken
                  </td>
                  <td className="py-2 pr-4">
                    JWT de acceso para autenticar peticiones a la API
                  </td>
                  <td className="py-2">15 minutos (TTL del token)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                    refreshToken
                  </td>
                  <td className="py-2 pr-4">
                    JWT de refresco para obtener nuevos access tokens
                  </td>
                  <td className="py-2">7 días</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                    theme
                  </td>
                  <td className="py-2 pr-4">
                    Preferencia de tema: "light" o "dark"
                  </td>
                  <td className="py-2">Persistente hasta cambio manual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            3. Finalidad
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong className="text-gray-900 dark:text-gray-100">
                Tokens JWT:
              </strong>{' '}
              mantener la sesión iniciada sin requerir credenciales en cada
              página. Son estrictamente necesarios para el funcionamiento del sistema.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-gray-100">
                Preferencia de tema:
              </strong>{' '}
              recordar si prefieres modo oscuro o claro entre visitas.
            </li>
          </ul>
          <p className="mt-2">
            No utilizamos tracking, analytics ni publicidad de terceros.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            4. Cómo eliminar los datos almacenados
          </h2>
          <p>
            Al cerrar sesión, los tokens se eliminan automáticamente del
            localStorage. También puedes limpiarlos manualmente desde las
            herramientas de desarrollador de tu navegador (
            <strong className="text-gray-900 dark:text-gray-100">F12</strong> →
            Application → Local Storage) o borrando los datos de navegación del
            sitio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            5. Nota de seguridad
          </h2>
          <div className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-yellow-800 dark:text-yellow-300">
              Los tokens almacenados en localStorage son accesibles para scripts
              JavaScript del mismo origen. Nunca compartas links de tu sesión ni
              instales extensiones de navegador no confiables. En entornos
              corporativos de alta seguridad se recomienda usar httpOnly cookies
              como alternativa.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
