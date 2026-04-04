/**
 * Archivo: main.tsx
 * Descripción: Punto de entrada de la aplicación React.
 * ¿Para qué? Montar el componente raíz App en el div#root del index.html.
 * ¿Impacto? Sin StrictMode React no detectaría problemas de efectos dobles en desarrollo.
 *   Sin AuthProvider ningún componente podría acceder al estado de autenticación.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// ¿Qué? Inicializar i18next ANTES de renderizar la app.
// ¿Para qué? Con initImmediate: false la inicialización es síncrona — el árbol
//   de componentes ya tiene traducciones disponibles desde el primer render.
// ¿Impacto? Si se omite, t() retorna la clave cruda ('auth.login.title') en lugar
//   del texto traducido durante el montaje inicial.
import '@/i18n';
import './index.css';
import App from './App.tsx';

// ¿Qué? Obtener el elemento raíz del DOM y lanzar la app React.
// ¿Para qué? createRoot es la API moderna de React 18+ (reemplaza a ReactDOM.render).
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontró el elemento #root en el HTML. Verificar index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

