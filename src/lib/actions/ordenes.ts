"use server";

import { db } from "@/lib/db";
import {
  ordenes,
  ordenServicios,
  vehiculos,
  clientes,
  usuarios,
  servicios,
  turnosCaja,
  pagos,
  sucursales,
  servicioRecetas,
  inventario,
  inventarioMovimientos,
  puntosFidelidad,
} from "@/lib/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { enviarNotificacionPushLocal } from "./push";
import { revalidatePath, revalidateTag } from "next/cache";

import { getErrorMessage } from "./action-utils";

// Obtener todas las órdenes de la sucursal actual
export async function getOrdenes() {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const result = await db
      .select({
        id: ordenes.id,
        nroTicket: ordenes.nroTicket,
        estado: ordenes.estado,
        prioridad: ordenes.prioridad,
        total: ordenes.total,
        notas: ordenes.notas,
        createdAt: ordenes.createdAt,
        updatedAt: ordenes.updatedAt,
        placa: vehiculos.placa,
        vehiculoMarca: vehiculos.marca,
        vehiculoModelo: vehiculos.modelo,
        vehiculoTipo: vehiculos.tipo,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        lavadorNombre: usuarios.nombre,
        lavadorApellido: usuarios.apellido,
        comprobanteTipo: ordenes.comprobanteTipo,
        comprobanteSerie: ordenes.comprobanteSerie,
        comprobanteNumero: ordenes.comprobanteNumero,
      })
      .from(ordenes)
      .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .leftJoin(usuarios, eq(ordenes.empleadoId, usuarios.id)) // Asignado a (lavador)
      .where(eq(ordenes.sucursalId, sucursalId))
      .orderBy(desc(ordenes.createdAt));

    return result;
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return [];
  }
}

// Obtener lista de lavadores activos de la sucursal para asignar
export async function getEmpleadosLavadores() {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    return await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
      })
      .from(usuarios)
      .where(
        and(
          eq(usuarios.sucursalId, sucursalId),
          eq(usuarios.rol, "lavador"),
          eq(usuarios.activo, true)
        )
      );
  } catch (error) {
    console.error("Error al obtener lavadores:", error);
    return [];
  }
}

// Obtener una orden detallada por su ID con sus servicios
export async function getOrdenById(id: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;
    const isSuperAdmin = session.user.rol === "superadmin";

    const query = db
      .select({
        id: ordenes.id,
        nroTicket: ordenes.nroTicket,
        estado: ordenes.estado,
        prioridad: ordenes.prioridad,
        subtotal: ordenes.subtotal,
        descuento: ordenes.descuento,
        total: ordenes.total,
        notas: ordenes.notas,
        createdAt: ordenes.createdAt,
        placa: vehiculos.placa,
        vehiculoMarca: vehiculos.marca,
        vehiculoModelo: vehiculos.modelo,
        vehiculoColor: vehiculos.color,
        vehiculoTipo: vehiculos.tipo,
        clienteId: clientes.id,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        clienteTelefono: clientes.telefono,
        clienteEmail: clientes.email,
        lavadorId: usuarios.id,
        lavadorNombre: usuarios.nombre,
        lavadorApellido: usuarios.apellido,
        comprobanteTipo: ordenes.comprobanteTipo,
        comprobanteSerie: ordenes.comprobanteSerie,
        comprobanteNumero: ordenes.comprobanteNumero,
        facturadoAt: ordenes.facturadoAt,
      })
      .from(ordenes)
      .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .leftJoin(usuarios, eq(ordenes.empleadoId, usuarios.id));

    if (isSuperAdmin) {
      query.where(eq(ordenes.id, id));
    } else {
      query.where(and(eq(ordenes.id, id), eq(ordenes.sucursalId, sucursalId)));
    }

    const [ordenDetail] = await query;

    if (!ordenDetail) return null;

    // Obtener los servicios de la orden
    const serviciosAsociados = await db
      .select()
      .from(ordenServicios)
      .where(eq(ordenServicios.ordenId, id));

    return {
      ...ordenDetail,
      servicios: serviciosAsociados,
    };
  } catch (error) {
    console.error("Error al obtener detalle de orden:", error);
    return null;
  }
}

