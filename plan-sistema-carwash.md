# Plan completo del sistema Car Wash

> Stack: Next.js 16.2.7 · Better-Auth · nuqs · Supabase · TanStack Table · Recharts · shadcn/ui · pdfx + react-pdf-renderer · Drizzle ORM

---

## Tabla de contenido

1. [Visión general](#1-visión-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura del sistema](#3-arquitectura-del-sistema)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Base de datos — esquema completo](#5-base-de-datos--esquema-completo)
6. [Autenticación y roles (Better-Auth)](#6-autenticación-y-roles-better-auth)
7. [Módulos del sistema](#7-módulos-del-sistema)
   - 7.1 [Clientes](#71-clientes)
   - 7.2 [Vehículos](#72-vehículos)
   - 7.3 [Servicios y paquetes](#73-servicios-y-paquetes)
   - 7.4 [Órdenes](#74-órdenes)
   - 7.5 [Caja y pagos](#75-caja-y-pagos)
   - 7.6 [Empleados](#76-empleados)
   - 7.7 [Inventario](#77-inventario)
   - 7.8 [Reportes y métricas](#78-reportes-y-métricas)
   - 7.9 [Notificaciones](#79-notificaciones)
   - 7.10 [Configuración](#710-configuración)
8. [Frontend — páginas y componentes](#8-frontend--páginas-y-componentes)
9. [Generación de PDFs (pdfx + react-pdf-renderer)](#9-generación-de-pdfs-pdfx--react-pdf-renderer)
10. [Estado global y URL state (nuqs)](#10-estado-global-y-url-state-nuqs)
11. [Validaciones (Zod)](#11-validaciones-zod)
12. [Infraestructura y despliegue](#12-infraestructura-y-despliegue)
13. [Variables de entorno](#13-variables-de-entorno)
14. [Hoja de ruta de desarrollo](#14-hoja-de-ruta-de-desarrollo)

---

## 1. Visión general

Sistema de gestión integral para un negocio de car wash. Permite registrar clientes y vehículos, crear y seguir órdenes de servicio en tiempo real, cobrar, generar reportes y exportar documentos PDF (tickets, facturas, cortes de caja). Soporta múltiples sucursales y roles de usuario.

### Actores del sistema

| Actor | Descripción |
|---|---|
| **Admin** | Acceso total: configuración, reportes globales, gestión de usuarios |
| **Supervisor** | Gestiona órdenes, empleados y reportes de su sucursal |
| **Cajero** | Crea órdenes, cobra y ve historial del turno |
| **Lavador** | Ve y actualiza el estado de sus órdenes asignadas |

---

## 2. Stack tecnológico

### Frontend
| Librería | Versión | Uso |
|---|---|---|
| Next.js | 16.2.7 | App Router, Server Components, Route Handlers |
| React | 19.x | UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 4.x | Estilos utilitarios |
| shadcn/ui | latest | Componentes base (Dialog, Sheet, Form, Table, etc.) |
| TanStack Table | v8 | Tablas con server-side pagination, filtros, sorting |
| Recharts | 2.x | Gráficas de ventas, métricas diarias, comparativos |
| nuqs | 2.x | Sincronización de filtros y paginación con URL params |
| React Hook Form | 7.x | Manejo de formularios |
| Zod | 3.x | Validación de esquemas cliente y servidor |
| date-fns | 3.x | Formateo y operaciones con fechas |
| sonner | latest | Toasts y notificaciones UI |
| lucide-react | latest | Iconos |

### Backend / Base de datos
| Librería | Versión | Uso |
|---|---|---|
| Supabase | — | PostgreSQL, Auth, Storage, Realtime |
| Drizzle ORM | 0.x | Queries type-safe, migraciones |
| Better-Auth | latest | Sesiones, RBAC, OAuth (Google) |
| Resend | latest | Emails transaccionales |

### Generación de documentos
| Librería | Uso |
|---|---|
| pdfx (akii09/pdfx) | Wrapper de alto nivel sobre react-pdf-renderer para generar PDFs desde componentes React |
| @react-pdf/renderer | Motor de renderizado PDF |

### Tooling
| Herramienta | Uso |
|---|---|
| Vitest | Tests unitarios |
| Playwright | Tests E2E |
| ESLint + Prettier | Lint y formato de código |
| GitHub Actions | CI/CD |
| Vercel | Hosting |

---

## 3. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────┐
│          Cliente — Next.js 16.2.7 (App Router)          │
│   shadcn/ui · TanStack Table · Recharts · nuqs           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP / Server Actions
          ┌──────────┴──────────┐
          │                     │
┌─────────▼────────┐  ┌────────▼─────────┐
│  Better-Auth     │  │  Route Handlers  │
│  Sesiones + RBAC │  │  API endpoints   │
└─────────┬────────┘  └────────┬─────────┘
          │                    │
          └──────────┬─────────┘
                     │
          ┌──────────▼──────────┐
          │   Drizzle ORM       │
          │   Servicios de      │
          │   negocio           │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │   Supabase          │
          │   PostgreSQL + RLS  │
          │   Realtime          │
          │   Storage           │
          └─────────────────────┘
```

### Flujo de una request típica

1. Usuario interactúa con la UI (Next.js Client Component)
2. Se llama a un Server Action o Route Handler
3. Better-Auth valida la sesión y el rol del usuario
4. Drizzle ejecuta la query contra Supabase/PostgreSQL
5. RLS de Supabase filtra por `sucursal_id` automáticamente
6. El resultado retorna al cliente con tipado completo

---

## 4. Estructura de carpetas

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── registro/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar + header + auth guard
│   │   ├── page.tsx                    # Dashboard home / KPIs
│   │   ├── clientes/
│   │   │   ├── page.tsx                # Listado con TanStack Table
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Ficha de cliente
│   │   │       └── editar/
│   │   │           └── page.tsx
│   │   ├── vehiculos/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── servicios/
│   │   │   ├── page.tsx                # Catálogo
│   │   │   └── paquetes/
│   │   │       └── page.tsx
│   │   ├── ordenes/
│   │   │   ├── page.tsx                # Lista + estado en vivo
│   │   │   ├── nueva/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── caja/
│   │   │   ├── page.tsx                # Turno actual
│   │   │   └── historial/
│   │   │       └── page.tsx
│   │   ├── reportes/
│   │   │   ├── page.tsx                # Dashboard con Recharts
│   │   │   └── exportar/
│   │   │       └── page.tsx
│   │   ├── empleados/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── inventario/
│   │   │   └── page.tsx
│   │   └── configuracion/
│   │       ├── page.tsx
│   │       ├── sucursales/
│   │       └── servicios/
│   └── api/
│       ├── auth/
│       │   └── [...all]/
│       │       └── route.ts            # Better-Auth handler
│       ├── ordenes/
│       │   └── [id]/
│       │       └── estado/
│       │           └── route.ts        # PATCH cambio de estado
│       └── pdf/
│           ├── ticket/
│           │   └── route.ts
│           ├── factura/
│           │   └── route.ts
│           └── reporte/
│               └── route.ts
├── components/
│   ├── ui/                             # shadcn/ui (auto-generados)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── breadcrumb.tsx
│   ├── clientes/
│   │   ├── cliente-form.tsx
│   │   ├── cliente-card.tsx
│   │   ├── clientes-table.tsx
│   │   └── cliente-vehiculos.tsx
│   ├── ordenes/
│   │   ├── orden-form.tsx
│   │   ├── orden-estado-badge.tsx
│   │   ├── ordenes-kanban.tsx          # Vista kanban para lavadores
│   │   └── ordenes-table.tsx
│   ├── caja/
│   │   ├── turno-card.tsx
│   │   └── cobro-form.tsx
│   ├── reportes/
│   │   ├── ventas-chart.tsx
│   │   ├── servicios-chart.tsx
│   │   └── kpi-cards.tsx
│   ├── pdf/                            # Componentes react-pdf-renderer
│   │   ├── ticket-pdf.tsx
│   │   ├── factura-pdf.tsx
│   │   ├── corte-caja-pdf.tsx
│   │   └── reporte-ventas-pdf.tsx
│   └── shared/
│       ├── data-table.tsx              # Wrapper TanStack Table genérico
│       ├── search-input.tsx
│       ├── date-range-picker.tsx
│       └── confirm-dialog.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts                    # Cliente Drizzle + Supabase
│   │   ├── schema.ts                   # Esquema completo Drizzle
│   │   └── migrations/
│   ├── auth/
│   │   ├── config.ts                   # Better-Auth config
│   │   └── permissions.ts             # Mapa de permisos por rol
│   ├── validations/
│   │   ├── cliente.ts
│   │   ├── orden.ts
│   │   ├── servicio.ts
│   │   └── caja.ts
│   ├── actions/                        # Server Actions
│   │   ├── clientes.ts
│   │   ├── ordenes.ts
│   │   ├── caja.ts
│   │   └── reportes.ts
│   └── utils.ts
├── hooks/
│   ├── use-clientes.ts
│   ├── use-ordenes.ts
│   ├── use-realtime-ordenes.ts         # Supabase Realtime
│   └── use-caja.ts
├── types/
│   └── index.ts                        # Tipos globales
└── drizzle.config.ts
```

---

## 5. Base de datos — esquema completo

### Convenciones
- Todos los IDs son `UUID` generados con `gen_random_uuid()`
- Timestamps en UTC con `timestamptz`
- Soft delete con columna `deleted_at` en entidades principales
- RLS activo en todas las tablas; filtro base por `sucursal_id`

---

### Tabla: `sucursales`

```sql
CREATE TABLE sucursales (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  direccion     TEXT,
  telefono      TEXT,
  email         TEXT,
  ruc           TEXT,
  logo_url      TEXT,
  config        JSONB DEFAULT '{}',   -- impuestos, moneda, etc.
  activa        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
// Drizzle ORM
export const sucursales = pgTable('sucursales', {
  id:         uuid('id').primaryKey().defaultRandom(),
  nombre:     text('nombre').notNull(),
  direccion:  text('direccion'),
  telefono:   text('telefono'),
  email:      text('email'),
  ruc:        text('ruc'),
  logoUrl:    text('logo_url'),
  config:     jsonb('config').default({}),
  activa:     boolean('activa').default(true),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

---

### Tabla: `usuarios`

> Manejada principalmente por Better-Auth. Se extiende con datos propios.

```sql
CREATE TABLE usuarios (
  id            UUID PRIMARY KEY,        -- sincronizado con better-auth user id
  sucursal_id   UUID REFERENCES sucursales(id),
  nombre        TEXT NOT NULL,
  apellido      TEXT,
  email         TEXT UNIQUE NOT NULL,
  telefono      TEXT,
  rol           TEXT NOT NULL CHECK (rol IN ('admin','supervisor','cajero','lavador')),
  activo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
export const rolesEnum = pgEnum('rol', ['admin', 'supervisor', 'cajero', 'lavador']);

export const usuarios = pgTable('usuarios', {
  id:          uuid('id').primaryKey(),
  sucursalId:  uuid('sucursal_id').references(() => sucursales.id),
  nombre:      text('nombre').notNull(),
  apellido:    text('apellido'),
  email:       text('email').unique().notNull(),
  telefono:    text('telefono'),
  rol:         rolesEnum('rol').notNull(),
  activo:      boolean('activo').default(true),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

---

### Tabla: `clientes`

```sql
CREATE TABLE clientes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id   UUID NOT NULL REFERENCES sucursales(id),
  nombre        TEXT NOT NULL,
  apellido      TEXT,
  telefono      TEXT,
  email         TEXT,
  tipo_doc      TEXT CHECK (tipo_doc IN ('DNI','RUC','CE','PASAPORTE')),
  nro_doc       TEXT,
  notas         TEXT,
  activo        BOOLEAN DEFAULT TRUE,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sucursal_id, nro_doc)
);

-- Índices para búsqueda rápida
CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_nombre   ON clientes(lower(nombre || ' ' || COALESCE(apellido,'')));
CREATE INDEX idx_clientes_nro_doc  ON clientes(nro_doc);
```

```typescript
export const tipoDocEnum = pgEnum('tipo_doc', ['DNI','RUC','CE','PASAPORTE']);

export const clientes = pgTable('clientes', {
  id:          uuid('id').primaryKey().defaultRandom(),
  sucursalId:  uuid('sucursal_id').notNull().references(() => sucursales.id),
  nombre:      text('nombre').notNull(),
  apellido:    text('apellido'),
  telefono:    text('telefono'),
  email:       text('email'),
  tipoDoc:     tipoDocEnum('tipo_doc'),
  nroDoc:      text('nro_doc'),
  notas:       text('notas'),
  activo:      boolean('activo').default(true),
  deletedAt:   timestamp('deleted_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqueDoc: unique().on(t.sucursalId, t.nroDoc),
  idxTel:    index('idx_clientes_telefono').on(t.telefono),
  idxDoc:    index('idx_clientes_nro_doc').on(t.nroDoc),
}));
```

---

### Tabla: `vehiculos`

```sql
CREATE TABLE vehiculos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  placa         TEXT NOT NULL,
  marca         TEXT,
  modelo        TEXT,
  anio          INT,
  color         TEXT,
  tipo          TEXT CHECK (tipo IN ('sedan','suv','pickup','moto','camion','furgon','otro')),
  notas         TEXT,
  activo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cliente_id, placa)
);

CREATE INDEX idx_vehiculos_placa ON vehiculos(upper(placa));
```

```typescript
export const tipoVehiculoEnum = pgEnum('tipo_vehiculo',
  ['sedan','suv','pickup','moto','camion','furgon','otro']);

export const vehiculos = pgTable('vehiculos', {
  id:         uuid('id').primaryKey().defaultRandom(),
  clienteId:  uuid('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  placa:      text('placa').notNull(),
  marca:      text('marca'),
  modelo:     text('modelo'),
  anio:       integer('anio'),
  color:      text('color'),
  tipo:       tipoVehiculoEnum('tipo'),
  notas:      text('notas'),
  activo:     boolean('activo').default(true),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniquePlaca: unique().on(t.clienteId, t.placa),
  idxPlaca:    index('idx_vehiculos_placa').on(t.placa),
}));
```

---

### Tabla: `categorias_servicio`

```sql
CREATE TABLE categorias_servicio (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id   UUID NOT NULL REFERENCES sucursales(id),
  nombre        TEXT NOT NULL,
  orden         INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Tabla: `servicios`

```sql
CREATE TABLE servicios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id     UUID NOT NULL REFERENCES sucursales(id),
  categoria_id    UUID REFERENCES categorias_servicio(id),
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  precio          NUMERIC(10,2) NOT NULL,
  duracion_min    INT DEFAULT 30,
  aplica_a        TEXT[] DEFAULT '{}',  -- ['sedan','suv',...]
  activo          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
export const servicios = pgTable('servicios', {
  id:           uuid('id').primaryKey().defaultRandom(),
  sucursalId:   uuid('sucursal_id').notNull().references(() => sucursales.id),
  categoriaId:  uuid('categoria_id').references(() => categoriasServicio.id),
  nombre:       text('nombre').notNull(),
  descripcion:  text('descripcion'),
  precio:       numeric('precio', { precision: 10, scale: 2 }).notNull(),
  duracionMin:  integer('duracion_min').default(30),
  aplicaA:      text('aplica_a').array().default([]),
  activo:       boolean('activo').default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

---

### Tabla: `paquetes`

```sql
CREATE TABLE paquetes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id   UUID NOT NULL REFERENCES sucursales(id),
  nombre        TEXT NOT NULL,
  descripcion   TEXT,
  precio        NUMERIC(10,2) NOT NULL,
  activo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Servicios que incluye el paquete
CREATE TABLE paquete_servicios (
  paquete_id    UUID NOT NULL REFERENCES paquetes(id) ON DELETE CASCADE,
  servicio_id   UUID NOT NULL REFERENCES servicios(id),
  PRIMARY KEY (paquete_id, servicio_id)
);
```

---

### Tabla: `turnos_caja`

```sql
CREATE TABLE turnos_caja (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id     UUID NOT NULL REFERENCES sucursales(id),
  empleado_id     UUID NOT NULL REFERENCES usuarios(id),
  apertura        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cierre          TIMESTAMPTZ,
  monto_inicial   NUMERIC(10,2) NOT NULL DEFAULT 0,
  monto_final     NUMERIC(10,2),
  observaciones   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Tabla: `ordenes`

```sql
CREATE TABLE ordenes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id     UUID NOT NULL REFERENCES sucursales(id),
  turno_id        UUID REFERENCES turnos_caja(id),
  vehiculo_id     UUID NOT NULL REFERENCES vehiculos(id),
  empleado_id     UUID REFERENCES usuarios(id),       -- asignado como lavador
  cajero_id       UUID REFERENCES usuarios(id),       -- quien abre la orden
  estado          TEXT NOT NULL DEFAULT 'pendiente'
                  CHECK (estado IN ('pendiente','en_proceso','completado','cobrado','cancelado')),
  prioridad       INT DEFAULT 0,
  subtotal        NUMERIC(10,2) DEFAULT 0,
  descuento       NUMERIC(10,2) DEFAULT 0,
  igv             NUMERIC(10,2) DEFAULT 0,
  total           NUMERIC(10,2) DEFAULT 0,
  notas           TEXT,
  nro_ticket      TEXT UNIQUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ordenes_estado       ON ordenes(estado);
CREATE INDEX idx_ordenes_created_at   ON ordenes(created_at DESC);
CREATE INDEX idx_ordenes_sucursal     ON ordenes(sucursal_id, created_at DESC);
CREATE INDEX idx_ordenes_vehiculo     ON ordenes(vehiculo_id);
```

```typescript
export const estadoOrdenEnum = pgEnum('estado_orden',
  ['pendiente','en_proceso','completado','cobrado','cancelado']);

export const ordenes = pgTable('ordenes', {
  id:          uuid('id').primaryKey().defaultRandom(),
  sucursalId:  uuid('sucursal_id').notNull().references(() => sucursales.id),
  turnoId:     uuid('turno_id').references(() => turnosCaja.id),
  vehiculoId:  uuid('vehiculo_id').notNull().references(() => vehiculos.id),
  empleadoId:  uuid('empleado_id').references(() => usuarios.id),
  cajeroId:    uuid('cajero_id').references(() => usuarios.id),
  estado:      estadoOrdenEnum('estado').notNull().default('pendiente'),
  prioridad:   integer('prioridad').default(0),
  subtotal:    numeric('subtotal', { precision: 10, scale: 2 }).default('0'),
  descuento:   numeric('descuento', { precision: 10, scale: 2 }).default('0'),
  igv:         numeric('igv', { precision: 10, scale: 2 }).default('0'),
  total:       numeric('total', { precision: 10, scale: 2 }).default('0'),
  notas:       text('notas'),
  nroTicket:   text('nro_ticket').unique(),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

---

### Tabla: `orden_servicios`

```sql
CREATE TABLE orden_servicios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id        UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  servicio_id     UUID NOT NULL REFERENCES servicios(id),
  nombre_servicio TEXT NOT NULL,         -- snapshot del nombre al momento de la orden
  precio_unitario NUMERIC(10,2) NOT NULL,
  cantidad        INT DEFAULT 1,
  subtotal        NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Tabla: `pagos`

```sql
CREATE TABLE pagos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id        UUID NOT NULL REFERENCES ordenes(id),
  turno_id        UUID REFERENCES turnos_caja(id),
  metodo          TEXT NOT NULL CHECK (metodo IN ('efectivo','tarjeta','yape','plin','transferencia','otro')),
  monto           NUMERIC(10,2) NOT NULL,
  referencia      TEXT,              -- número de operación, voucher, etc.
  cajero_id       UUID REFERENCES usuarios(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
export const metodoPagoEnum = pgEnum('metodo_pago',
  ['efectivo','tarjeta','yape','plin','transferencia','otro']);

export const pagos = pgTable('pagos', {
  id:         uuid('id').primaryKey().defaultRandom(),
  ordenId:    uuid('orden_id').notNull().references(() => ordenes.id),
  turnoId:    uuid('turno_id').references(() => turnosCaja.id),
  metodo:     metodoPagoEnum('metodo').notNull(),
  monto:      numeric('monto', { precision: 10, scale: 2 }).notNull(),
  referencia: text('referencia'),
  cajeroId:   uuid('cajero_id').references(() => usuarios.id),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

---

### Tabla: `puntos_fidelidad`

```sql
CREATE TABLE puntos_fidelidad (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    UUID NOT NULL REFERENCES clientes(id),
  orden_id      UUID REFERENCES ordenes(id),
  puntos        INT NOT NULL,          -- positivo = ganó, negativo = canjeó
  tipo          TEXT NOT NULL CHECK (tipo IN ('ganado','canjeado','ajuste')),
  descripcion   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Tabla: `inventario`

```sql
CREATE TABLE inventario (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sucursal_id     UUID NOT NULL REFERENCES sucursales(id),
  nombre          TEXT NOT NULL,
  descripcion     TEXT,
  unidad          TEXT DEFAULT 'unidad',
  stock           NUMERIC(10,3) DEFAULT 0,
  stock_minimo    NUMERIC(10,3) DEFAULT 0,
  precio_compra   NUMERIC(10,2),
  proveedor       TEXT,
  activo          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Movimientos de inventario
CREATE TABLE inventario_movimientos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID NOT NULL REFERENCES inventario(id),
  tipo            TEXT NOT NULL CHECK (tipo IN ('entrada','salida','ajuste')),
  cantidad        NUMERIC(10,3) NOT NULL,
  motivo          TEXT,
  usuario_id      UUID REFERENCES usuarios(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Tabla: `notificaciones`

```sql
CREATE TABLE notificaciones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID NOT NULL REFERENCES usuarios(id),
  tipo          TEXT NOT NULL,
  titulo        TEXT NOT NULL,
  mensaje       TEXT,
  leida         BOOLEAN DEFAULT FALSE,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

### RLS (Row Level Security)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE clientes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos_caja      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones   ENABLE ROW LEVEL SECURITY;

-- Política base: los usuarios solo ven datos de su sucursal
CREATE POLICY "sucursal_isolation" ON clientes
  USING (
    sucursal_id = (
      SELECT sucursal_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Admin ve todo
CREATE POLICY "admin_all" ON clientes
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Notificaciones: solo el propio usuario
CREATE POLICY "own_notifications" ON notificaciones
  USING (usuario_id = auth.uid());
```

---

### Relaciones Drizzle (resumen)

```typescript
// lib/db/relations.ts
export const clientesRelations = relations(clientes, ({ many }) => ({
  vehiculos:         many(vehiculos),
  puntosFidelidad:   many(puntosFidelidad),
}));

export const vehiculosRelations = relations(vehiculos, ({ one, many }) => ({
  cliente: one(clientes, { fields: [vehiculos.clienteId], references: [clientes.id] }),
  ordenes: many(ordenes),
}));

export const ordenesRelations = relations(ordenes, ({ one, many }) => ({
  vehiculo:      one(vehiculos, { fields: [ordenes.vehiculoId], references: [vehiculos.id] }),
  empleado:      one(usuarios, { fields: [ordenes.empleadoId], references: [usuarios.id] }),
  cajero:        one(usuarios, { fields: [ordenes.cajeroId], references: [usuarios.id] }),
  turno:         one(turnosCaja, { fields: [ordenes.turnoId], references: [turnosCaja.id] }),
  servicios:     many(ordenServicios),
  pagos:         many(pagos),
}));
```

---

## 6. Autenticación y roles (Better-Auth)

```typescript
// lib/auth/config.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn:      60 * 60 * 24 * 7,   // 7 días
    updateAge:      60 * 60 * 24,        // renovar cada 24h
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  user: {
    additionalFields: {
      rol:        { type: 'string', required: true, defaultValue: 'cajero' },
      sucursalId: { type: 'string', required: false },
    },
  },
});
```

### Mapa de permisos

```typescript
// lib/auth/permissions.ts
export const PERMISSIONS = {
  clientes: {
    ver:     ['admin','supervisor','cajero'],
    crear:   ['admin','supervisor','cajero'],
    editar:  ['admin','supervisor','cajero'],
    eliminar:['admin'],
  },
  ordenes: {
    ver:           ['admin','supervisor','cajero','lavador'],
    crear:         ['admin','supervisor','cajero'],
    asignar:       ['admin','supervisor'],
    cambiarEstado: ['admin','supervisor','cajero','lavador'],
    cancelar:      ['admin','supervisor'],
  },
  caja: {
    abrir:  ['admin','supervisor','cajero'],
    cerrar: ['admin','supervisor','cajero'],
    ver:    ['admin','supervisor'],
  },
  reportes: {
    ver:      ['admin','supervisor'],
    exportar: ['admin','supervisor'],
  },
  empleados: {
    ver:     ['admin','supervisor'],
    gestionar:['admin'],
  },
  configuracion: {
    ver:      ['admin'],
    gestionar:['admin'],
  },
} as const;

// Helper
export function canDo(
  rol: string,
  modulo: keyof typeof PERMISSIONS,
  accion: string
): boolean {
  const allowed = PERMISSIONS[modulo]?.[accion as never] as string[] | undefined;
  return allowed?.includes(rol) ?? false;
}
```

### Middleware de protección

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { pathname } = request.nextUrl;

  // Proteger rutas admin
  if (pathname.startsWith('/configuracion') && session.user.rol !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Lavadores solo acceden a órdenes
  if (session.user.rol === 'lavador' && !pathname.startsWith('/ordenes')) {
    return NextResponse.redirect(new URL('/ordenes', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(dashboard)/:path*'],
};
```

---

## 7. Módulos del sistema

### 7.1 Clientes

**Funcionalidades:**
- Registro con datos personales + documento de identidad
- Búsqueda rápida por nombre, teléfono o placa (usada al momento de recibir al cliente)
- Historial de órdenes paginado con TanStack Table
- Vehículos asociados (CRUD)
- Saldo de puntos de fidelidad con historial de movimientos
- Exportar ficha del cliente en PDF
- Notas internas por cliente

**Server Action — crear cliente:**

```typescript
// lib/actions/clientes.ts
'use server'
import { db } from '@/lib/db';
import { clientes } from '@/lib/db/schema';
import { clienteSchema } from '@/lib/validations/cliente';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

export async function crearCliente(data: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('No autorizado');

  const parsed = clienteSchema.parse(data);

  const [cliente] = await db.insert(clientes).values({
    ...parsed,
    sucursalId: session.user.sucursalId,
  }).returning();

  return cliente;
}
```

**Validación Zod:**

```typescript
// lib/validations/cliente.ts
import { z } from 'zod';

export const clienteSchema = z.object({
  nombre:    z.string().min(2, 'Mínimo 2 caracteres').max(100),
  apellido:  z.string().max(100).optional(),
  telefono:  z.string().regex(/^\+?[\d\s\-]{7,15}$/, 'Teléfono inválido').optional(),
  email:     z.string().email('Email inválido').optional().or(z.literal('')),
  tipoDoc:   z.enum(['DNI','RUC','CE','PASAPORTE']).optional(),
  nroDoc:    z.string().max(20).optional(),
  notas:     z.string().max(500).optional(),
});
```

---

### 7.2 Vehículos

**Funcionalidades:**
- Registro de múltiples vehículos por cliente
- Búsqueda por placa (normalizada a mayúsculas, sin espacios)
- Historial de servicios por vehículo
- Tipo de vehículo usado para filtrar servicios aplicables

```typescript
export const vehiculoSchema = z.object({
  clienteId: z.string().uuid(),
  placa:     z.string().min(3).max(10).transform(v => v.toUpperCase().replace(/\s/g, '')),
  marca:     z.string().max(50).optional(),
  modelo:    z.string().max(50).optional(),
  anio:      z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  color:     z.string().max(30).optional(),
  tipo:      z.enum(['sedan','suv','pickup','moto','camion','furgon','otro']).optional(),
});
```

---

### 7.3 Servicios y paquetes

**Funcionalidades:**
- Catálogo de servicios con precio, duración y tipo de vehículo aplicable
- Agrupación por categoría
- Paquetes (combo de servicios con precio especial)
- Activar/desactivar servicios sin eliminar historial

---

### 7.4 Órdenes

**Funcionalidades:**
- Wizard de 3 pasos: buscar vehículo → seleccionar servicios → confirmar
- Vista kanban por estado para lavadores (Realtime)
- Cambio de estado con validación de transición
- Asignación de lavador
- Cálculo automático de subtotal, descuento, IGV y total
- Generación de número de ticket único por sucursal

**Transiciones válidas de estado:**

```
pendiente → en_proceso → completado → cobrado
pendiente → cancelado
en_proceso → cancelado  (solo supervisor/admin)
```

**Server Action — cambiar estado:**

```typescript
export async function cambiarEstadoOrden(ordenId: string, nuevoEstado: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('No autorizado');

  const TRANSICIONES: Record<string, string[]> = {
    pendiente:    ['en_proceso', 'cancelado'],
    en_proceso:   ['completado', 'cancelado'],
    completado:   ['cobrado'],
    cobrado:      [],
    cancelado:    [],
  };

  const [orden] = await db.select().from(ordenes).where(eq(ordenes.id, ordenId));
  if (!orden) throw new Error('Orden no encontrada');

  const permitidos = TRANSICIONES[orden.estado];
  if (!permitidos.includes(nuevoEstado)) {
    throw new Error(`Transición inválida: ${orden.estado} → ${nuevoEstado}`);
  }

  await db.update(ordenes)
    .set({ estado: nuevoEstado as any, updatedAt: new Date() })
    .where(eq(ordenes.id, ordenId));
}
```

**Hook Realtime:**

```typescript
// hooks/use-realtime-ordenes.ts
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/db/supabase-client';

export function useRealtimeOrdenes(sucursalId: string) {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('ordenes_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ordenes',
          filter: `sucursal_id=eq.${sucursalId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrdenes(prev => [payload.new as Orden, ...prev]);
          }
          if (payload.eventType === 'UPDATE') {
            setOrdenes(prev =>
              prev.map(o => o.id === payload.new.id ? payload.new as Orden : o)
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sucursalId]);

  return ordenes;
}
```

---

### 7.5 Caja y pagos

**Funcionalidades:**
- Apertura de turno con monto inicial
- Cierre con cuadre automático (cobrado vs esperado)
- Registro de cobro: un pago puede ser dividido en varios métodos (efectivo + Yape)
- Exportar corte de caja en PDF
- Historial de turnos con totales

**Server Action — cobrar orden:**

```typescript
export async function cobrarOrden(
  ordenId: string,
  pagosData: { metodo: string; monto: number; referencia?: string }[]
) {
  const session = await auth.api.getSession({ headers: await headers() });

  return await db.transaction(async (tx) => {
    const [orden] = await tx.select().from(ordenes).where(eq(ordenes.id, ordenId));
    if (orden.estado !== 'completado') throw new Error('La orden debe estar completada');

    const totalPagado = pagosData.reduce((sum, p) => sum + p.monto, 0);
    if (Math.abs(totalPagado - Number(orden.total)) > 0.01) {
      throw new Error('El monto pagado no coincide con el total');
    }

    // Registrar cada pago
    await tx.insert(pagos).values(
      pagosData.map(p => ({
        ordenId,
        turnoId: session.user.turnoActivo,
        metodo:  p.metodo as any,
        monto:   String(p.monto),
        referencia: p.referencia,
        cajeroId: session.user.id,
      }))
    );

    // Cambiar estado a cobrado
    await tx.update(ordenes)
      .set({ estado: 'cobrado', updatedAt: new Date() })
      .where(eq(ordenes.id, ordenId));

    // Sumar puntos de fidelidad (1 punto por cada S/ 10)
    const vehiculo = await tx.query.vehiculos.findFirst({
      where: eq(vehiculos.id, orden.vehiculoId),
    });
    const puntos = Math.floor(Number(orden.total) / 10);
    if (puntos > 0) {
      await tx.insert(puntosFidelidad).values({
        clienteId:   vehiculo!.clienteId,
        ordenId,
        puntos,
        tipo:        'ganado',
        descripcion: `Orden #${orden.nroTicket}`,
      });
    }
  });
}
```

---

### 7.6 Empleados

**Funcionalidades:**
- CRUD de empleados vinculado a `usuarios`
- Asignación de rol y sucursal
- Dashboard de productividad: órdenes completadas por empleado, tiempo promedio
- Configuración de comisión por porcentaje (opcional)

---

### 7.7 Inventario

**Funcionalidades:**
- Registro de productos de limpieza y suministros
- Control de stock con alertas cuando llega al mínimo
- Movimientos de entrada/salida con motivo
- Alerta visual en dashboard cuando hay items bajo mínimo

---

### 7.8 Reportes y métricas

**Páginas y gráficas:**

| Reporte | Tipo de gráfica | Datos |
|---|---|---|
| Ventas diarias | AreaChart (Recharts) | total por día del mes actual |
| Ingresos por servicio | BarChart | ranking de servicios más vendidos |
| Métodos de pago | PieChart | distribución efectivo/tarjeta/Yape/etc |
| Órdenes por hora | BarChart | horas pico del día |
| Comparativo mensual | LineChart | mes actual vs mes anterior |
| Top clientes | Tabla | clientes con más visitas/gasto |

**Exportaciones PDF disponibles:**
- Reporte de ventas por rango de fechas
- Corte de caja por turno
- Ranking de servicios

---

### 7.9 Notificaciones

**Disparadores:**
- Stock de inventario bajo el mínimo → notifica a supervisor/admin
- Orden sin atender por más de X minutos → notifica al cajero
- Cierre de turno pendiente al final del día
- Nuevo registro de cliente desde formulario web (si se habilita)

```typescript
// Crear notificación desde server action
async function notificar(usuarioId: string, tipo: string, titulo: string, mensaje: string) {
  await db.insert(notificaciones).values({ usuarioId, tipo, titulo, mensaje });
  // Supabase Realtime dispara el cambio al cliente automáticamente
}
```

---

### 7.10 Configuración

**Secciones (solo admin):**
- Datos de la sucursal (nombre, logo, RUC, dirección)
- Configuración de IGV (porcentaje, incluido/excluido en precio)
- Gestión de usuarios: invitar, cambiar rol, desactivar
- Categorías de servicios
- Parámetros del programa de puntos (ratio de conversión)
- Personalización de ticket PDF (logo, colores, mensaje de pie)

---

## 8. Frontend — páginas y componentes

### Tabla genérica con TanStack Table + nuqs

```typescript
// components/shared/data-table.tsx
'use client'
import {
  useReactTable, getCoreRowModel, flexRender,
  type ColumnDef, type PaginationState,
} from '@tanstack/react-table';
import { parseAsInteger, useQueryStates } from 'nuqs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface DataTableProps<T> {
  data:        T[];
  columns:     ColumnDef<T>[];
  totalCount:  number;
  pageSize?:   number;
}

export function DataTable<T>({ data, columns, totalCount, pageSize = 20 }: DataTableProps<T>) {
  const [{ page }, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
  });

  const pagination: PaginationState = { pageIndex: page - 1, pageSize };

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    state: { pagination },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setParams({ page: next.pageIndex + 1 });
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(hg => (
            <TableRow key={hg.id}>
              {hg.headers.map(h => (
                <TableHead key={h.id}>
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between py-4">
        <span className="text-sm text-muted-foreground">
          {totalCount} registros
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            Anterior
          </Button>
          <Button variant="outline" size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Filtros sincronizados con URL (nuqs)

```typescript
// Ejemplo en página de clientes
'use client'
import { parseAsString, useQueryStates } from 'nuqs';

export function ClientesFiltros() {
  const [filters, setFilters] = useQueryStates({
    q:    parseAsString.withDefault(''),
    doc:  parseAsString.withDefault(''),
  });

  return (
    <div className="flex gap-2 mb-4">
      <Input
        placeholder="Buscar por nombre, teléfono..."
        value={filters.q}
        onChange={e => setFilters({ q: e.target.value })}
      />
      <Select value={filters.doc} onValueChange={doc => setFilters({ doc })}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Tipo doc" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          <SelectItem value="DNI">DNI</SelectItem>
          <SelectItem value="RUC">RUC</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

---

## 9. Generación de PDFs (pdfx + react-pdf-renderer)

### Ticket de orden

```typescript
// components/pdf/ticket-pdf.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page:        { padding: 24, fontSize: 10, fontFamily: 'Helvetica' },
  header:      { alignItems: 'center', marginBottom: 16 },
  logo:        { width: 80, height: 40, marginBottom: 8 },
  titulo:      { fontSize: 16, fontWeight: 'bold' },
  subtitulo:   { fontSize: 9, color: '#666', marginTop: 2 },
  divider:     { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginVertical: 8 },
  row:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label:       { color: '#6b7280' },
  value:       { fontWeight: 'bold' },
  serviceRow:  { flexDirection: 'row', marginBottom: 3 },
  serviceName: { flex: 1 },
  servicePrice:{ width: 60, textAlign: 'right' },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  totalLabel:  { fontSize: 12, fontWeight: 'bold' },
  totalAmount: { fontSize: 14, fontWeight: 'bold' },
  footer:      { marginTop: 24, alignItems: 'center', color: '#9ca3af', fontSize: 9 },
});

interface TicketPDFProps {
  orden: {
    nroTicket: string;
    createdAt: string;
    vehiculo:  { placa: string; marca?: string; modelo?: string; color?: string };
    cliente:   { nombre: string; apellido?: string; telefono?: string };
    servicios: { nombre: string; precio: number; cantidad: number }[];
    subtotal:  number;
    descuento: number;
    igv:       number;
    total:     number;
    metodoPago: string;
  };
  sucursal: {
    nombre:   string;
    direccion?: string;
    ruc?:     string;
    logoUrl?: string;
  };
}

export function TicketPDF({ orden, sucursal }: TicketPDFProps) {
  return (
    <Document>
      <Page size={[226, 'auto']} style={styles.page}>  {/* 80mm roll */}

        {/* Encabezado */}
        <View style={styles.header}>
          {sucursal.logoUrl && <Image src={sucursal.logoUrl} style={styles.logo} />}
          <Text style={styles.titulo}>{sucursal.nombre}</Text>
          {sucursal.direccion && <Text style={styles.subtitulo}>{sucursal.direccion}</Text>}
          {sucursal.ruc && <Text style={styles.subtitulo}>RUC: {sucursal.ruc}</Text>}
        </View>

        <View style={styles.divider} />

        {/* Datos de la orden */}
        <View style={styles.row}>
          <Text style={styles.label}>Ticket</Text>
          <Text style={styles.value}>#{orden.nroTicket}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha</Text>
          <Text>{new Date(orden.createdAt).toLocaleString('es-PE')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Placa</Text>
          <Text style={styles.value}>{orden.vehiculo.placa}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Vehículo</Text>
          <Text>{[orden.vehiculo.marca, orden.vehiculo.modelo, orden.vehiculo.color].filter(Boolean).join(' ')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cliente</Text>
          <Text>{[orden.cliente.nombre, orden.cliente.apellido].filter(Boolean).join(' ')}</Text>
        </View>

        <View style={styles.divider} />

        {/* Servicios */}
        {orden.servicios.map((s, i) => (
          <View key={i} style={styles.serviceRow}>
            <Text style={styles.serviceName}>{s.cantidad > 1 ? `${s.cantidad}x ` : ''}{s.nombre}</Text>
            <Text style={styles.servicePrice}>S/ {(s.precio * s.cantidad).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Totales */}
        {orden.descuento > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Descuento</Text>
            <Text>- S/ {orden.descuento.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text>S/ {orden.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>IGV (18%)</Text>
          <Text>S/ {orden.igv.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalAmount}>S/ {orden.total.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Método de pago</Text>
          <Text>{orden.metodoPago.toUpperCase()}</Text>
        </View>

        <View style={styles.footer}>
          <Text>¡Gracias por su preferencia!</Text>
          <Text>Conserve este ticket como comprobante</Text>
        </View>
      </Page>
    </Document>
  );
}
```

### Route Handler para descargar PDF

```typescript
// app/api/pdf/ticket/route.ts
import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { TicketPDF } from '@/components/pdf/ticket-pdf';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const ordenId = request.nextUrl.searchParams.get('ordenId');
  if (!ordenId) return new Response('ordenId requerido', { status: 400 });

  const orden = await db.query.ordenes.findFirst({
    where: eq(ordenes.id, ordenId),
    with: {
      vehiculo: { with: { cliente: true } },
      servicios: true,
      pagos: true,
    },
  });

  if (!orden) return new Response('Orden no encontrada', { status: 404 });

  const buffer = await renderToBuffer(
    <TicketPDF orden={mapOrden(orden)} sucursal={mapSucursal(orden)} />
  );

  return new Response(buffer, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `inline; filename="ticket-${orden.nroTicket}.pdf"`,
    },
  });
}
```

---

## 10. Estado global y URL state (nuqs)

```typescript
// Parsers reutilizables
import {
  parseAsString, parseAsInteger, parseAsIsoDateTime,
  createSearchParamsCache, createSerializer,
} from 'nuqs/server';

export const ordenesSearchParams = {
  q:       parseAsString.withDefault(''),
  estado:  parseAsString.withDefault(''),
  desde:   parseAsIsoDateTime,
  hasta:   parseAsIsoDateTime,
  page:    parseAsInteger.withDefault(1),
  size:    parseAsInteger.withDefault(20),
};

// En Server Component:
export const ordenesCache   = createSearchParamsCache(ordenesSearchParams);
export const serializeOrden = createSerializer(ordenesSearchParams);

// Uso en page.tsx (Server Component)
export default async function OrdenesPage({ searchParams }: { searchParams: Promise<any> }) {
  const { q, estado, desde, hasta, page, size } = await ordenesCache.parse(searchParams);

  const data = await getOrdenes({ q, estado, desde, hasta, page, size });

  return <OrdenesTable data={data} />;
}
```

---

## 11. Validaciones (Zod)

```typescript
// lib/validations/orden.ts
export const crearOrdenSchema = z.object({
  vehiculoId:  z.string().uuid('Vehículo requerido'),
  empleadoId:  z.string().uuid().optional(),
  servicios:   z.array(z.object({
    servicioId: z.string().uuid(),
    cantidad:   z.number().int().min(1).max(10),
  })).min(1, 'Debe seleccionar al menos un servicio'),
  descuento:   z.number().min(0).max(100).default(0),
  notas:       z.string().max(300).optional(),
});

// lib/validations/caja.ts
export const abrirTurnoSchema = z.object({
  montoInicial: z.number().min(0, 'El monto no puede ser negativo'),
});

export const cobrarOrdenSchema = z.object({
  ordenId: z.string().uuid(),
  pagos:   z.array(z.object({
    metodo:     z.enum(['efectivo','tarjeta','yape','plin','transferencia','otro']),
    monto:      z.number().positive('El monto debe ser mayor a 0'),
    referencia: z.string().max(100).optional(),
  })).min(1),
});
```

---

## 12. Infraestructura y despliegue

### Stack de infraestructura

| Servicio | Propósito |
|---|---|
| Vercel | Hosting Next.js, Edge Functions, CDN |
| Supabase Cloud | PostgreSQL gestionado, Auth, Storage, Realtime |
| GitHub Actions | CI/CD: lint + typecheck + tests + deploy |
| Resend | Emails transaccionales (confirmaciones, reportes) |

### Pipeline CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test

  deploy:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token:   ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id:  ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Migraciones con Drizzle

```bash
# Generar migración
npx drizzle-kit generate

# Aplicar en desarrollo
npx drizzle-kit migrate

# Aplicar en producción (desde CI)
npx drizzle-kit migrate --config drizzle.config.ts
```

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema:    './lib/db/schema.ts',
  out:       './lib/db/migrations',
  dialect:   'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## 13. Variables de entorno

```env
# .env.local

# Base de datos
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Better-Auth
BETTER_AUTH_SECRET="[string aleatorio 32+ chars]"
BETTER_AUTH_URL="https://tudominio.com"

# OAuth Google
GOOGLE_CLIENT_ID="[id].apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-[secret]"

# Email
RESEND_API_KEY="re_[key]"
EMAIL_FROM="noreply@tudominio.com"

# App
NEXT_PUBLIC_APP_URL="https://tudominio.com"
NEXT_PUBLIC_APP_NAME="CarWash Pro"
```

---

## 14. Hoja de ruta de desarrollo

### Sprint 1 — Fundamentos (2 semanas)
- [ ] Setup del proyecto Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Configurar Supabase (proyecto, tablas base, RLS)
- [ ] Configurar Drizzle ORM + migraciones
- [ ] Implementar Better-Auth (email/password + roles)
- [ ] Layout del dashboard (sidebar, header, rutas protegidas)
- [ ] CRUD de sucursales

### Sprint 2 — Módulo Clientes y Vehículos (2 semanas)
- [ ] Tabla de clientes con TanStack Table + nuqs (filtros en URL)
- [ ] Formulario de cliente con React Hook Form + Zod
- [ ] CRUD de vehículos asociados al cliente
- [ ] Búsqueda rápida por nombre, teléfono y placa
- [ ] Ficha de cliente con historial

### Sprint 3 — Módulo Servicios y Órdenes (2 semanas)
- [ ] Catálogo de servicios y categorías
- [ ] Paquetes de servicios
- [ ] Wizard de creación de orden (3 pasos)
- [ ] Vista kanban de órdenes con Realtime
- [ ] Cambio de estado de órdenes
- [ ] Asignación de lavador

### Sprint 4 — Caja, Pagos y PDFs (2 semanas)
- [ ] Apertura/cierre de turno
- [ ] Cobro con múltiples métodos de pago
- [ ] Generación de ticket PDF (pdfx + react-pdf-renderer)
- [ ] Generación de corte de caja PDF
- [ ] Programa de puntos de fidelidad

### Sprint 5 — Reportes y Métricas (1 semana)
- [ ] Dashboard con KPIs (Recharts)
- [ ] Reporte de ventas por rango de fechas
- [ ] Gráfica de servicios más vendidos
- [ ] Top clientes
- [ ] Exportar reporte PDF

### Sprint 6 — Módulos adicionales (2 semanas)
- [ ] Módulo de empleados con productividad
- [ ] Control de inventario con alertas
- [ ] Notificaciones en tiempo real
- [ ] Módulo de configuración (admin)
- [ ] Emails transaccionales (Resend)

### Sprint 7 — QA y despliegue (1 semana)
- [ ] Tests unitarios con Vitest (actions, validaciones)
- [ ] Tests E2E con Playwright (flujo completo de orden)
- [ ] Optimización de queries (índices, explain analyze)
- [ ] Setup CI/CD en GitHub Actions
- [ ] Despliegue en Vercel + dominio personalizado
- [ ] Documentación de uso para el equipo

---

*Documento generado el 03/06/2026. Stack sujeto a actualización según evolución del proyecto.*
