"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface VehiclePlateProps {
  plate: string;
  country?: string;
  size?: "xs" | "sm" | "md" | "lg";
  copyable?: boolean;
  className?: string;
}

function getSizeClasses(size: "xs" | "sm" | "md" | "lg") {
  switch (size) {
    case "xs":
      return {
        container: "px-1.5 py-0.5 min-w-[70px]",
        country: "text-[5px] tracking-widest",
        number: "text-[10px] tracking-wider font-extrabold",
        icon: "h-2 w-2",
      };
    case "md":
      return {
        container: "px-3 py-1 min-w-[110px]",
        country: "text-[7px] tracking-widest",
        number: "text-[15px] tracking-widest font-black",
        icon: "h-3 w-3",
      };
    case "lg":
      return {
        container: "px-4 py-2 min-w-[150px] shadow-md",
        country: "text-[9px] tracking-widest",
        number: "text-[22px] tracking-widest font-black",
        icon: "h-3.5 w-3.5",
      };
    case "sm":
    default:
      return {
        container: "px-2 py-0.5 min-w-[84px]",
        country: "text-[6px] tracking-widest",
        number: "text-[12px] tracking-widest font-black",
        icon: "h-2.5 w-2.5",
      };
  }
}

export function VehiclePlate({
  plate,
  country = "PERÚ",
  size = "sm",
  copyable = true,
  className = "",
}: VehiclePlateProps) {
  const [copied, setCopied] = useState(false);

  // Normalizar placa (limpiar espacios y mayúsculas)
  const cleanPlate = plate ? plate.trim().toUpperCase() : "---";

  const handleCopy = (e: React.MouseEvent) => {
    if (!copyable) return;
    e.stopPropagation();
    navigator.clipboard.writeText(cleanPlate);
    setCopied(true);
    toast.success(`Placa ${cleanPlate} copiada`, { duration: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = getSizeClasses(size);

  return (
    <div
      onClick={copyable ? handleCopy : undefined}
      title={copyable ? "Clic para copiar placa" : undefined}
      className={`group relative inline-flex flex-col items-center justify-center rounded-md border border-zinc-700/80 bg-zinc-950 text-zinc-100 font-mono shadow-xs select-all transition-all duration-200 ${
        copyable
          ? "cursor-pointer hover:border-secondary hover:ring-2 hover:ring-secondary/20 hover:scale-[1.02] active:scale-95"
          : ""
      } ${sizeClasses.container} ${className}`}
    >
      {/* Tornillos de placa decorativos en tamaños md y lg */}
      {(size === "md" || size === "lg") && (
        <>
          <div className="absolute top-1 left-1.5 h-1.5 w-1.5 rounded-full bg-zinc-600 border border-zinc-800" />
          <div className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-zinc-600 border border-zinc-800" />
        </>
      )}

      {/* Franja superior país */}
      <span className={`uppercase font-bold text-zinc-400 leading-none ${sizeClasses.country}`}>
        {country}
      </span>

      {/* Número de placa */}
      <div className="flex items-center gap-1 mt-0.5">
        <span className={`leading-none text-zinc-100 ${sizeClasses.number}`}>
          {cleanPlate}
        </span>

        {/* Icono de copiado al hacer hover */}
        {copyable && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 text-zinc-400">
            {copied ? (
              <Check className={`${sizeClasses.icon} text-emerald-400`} />
            ) : (
              <Copy className={sizeClasses.icon} />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