// Crear una nueva orden con cliente/vehículo on-the-fly si es necesario
export async function createOrden(data: {
  placa: string;
  vehiculoTipo: "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro";
  vehiculoMarca?: string;
  vehiculoModelo?: string;
  vehiculoColor?: string;
  clienteNombre: string;
  clienteApellido?: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  serviciosSeleccionados: { id: string; precio: string; nombre: string }[];
  empleadoId?: string | null; // lavador
  notas?: string;
  prioridad?: number;
  descuento?: string;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "crear" });
    const sucursalId = session.user.sucursalId!;
    const cajeroId = session.user.id;
    const selectedServiceIds = data.serviciosSeleccionados.map((servicio) => servicio.id);

    if (selectedServiceIds.length === 0) {
      throw new Error("Seleccione al menos un servicio.");
    }

    const serviciosSucursal = await db
      .select({
        id: servicios.id,
        nombre: servicios.nombre,
        precio: servicios.precio,
      })
      .from(servicios)
      .where(
        and(
          eq(servicios.sucursalId, sucursalId),
          eq(servicios.activo, true),
          inArray(servicios.id, selectedServiceIds)
        )
      );

    if (serviciosSucursal.length !== selectedServiceIds.length) {
      throw new Error("Uno o más servicios no pertenecen a la sucursal o están inactivos.");
    }

    const serviciosPorId = new Map(serviciosSucursal.map((servicio) => [servicio.id, servicio]));

    if (data.empleadoId) {
      const [lavador] = await db
        .select({ id: usuarios.id })
        .from(usuarios)
        .where(
          and(
            eq(usuarios.id, data.empleadoId),
            eq(usuarios.sucursalId, sucursalId),
            eq(usuarios.rol, "lavador"),
            eq(usuarios.activo, true)
          )
        );

      if (!lavador) {
        throw new Error("El lavador seleccionado no pertenece a la sucursal.");
      }
    }

    // 1. Obtener o crear Cliente
    let clienteId: string;
    const cleanTelefono = data.clienteTelefono?.trim() || "";

    const [existingCliente] = await db
      .select()
      .from(clientes)
      .where(
        and(
          eq(clientes.sucursalId, sucursalId),
          cleanTelefono !== "" ? eq(clientes.telefono, cleanTelefono) : sql`false`
        )
      );

    if (existingCliente) {
      clienteId = existingCliente.id;
    } else {
      const [newCliente] = await db
        .insert(clientes)
        .values({
          sucursalId,
          nombre: data.clienteNombre,
          apellido: data.clienteApellido || null,
          telefono: cleanTelefono || null,
          email: data.clienteEmail || null,
          activo: true,
        })
        .returning();
      clienteId = newCliente.id;
    }

    // 2. Obtener o crear Vehículo
    let vehiculoId: string;
    const cleanPlaca = data.placa.trim().toUpperCase();

    const [existingVehiculo] = await db
      .select()
      .from(vehiculos)
      .where(and(eq(vehiculos.placa, cleanPlaca), eq(vehiculos.clienteId, clienteId)));

    if (existingVehiculo) {
      vehiculoId = existingVehiculo.id;
    } else {
      const [newVehiculo] = await db
        .insert(vehiculos)
        .values({
          clienteId,
          placa: cleanPlaca,
          tipo: data.vehiculoTipo,
          marca: data.vehiculoMarca || null,
          modelo: data.vehiculoModelo || null,
          color: data.vehiculoColor || null,
          activo: true,
        })
        .returning();
      vehiculoId = newVehiculo.id;
    }

    // 3. Obtener turno de caja activo para asociar la orden
    const [activeTurno] = await db
      .select()
      .from(turnosCaja)
      .where(and(eq(turnosCaja.sucursalId, sucursalId), sql`${turnosCaja.cierre} IS NULL`))
      .orderBy(desc(turnosCaja.apertura));

    if (!activeTurno) {
      throw new Error("No es posible registrar la orden porque la caja está cerrada. Por favor abra la caja primero.");
    }

    // 4. Generar número de ticket correlativo único para la sucursal
    const [sucursalInfo] = await db
      .select({ nombre: sucursales.nombre })
      .from(sucursales)
      .where(eq(sucursales.id, sucursalId))
      .limit(1);

    const sucursalNombre = sucursalInfo?.nombre || "TKT";
    const prefix = `T-${sucursalNombre.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)}`;

    const [maxTicket] = await db
      .select({ nroTicket: ordenes.nroTicket })
      .from(ordenes)
      .where(and(eq(ordenes.sucursalId, sucursalId), sql`${ordenes.nroTicket} LIKE ${prefix || ""} || '-%'`))
      .orderBy(desc(ordenes.nroTicket))
      .limit(1);

    let nextNumber = 1;
    if (maxTicket && maxTicket.nroTicket) {
      const parts = maxTicket.nroTicket.split("-");
      const numPart = parts[parts.length - 1];
      const currentMax = parseInt(numPart, 10);
      if (!isNaN(currentMax)) {
        nextNumber = currentMax + 1;
      }
    }

    const nextCorrelativo = nextNumber.toString().padStart(4, "0");
    const nroTicket = `${prefix}-${nextCorrelativo}`;

    // 5. Calcular totales
    let subtotalNumeric = 0;
    selectedServiceIds.forEach((servicioId) => {
      const servicio = serviciosPorId.get(servicioId);
      subtotalNumeric += parseFloat(servicio?.precio || "0");
    });

    const descuentoVal = parseFloat(data.descuento || "0") || 0;
    const totalVal = Math.max(0, subtotalNumeric - descuentoVal);

    // 6. Insertar Orden
    const [newOrden] = await db
      .insert(ordenes)
      .values({
        sucursalId,
        turnoId: activeTurno?.id || null,
        vehiculoId,
        empleadoId: data.empleadoId || null,
        cajeroId,
        estado: "pendiente",
        prioridad: data.prioridad ?? 0,
        subtotal: subtotalNumeric.toString(),
        descuento: descuentoVal.toString(),
        total: totalVal.toString(),
        notas: data.notas || null,
        nroTicket,
      })
      .returning();

    // 7. Insertar Servicios Detallados de la Orden (en 1 solo bulk insert)
    const servicesToInsert = selectedServiceIds
      .map((servicioId) => {
        const servicio = serviciosPorId.get(servicioId);
        if (!servicio) return null;
        return {
          ordenId: newOrden.id,
          servicioId,
          nombreServicio: servicio.nombre,
          precioUnitario: servicio.precio,
          cantidad: 1,
          subtotal: servicio.precio,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    if (servicesToInsert.length > 0) {
      await db.insert(ordenServicios).values(servicesToInsert);
    }

    revalidateTag("dashboard", { expire: 300 });
    revalidatePath("/ordenes");
    revalidatePath("/dashboard");
    return { success: true, data: newOrden };
  } catch (error: unknown) {
    console.error("Error al registrar orden:", error);
    return { success: false, error: getErrorMessage(error, "Error al registrar la orden") };
  }
}

// Actualizar el estado de lavado de una orden
export async function updateOrdenEstado(id: string, nuevoEstado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado") {
  try {
    const session = await getSessionOrThrow({
      modulo: "ordenes",
      accion: nuevoEstado === "cancelado" ? "cancelar" : "cambiarEstado",
    });
    const sucursalId = session.user.sucursalId!;

    // 1. Obtener la orden actual para verificar su estado previo
    const [existing] = await db
      .select({ estado: ordenes.estado })
      .from(ordenes)
      .where(and(eq(ordenes.id, id), eq(ordenes.sucursalId, sucursalId)));

    if (existing && existing.estado === "cobrado" && nuevoEstado === "cancelado") {
      // Reconciliar en caja: borrar transacciones de pago asociadas
      await db.delete(pagos).where(eq(pagos.ordenId, id));
    }

    // 2. Descuento automático de Kardex de Insumos al marcar como 'completado'
    if (existing && nuevoEstado === "completado" && existing.estado !== "completado") {
      const serviciosOrden = await db
        .select({ servicioId: ordenServicios.servicioId })
        .from(ordenServicios)
        .where(eq(ordenServicios.ordenId, id));

      const servicioIds = serviciosOrden.map((s) => s.servicioId);

      if (servicioIds.length > 0) {
        const recetas = await db
          .select({
            itemId: servicioRecetas.itemId,
            cantidadConsumo: servicioRecetas.cantidadConsumo,
          })
          .from(servicioRecetas)
          .where(inArray(servicioRecetas.servicioId, servicioIds));

        await Promise.all(
          recetas.map(async (receta) => {
            const cantidad = parseFloat(receta.cantidadConsumo) || 0;
            if (cantidad > 0) {
              await db
                .update(inventario)
                .set({
                  stock: sql`${inventario.stock} - ${cantidad}`,
                  updatedAt: new Date(),
                })
                .where(eq(inventario.id, receta.itemId));

              await db.insert(inventarioMovimientos).values({
                itemId: receta.itemId,
                tipo: "salida",
                cantidad: receta.cantidadConsumo,
                motivo: `Consumo automático por Orden #${id.substring(0, 8).toUpperCase()}`,
                usuarioId: session.user.id,
              });
            }
          })
        );
        revalidateTag("inventario", { expire: 600 });
      }
    }

    const [updated] = await db
      .update(ordenes)
      .set({
        estado: nuevoEstado,
        // Si se cancela, remover la asociación al turno de caja si existía
        ...(nuevoEstado === "cancelado" ? { turnoId: null } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(ordenes.id, id), eq(ordenes.sucursalId, sucursalId)))
      .returning();

    // Acumulación automática de Puntos de Fidelidad al completar o cobrar
    if ((nuevoEstado === "completado" || nuevoEstado === "cobrado") && updated.vehiculoId) {
      const [veh] = await db
        .select({ clienteId: vehiculos.clienteId })
        .from(vehiculos)
        .where(eq(vehiculos.id, updated.vehiculoId));

      if (veh?.clienteId) {
        const puntosGanados = Math.floor(parseFloat(updated.total || "0"));
        if (puntosGanados > 0) {
          await db
            .insert(puntosFidelidad)
            .values({
              clienteId: veh.clienteId,
              ordenId: updated.id,
              puntos: puntosGanados,
              tipo: "ganado",
              descripcion: `Puntos ganados por Orden #${updated.nroTicket || updated.id.substring(0, 8)}`,
            })
            .catch(() => {});
        }
      }
    }

    revalidateTag("dashboard", { expire: 0 });
    revalidateTag("ordenes", { expire: 0 });
    revalidatePath("/ordenes");
    revalidatePath("/kiosco");
    revalidatePath("/caja");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al actualizar estado de orden:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar estado") };
  }
}

// Asignar lavador a una orden
export async function asignarLavadorAOrden(id: string, empleadoId: string | null) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "asignar" });
    const sucursalId = session.user.sucursalId!;

    if (empleadoId) {
      const [lavador] = await db
        .select({ id: usuarios.id })
        .from(usuarios)
        .where(
          and(
            eq(usuarios.id, empleadoId),
            eq(usuarios.sucursalId, sucursalId),
            eq(usuarios.rol, "lavador"),
            eq(usuarios.activo, true)
          )
        );

      if (!lavador) {
        throw new Error("El lavador seleccionado no pertenece a la sucursal.");
      }
    }

    const [updated] = await db
      .update(ordenes)
      .set({
        empleadoId: empleadoId || null,
        updatedAt: new Date(),
      })
      .where(and(eq(ordenes.id, id), eq(ordenes.sucursalId, sucursalId)))
      .returning();

    revalidateTag("dashboard", { expire: 300 });
    revalidatePath("/ordenes");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al asignar lavador:", error);
    return { success: false, error: getErrorMessage(error, "Error al asignar") };
  }
}

