/**
 * Archivo: hooks/useTheme.ts
 * Descripción: Hook para gestionar el tema claro/oscuro del sistema.
 * ¿Para qué? Sincronizar la clase .dark en <html> con la preferencia del usuario
 *   y guardarla en localStorage para que persista entre sesiones.
 * ¿Impacto? Sin este hook el tema se resetea a claro cada vez que el usuario
 *   recarga la página, creando una mala experiencia.
 */

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

// ¿Qué? Hook que controla el tema claro/oscuro de la aplicación.
export function useTheme() {
  // ¿Qué? Inicializar desde localStorage o desde la preferencia del sistema.
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // ¿Qué? Aplicar la clase .dark en <html> cada vez que cambie el tema.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return { theme, toggleTheme };
}
