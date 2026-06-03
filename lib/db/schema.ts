import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  jsonb,
  pgEnum,
  unique,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const rolesEnum = pgEnum('rol', ['admin', 'supervisor', 'cajero', 'lavador']);
export const tipoDocEnum = pgEnum('tipo_doc', ['DNI', 'RUC', 'CE', 'PASAPORTE']);
export const tipoVehiculoEnum = pgEnum('tipo_vehiculo', ['sedan', 'suv', 'pickup', 'moto', 'camion', 'furgon', 'otro']);
export const estadoOrdenEnum = pgEnum('estado_orden', ['pendiente', 'en_proceso', 'completado', 'cobrado', 'cancelado']);
export const metodoPagoEnum = pgEnum('metodo_pago', ['efectivo', 'tarjeta', 'yape', 'plin', 'transferencia', 'otro']);
export const tipoPuntosEnum = pgEnum('tipo_puntos', ['ganado', 'canjeado', 'ajuste']);
export const tipoMovimientoEnum = pgEnum('tipo_movimiento', ['entrada', 'salida', 'ajuste']);

// --- TABLAS DE CONFIGURACIÓN ---

export const sucursales = pgTable('sucursales', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  direccion: text('direccion'),
  telefono: text('telefono'),
  email: text('email'),
  ruc: text('ruc'),
  logoUrl: text('logo_url'),
  config: jsonb('config').default({}),
  activa: boolean('activa').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// --- TABLAS DE AUTENTICACIÓN (BETTER-AUTH) ---

export const usuarios = pgTable('usuarios', {
  id: text('id').primaryKey(),
  sucursalId: uuid('sucursal_id').references(() => sucursales.id),
  nombre: text('nombre').notNull(),
  apellido: text('apellido'),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  telefono: text('telefono'),
  rol: rolesEnum('rol').notNull().default('cajero'),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sesiones = pgTable('sesiones', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
});

export const cuentas = pgTable('cuentas', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const verificaciones = pgTable('verificaciones', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// --- TABLAS DE NEGOCIO ---

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  sucursalId: uuid('sucursal_id').notNull().references(() => sucursales.id),
  nombre: text('nombre').notNull(),
  apellido: text('apellido'),
  telefono: text('telefono'),
  email: text('email'),
  tipoDoc: tipoDocEnum('tipo_doc'),
  nroDoc: text('nro_doc'),
  notas: text('notas'),
  activo: boolean('activo').default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqueDoc: unique().on(t.sucursalId, t.nroDoc),
  idxTel: index('idx_clientes_telefono').on(t.telefono),
  idxDoc: index('idx_clientes_nro_doc').on(t.nroDoc),
}));

export const vehiculos = pgTable('vehiculos', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  placa: text('placa').notNull(),
  marca: text('marca'),
  modelo: text('modelo'),
  anio: integer('anio'),
  color: text('color'),
  tipo: tipoVehiculoEnum('tipo'),
  notas: text('notas'),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniquePlaca: unique().on(t.clienteId, t.placa),
  idxPlaca: index('idx_vehiculos_placa').on(t.placa),
}));

