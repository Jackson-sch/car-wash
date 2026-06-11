import { Suspense } from "react";
import { getNotificaciones } from "@/lib/actions/notificaciones";
import { NotificacionesClient } from "./notificaciones-client";

export const metadata = {
  title: "Notificaciones | WashMaster Pro",
  description: "Centro de notificaciones del sistema",
};

export default async function NotificacionesPage() {
  const notificaciones = await getNotificaciones(100);

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando notificaciones...</div>}>
      <NotificacionesClient initialNotificaciones={notificaciones} />
    </Suspense>
  );
}
