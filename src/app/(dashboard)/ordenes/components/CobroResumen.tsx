import { User, Car } from "lucide-react";
import { formatCurrency } from "@/lib/formats";
import { OrdenResumen } from "./CobrarModal";

interface CobroResumenProps {
  orden: OrdenResumen;
  totalNum: number;
}

export function CobroResumen({ orden, totalNum }: CobroResumenProps) {
  return (
    <div className="p-4 bg-zinc-50/30 border border-zinc-100 rounded-2xl space-y-3 shadow-inner">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] font-black uppercase text-zinc-450 tracking-wider">
            Cliente y Vehículo
          </p>
          <div className="flex flex-col gap-1 mt-1.5 text-xs text-zinc-700">
            {orden.clienteNombre ? (
              <span className="flex items-center gap-1.5 font-bold text-zinc-900">
                <User className="size-3.5 text-zinc-400" />
                {orden.clienteNombre} {orden.clienteApellido || ""}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-zinc-400 italic">
                <User className="size-3.5" />
                Cliente genérico
              </span>
            )}
            {orden.vehiculoMarca && (
              <span className="flex items-center gap-1.5 capitalize font-medium text-zinc-550">
                <Car className="size-3.5 text-zinc-400" />
                {orden.vehiculoMarca} {orden.vehiculoModelo || ""}
              </span>
            )}
          </div>
        </div>

        {/* Badge de Placa Peruana Realista con colores estables para evitar problemas en modo oscuro */}
        <div className="inline-flex flex-col items-center bg-amber-400 border border-amber-500 rounded px-2.5 py-0.5 shadow-sm">
          <span className="text-[7px] uppercase font-bold text-amber-900/80 tracking-widest leading-none">
            PERU
          </span>
          <span className="text-xs font-mono font-black text-black tracking-widest leading-none mt-0.5">
            {orden.placa.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Monto Total */}
      <div className="pt-3 border-t border-zinc-200/50 flex justify-between items-center">
        <span className="text-xs font-bold text-zinc-650">
          Total a Pagar
        </span>
        <span className="text-2xl font-black text-secondary">
          {formatCurrency(totalNum)}
        </span>
      </div>
    </div>
  );
}
