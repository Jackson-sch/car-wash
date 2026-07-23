# Contributing to WashMaster Pro

## Server Action Auth Patterns

All server actions (`src/lib/actions/*.ts`) must include auth/business-logic guards. This document describes the patterns used throughout the codebase.

---

### Pattern 1: Authenticated Actions (most common)

For actions that require a logged-in user with specific permissions, use `getSessionOrThrow()` from `./servicios`:

```typescript
"use server";

import { getSessionOrThrow } from "./servicios";
import { revalidatePath } from "next/cache";

export async function createServicio(data: ServicioData) {
  try {
    const session = await getSessionOrThrow({
      modulo: "servicios",
      accion: "gestionar",
    });
    const sucursalId = session.user.sucursalId!;

    // ... business logic scoped to sucursalId ...
  } catch (error) {
    return { success: false, error: "..." };
  }
}
```

**Key rules:**
- Always destructure `session.user.sucursalId` for data scoping
- All DB queries must filter by `sucursalId` to prevent cross-branch access
- Use `revalidatePath`/`revalidateTag` after mutations
- Return `{ success, data }` or `{ success, error }` — never throw to the client

**Available permission modules** (defined in `src/lib/auth/permissions.ts`):

| Module | Acciones disponibles |
|---|---|
| `clientes` | `ver`, `crear`, `editar`, `eliminar` |
| `ordenes` | `ver`, `crear`, `asignar`, `cambiarEstado`, `cancelar` |
| `servicios` | `ver`, `gestionar` |
| `caja` | `abrir`, `cerrar`, `ver` |
| `inventario` | `ver`, `gestionar` |
| `reportes` | `ver`, `exportar` |
| `empleados` | `ver`, `gestionar` |
| `paquetes` | `ver`, `gestionar` |
| `configuracion` | `ver`, `gestionar` |

Omit the permission parameter when only session validation is needed:
```typescript
const session = await getSessionOrThrow(); // Just checks logged in
```

---

### Pattern 2: Super Admin Only

For superadmin-restricted actions (plan management, platform config, multi-tenant ops):

```typescript
"use server";

import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";

async function verifySuperAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.rol !== "superadmin") {
    throw new Error("No autorizado.");
  }
  return session;
}

export async function createPlan(data: PlanData) {
  try {
    const session = await verifySuperAdminSession();
    // ...
  } catch (error) {
    return { success: false, error: "..." };
  }
}
```

**Key rules:**
- Always the same `verifySuperAdminSession()` helper
- Throw on failure, catch in the exported function
- Log audit entries via `logAudit()` for all mutations

---

### Pattern 3: Public-Facing Actions (rare)

For actions that must be callable without authentication (e.g., customer feedback form):

```typescript
"use server";

import { evaluacionLimiter, globalLimiter, getClientIp } from "./rate-limit";

export async function guardarEvaluacionCSAT(params: EvaluacionParams) {
  try {
    // 1. Validate input
    // 2. Business-logic guard (e.g., order must be completed)
    // 3. Rate limiting per key (ticket + IP)
    const ipLimit = globalLimiter.check(`ip:${clientIp}`);
    if (!ipLimit.allowed) {
      return { success: false, error: "Demasiadas solicitudes." };
    }
    // 4. Only then: DB read + mutation
  } catch (error) {
    return { success: false, error: "..." };
  }
}
```

**Key rules:**
- Must still have business-logic guards (valid order state, duplicate checks, etc.)
- Always apply rate limiting via `src/lib/actions/rate-limit.ts`
- Validate AND sanitize ALL inputs
- Fail fast: validate before any DB reads
- Track usage per unique key (ticket ID, IP address)

---

### Pattern 4: Read-Only Operational Checks (rare)

For public health-check or setup status endpoints:

```typescript
export async function checkSystemStatus() {
  // Read-only SELECT — no mutation
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usuarios);

  if (count > 0) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { hasUsers: true }; // Don't leak details
  }
  return { hasUsers: count > 0 };
}
```

**Key rules:**
- READ-ONLY only — no `.insert()`, `.update()`, `.delete()`
- Never leak internal state to unauthenticated callers
- Still rate-limit if called frequently

---

### Rate Limiter Utility

Located in `src/lib/actions/rate-limit.ts`:

```typescript
import { evaluacionLimiter, globalLimiter, getClientIp } from "./rate-limit";

const myLimiter = createRateLimiter({
  max: 5,
  windowMs: 60_000,  // 5 requests per minute
  name: "my-action",
});

const result = myLimiter.check("some-key");
// → { allowed: boolean, limit: number, remaining: number, reset: number }
```

Pre-built limiters:
- `evaluacionLimiter` — 3 req/hour per ticket (use for public feedback forms)
- `globalLimiter` — 20 req/min per IP (use as global throttle)

---

### Internal Helper Actions

Functions prefixed with `_` (e.g., `_getConfigGlobal`, `_getEmpresas`) are internal helpers that rely on their caller's auth context. They must NOT be exported directly — only called from auth-guarded functions.

---

### Checklist for New Server Actions

- [ ] Does this action need auth? → Use Pattern 1 or 2
- [ ] Is it truly public-facing? → Use Pattern 3 + rate limiter
- [ ] Is it read-only? → Use Pattern 4
- [ ] Are all DB queries scoped by `sucursalId`?
- [ ] Are we calling `revalidatePath` / `revalidateTag` after mutations?
- [ ] Are we returning `{ success, data }` or `{ success, error }`?
- [ ] Are audit logs needed for superadmin actions? (use `logAudit()`)

---

### Code Style

- All server actions files are in `src/lib/actions/`
- Use `"use server"` directive at the top
- Catch errors and return structured responses — never let exceptions propagate
- Prefer `import { getSessionOrThrow } from "./servicios"` over calling `auth.api.getSession` directly
- Use `import { getErrorMessage } from "./action-utils"` for error messages