export const categoriasServicio = pgTable('categorias_servicio', {
  id: uuid('id').primaryKey().defaultRandom(),
  sucursalId: uuid('sucursal_id').notNull().references(() => sucursales.id),
  nombre: text('nombre').notNull(),
  orden: integer('orden').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const servicios = pgTable('servicios', {
  id: uuid('id').primaryKey().defaultRandom(),
  sucursalId: uuid('sucursal_id').notNull().references(() => sucursales.id),
  categoriaId: uuid('categoria_id').references(() => categoriasServicio.id),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  precio: numeric('precio', { precision: 10, scale: 2 }).notNull(),
  duracionMin: integer('duracion_min').default(30),
  aplicaA: text('aplica_a').array().default([]),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const paquetes = pgTable('paquetes', {
  id: uuid('id').primaryKey().defaultRandom(),
  sucursalId: uuid('sucursal_id').notNull().references(() => sucursales.id),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  precio: numeric('precio', { precision: 10, scale: 2 }).notNull(),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const paqueteServicios = pgTable('paquete_servicios', {
  paqueteId: uuid('paquete_id').notNull().references(() => paquetes.id, { onDelete: 'cascade' }),
  servicioId: uuid('servicio_id').notNull().references(() => servicios.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.paqueteId, t.servicioId] }),
}));

export const turnosCaja = pgTable('turnos_caja', {
  id: uuid('id').primaryKey().defaultRandom(),
  sucursalId: uuid('sucursal_id').notNull().references(() => sucursales.id),
  empleadoId: text('empleado_id').notNull().references(() => usuarios.id),
  apertura: timestamp('apertura', { withTimezone: true }).notNull().defaultNow(),
  cierre: timestamp('cierre', { withTimezone: true }),
  montoInicial: numeric('monto_inicial', { precision: 10, scale: 2 }).notNull().default('0'),
  montoFinal: numeric('monto_final', { precision: 10, scale: 2 }),
  observaciones: text('observaciones'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const ordenes = pgTable('ordenes', {
  id: uuid('id').primaryKey().defaultRandom(),
  sucursalId: uuid('sucursal_id').notNull().references(() => sucursales.id),
  turnoId: uuid('turno_id').references(() => turnosCaja.id),
  vehiculoId: uuid('vehiculo_id').notNull().references(() => vehiculos.id),
  empleadoId: text('empleado_id').references(() => usuarios.id), // lavador
  cajeroId: text('cajero_id').references(() => usuarios.id),     // cajero que abre la orden
  estado: estadoOrdenEnum('estado').notNull().default('pendiente'),
  prioridad: integer('prioridad').default(0),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).default('0'),
  descuento: numeric('descuento', { precision: 10, scale: 2 }).default('0'),
  igv: numeric('igv', { precision: 10, scale: 2 }).default('0'),
  total: numeric('total', { precision: 10, scale: 2 }).default('0'),
  notas: text('notas'),
  nroTicket: text('nro_ticket').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxEst: index('idx_ordenes_estado').on(t.estado),
  idxCre: index('idx_ordenes_created_at').on(t.createdAt),
  idxSuc: index('idx_ordenes_sucursal').on(t.sucursalId, t.createdAt),
  idxVeh: index('idx_ordenes_vehiculo').on(t.vehiculoId),
}));

export const ordenServicios = pgTable('orden_servicios', {
  id: uuid('id').primaryKey().defaultRandom(),
  ordenId: uuid('orden_id').notNull().references(() => ordenes.id, { onDelete: 'cascade' }),
  servicioId: uuid('servicio_id').notNull().references(() => servicios.id),
  nombreServicio: text('nombre_servicio').notNull(),
  precioUnitario: numeric('precio_unitario', { precision: 10, scale: 2 }).notNull(),
  cantidad: integer('cantidad').default(1),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const pagos = pgTable('pagos', {
  id: uuid('id').primaryKey().defaultRandom(),
  ordenId: uuid('orden_id').notNull().references(() => ordenes.id),
  turnoId: uuid('turno_id').references(() => turnosCaja.id),
  metodo: metodoPagoEnum('metodo').notNull(),
  monto: numeric('monto', { precision: 10, scale: 2 }).notNull(),
  referencia: text('referencia'),
  cajeroId: text('cajero_id').references(() => usuarios.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const puntosFidelidad = pgTable('puntos_fidelidad', {
  id: uuid('id').primaryKey().defaultRandom(),
  clienteId: uuid('cliente_id').notNull().references(() => clientes.id),
  ordenId: uuid('orden_id').references(() => ordenes.id),
  puntos: integer('puntos').notNull(),
  tipo: tipoPuntosEnum('tipo').notNull(),
  descripcion: text('descripcion'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const inventario = pgTable('inventario', {
  id: uuid('id').primaryKey().defaultRandom(),
  sucursalId: uuid('sucursal_id').notNull().references(() => sucursales.id),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  unidad: text('unidad').default('unidad'),
  stock: numeric('stock', { precision: 10, scale: 3 }).default('0'),
  stockMinimo: numeric('stock_minimo', { precision: 10, scale: 3 }).default('0'),
  precioCompra: numeric('precio_compra', { precision: 10, scale: 2 }),
  proveedor: text('proveedor'),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const inventarioMovimientos = pgTable('inventario_movimientos', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuid('item_id').notNull().references(() => inventario.id),
  tipo: tipoMovimientoEnum('tipo').notNull(),
  cantidad: numeric('cantidad', { precision: 10, scale: 3 }).notNull(),
  motivo: text('motivo'),
  usuarioId: text('usuario_id').references(() => usuarios.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const notificaciones = pgTable('notificaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  usuarioId: text('usuario_id').notNull().references(() => usuarios.id),
  tipo: text('tipo').notNull(),
  titulo: text('titulo').notNull(),
  mensaje: text('mensaje'),
  leida: boolean('leida').default(false),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// --- RELACIONES DRIZZLE (relations) ---

export const sucursalesRelations = relations(sucursales, ({ many }) => ({
  usuarios: many(usuarios),
  clientes: many(clientes),
  categorias: many(categoriasServicio),
  servicios: many(servicios),
  paquetes: many(paquetes),
  turnos: many(turnosCaja),
  ordenes: many(ordenes),
  inventarios: many(inventario),
}));

export const usuariosRelations = relations(usuarios, ({ one, many }) => ({
  sucursal: one(sucursales, { fields: [usuarios.sucursalId], references: [sucursales.id] }),
  sesiones: many(sesiones),
  cuentas: many(cuentas),
  turnos: many(turnosCaja),
  ordenesLavador: many(ordenes, { relationName: 'empleado_id' }),
  ordenesCajero: many(ordenes, { relationName: 'cajero_id' }),
  pagosRegistrados: many(pagos),
  movimientosInventario: many(inventarioMovimientos),
  notificaciones: many(notificaciones),
}));

export const clientesRelations = relations(clientes, ({ one, many }) => ({
  sucursal: one(sucursales, { fields: [clientes.sucursalId], references: [sucursales.id] }),
  vehiculos: many(vehiculos),
  puntosFidelidad: many(puntosFidelidad),
}));

export const vehiculosRelations = relations(vehiculos, ({ one, many }) => ({
  cliente: one(clientes, { fields: [vehiculos.clienteId], references: [clientes.id] }),
  ordenes: many(ordenes),
}));

export const categoriasServicioRelations = relations(categoriasServicio, ({ one, many }) => ({
  sucursal: one(sucursales, { fields: [categoriasServicio.sucursalId], references: [sucursales.id] }),
  servicios: many(servicios),
}));

export const serviciosRelations = relations(servicios, ({ one, many }) => ({
  sucursal: one(sucursales, { fields: [servicios.sucursalId], references: [sucursales.id] }),
  categoria: one(categoriasServicio, { fields: [servicios.categoriaId], references: [categoriasServicio.id] }),
  paquetes: many(paqueteServicios),
  ordenes: many(ordenServicios),
}));

export const paquetesRelations = relations(paquetes, ({ one, many }) => ({
  sucursal: one(sucursales, { fields: [paquetes.sucursalId], references: [sucursales.id] }),
  servicios: many(paqueteServicios),
}));

export const paqueteServiciosRelations = relations(paqueteServicios, ({ one }) => ({
  paquete: one(paquetes, { fields: [paqueteServicios.paqueteId], references: [paquetes.id] }),
  servicio: one(servicios, { fields: [paqueteServicios.servicioId], references: [servicios.id] }),
}));

export const turnosCajaRelations = relations(turnosCaja, ({ one, many }) => ({
  sucursal: one(sucursales, { fields: [turnosCaja.sucursalId], references: [sucursales.id] }),
  empleado: one(usuarios, { fields: [turnosCaja.empleadoId], references: [usuarios.id] }),
  ordenes: many(ordenes),
  pagos: many(pagos),
}));

export const ordenesRelations = relations(ordenes, ({ one, many }) => ({
  sucursal: one(sucursales, { fields: [ordenes.sucursalId], references: [sucursales.id] }),
  turno: one(turnosCaja, { fields: [ordenes.turnoId], references: [turnosCaja.id] }),
  vehiculo: one(vehiculos, { fields: [ordenes.vehiculoId], references: [vehiculos.id] }),
  empleado: one(usuarios, { fields: [ordenes.empleadoId], references: [usuarios.id] }),
  cajero: one(usuarios, { fields: [ordenes.cajeroId], references: [usuarios.id] }),
  servicios: many(ordenServicios),
  pagos: many(pagos),
  puntosFidelidad: many(puntosFidelidad),
}));

export const ordenServiciosRelations = relations(ordenServicios, ({ one }) => ({
  orden: one(ordenes, { fields: [ordenServicios.ordenId], references: [ordenes.id] }),
  servicio: one(servicios, { fields: [ordenServicios.servicioId], references: [servicios.id] }),
}));

export const pagosRelations = relations(pagos, ({ one }) => ({
  orden: one(ordenes, { fields: [pagos.ordenId], references: [ordenes.id] }),
  turno: one(turnosCaja, { fields: [pagos.turnoId], references: [turnosCaja.id] }),
  cajero: one(usuarios, { fields: [pagos.cajeroId], references: [usuarios.id] }),
}));

export const puntosFidelidadRelations = relations(puntosFidelidad, ({ one }) => ({
  cliente: one(clientes, { fields: [puntosFidelidad.clienteId], references: [clientes.id] }),
  orden: one(ordenes, { fields: [puntosFidelidad.ordenId], references: [ordenes.id] }),
}));

export const inventarioRelations = relations(inventario, ({ one, many }) => ({
  sucursal: one(sucursales, { fields: [inventario.sucursalId], references: [sucursales.id] }),
  movimientos: many(inventarioMovimientos),
}));

export const inventarioMovimientosRelations = relations(inventarioMovimientos, ({ one }) => ({
  item: one(inventario, { fields: [inventarioMovimientos.itemId], references: [inventario.id] }),
  usuario: one(usuarios, { fields: [inventarioMovimientos.usuarioId], references: [usuarios.id] }),
}));

export const notificacionesRelations = relations(notificaciones, ({ one }) => ({
  usuario: one(usuarios, { fields: [notificaciones.usuarioId], references: [usuarios.id] }),
}));
