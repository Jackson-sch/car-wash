import { ShieldCheck, HelpCircle } from "lucide-react";

export function BootstrapHeader() {
  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md z-10">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
        <span className="font-extrabold tracking-wider text-sm text-white">
          WashMaster<span className="text-cyan-400"> Pro</span>
        </span>
      </div>
      <div className="text-xs text-white/50 flex items-center gap-1.5 font-medium">
        <HelpCircle className="h-4 w-4" />
        Configuración Inicial
      </div>
    </header>
  );
}
