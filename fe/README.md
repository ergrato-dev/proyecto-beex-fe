# ⚛️ Frontend — React + Vite + TypeScript

<!--
  ¿Qué? Guía pedagógica completa del frontend del sistema NN Auth.
  ¿Para qué? Que cualquier aprendiz entienda cada archivo, cada decisión
    de diseño y cada patrón de React aplicado — sin necesidad de adivinar.
  ¿Impacto? Un frontend bien documentado permite a nuevos colaboradores
    contribuir con confianza y aprender buenas prácticas de React moderno.
-->

> **Tecnologías:** React 19 · Vite 8 · TypeScript 5 · TailwindCSS 4 · React Router 7 · Axios

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#1-prerrequisitos)
2. [Estructura de carpetas](#2-estructura-de-carpetas)
3. [Instalación](#3-instalación)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Configuración Vite — `vite.config.ts`](#5-configuración-vite--viteconfigts)
6. [Configuración TypeScript — `tsconfig.app.json`](#6-configuración-typescript--tsconfigappjson)
7. [Estilos globales — `index.css` (TailwindCSS v4)](#7-estilos-globales--indexcss-tailwindcss-v4)
8. [Punto de entrada — `main.tsx`](#8-punto-de-entrada--maintsx)
9. [Componente raíz — `App.tsx`](#9-componente-raíz--apptsx)
10. [Tipos TypeScript — `types/auth.ts`](#10-tipos-typescript--typesauthts)
11. [Capa API — `api/axios.ts` y `api/auth.ts`](#11-capa-api--apiaxiosts-y-apiauthts)
12. [Contexto global — `context/AuthContext.tsx`](#12-contexto-global--contextauthcontexttsx)
13. [Hooks — `useAuth` y `useTheme`](#13-hooks--useauth-y-usetheme)
14. [Componentes UI](#14-componentes-ui)
15. [Componentes de Layout](#15-componentes-de-layout)
16. [Páginas](#16-páginas)
17. [Tests — Vitest + Testing Library](#17-tests--vitest--testing-library)
18. [Comandos disponibles](#18-comandos-disponibles)
19. [Glosario](#19-glosario)

---

## 1. Prerrequisitos

| Herramienta | Versión | Verificar con    |
| ----------- | ------- | ---------------- |
| Node.js     | 20 LTS+ | `node --version` |
| pnpm        | 9+      | `pnpm --version` |

El backend (`be/`) debe estar ejecutándose en `http://localhost:3000`.

---

## 2. Estructura de carpetas

```
fe/
├── index.html                 # HTML base de Vite — único archivo HTML
├── package.json               # Dependencias y scripts (versiones exactas, pnpm)
├── vite.config.ts             # Vite + React + TailwindCSS v4 + Vitest
├── tsconfig.json              # Configuración raíz TypeScript
├── tsconfig.app.json          # Configuración TypeScript para la app (strict)
├── tsconfig.node.json         # Configuración TypeScript para vite.config.ts
├── .env.example               # Plantilla de variables de entorno
├── .env                       # Variables reales (NO versionado en git)
└── src/
    ├── main.tsx               # Monta React en el DOM — punto de entrada
    ├── App.tsx                # Router + providers + todas las rutas
    ├── index.css              # TailwindCSS v4 + dark mode setup
    │
    ├── types/
    │   └── auth.ts            # Interfaces del dominio: User, AuthTokens, requests…
    │
    ├── api/
    │   ├── axios.ts           # Instancia Axios + interceptor JWT
    │   └── auth.ts            # Funciones para cada endpoint de la API
    │
    ├── context/
    │   └── AuthContext.tsx    # Estado global: user, isAuthenticated, login, logout
    │
    ├── hooks/
    │   ├── useAuth.ts         # Accede al AuthContext de forma segura
    │   └── useTheme.ts        # Gestiona dark/light mode con localStorage
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx         # Botón reutilizable con variantes (primary/ghost/etc)
    │   │   ├── InputField.tsx     # Input con label, helper text y estado de error
    │   │   ├── Alert.tsx          # Mensajes de éxito/error/info accesibles (role="alert")
    │   │   ├── ThemeToggle.tsx    # Toggle dark/light mode
    │   │   └── ProtectedRoute.tsx # Guarda rutas privadas — redirige si no autenticado
    │   └── layout/
    │       ├── Layout.tsx         # Wrapper: Navbar + {children} + Footer
    │       ├── Navbar.tsx         # Barra de navegación con links y ThemeToggle
    │       └── Footer.tsx         # Pie de página con links legales
    │
    ├── pages/
    │   ├── LandingPage.tsx        # Página pública — presentación del sistema (/)
    │   ├── LoginPage.tsx          # Formulario de login (/login)
    │   ├── RegisterPage.tsx       # Formulario de registro (/register)
    │   ├── DashboardPage.tsx      # Panel del usuario autenticado (/dashboard) 🔒
    │   ├── ChangePasswordPage.tsx # Cambio de contraseña (/change-password) 🔒
    │   ├── ForgotPasswordPage.tsx # Solicitar recuperación (/forgot-password)
    │   ├── ResetPasswordPage.tsx  # Restablecer contraseña con token (/reset-password)
    │   ├── ContactPage.tsx        # Formulario de contacto (/contacto)
    │   ├── TerminosDeUsoPage.tsx  # Términos de uso (/terminos-de-uso)
    │   ├── PoliticaPrivacidadPage.tsx # Política de privacidad (/politica-privacidad)
    │   └── PoliticaCookiesPage.tsx    # Política de cookies (/politica-cookies)
    │
    └── __tests__/
        ├── setup.ts                   # Setup global — jest-dom matchers
        ├── components/
        │   ├── Alert.test.tsx         # 6 tests
        │   ├── Button.test.tsx        # 9 tests
        │   ├── InputField.test.tsx    # 7 tests
        │   └── ProtectedRoute.test.tsx # 3 tests
        ├── hooks/
        │   └── useAuth.test.tsx       # 2 tests
        ├── context/
        │   └── AuthContext.test.tsx   # 6 tests
        └── pages/
            ├── LoginPage.test.tsx         # 7 tests
            ├── RegisterPage.test.tsx      # 6 tests
            ├── ForgotPasswordPage.test.tsx # 5 tests
            └── ResetPasswordPage.test.tsx  # 7 tests
```

Total: **58 tests** en 10 archivos.

---

## 3. Instalación

```bash
cd fe

# Instalar todas las dependencias
pnpm install

# Verificar que el frontend compila y arranca
pnpm dev
# → ✅ Local: http://localhost:5173
```

> ⚠️ **Siempre** usar `pnpm`. Nunca `npm install`.

---

## 4. Variables de entorno

Vite expone variables de entorno al frontend mediante el prefijo **`VITE_`**.

```bash
cp .env.example .env
```

Contenido de `.env.example`:

```bash
# URL base de la API del backend
# ¿Para qué? Permite cambiar de http://localhost:3000 a la URL de producción
#   sin modificar ningún archivo de código.
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

**Acceso en el código:**

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// → "http://localhost:3000/api/v1"
```

> ⚠️ **Importante:** Las variables `VITE_` son visibles en el bundle del browser.
> **Nunca** poner secrets, claves de API ni contraseñas en variables `VITE_`.
> Solo URLs y configuración no sensible.

---

## 5. Configuración Vite — `vite.config.ts`

**Archivo:** `vite.config.ts`

```typescript
import { defineConfig } from 'vitest/config'; // ← usa vitest/config, no vite/config
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),         // Fast Refresh + JSX transform
    tailwindcss(),   // TailwindCSS v4 integrado en el pipeline de Vite
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), // "@/components/..." → "src/components/..."
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true, // describe, it, expect sin imports
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 70, functions: 70 },
    },
  },
});
```

**¿Por qué `vitest/config` en vez de `vite/config`?**

Al importar desde `vitest/config`, Vite tiene acceso al tipo `test` dentro de
`defineConfig` sin errores de TypeScript. Si se usara `vite/config`, la clave
`test` no existiría en el tipo y habría que usar overrides o `as any`.

**¿Por qué el alias `@/`?**

```typescript
// ❌ Sin alias — frágil ante refactors
import { Button } from '../../../components/ui/Button';

// ✅ Con alias — siempre correcto sin importar la profundidad
import { Button } from '@/components/ui/Button';
```

---

## 6. Configuración TypeScript — `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
  }
}
```

- **`strict: true`** — Habilita todas las verificaciones de TypeScript. Sin esto,
  `null` y `undefined` no se detectan en tiempo de compilación.
- **`"types": [..., "vitest/globals"]`** — Hace disponibles `describe`, `it`, `expect`
  sin necesidad de importarlos en cada test (funciona junto con `globals: true` en vitest).
- **`"types": [..., "@testing-library/jest-dom"]`** — Habilita matchers como
  `toBeInTheDocument()`, `toHaveValue()`, etc. en TypeScript.

---

## 7. Estilos globales — `index.css` (TailwindCSS v4)

**Archivo:** `src/index.css`

```css
/* Importar TailwindCSS v4 completo */
@import "tailwindcss";

/*
 * Dark mode basado en la clase .dark en <html> — no en prefers-color-scheme.
 * Permite que el usuario controle el tema con el ThemeToggle.
 */
@custom-variant dark (&:where(.dark, .dark *));

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
```

**TailwindCSS v4 — diferencias clave vs v3:**

| Aspecto               | TailwindCSS v3                              | TailwindCSS v4                                   |
| --------------------- | ------------------------------------------- | ------------------------------------------------ |
| Importación           | `@tailwind base/components/utilities`       | `@import "tailwindcss"` (una sola línea)         |
| Config dark mode      | `darkMode: 'class'` en `tailwind.config.js` | `@custom-variant dark` en CSS                    |
| Plugin Vite           | PostCSS manual                              | `@tailwindcss/vite` directo                      |
| Archivo de config     | `tailwind.config.js` necesario              | No se necesita para config básica                |

**¿Cómo funciona el dark mode?**

Cuando el usuario hace click en `ThemeToggle`, el hook `useTheme` añade o quita
la clase `dark` en `document.documentElement` (`<html>`). TailwindCSS aplica los
estilos con prefijo `dark:` solo cuando ese elemento tiene la clase `dark`.

---

## 8. Punto de entrada — `main.tsx`

**Archivo:** `src/main.tsx`

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

**`StrictMode`:**
React 19 mantiene `StrictMode` para detectar efectos secundarios inesperados.
En desarrollo, los componentes se montan dos veces para exponer bugs de `useEffect`
que no limpian correctamente sus suscripciones. En producción, solo se montan una vez.

---

## 9. Componente raíz — `App.tsx`

**Archivo:** `src/App.tsx`

```typescript
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Layout><LandingPage /></Layout>} />
          <Route path="/login" element={<Layout><LoginPage /></Layout>} />
          <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
          <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
          <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />

          {/* Rutas protegidas */}
          <Route path="/dashboard"
            element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>}
          />
          <Route path="/change-password"
            element={<ProtectedRoute><Layout><ChangePasswordPage /></Layout></ProtectedRoute>}
          />

          {/* Páginas legales y contacto */}
          <Route path="/terminos-de-uso" element={<Layout><TerminosDeUsoPage /></Layout>} />
          <Route path="/politica-privacidad" element={<Layout><PoliticaPrivacidadPage /></Layout>} />
          <Route path="/politica-cookies" element={<Layout><PoliticaCookiesPage /></Layout>} />
          <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />

          {/* 404 */}
          <Route path="*" element={<Layout><p>404 — Página no encontrada</p></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

**Jerarquía de envoltura:**
```
AuthProvider          ← estado de autenticación disponible globalmente
  BrowserRouter       ← historial de navegación (HTML5 History API)
    Routes            ← algoritmo de matching de rutas
      Route           ← monta el componente cuando la URL coincide
        ProtectedRoute  ← (solo rutas privadas) redirige si no autenticado
          Layout        ← Navbar + {children} + Footer
            Página      ← el componente de la página
```

---

## 10. Tipos TypeScript — `types/auth.ts`

**Archivo:** `src/types/auth.ts`

Define 9 interfaces que representan el dominio de autenticación:

| Interfaz                 | Uso                                                     |
| ------------------------ | ------------------------------------------------------- |
| `User`                   | Datos del usuario (sin contraseña)                      |
| `AuthTokens`             | `{ accessToken, refreshToken, tokenType }`              |
| `RegisterRequest`        | Body para `POST /auth/register`                         |
| `LoginRequest`           | Body para `POST /auth/login`                            |
| `RefreshTokenRequest`    | Body para `POST /auth/refresh`                          |
| `ChangePasswordRequest`  | Body para `POST /auth/change-password`                  |
| `ForgotPasswordRequest`  | Body para `POST /auth/forgot-password`                  |
| `ResetPasswordRequest`   | Body para `POST /auth/reset-password`                   |
| `ApiResponse<T>`         | Wrapper genérico `{ data: T, message?: string }`        |

**¿Por qué centralizar tipos?**

Si el backend cambia un campo (ej: `fullName` → `name`), TypeScript señala
**todos** los archivos que usan esa interfaz. Sin tipos centralizados, el bug
se descubriría en runtime, no en compilación.

---

## 11. Capa API — `api/axios.ts` y `api/auth.ts`

### `api/axios.ts` — Instancia configurada de Axios

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: inyecta el JWT en cada request automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**¿Qué es un interceptor de Axios?**

Es una función que Axios ejecuta **antes** de enviar cada request. El interceptor
de request aquí lee el token del `localStorage` y añade el header
`Authorization: Bearer <token>` automáticamente. Sin él, cada llamada a una ruta
protegida tendría que añadir el header manualmente.

### `api/auth.ts` — Funciones por endpoint

Cada función tiene una responsabilidad: un endpoint.

```typescript
export async function register(data: RegisterRequest): Promise<User> { ... }
export async function login(data: LoginRequest): Promise<AuthTokens> { ... }
export async function refreshToken(data: RefreshTokenRequest): Promise<AuthTokens> { ... }
export async function changePassword(data: ChangePasswordRequest): Promise<void> { ... }
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> { ... }
export async function resetPassword(data: ResetPasswordRequest): Promise<void> { ... }
export async function getMe(): Promise<User> { ... }
```

Los componentes **nunca** importan `axios` directamente. Si mañana se cambia Axios
por `fetch`, solo hay que modificar estos dos archivos — ningún componente cambia.

---

## 12. Contexto global — `context/AuthContext.tsx`

**Archivo:** `src/context/AuthContext.tsx`

React Context es el mecanismo nativo para **estado global** sin librerías externas.
Sin él, para pasar `user` de `App.tsx` a `DashboardPage.tsx` habría que atravesar
todos los componentes intermedios (Navbar, Layout…) mediante props — eso se llama
**prop drilling** y hace el código muy difícil de mantener.

```typescript
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}
```

**Restauración de sesión:**

```typescript
useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) { setIsLoading(false); return; }

  authApi.getMe()
    .then(setUser)
    .catch(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    })
    .finally(() => setIsLoading(false));
}, []);
```

Si el usuario tenía sesión activa y refresca el browser, el token sigue en
`localStorage`. Este `useEffect` lo detecta, llama a `/users/me` para verificar
que sigue siendo válido y restaura el estado sin que el usuario tenga que re-loguearse.

---

## 13. Hooks — `useAuth` y `useTheme`

### `useAuth`

```typescript
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return context;
}
```

**¿Por qué lanzar un error si no hay contexto?**

Si un componente usa `useAuth()` fuera del `<AuthProvider>`, el contexto sería
`undefined`. El error explícito guía directamente hacia la solución. Sin él,
el error sería _"Cannot read properties of undefined"_ — difícil de localizar.

### `useTheme`

```typescript
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return { isDark, toggleTheme };
}
```

**Inicialización lazy del estado:**

El `useState(() => { ... })` (con función) se ejecuta solo **una vez** al montar.
Primero respeta la preferencia guardada en `localStorage`, y si no hay ninguna,
usa la preferencia del sistema operativo (`prefers-color-scheme`).

---

## 14. Componentes UI

### `Button.tsx`

Botón reutilizable con variantes de estilo:

| Variante  | Uso                                  |
| --------- | ------------------------------------ |
| `primary` | Acción principal (guardar, login)    |
| `ghost`   | Acción secundaria (cancelar, volver) |
| `danger`  | Acciones destructivas                |
| `link`    | Navegación inline                    |

Extiende `React.ButtonHTMLAttributes<HTMLButtonElement>` para heredar todos los
atributos HTML nativos sin necesidad de declararlos uno a uno.

### `InputField.tsx`

Incluye `<label>` vinculado al `<input>` mediante `htmlFor`/`id`.
Sin el `<label>`, los lectores de pantalla no pueden identificar qué campo es
cada input (WCAG 2.1 AA — Criterio de éxito 1.3.1).

### `Alert.tsx`

Usa `role="alert"` para que los lectores de pantalla anuncien el mensaje
automáticamente al aparecer — parte del estándar ARIA.

Variantes disponibles: `success`, `error`, `info`, `warning`.

### `ThemeToggle.tsx`

Botón que alterna entre tema claro y oscuro usando el hook `useTheme`.
Incluye `aria-label="Toggle theme"` para accesibilidad.

### `ProtectedRoute.tsx`

```typescript
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
```

**¿Por qué `replace` en `Navigate`?**

Con `replace`, la redirección a `/login` no añade una nueva entrada al historial.
Sin él, si el usuario presiona "atrás" desde `/login`, volvería a `/dashboard`
(que lo redirigiría de nuevo a `/login` — loop infinito).

---

## 15. Componentes de Layout

### `Layout.tsx`

```typescript
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 ...">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

El patrón `flex flex-col` + `flex-1` en `<main>` garantiza que el footer siempre
esté al fondo de la pantalla — incluso en páginas con poco contenido.

### `Navbar.tsx`

Muestra diferentes links según el estado de autenticación:
- **No autenticado:** Inicio · Login · Registrarse
- **Autenticado:** Dashboard · Cambiar contraseña · Cerrar sesión

Incluye el `ThemeToggle` en ambos estados.

### `Footer.tsx`

Pie de página con links a páginas legales (Términos de uso, Privacidad, Cookies).

---

## 16. Páginas

| Ruta                   | Página                    | Auth | Descripción                                               |
| ---------------------- | ------------------------- | ---- | --------------------------------------------------------- |
| `/`                    | `LandingPage`             | No   | Presentación del sistema con CTAs de login y registro     |
| `/login`               | `LoginPage`               | No   | Formulario email + contraseña                             |
| `/register`            | `RegisterPage`            | No   | Formulario nombre, email, contraseña + confirmación       |
| `/forgot-password`     | `ForgotPasswordPage`      | No   | Solicitar email de recuperación                           |
| `/reset-password`      | `ResetPasswordPage`       | No   | Nueva contraseña (lee `?token=` del query param)          |
| `/dashboard`           | `DashboardPage`           | ✅   | Bienvenida al usuario, muestra nombre y email             |
| `/change-password`     | `ChangePasswordPage`      | ✅   | Contraseña actual + nueva contraseña + confirmación       |
| `/terminos-de-uso`     | `TerminosDeUsoPage`       | No   | Términos y condiciones de uso                             |
| `/politica-privacidad` | `PoliticaPrivacidadPage`  | No   | Política de privacidad de datos                           |
| `/politica-cookies`    | `PoliticaCookiesPage`     | No   | Política de uso de cookies                                |
| `/contacto`            | `ContactPage`             | No   | Formulario de contacto con campos básicos                 |

**Patrón común en páginas de formulario:**

```typescript
const [formData, setFormData] = useState({ email: '', password: '' });
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);
  try {
    await someApiCall(formData);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

**`ResetPasswordPage`** lee el token de la URL:

```typescript
const [searchParams] = useSearchParams();
const token = searchParams.get('token') ?? '';
// El link del email contiene: /reset-password?token=<uuid>
```

---

## 17. Tests — Vitest + Testing Library

**Directorio:** `src/__tests__/`

### Setup global (`setup.ts`)

```typescript
import '@testing-library/jest-dom';
// Añade matchers: toBeInTheDocument(), toHaveValue(), toBeDisabled()...
```

### Filosofía de tests

> **"Test behavior, not implementation"** — probar qué ve y qué puede hacer el usuario,
> no los detalles internos de cómo se implementó el componente.

```typescript
// ✅ CORRECTO — prueba lo que el usuario ve
expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

// ❌ INCORRECTO — prueba detalles de implementación
expect(component.state.isLoading).toBe(false);
```

### Ejemplo: test de LoginPage

```typescript
describe('LoginPage', () => {
  it('renders login form with email and password fields', () => {
    render(<LoginPage />, { wrapper: TestWrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginPage />, { wrapper: TestWrapper });
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
```

### Test de seguridad (OWASP A07 — anti-enumeración)

`ForgotPasswordPage` incluye un test que verifica que el mensaje de éxito es
genérico — no revela si el email existe o no en la BD:

```typescript
it('shows generic success message regardless of email existence', async () => {
  vi.mocked(authApi.forgotPassword).mockResolvedValue(undefined);
  render(<ForgotPasswordPage />, { wrapper: TestWrapper });
  await userEvent.type(screen.getByLabelText(/email/i), 'nonexistent@example.com');
  await userEvent.click(screen.getByRole('button', { name: /send/i }));
  const alert = await screen.findByRole('alert');
  expect(alert.textContent).not.toMatch(/not found|doesn't exist|no account/i);
});
```

### Resumen de tests

| Archivo                              | Tests | Qué prueba                                      |
| ------------------------------------ | ----- | ----------------------------------------------- |
| `components/Alert.test.tsx`          | 6     | Variantes, dismiss, role="alert"                |
| `components/Button.test.tsx`         | 9     | Variantes, isLoading, disabled                  |
| `components/InputField.test.tsx`     | 7     | Label, error, helperText, aria                  |
| `components/ProtectedRoute.test.tsx` | 3     | Redirige sin auth, muestra children con auth    |
| `hooks/useAuth.test.tsx`             | 2     | Error fuera de Provider, acceso con Provider    |
| `context/AuthContext.test.tsx`       | 6     | login, register, logout, restauración de sesión |
| `pages/LoginPage.test.tsx`           | 7     | Render, submit, error handling, loading state   |
| `pages/RegisterPage.test.tsx`        | 6     | Render, validación, submit, error               |
| `pages/ForgotPasswordPage.test.tsx`  | 5     | Submit, éxito genérico, error                   |
| `pages/ResetPasswordPage.test.tsx`   | 7     | Token de URL, submit, confirm password          |
| **Total**                            | **58**| —                                               |

---

## 18. Comandos disponibles

```bash
# Iniciar el servidor de desarrollo con hot-reload
pnpm dev
# → http://localhost:5173

# Compilar para producción (TypeScript + Vite bundle)
pnpm build

# Previsualizar el build de producción localmente
pnpm preview

# Ejecutar todos los tests
pnpm test

# Ejecutar tests en modo watch interactivo
pnpm test:watch

# Ejecutar tests con reporte de cobertura
pnpm test:coverage

# Verificar errores TypeScript sin generar archivos
pnpm typecheck

# Ejecutar ESLint
pnpm lint

# Verificar formato con Prettier (sin modificar)
pnpm format:check

# Aplicar formato con Prettier
pnpm format
```

---

## 19. Glosario

| Término             | Definición                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| **SPA**             | _Single Page Application_ — se carga una vez; la navegación no recarga la página               |
| **Vite**            | Bundler moderno ultra-rápido para desarrollo y producción con ES modules nativos                |
| **Hot Reload**      | Actualiza componentes modificados en el browser sin recargar la página completa                 |
| **JSX / TSX**       | Extensión de sintaxis que permite escribir HTML dentro de TypeScript                            |
| **Context API**     | Mecanismo nativo de React para compartir estado sin prop drilling                              |
| **Prop drilling**   | Anti-patrón: pasar props a través de múltiples capas de componentes intermedios                 |
| **Custom Hook**     | Función que empieza con `use` y encapsula lógica de React reutilizable                          |
| **Interceptor**     | Función que modifica requests/responses de Axios antes/después de que se envíen                 |
| **ProtectedRoute**  | Componente que verifica auth y redirige a `/login` si el usuario no está autenticado            |
| **TailwindCSS**     | Framework CSS utility-first — clases atómicas en lugar de CSS personalizado                    |
| **Dark mode**       | Tema visual oscuro — activado añadiendo la clase `dark` a `<html>`                             |
| **ARIA**            | _Accessible Rich Internet Applications_ — atributos HTML para accesibilidad (role, aria-label) |
| **WCAG**            | _Web Content Accessibility Guidelines_ — estándar de accesibilidad web (objetivo: AA)          |
| **jsdom**           | Implementación de DOM en Node.js — permite tests de componentes React sin browser real          |
| **Testing Library** | Utilities para testear componentes desde la perspectiva del usuario                            |
| **Vitest**          | Test runner moderno compatible con Vite — misma config, mismo pipeline de transformación        |
| **useSearchParams** | Hook de React Router para leer/escribir query params (`?token=...`) de la URL                  |
| **Fast Refresh**    | HMR de React — recarga solo el componente modificado preservando el estado del resto            |
```
