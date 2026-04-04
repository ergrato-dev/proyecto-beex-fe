/**
 * Archivo: pages/LoginPage.tsx
 * Descripción: Página de inicio de sesión.
 * ¿Para qué? Permitir a usuarios registrados autenticarse con email y contraseña.
 * ¿Impacto? Es la puerta de entrada principal al sistema — un error aquí
 *   bloquea el acceso a todas las rutas protegidas.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Alert } from '@/components/ui/Alert';

interface FormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ¿Qué? Actualiza el campo correspondiente y limpia el error al escribir.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData);
      // ¿Qué? Redirigir al dashboard tras login exitoso.
      navigate('/dashboard');
    } catch (err) {
      // ¿Qué? Mensaje genérico — no revelar si el email existe (OWASP).
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* ─── Cabecera ─── */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Iniciar sesión
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </div>

        {/* ─── Formulario ─── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && <Alert type="error" message={error} />}

          <InputField
            id="email"
            name="email"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@empresa.com"
          />

          <InputField
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          {/* ¿Qué? Link de recuperación alineado a la derecha bajo el campo de contraseña. */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* ¿Qué? Botón de acción alineado a la derecha — regla del design system. */}
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isLoading}>
              Iniciar sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
