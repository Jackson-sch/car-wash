import { Card } from "@/components/ui/card";

interface TurnoResumenCardProps {
  resumen: {
    totalServicios: number;
    ventasBrutas: number;
    descuentos: number;
    ingresosNetos: number;
  };
}

export function TurnoResumenCard({ resumen }: TurnoResumenCardProps) {
  return (
    <Card className="p-5 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4">
      <h2 className="text-xs uppercase font-black text-zinc-700 tracking-wider border-b border-border pb-1">
        Resumen Operativo del Turno
      </h2>
      
      <div className="space-y-2.5 text-xs text-zinc-700">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Servicios Cobrados</span>
          <span className="font-bold text-zinc-800">{resumen.totalServicios}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Ventas Brutas</span>
          <span className="font-bold text-zinc-800">S/ {resumen.ventasBrutas.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Descuentos Aplicados</span>
          <span className="font-bold text-rose-600">- S/ {resumen.descuentos.toFixed(2)}</span>
        </div>
        <div className="border-t border-border pt-2.5 flex justify-between items-baseline font-bold">
          <span className="text-zinc-900">Ingresos Netos del Turno</span>
          <span className="text-secondary text-sm font-extrabold">S/ {resumen.ingresosNetos.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
