# Patrones Arquitectónicos — NN Auth System (Express Edition)

## 1. Patrón MVC Adaptado — Router/Controller/Service/DB

Este proyecto implementa una variante de MVC adaptada para APIs REST con Express:

```
MVC Clásico          →    Express Adaptation
─────────────────────────────────────────────
Model                →    DB Schema (Drizzle) + Service
View                 →    JSON Response (no hay "vista" HTML)
Controller           →    Controller + Router
```

### Flujo completo

```
HTTP Request
    │
    ▼
[Router]         → Define la ruta, aplica middlewares (auth, validate, rate-limit)
    │
    ▼
[Controller]     → Extrae datos de req (body, params, user)
    │               Llama al service correspondiente
    │               Construye y envía la respuesta HTTP
    ▼
[Service]        → Contiene TODA la lógica de negocio
    │               Orquesta llamadas a la BD, utils, email
    │               Lanza errores tipados ante condiciones inválidas
    ▼
[DB / Drizzle]   → Consultas type-safe a PostgreSQL
                    Retorna tipos inferidos del schema
```

### Ejemplo concreto — Registro de usuario

```typescript
// auth.router.ts — define ruta + middlewares
router.post('/register', validate(registerSchema), authController.register);

// auth.controller.ts — thin layer HTTP
export const register = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.registerUser(req.body);
  res.status(201).json(user);
};

// auth.service.ts — lógica de negocio
export async function registerUser(data: RegisterInput): Promise<UserResponse> {
  const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) });
  if (existing) throw new ConflictError('Email already registered');
  const hashedPassword = await hashPassword(data.password);
  const [user] = await db.insert(users).values({ ...data, hashedPassword }).returning();
  return toUserResponse(user);
}
```

**Beneficio educativo**: cada capa tiene una sola responsabilidad. Si hay un bug de negocio, buscar en el service. Si es HTTP, en el controller. Si es de ruta, en el router.

---

## 2. Patrón Middleware Chain (Express)

Express procesa cada request a través de una cadena de middlewares. Cada middleware puede:
- Modificar `req` o `res`
- Llamar `next()` para pasar al siguiente
- Terminar el ciclo (enviar respuesta)
- Llamar `next(error)` para delegar al error handler

```
Request → helmet → cors → json → rateLimit → validate → authMiddleware → controller → errorHandler → Response
```

```typescript
// ¿Qué? Middleware de validación genérico con zod.
// ¿Para qué? Centralizar la validación de inputs en un solo lugar reutilizable.
// ¿Impacto? Si se omite, los datos del cliente llegan sin validar al service.
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError(result.error));
      return;
    }
    req.body = result.data; // datos ya validados y transformados
    next();
  };
}
```

---

## 3. Patrón Repository (implícito en Drizzle)

Aunque no se implementa explícitamente una capa Repository, Drizzle ORM actúa como tal: abstrae el acceso a la BD con una API type-safe que evita SQL crudo disperso por el código.

```typescript
// Acceso centralizado a la BD a través de Drizzle
const user = await db.query.users.findFirst({
  where: eq(users.email, email),
});

// vs SQL crudo disperso (anti-pattern)
const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

---

## 4. Patrón Context/Provider (React)

El estado de autenticación se gestiona con el patrón Context/Provider de React:

```
AuthProvider (en App.tsx)
    │
    │  Provee: { user, accessToken, login, logout, register }
    │
    ├── LandingPage (no usa auth)
    ├── LoginPage → useAuth() → login()
    ├── RegisterPage → useAuth() → register()
    └── DashboardPage (protegida) → useAuth() → user
```

```typescript
// AuthContext.tsx — define el contexto y su tipo
const AuthContext = createContext<AuthContextType | null>(null);

// useAuth.ts — hook que consume el contexto con validación
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

**Beneficio**: evita "prop drilling" (pasar props de autenticación por cada nivel del árbol de componentes).

---

## 5. Patrón Error Handling Centralizado

Todos los errores se lanzan como instancias de clases tipadas y se capturan en un único middleware global:

```typescript
// Jerarquía de errores tipados
class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) { super(message); }
}

class ValidationError extends AppError { /* 400 */ }
class UnauthorizedError extends AppError { /* 401 */ }
class ForbiddenError extends AppError { /* 403 */ }
class NotFoundError extends AppError { /* 404 */ }
class ConflictError extends AppError { /* 409 */ }

// error.middleware.ts — captura TODOS los errores
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }
  // Error no anticipado
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
}
```

**Beneficio**: los controllers y services solo lanzan errores — no manejan la respuesta HTTP. El handler centralizado garantiza formato consistente.

---

## 6. Patrón DTO / Response Shape

Los datos que salen de la BD nunca se retornan directamente. Se transforman a un DTO (Data Transfer Object) que excluye campos sensibles:

```typescript
// ¿Qué? Transforma un User de BD a UserResponse sin hashed_password.
// ¿Para qué? Nunca exponer el hash de contraseña en respuestas HTTP.
// ¿Impacto? Si se retorna el registro completo, el hash queda expuesto.
export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // hashedPassword: user.hashedPassword  ← NUNCA incluir
  };
}
```

---

## 7. Comparación con el Proyecto Original (FastAPI)

| Aspecto | FastAPI (Python) | Express (Node.js) |
|---|---|---|
| Validación | Pydantic (decoradores) | zod + middleware validate |
| Routing | Decoradores `@router.post` | `router.post()` explícito |
| Inyección de dependencias | `Depends()` de FastAPI | Argumentos de función / middleware |
| ORM | SQLAlchemy 2.0 | Drizzle ORM |
| Migraciones | Alembic | drizzle-kit |
| Async | `async def` nativo | `async/await` nativo |
| Documentación API | Swagger UI automático `/docs` | Manual (este archivo) |
| Testing | pytest + httpx | vitest + supertest |
| Pattern auth | Router → Service → CRUD | Router → Controller → Service → DB |
