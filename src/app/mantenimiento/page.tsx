import { db } from "@/lib/db";
import { configGlobal } from "@/lib/db/schema";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MantenimientoPage() {
  const [config] = await db.select().from(configGlobal).limit(1);
  const mensaje = config?.mantenimientoMensaje || "Estamos realizando tareas de mantenimiento. Vuelve pronto.";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Wrench className="size-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Mantenimiento Programado
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mensaje}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 pt-4">
            <span>WashMaster Pro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
