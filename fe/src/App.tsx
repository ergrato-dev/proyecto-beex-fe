/**
 * Archivo: App.tsx
 * Descripción: Componente raíz — define el enrutamiento de la aplicación.
 * ¿Para qué? Centralizar TODAS las rutas en un solo lugar facilita entender
 *   la estructura de navegación del sistema de un vistazo.
 * ¿Impacto? Una ruta mal configurada puede hacer que una página sea inaccesible
 *   o que una ruta protegida quede expuesta sin autenticación.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { ContactPage } from '@/pages/ContactPage';
import { TerminosDeUsoPage } from '@/pages/TerminosDeUsoPage';
import { PoliticaPrivacidadPage } from '@/pages/PoliticaPrivacidadPage';
import { PoliticaCookiesPage } from '@/pages/PoliticaCookiesPage';

function App() {
  return (
    // ¿Qué? AuthProvider envuelve todo el árbol para que cualquier componente pueda usar useAuth().
    // ¿Para qué? Sin este wrapper, useAuth() lanzaría un error porque el contexto estaría undefined.
    // ¿Impacto? Debe ser el componente más externo — si se coloca dentro de BrowserRouter,
    //   los hooks de navegación (useNavigate) no estarían disponibles dentro del Provider.
    <AuthProvider>
      {/* ¿Qué? BrowserRouter habilita la navegación del lado del cliente con la History API.
          ¿Para qué? Permite navegar entre páginas sin recargar el servidor (SPA).
          ¿Impacto? Sin BrowserRouter, todos los hooks de react-router (useNavigate, Link) fallan. */}
      <BrowserRouter>
        {/* ¿Qué? Routes evalúa las rutas en orden y renderiza solo la primera que coincide.
            ¿Para qué? Evitar que múltiples rutas se rendericen al mismo tiempo.
            ¿Impacto? Es el reemplazo del antiguo Switch — más preciso y predecible. */}
        <Routes>
          {/* ─── Rutas públicas — accesibles sin autenticación ─── */}
          <Route path="/" element={<Layout><LandingPage /></Layout>} />
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
          <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
          <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />
          {/* ¿Qué? /verify-email?token=xxx — enlace del email de activación de cuenta.
              ¿Para qué? El usuario llega aquí al hacer clic en el email de bienvenida.
              ¿Impacto? La página extrae el token del query param y llama a la API automáticamente. */}
          <Route path="/verify-email" element={<Layout><VerifyEmailPage /></Layout>} />

          {/* ─── Rutas protegidas — requieren sesión activa ─── */}
          {/* ¿Qué? ProtectedRoute comprueba isAuthenticated antes de renderizar el hijo.
              ¿Para qué? Si el usuario no está autenticado, redirige al /login.
              ¿Impacto? Sin este wrapper, las rutas privadas serían accesibles a cualquiera
                que conozca la URL directa. */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>}
          />
          <Route
            path="/change-password"
            element={<ProtectedRoute><Layout><ChangePasswordPage /></Layout></ProtectedRoute>}
          />

          {/* ─── Páginas legales y contacto ─── */}
          <Route path="/terminos-de-uso" element={<Layout><TerminosDeUsoPage /></Layout>} />
          <Route path="/politica-privacidad" element={<Layout><PoliticaPrivacidadPage /></Layout>} />
          <Route path="/politica-cookies" element={<Layout><PoliticaCookiesPage /></Layout>} />
          <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />

          {/* ¿Qué? Ruta comodín path="*" — captura cualquier URL no definida arriba.
              ¿Para qué? Mostrar una página 404 amigable en lugar de pantalla en blanco.
              ¿Impacto? Sin esta ruta, las URLs incorrectas renderizarían nada. */}
          <Route
            path="*"
            element={
              <Layout>
                <div className="min-h-[60vh] flex items-center justify-center">
                  <p className="text-gray-500 dark:text-slate-400 text-sm">
                    404 — Pagina no encontrada
                  </p>
                </div>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
