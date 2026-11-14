"use server";

import { db } from "@/lib/db";
import { proveedores, compras } from "@/lib/db/schema";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";

export interface ProveedorInput {
  id?: string;
  ruc?: string | null;
  razonSocial: string;
  nombreComercial?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  contactoNombre?: string | null;
  banco?: string | null;
  cuentaBancaria?: string | null;
  cci?: string | null;
  notas?: string | null;
}

export async function getProveedoresAction() {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const rows = await db
      .select()
      .from(proveedores)
      .where(eq(proveedores.sucursalId, sucursalId))
      .orderBy(desc(proveedores.updatedAt), proveedores.razonSocial);

    // Agregar estadísticas por proveedor desde compras completadas
    const statsRows = await db
      .select({
        proveedorId: compras.proveedorId,
        totalCompras: sql<number>`count(*)::int`,
        montoTotal: sql<string>`coalesce(sum(${compras.total}), 0)`,
        ultimaCompra: sql<string>`max(${compras.fechaEmision})`,
      })
      .from(compras)
      .where(and(eq(compras.sucursalId, sucursalId), eq(compras.estado, "completada")))
      .groupBy(compras.proveedorId);

    const statsMap = new Map(
      statsRows
        .filter((s) => s.proveedorId !== null)
        .map((s) => [
          s.proveedorId!,
          {
            totalCompras: Number(s.totalCompras || 0),
            montoTotal: parseFloat(s.montoTotal || "0"),
            ultimaCompra: s.ultimaCompra ? new Date(s.ultimaCompra) : null,
          },
        ])
    );

    const data = rows.map((p) => {
      const st = statsMap.get(p.id) || {
        totalCompras: 0,
        montoTotal: 0,
        ultimaCompra: null,
      };
      return {
        ...p,
        ...st,
      };
    });

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error al obtener proveedores:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Error al cargar el directorio de proveedores"),
      data: [],
    };
  }
}

export async function getProveedoresParaAutocompleteAction() {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const list = await db
      .select({
        id: proveedores.id,
        ruc: proveedores.ruc,
        razonSocial: proveedores.razonSocial,
        nombreComercial: proveedores.nombreComercial,
        direccion: proveedores.direccion,
        telefono: proveedores.telefono,
        email: proveedores.email,
        contactoNombre: proveedores.contactoNombre,
        banco: proveedores.banco,
        cuentaBancaria: proveedores.cuentaBancaria,
        cci: proveedores.cci,
      })
      .from(proveedores)
      .where(and(eq(proveedores.sucursalId, sucursalId), eq(proveedores.activo, true)))
      .orderBy(proveedores.razonSocial);

    return { success: true, data: list };
  } catch (error: unknown) {
    console.error("Error al obtener proveedores para autocompletado:", error);
    return { success: false, error: getErrorMessage(error, "Error al cargar proveedores"), data: [] };
  }
}

export async function buscarProveedorPorRucAction(query: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "ver" });
    const sucursalId = session.user.sucursalId!;
    const clean = query.trim();
    if (!clean) return { success: true, data: null };

    const exact = await db
      .select()
      .from(proveedores)
      .where(
        and(
          eq(proveedores.sucursalId, sucursalId),
          or(
            eq(proveedores.ruc, clean),
            ilike(proveedores.razonSocial, `%${clean}%`)
          )
        )
      )
      .limit(1);

    return { success: true, data: exact[0] || null };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, "Error buscando proveedor"), data: null };
  }
}

