/**
 * Archivo: i18n/index.ts
 * Descripción: Configuración e inicialización de i18next para React.
 * ¿Para qué? Centralizar la configuración de internacionalización — idiomas
 *   soportados, idioma por defecto, fallback y recursos en memoria.
 * ¿Impacto? Este archivo debe importarse ANTES de renderizar la app (en main.tsx).
 *   Si no se importa, todas las llamadas a t() retornan la clave en lugar del texto.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { es } from './locales/es';
import { en } from './locales/en';

// ¿Qué? Idiomas soportados — lista exhaustiva usada por el LanguageToggle.
export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ¿Qué? Clave de localStorage donde se persiste la preferencia de idioma.
const LANG_STORAGE_KEY = 'nn_language';

// ¿Qué? Recuperar el idioma guardado o usar español como defecto.
// ¿Para qué? El usuario no debería ver su idioma reiniciarse en cada recarga.
function getInitialLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored === 'es' || stored === 'en') return stored;
  return 'es';
}

// ¿Qué? Recursos de traducción cargados en memoria (sin backend HTTP).
// ¿Para qué? Sin plugin de backend, las traducciones están disponibles
//   desde el primer render — sin loading states ni peticiones extra.
const resources = {
  es: { translation: es },
  en: { translation: en },
};

void i18n
  // ¿Qué? Plugin que conecta i18next con el árbol de componentes React.
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),

    // ¿Qué? Si una clave no existe en el idioma actual, usar español.
    fallbackLng: 'es',

    interpolation: {
      // ¿Qué? React ya escapa los valores HTML — desactivar el doble escape de i18next.
      escapeValue: false,
    },

    // ¿Qué? Inicialización síncrona — la app no espera callbacks antes de renderizar.
    // ¿Para qué? Los recursos están en memoria, no hay nada asíncrono que esperar.
    //   Sin esto podría haber un flash de claves sin traducir en el primer render.
    initImmediate: false,
  });

// ¿Qué? Helpers para cambiar idioma y persistirlo en localStorage.
export function changeLanguage(lang: SupportedLanguage): void {
  void i18n.changeLanguage(lang);
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

export default i18n;
