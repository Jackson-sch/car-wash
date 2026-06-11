"use client";

import { Sparkles, ShieldCheck, Zap, Database } from "lucide-react";

export function RegisterBenefitsPanel() {
  return (
    <div className="hidden lg:col-span-7 bg-zinc-50 border-l border-border relative overflow-hidden lg:flex flex-col justify-between p-16 z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-500/10 to-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="self-start inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/25 bg-secondary/5 text-secondary text-xs font-semibold">
        <Sparkles className="h-3.5 w-3.5" />
        Únete a la eficiencia operativa
      </div>

      <div className="my-auto max-w-lg space-y-8 relative">
        <div className="space-y-4">
          <h3 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Controla todo desde <span className="text-secondary">cualquier lugar</span>
          </h3>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Al registrar tu cuenta, tendrás acceso a herramientas de alta fidelidad diseñadas para agilizar la entrada de órdenes, la facturación y el seguimiento del lavado en tiempo real.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="h-9 w-9 rounded-md bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Seguridad y Roles</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Acceso personalizado según tu puesto (administrador, cajero, supervisor o lavador).</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="h-9 w-9 rounded-md bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Órdenes en Tiempo Real</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Visualiza el avance del lavado de vehículos mediante un tablero ágil e interactivo.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="h-9 w-9 rounded-md bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Conectividad de Base de Datos</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Toda la información de tus clientes y caja está sincronizada y respaldada de manera segura.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>WashMaster Pro v1.0</span>
        <span>© 2026 Jackson Tech Inc.</span>
      </div>
    </div>
  );
}
