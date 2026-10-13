"use client";

import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lavador {
  id: string;
  nombre: string;
  apellido: string | null;
}

interface PasoOperacionNotasProps {
  lavadores: Lavador[];
  empleadoId: string;
  setEmpleadoId: (id: string) => void;
  prioridad: number;
  setPrioridad: (p: number) => void;
  notas: string;
  setNotas: (n: string) => void;
  placa: string;
}

export function PasoOperacionNotas({
  lavadores,
  empleadoId,
  setEmpleadoId,
  prioridad,
  setPrioridad,
  notas,
  setNotas,
  placa,
}: PasoOperacionNotasProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 transition-opacity duration-300">
      <Card className="p-6 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider">
          Parámetros Operativos
        </h2>

        <div className="space-y-2">
          <Label htmlFor="lavador" className="text-xs font-bold text-foreground">
            Asignar Lavador Responsable (Opcional)
          </Label>
          <Select
            value={empleadoId || "unassigned"}
            onValueChange={(val: string | null) => setEmpleadoId(!val || val === "unassigned" ? "" : val)}
          >
            <SelectTrigger id="lavador" className="w-full bg-card border-border text-foreground rounded-xl text-xs sm:text-sm h-10 px-3">
              <SelectValue placeholder="Dejar sin asignar (cola de espera)">
                {(val) => {
                  if (!val || val === "unassigned") return "Dejar sin asignar (cola de espera)";
                  const lavador = lavadores.find((l) => l.id === val);
                  return lavador ? `${lavador.nombre} ${lavador.apellido || ""}` : val;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-full bg-card text-card-foreground border border-border">
              <SelectItem value="unassigned">Dejar sin asignar (cola de espera)</SelectItem>
              {lavadores.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.nombre} {l.apellido || ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-foreground">Prioridad del Lavado</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPrioridad(0)}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                prioridad === 0
                  ? "bg-secondary/10 border-secondary text-secondary ring-1 ring-secondary/40 shadow-xs"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${prioridad === 0 ? "border-secondary bg-secondary" : "border-border"}`}>
                {prioridad === 0 && <div className="size-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Normal</p>
                <p className="text-[10px] text-muted-foreground">Cola de espera estándar</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPrioridad(1)}
              className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                prioridad === 1
                  ? "bg-amber-500/10 border-amber-500 text-amber-500 ring-1 ring-amber-500/40 shadow-xs"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${prioridad === 1 ? "border-amber-500 bg-amber-500" : "border-border"}`}>
                {prioridad === 1 && <div className="size-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Express / Prioritario</p>
                <p className="text-[10px] text-muted-foreground">Atención preferente en bahía</p>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs font-bold text-foreground">
            Notas de Trabajo / Observaciones del Auto
          </Label>
          <textarea
            id="notes"
            placeholder="Ej. Cuidado con el espejo izquierdo flojo, aspirar bien la maletera..."
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={4}
            className="w-full bg-card border border-border focus:border-secondary rounded-xl text-xs sm:text-sm p-3 outline-none resize-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      {/* Confirm Details Summary */}
      <Card className="p-5 border border-amber-200 dark:border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">Validación de Datos</h4>
          <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-relaxed font-bold">
            Por favor, confirma que la placa <span className="text-muted-foreground font-extrabold">{placa.toUpperCase()}</span> y los datos del cliente son correctos antes de enviar. Al guardar, se generará el ticket de servicio en estado &ldquo;En Espera&rdquo;.
          </p>
        </div>
      </Card>
    </div>
  );
}
