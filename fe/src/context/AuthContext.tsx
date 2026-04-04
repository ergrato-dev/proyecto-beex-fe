/**
 * Archivo: context/AuthContext.tsx
 * Descripción: Contexto global de autenticación — estado del usuario y tokens JWT.
 * ¿Para qué? Compartir el estado de autenticación (usuario, tokens, loading) en
 *   toda la aplicación sin necesidad de prop drilling.
 * ¿Impacto? Sin este contexto cada componente tendría que leer localStorage
 *   directamente y manejar su propio estado de auth — imposible de mantener.
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '@/api/auth';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth';

// ¿Qué? Tipo del valor que provee el contexto.
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

// ¿Qué? El contexto en sí — inicialmente undefined para detectar usos fuera del Provider.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ¿Qué? Props del Provider — solo necesita los hijos que va a envolver.
interface AuthProviderProps {
  children: ReactNode;
}

// ¿Qué? Provider que mantiene el estado de autenticación y lo expone al árbol.
// ¿Para qué? Envuelve toda la app en main.tsx para que cualquier componente
//   pueda acceder a user, login, logout, etc. mediante el hook useAuth.
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ¿Qué? Al cargar la app, verificar si hay un token guardado e intentar cargar el perfil.
  // ¿Para qué? Restaurar la sesión del usuario si ya se había autenticado antes.
  // ¿Impacto? Sin esto el usuario tiene que re-iniciar sesión cada vez que refresca la página.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .getMe()
      .then(setUser)
      .catch(() => {
        // ¿Qué? Si el token expiró o es inválido, limpiar el storage.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ¿Qué? Función de login — guarda tokens y carga el perfil del usuario.
  const login = useCallback(async (data: LoginRequest) => {
    const tokens = await authApi.login(data);
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    const profile = await authApi.getMe();
    setUser(profile);
  }, []);

  // ¿Qué? Función de registro — registra, hace login automático y carga el perfil.
  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data);
    await login({ email: data.email, password: data.password });
  }, [login]);

  // ¿Qué? Función de logout — elimina tokens y resetea el estado.
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