export async function upsertProveedorAction(data: ProveedorInput) {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    if (!data.razonSocial?.trim()) {
      return { success: false, error: "La Razón Social o nombre es obligatorio." };
    }

    const rucClean = data.ruc?.trim() || null;

    if (data.id) {
      // Check duplicate RUC on another record
      if (rucClean) {
        const dup = await db
          .select({ id: proveedores.id })
          .from(proveedores)
          .where(
            and(
              eq(proveedores.sucursalId, sucursalId),
              eq(proveedores.ruc, rucClean)
            )
          )
          .limit(1);

        if (dup[0] && dup[0].id !== data.id) {
          return {
            success: false,
            error: `Ya existe otro proveedor registrado con el RUC ${rucClean}.`,
          };
        }
      }

      const [updated] = await db
        .update(proveedores)
        .set({
          ruc: rucClean,
          razonSocial: data.razonSocial.trim(),
          nombreComercial: data.nombreComercial?.trim() || null,
          direccion: data.direccion?.trim() || null,
          telefono: data.telefono?.trim() || null,
          email: data.email?.trim() || null,
          contactoNombre: data.contactoNombre?.trim() || null,
          banco: data.banco?.trim() || null,
          cuentaBancaria: data.cuentaBancaria?.trim() || null,
          cci: data.cci?.trim() || null,
          notas: data.notas?.trim() || null,
          updatedAt: new Date(),
        })
        .where(and(eq(proveedores.id, data.id), eq(proveedores.sucursalId, sucursalId)))
        .returning();

      revalidatePath("/compras");
      revalidatePath("/compras/proveedores");
      revalidatePath("/compras/nueva");
      return { success: true, data: updated };
    } else {
      // Crear o actualizar si coincide el RUC
      if (rucClean) {
        const existing = await db
          .select()
          .from(proveedores)
          .where(
            and(
              eq(proveedores.sucursalId, sucursalId),
              eq(proveedores.ruc, rucClean)
            )
          )
          .limit(1);

        if (existing[0]) {
          return {
            success: false,
            error: `El proveedor con RUC ${rucClean} ya se encuentra registrado (${existing[0].razonSocial}).`,
          };
        }
      }

      const [created] = await db
        .insert(proveedores)
        .values({
          sucursalId,
          ruc: rucClean,
          razonSocial: data.razonSocial.trim(),
          nombreComercial: data.nombreComercial?.trim() || null,
          direccion: data.direccion?.trim() || null,
          telefono: data.telefono?.trim() || null,
          email: data.email?.trim() || null,
          contactoNombre: data.contactoNombre?.trim() || null,
          banco: data.banco?.trim() || null,
          cuentaBancaria: data.cuentaBancaria?.trim() || null,
          cci: data.cci?.trim() || null,
          notas: data.notas?.trim() || null,
          activo: true,
        })
        .returning();

      revalidatePath("/compras");
      revalidatePath("/compras/proveedores");
      revalidatePath("/compras/nueva");
      return { success: true, data: created };
    }
  } catch (error: unknown) {
    console.error("Error al guardar proveedor:", error);
    return { success: false, error: getErrorMessage(error, "Error al guardar el proveedor") };
  }
}

export async function toggleEstadoProveedorAction(id: string, activo: boolean) {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    await db
      .update(proveedores)
      .set({ activo, updatedAt: new Date() })
      .where(and(eq(proveedores.id, id), eq(proveedores.sucursalId, sucursalId)));

    revalidatePath("/compras");
    revalidatePath("/compras/proveedores");
    revalidatePath("/compras/nueva");

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error, "Error al actualizar estado") };
  }
}

export async function getProveedorByIdAction(proveedorId: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const prov = await db.query.proveedores.findFirst({
      where: and(eq(proveedores.id, proveedorId), eq(proveedores.sucursalId, sucursalId)),
      with: {
        compras: {
          orderBy: [desc(compras.fechaEmision), desc(compras.createdAt)],
          with: {
            detalles: {
              with: {
                insumo: {
                  columns: { id: true, nombre: true, unidad: true },
                },
              },
            },
          },
        },
      },
    });

    if (!prov) {
      return { success: false, error: "Proveedor no encontrado.", data: null };
    }

    return { success: true, data: prov };
  } catch (error: unknown) {
    console.error("Error al obtener proveedor:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Error al cargar la ficha del proveedor"),
      data: null,
    };
  }
}
