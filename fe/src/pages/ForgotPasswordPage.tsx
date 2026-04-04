/**
 * Archivo: pages/ForgotPasswordPage.tsx
 * Descripción: Página para solicitar el email de recuperación de contraseña.
 * ¿Para qué? Iniciar el flujo de reset enviando un enlace al email del usuario.
 * ¿Impacto? La respuesta siempre es genérica (200 OK) para no revelar si el email
 *   está registrado — protección contra enumeración de usuarios (OWASP A07).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authApi from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { Alert } from '@/components/ui/Alert';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes('@')) {
      setEmailError('Ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
      // ¿Qué? Siempre marcamos como enviado, sin importar si el email existe.
      // ¿Para qué? No revelar al atacante si el email está registrado en el sistema.
      setSubmitted(true);
    } catch {
      // ¿Qué? Incluso con error del servidor, mostrar el mensaje de éxito.
      // ¿Para qué? Mismo motivo — consistencia en la respuesta al usuario.
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Alert
            type="success"
            message="Si tu correo está registrado, recibirás un enlace de recuperación en breve. Revisa también tu carpeta de spam."
          />
          <div className="mt-4 flex justify-end">
            <Link
              to="/login"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu
            contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <InputField
            id="email"
            name="email"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={handleChange}
            placeholder="tu@empresa.com"
            error={emailError}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Link to="/login">
              <Button type="button" variant="secondary">
                Volver
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading}>
              Enviar enlace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
