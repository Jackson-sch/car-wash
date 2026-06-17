"use client";

import Link from "next/link";
import { PlusCircle, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TipoIcon } from "./TipoIcon";
import { TIPO_LABELS, VehiculoData } from "../types";

interface VehiculoHeroProps {
  vehiculo: VehiculoData;
  onEditClick: () => void;
}

export function VehiculoHero({ vehiculo, onEditClick }: VehiculoHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-linear-to-br from-card/95 via-card/50 to-muted/20 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-6 shadow-lg shadow-black/5">
      <style>{`
        @keyframes shine {
          0% { background-position: 150% 0; }
          100% { background-position: -50% 0; }
        }
      `}</style>

      {/* Background gradient decorative elements */}
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="h-20 w-20 rounded-2xl bg-secondary/10 dark:bg-secondary/20 text-secondary border border-secondary/15 flex items-center justify-center shrink-0 shadow-inner">
          <TipoIcon tipo={vehiculo.tipo} className="h-10 w-10 animate-pulse" />
        </div>
        <div className="space-y-3 flex flex-col items-center sm:items-start">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            {/* Placa reflective style with shimmer animation */}
            <div className="relative overflow-hidden bg-white dark:bg-zinc-950 border-[2.5px] border-zinc-950 dark:border-zinc-200 px-4 py-1.5 rounded-lg shadow-xs flex flex-col items-center justify-center font-mono select-none tracking-widest min-w-[125px]">
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                  background: 'linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.35) 48%, rgba(255, 255, 255, 0.55) 50%, rgba(255, 255, 255, 0.35) 52%, transparent 65%)',
                  backgroundSize: '200% 100%',
                  animation: 'shine 4s infinite linear'
                }}
              />
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 flex justify-between px-2 items-center">
                <div className="flex gap-0.5 h-[3px] w-2 items-center mt-[-px]">
                  <span className="bg-red-600 w-[2.5px] h-full" />
                  <span className="bg-white w-[2px] h-full" />
                  <span className="bg-red-600 w-[2.5px] h-full" />
                </div>
                <span className="text-[6px] font-black text-white leading-none">PE</span>
              </div>
              <span className="text-[7px] font-extrabold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase leading-none mt-0.5">PERÚ</span>
              <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-widest py-0.5 leading-none mt-0.5">{vehiculo.placa}</span>
            </div>
            <Badge 
              variant={vehiculo.activo ? "default" : "secondary"} 
              className={`text-[9px] font-extrabold tracking-wider uppercase ${
                vehiculo.activo 
                  ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse" 
                  : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
              }`}
            >
              {vehiculo.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {vehiculo.marca || "—"} {vehiculo.modelo || ""}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary" />
              {TIPO_LABELS[vehiculo.tipo || ""] || vehiculo.tipo || "—"}
              {vehiculo.anio && <> &middot; Año {vehiculo.anio}</>}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Button 
          variant="outline"
          onClick={onEditClick}
          className="w-full sm:w-auto gap-2 border-border hover:border-zinc-350 dark:hover:border-zinc-700 bg-card/65 font-bold h-11 px-6 rounded-xl transition-all hover:scale-102 duration-300 cursor-pointer text-foreground shadow-xs"
        >
          <Edit3 className="h-4 w-4 text-muted-foreground" />
          Editar
        </Button>
        <Link href={`/ordenes/nueva?vehiculoId=${vehiculo.id}`} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2 bg-secondary hover:bg-secondary/90 text-white font-bold h-11 px-6 rounded-xl shadow-md shadow-secondary/15 transition-all hover:scale-102 duration-300 cursor-pointer">
            <PlusCircle className="h-5 w-5" />
            Nueva Orden
          </Button>
        </Link>
      </div>
    </div>
  );
}
