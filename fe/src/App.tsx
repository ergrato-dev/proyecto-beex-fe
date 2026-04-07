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
    // AuthProvider envuelve todo para que cualquier componente pueda usar useAuth().
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/" element={<Layout><LandingPage /></Layout>} />
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
          <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
          <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />
          {/* /verify-email?token=xxx — enlace del email de activación de cuenta */}
          <Route path="/verify-email" element={<Layout><VerifyEmailPage /></Layout>} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>}
          />
          <Route
            path="/change-password"
            element={<ProtectedRoute><Layout><ChangePasswordPage /></Layout></ProtectedRoute>}
          />

          {/* Paginas legales y contacto */}
          <Route path="/terminos-de-uso" element={<Layout><TerminosDeUsoPage /></Layout>} />
          <Route path="/politica-privacidad" element={<Layout><PoliticaPrivacidadPage /></Layout>} />
          <Route path="/politica-cookies" element={<Layout><PoliticaCookiesPage /></Layout>} />
          <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />

          {/* 404 */}
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
