/**
 * Archivo: hooks/useAuth.ts
 * Descripción: Hook personalizado para acceder al contexto de autenticación.
 * ¿Para qué? Abstraer el acceso a AuthContext y proporcionar un error claro
 *   si el hook se usa fuera del AuthProvider.
 * ¿Impacto? Sin este hook los componentes tendrían que usar useContext(AuthContext)
 *   directamente y manejar el caso undefined — este hook lo centraliza.
 */

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextValue } from '@/context/AuthContext';

// ¿Qué? Hook que retorna el valor del AuthContext.
// ¿Para qué? Proveer un acceso typesafe y con error descriptivo al estado de auth.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }

  return context;
}
