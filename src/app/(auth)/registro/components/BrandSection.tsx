export function BrandSection() {
  return (
    <div className="md:col-span-5 space-y-6 text-left hidden md:block">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/10 text-cyan-400 text-[10px] font-bold tracking-wider uppercase animate-pulse">
        Instalador del Sistema
      </div>
      <h1 className="text-3xl font-extrabold leading-tight text-white tracking-tight">
        Configura tu primer autolavado en{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
          segundos
        </span>.
      </h1>
      <p className="text-sm text-zinc-400 leading-relaxed font-medium">
        Al no detectarse usuarios en la base de datos, has entrado al asistente de inicialización. Define tus datos de Administrador y el nombre de la sucursal matriz para arrancar el sistema.
      </p>

      <div className="space-y-3 pt-2">
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 mt-0.5">1</div>
          <p className="text-xs text-zinc-400 font-medium">Se crea la sucursal matriz por defecto.</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 mt-0.5">2</div>
          <p className="text-xs text-zinc-400 font-medium">Se crea la primera cuenta con rol de Administrador.</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-5 w-5 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 mt-0.5">3</div>
          <p className="text-xs text-zinc-400 font-medium">Una vez creada, el registro público se bloquea automáticamente por seguridad.</p>
        </div>
      </div>
    </div>
  );
}
