"use server";

import { db } from "@/lib/db";
import { servicios, categoriasServicio, sucursales } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { canDo, PERMISSIONS } from "@/lib/auth/permissions";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";

type PermissionModule = keyof typeof PERMISSIONS;

export async function getSessionOrThrow(permission?: {
  modulo: PermissionModule;
  accion: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("No autorizado. Inicie sesión nuevamente.");
  }

  // Si el usuario no tiene sucursal asociada (ej. administración central),
  // se asigna automáticamente la primera sucursal activa de la base de datos
  if (!session.user?.sucursalId) {
    const activeSucursales = await db.select().from(sucursales).limit(1);
    if (activeSucursales[0]) {
      session.user.sucursalId = activeSucursales[0].id;
    } else {
      throw new Error("No autorizado: no hay sucursales registradas en el sistema.");
    }
  }

  if (permission && !canDo(session.user.rol, permission.modulo, permission.accion)) {
    throw new Error("No autorizado para realizar esta acción.");
  }

  return session;
}

// Obtener todas las categorías de servicio de la sucursal
export async function getCategoriasServicio() {
  try {
    const session = await getSessionOrThrow({ modulo: "servicios", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    return await db
      .select()
      .from(categoriasServicio)
      .where(eq(categoriasServicio.sucursalId, sucursalId))
      .orderBy(categoriasServicio.orden);
  } catch (error) {
    console.error("Error al obtener categorías de servicio:", error);
    return [];
  }
}

// Obtener todos los servicios activos
export async function getServicios() {
  try {
    const session = await getSessionOrThrow({ modulo: "servicios", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    return await db
      .select({
        id: servicios.id,
        nombre: servicios.nombre,
        descripcion: servicios.descripcion,
        precio: servicios.precio,
        duracionMin: servicios.duracionMin,
        aplicaA: servicios.aplicaA,
        activo: servicios.activo,
        categoriaId: servicios.categoriaId,
        categoriaNombre: categoriasServicio.nombre,
      })
      .from(servicios)
      .leftJoin(categoriasServicio, eq(servicios.categoriaId, categoriasServicio.id))
      .where(and(eq(servicios.sucursalId, sucursalId), eq(servicios.activo, true)))
      .orderBy(servicios.nombre);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return [];
  }
}

// Crear un nuevo servicio
export async function createServicio(data: {
  nombre: string;
  descripcion?: string | null;
  precio: string; // numeric as string
  duracionMin?: number;
  categoriaId?: string | null;
  aplicaA?: string[];
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "servicios", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [newServicio] = await db
      .insert(servicios)
      .values({
        sucursalId,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio: data.precio,
        duracionMin: data.duracionMin ?? 30,
        categoriaId: data.categoriaId || null,
        aplicaA: data.aplicaA || [],
        activo: true,
      })
      .returning();

    revalidatePath("/servicios");
    return { success: true, data: newServicio };
  } catch (error: unknown) {
    console.error("Error al crear servicio:", error);
    return { success: false, error: getErrorMessage(error, "Error al crear el servicio") };
  }
}

// Actualizar un servicio existente
export async function updateServicio(
  id: string,
  data: {
    nombre?: string;
    descripcion?: string | null;
    precio?: string;
    duracionMin?: number;
    categoriaId?: string | null;
    aplicaA?: string[];
    activo?: boolean;
  }
) {
  try {
    const session = await getSessionOrThrow({ modulo: "servicios", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [updated] = await db
      .update(servicios)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(servicios.id, id), eq(servicios.sucursalId, sucursalId)))
      .returning();

    revalidatePath("/servicios");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al actualizar servicio:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar el servicio") };
  }
}

// Desactivar o eliminar lógicamente un servicio
export async function deleteServicio(id: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "servicios", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    await db
      .update(servicios)
      .set({
        activo: false,
        updatedAt: new Date(),
      })
      .where(and(eq(servicios.id, id), eq(servicios.sucursalId, sucursalId)));

    revalidatePath("/servicios");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error al eliminar servicio:", error);
    return { success: false, error: getErrorMessage(error, "Error al eliminar el servicio") };
  }
}

// Crear una categoría de servicio
export async function createCategoriaServicio(nombre: string, orden: number = 0) {
  try {
    const session = await getSessionOrThrow({ modulo: "servicios", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [newCat] = await db
      .insert(categoriasServicio)
      .values({
        sucursalId,
        nombre,
        orden,
      })
      .returning();

    revalidatePath("/servicios");
    return { success: true, data: newCat };
  } catch (error: unknown) {
    console.error("Error al crear categoría:", error);
    return { success: false, error: getErrorMessage(error, "Error al crear la categoría") };
  }
}

// Pre-cargar datos demo de servicios
export async function preCargarServiciosDemo() {
  try {
    const session = await getSessionOrThrow({ modulo: "servicios", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    // Verificar si ya existen categorías
    const existingCats = await db
      .select()
      .from(categoriasServicio)
      .where(eq(categoriasServicio.sucursalId, sucursalId));

    if (existingCats.length > 0) {
      return { success: false, error: "Ya existen servicios o categorías en este catálogo." };
    }

    // 1. Crear Categorías
    const catsData = [
      { nombre: "Lavado Básico", orden: 1 },
      { nombre: "Lavado Premium", orden: 2 },
      { nombre: "Detallado & Cuidado", orden: 3 },
      { nombre: "Servicios Especiales", orden: 4 },
    ];

    const insertedCats = [];
    for (const c of catsData) {
      const [inserted] = await db
        .insert(categoriasServicio)
        .values({
          sucursalId,
          nombre: c.nombre,
          orden: c.orden,
        })
        .returning();
      insertedCats.push(inserted);
    }

    // 2. Crear Servicios
    const serviciosDemo = [
      {
        nombre: "Lavado Completo CarWash",
        descripcion: "Lavado exterior con shampoo PH neutro, aspirado de salón completo, silicona en plásticos y perfume premium.",
        precio: "30.00",
        duracionMin: 30,
        categoriaId: insertedCats[0].id,
        aplicaA: ["sedan", "suv", "moto"],
      },
      {
        nombre: "Lavado Premium & Chasis",
        descripcion: "Lavado completo + lavado de chasis con removedor de grasa, cera líquida protectora y limpieza profunda de aros.",
        precio: "50.00",
        duracionMin: 45,
        categoriaId: insertedCats[1].id,
        aplicaA: ["sedan", "suv", "pickup"],
      },
      {
        nombre: "Lavado de Motor Express",
        descripcion: "Limpieza técnica de motor con desengrasante biodegradable, secado con aire a presión y abrillantador de mangueras.",
        precio: "45.00",
        duracionMin: 40,
        categoriaId: insertedCats[3].id,
        aplicaA: ["sedan", "suv", "pickup", "otro"],
      },
      {
        nombre: "Encerado Orbital Premium",
        descripcion: "Encerado profesional con cera de carnauba aplicando pulidora orbital para un brillo espejo y protección por 3 meses.",
        precio: "120.00",
        duracionMin: 90,
        categoriaId: insertedCats[2].id,
        aplicaA: ["sedan", "suv", "pickup"],
      },
      {
        nombre: "Lavado de Salón e Interiores",
        descripcion: "Desmontado de asientos, lavado al detalle con máquina de inyección-extracción de alfombras, techos, puertas y desinfección con ozono.",
        precio: "280.00",
        duracionMin: 180,
        categoriaId: insertedCats[2].id,
        aplicaA: ["sedan", "suv", "pickup", "camion"],
      },
      {
        nombre: "Lavado Full Moto Especial",
        descripcion: "Lavado detallado para motocicletas, desengrasado de cadena, lavado de motor y aplicación de cera protectora de pintura.",
        precio: "25.00",
        duracionMin: 30,
        categoriaId: insertedCats[0].id,
        aplicaA: ["moto"],
      },
    ];

    for (const s of serviciosDemo) {
      await db.insert(servicios).values({
        sucursalId,
        nombre: s.nombre,
        descripcion: s.descripcion,
        precio: s.precio,
        duracionMin: s.duracionMin,
        categoriaId: s.categoriaId,
        aplicaA: s.aplicaA,
        activo: true,
      });
    }

    revalidatePath("/servicios");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error al cargar demo:", error);
    return { success: false, error: getErrorMessage(error, "Error al cargar los datos de prueba") };
  }
}
