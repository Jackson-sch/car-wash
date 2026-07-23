export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { planes } from "@/lib/db/schema";
import { PlanesClient } from "./planes-client";


export default async function SuperAdminPlanesPage() {
  const raw = await db.select().from(planes).orderBy(planes.precio);
  const planesData = raw.map((p) => ({ ...p, features: p.features as Record<string, boolean> }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Gestión de Planes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define los planes de suscripción, sus límites y características disponibles para los inquilinos.
        </p>
      </div>

      <PlanesClient initialPlanes={planesData} />
    </div>
  );
}