// Registrar comprobante SUNAT emitido manualmente
export async function registrarComprobanteSunat(data: {
  ordenId: string;
  tipo: "boleta" | "factura" | null;
  serie?: string;
  numero?: string;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "crear" });
    const sucursalId = session.user.sucursalId!;
    const isSuperAdmin = session.user.rol === "superadmin";

    let updatedRows = [];

    if (data.tipo) {
      if (!data.serie || !data.numero) {
        throw new Error("Serie y número son obligatorios para registrar un comprobante");
      }

      const serieClean = data.serie.trim().toUpperCase();
      const numeroClean = data.numero.trim();

      // Validar serie (ej: B001 o F001, 4 caracteres)
      if (!/^[BF][A-Z0-9]{3}$/.test(serieClean)) {
        throw new Error("La serie debe iniciar con B o F y tener exactamente 4 caracteres (Ej: B001, F001)");
      }

      // Validar número (hasta 8 dígitos)
      if (!/^\d{1,8}$/.test(numeroClean)) {
        throw new Error("El número debe ser únicamente dígitos (hasta 8 dígitos)");
      }

      // Rellenar con ceros a la izquierda hasta 8 dígitos
      const numeroPadded = numeroClean.padStart(8, "0");

      const query = db
        .update(ordenes)
        .set({
          comprobanteTipo: data.tipo,
          comprobanteSerie: serieClean,
          comprobanteNumero: numeroPadded,
          facturadoAt: new Date(),
          updatedAt: new Date(),
        });

      if (isSuperAdmin) {
        updatedRows = await query.where(eq(ordenes.id, data.ordenId)).returning();
      } else {
        updatedRows = await query.where(and(eq(ordenes.id, data.ordenId), eq(ordenes.sucursalId, sucursalId))).returning();
      }
    } else {
      // Limpiar comprobante (revertir a nota de venta)
      const query = db
        .update(ordenes)
        .set({
          comprobanteTipo: null,
          comprobanteSerie: null,
          comprobanteNumero: null,
          facturadoAt: null,
          updatedAt: new Date(),
        });

      if (isSuperAdmin) {
        updatedRows = await query.where(eq(ordenes.id, data.ordenId)).returning();
      } else {
        updatedRows = await query.where(and(eq(ordenes.id, data.ordenId), eq(ordenes.sucursalId, sucursalId))).returning();
      }
    }

    if (updatedRows.length === 0) {
      throw new Error("No se pudo actualizar la orden. Verifique si pertenece a la sucursal activa o sus permisos.");
    }

    revalidatePath("/ordenes");
    revalidatePath(`/ordenes/${data.ordenId}/ticket`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error al registrar comprobante SUNAT:", error);
    return { success: false, error: getErrorMessage(error, "Error al registrar comprobante") };
  }
}

// Obtener automáticamente el siguiente número correlativo para la serie de comprobantes
export async function getSiguienteCorrelativoComprobante(
  tipo: "boleta" | "factura",
  serieInput?: string
) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const serie = (serieInput || (tipo === "boleta" ? "B001" : "F001")).toUpperCase().trim();

    const [row] = await db
      .select({
        maxNum: sql<string>`MAX(${ordenes.comprobanteNumero})`,
      })
      .from(ordenes)
      .where(
        and(
          eq(ordenes.sucursalId, sucursalId),
          eq(ordenes.comprobanteTipo, tipo),
          eq(ordenes.comprobanteSerie, serie)
        )
      );

    let nextNumber = 1;
    if (row?.maxNum) {
      const parsed = parseInt(row.maxNum, 10);
      if (!isNaN(parsed) && parsed > 0) {
        nextNumber = parsed + 1;
      }
    }

    const numeroPadded = nextNumber.toString().padStart(8, "0");

    return {
      success: true,
      serie,
      numero: numeroPadded,
    };
  } catch (error) {
    console.error("Error al obtener siguiente correlativo:", error);
    return {
      success: false,
      serie: tipo === "boleta" ? "B001" : "F001",
      numero: "00000001",
    };
  }
}

