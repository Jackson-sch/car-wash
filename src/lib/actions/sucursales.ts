"use server";

import { db } from "@/lib/db";
import { sucursales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getActiveSucursales() {
  try {
    return await db
      .select({
        id: sucursales.id,
        nombre: sucursales.nombre,
      })
      .from(sucursales)
      .where(eq(sucursales.activa, true));
  } catch (error) {
    console.error("Error fetching active branches:", error);
    return [];
  }
}
