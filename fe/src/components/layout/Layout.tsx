/**
 * Archivo: components/layout/Layout.tsx
 * Descripción: Layout base que envuelve todas las páginas con Navbar y Footer.
 * ¿Para qué? Garantizar estructura consistente (header + main + footer) en
 *   todas las páginas sin repetir el código de estructura en cada una.
 * ¿Impacto? Sin este componente cada página tendría que importar y renderizar
 *   Navbar y Footer individualmente.
 */

import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    // ¿Qué? min-h-screen + flex-col garantiza que el footer siempre esté al fondo.
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
