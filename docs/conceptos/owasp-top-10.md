# OWASP Top 10 (2021) — Implementación en NN Auth System

## ¿Qué es OWASP?

OWASP (Open Worldwide Application Security Project) es una organización sin ánimo de lucro que publica estándares y guías de seguridad para aplicaciones web. El **OWASP Top 10** es la lista de las 10 vulnerabilidades más críticas y comunes, actualizada periódicamente.

Este documento describe cómo el NN Auth System aborda cada una de estas vulnerabilidades.

---

## A01 — Broken Access Control (Control de Acceso Roto)

**¿Qué es?** Los usuarios pueden actuar fuera de sus permisos: acceder a datos de otros, modificar recursos sin autorización, o realizar acciones de admin sin serlo.

**Implementación en este proyecto:**

- Middleware `auth.middleware.ts` verifica el JWT en cada ruta protegida
- El endpoint `GET /api/v1/users/me` solo retorna los datos del usuario del token — nunca permite pasar un `id` externo
- Rutas protegidas no son accesibles sin token válido (401)
- Sin roles avanzados en este proyecto; si se añaden, deben verificarse en el service layer

```typescript
// ✅ El usuario solo puede ver SUS propios datos
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  // req.user.id viene del JWT verificado — no del body/params
  const user = await getUserById(req.user.id);
  res.json(user);
}
```

---

## A02 — Cryptographic Failures (Fallos Criptográficos)

**¿Qué es?** Datos sensibles expuestos por cifrado débil, ausente, o mal implementado. Contraseñas en texto plano, tokens predecibles, comunicación sin TLS.

**Implementación en este proyecto:**

- Contraseñas hasheadas con **bcrypt** (factor de costo 12) — nunca texto plano
- JWT firmados con secretos de mínimo 32 caracteres en variables de entorno
- Algoritmo HS256 para JWT
- En producción: HTTPS obligatorio (TLS termination en el servidor/proxy)
- Tokens de reset: UUID v4 — suficientemente aleatorios

```typescript
// ✅ Hash bcrypt con factor de costo 12
export async function hashPassword(password: string): Promise<string> {
  const SALT_ROUNDS = 12;
  return bcrypt.hash(password, SALT_ROUNDS);
}
```

---

## A03 — Injection (Inyección)

**¿Qué es?** El atacante introduce código malicioso (SQL, comandos OS, etc.) que la aplicación ejecuta. La inyección SQL es la más común.

**Implementación en este proyecto:**

- **Prisma ORM** genera consultas parametrizadas automáticamente — nunca SQL crudo con interpolación de strings
- **zod** valida y sanitiza todos los inputs antes de que lleguen al service o la BD
- No se usa `eval()` ni interpolación directa de datos del usuario

```typescript
// ✅ Prisma ORM — consulta parametrizada automática
const user = await db.user.findUnique({
  where: { email }, // 'email' es parametrizado, no interpolado
});

// ❌ NUNCA hacer esto
const result = await pool.query(`SELECT * FROM users WHERE email = '${email}'`);
```

---

## A04 — Insecure Design (Diseño Inseguro)

**¿Qué es?** Falta de controles de seguridad desde el diseño. No se anticipan vectores de ataque en la arquitectura.

**Implementación en este proyecto:**

- Tokens de reset con expiración de 1 hora y marca `used = true` al utilizarse — no reutilizables
- Mensajes de error genéricos en auth (no revelan si el email existe)
- Separación clara de responsabilidades: router → controller → service → db
- Rate limiting en endpoints de autenticación

---

## A05 — Security Misconfiguration (Configuración de Seguridad Incorrecta)

**¿Qué es?** Configuraciones por defecto inseguras, puertos/servicios expuestos innecesariamente, cabeceras de seguridad ausentes.

**Implementación en este proyecto:**

- `helmet` configura automáticamente las cabeceras HTTP de seguridad:
  - `X-Frame-Options: DENY` — previene clickjacking
  - `X-Content-Type-Options: nosniff` — previene MIME sniffing
  - `Strict-Transport-Security` — fuerza HTTPS
  - `Content-Security-Policy` — restringe fuentes de recursos
- `cors` configurado con orígenes explícitos — nunca `origin: "*"` en producción
- Variables de entorno validadas con zod al inicio — la app no arranca con config incompleta

```typescript
// ✅ helmet con configuración estricta
app.use(helmet());

// ✅ cors con origen explícito
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));
```

---

## A06 — Vulnerable and Outdated Components (Componentes Vulnerables y Desactualizados)

**¿Qué es?** Usar librerías o frameworks con vulnerabilidades conocidas.

**Implementación en este proyecto:**

- Usar siempre versiones LTS/estables de Node.js (20 LTS)
- `pnpm audit` para escanear vulnerabilidades en dependencias
- Actualizar dependencias regularmente con `pnpm outdated`
- Preferir librerías con mantenimiento activo (bcryptjs, jsonwebtoken, zod)

```bash
# Verificar vulnerabilidades en dependencias
pnpm audit

# Ver dependencias desactualizadas
pnpm outdated
```

---

## A07 — Identification and Authentication Failures (Fallos de Identificación y Autenticación)

**¿Qué es?** Implementaciones débiles de autenticación: contraseñas débiles permitidas, sin bloqueo ante fuerza bruta, tokens predecibles.

**Implementación en este proyecto:**

- Validación de fortaleza de contraseña con zod (min. 8 chars, mayúscula, minúscula, número)
- `express-rate-limit`: máximo 10 intentos de login en 15 minutos por IP
- Access tokens de corta duración (15 min) para minimizar ventana de exposición
- Refresh tokens de 7 días — permiten renovación sin re-autenticación
- Mensajes de error genéricos en login (no revelan qué campo falló)
- Comparación de tiempo constante en login (mitiga timing attacks — ver abajo)

```typescript
// ✅ Rate limiting en endpoints de auth
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many attempts' } },
});

app.use('/api/v1/auth', authRateLimit);
```

**Timing attack en login — el mensaje genérico no es suficiente.**

Si el código busca el usuario y solo llama a `bcrypt.compare` cuando existe
(`if (!user || !(await verifyPassword(...)))`), el branch "usuario no existe"
responde en microsegundos mientras que "contraseña incorrecta" tarda lo que
tarda bcrypt (~60-100ms con cost 12). Un atacante puede medir esa diferencia
con Burp Repeater y enumerar usuarios válidos aunque el mensaje de error sea
idéntico en ambos casos — el mensaje no es la única señal que existe.

```typescript
// utils/security.ts — hash fijo sin usuario real detrás
export const DUMMY_PASSWORD_HASH = '$2b$12$...';

// modules/auth/auth.service.ts
const user = await db.query.users.findFirst({ where: eq(users.email, data.email) });

// ✅ Si el usuario no existe, igual se corre bcrypt contra DUMMY_PASSWORD_HASH —
//    ambos branches tardan lo mismo, no hay señal de timing que enumerar.
const isPasswordValid = await verifyPassword(data.password, user?.hashedPassword ?? DUMMY_PASSWORD_HASH);
if (!user || !isPasswordValid) {
  throw new UnauthorizedError('Credenciales inválidas.');
}
```

---

## A08 — Software and Data Integrity Failures (Fallos de Integridad de Software y Datos)

**¿Qué es?** La aplicación no verifica la integridad del código o los datos: dependencias sin verificar, actualizaciones automáticas sin validación, deserialización insegura.

**Implementación en este proyecto:**

- `pnpm-lock.yaml` fija versiones exactas de todas las dependencias
- JWT firmado con secreto — cualquier modificación del token lo invalida
- zod valida la estructura de los datos entrantes — nunca se confía en el shape de un objeto externo

---

## A09 — Security Logging and Monitoring Failures (Fallos en Registro y Monitoreo de Seguridad)

**¿Qué es?** Sin logs de eventos de seguridad, es imposible detectar ataques o forensics tras incidentes.

**Implementación en este proyecto (básica, educativa):**

- Los errores de autenticación deben loggearse (sin incluir la contraseña)
- El middleware de errores global registra todos los errores 5xx
- En producción: integrar logging estructurado (Winston, Pino) y alertas

```typescript
// ✅ Loggear eventos de seguridad sin datos sensibles
console.warn(`[AUTH] Failed login attempt for email: ${email} from IP: ${ip}`);
// ❌ NUNCA loggear contraseñas
// console.log(`[AUTH] Login failed: email=${email}, password=${password}`);
```

---

## A10 — Server-Side Request Forgery (SSRF)

**¿Qué es?** El servidor realiza peticiones HTTP a URLs controladas por el atacante, potencialmente accediendo a recursos internos.

**Implementación en este proyecto:**

- Este proyecto no realiza peticiones HTTP a URLs externas proporcionadas por el usuario
- El único cliente HTTP es nodemailer (hacia el servidor SMTP configurado en variables de entorno)
- En futuros desarrollos: validar y sanitizar cualquier URL proporcionada por el usuario antes de usarla en peticiones del servidor

---

## Resumen de Controles Implementados

| OWASP | Control principal | Librería/Herramienta |
|---|---|---|
| A01 | Auth middleware + JWT claims | jsonwebtoken |
| A02 | Bcrypt hashing + JWT signing | bcryptjs, jsonwebtoken |
| A03 | ORM parametrizado + validación | Prisma ORM, zod |
| A04 | Tokens con TTL + mensajes genéricos | Diseño del sistema |
| A05 | Security headers + CORS estricto | helmet, cors |
| A06 | Lockfile + auditoría periódica | pnpm audit |
| A07 | Rate limiting + contraseñas fuertes | express-rate-limit, zod |
| A08 | Lockfile + JWT signed | pnpm-lock.yaml, jsonwebtoken |
| A09 | Logging de eventos de auth | console / logger |
| A10 | Sin URLs de usuario en requests | Diseño del sistema |
