"use client";

import { useState, useTransition } from "react";
import {
  UserCog,
  ClipboardCheck,
  Coins,
  UserPlus,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  registrarEmpleado,
  actualizarEmpleado,
  cambiarEstadoEmpleado,
  getOrdenesPendientesLiquidacion,
} from "@/lib/actions/empleados";
import { toast } from "sonner";
import { EmpleadosGrid, type Empleado } from "./components/EmpleadosGrid";
import { CrearEmpleadoModal } from "./components/CrearEmpleadoModal";
import { EditarEmpleadoModal } from "./components/EditarEmpleadoModal";
import { LiquidarComisionModal, type OrdenPendiente } from "./components/LiquidarComisionModal";
import { formatCurrency } from "@/lib/formats";
import { useSession } from "@/lib/auth-client";

interface EmpleadosClientProps {
  initialEmpleados: Empleado[];
}

export function EmpleadosClient({ initialEmpleados }: EmpleadosClientProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [empleados, setEmpleados] = useState<Empleado[]>(initialEmpleados);
  const [isPending, startTransition] = useTransition();
  const [showGuide, setShowGuide] = useState(false);

  // Estados de modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  // Estado para Liquidación de Comisiones
  const [liquidarOpen, setLiquidarOpen] = useState(false);
  const [liquidarEmpleado, setLiquidarEmpleado] = useState<Empleado | null>(null);
  const [ordenesPendientes, setOrdenesPendientes] = useState<OrdenPendiente[]>([]);

  const handleSave = async (data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rol: "admin" | "supervisor" | "cajero" | "lavador";
  }): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const res = await registrarEmpleado(data);

        if (res.success && res.data) {
          toast.success("Personal registrado con éxito");
          const newEmp: Empleado = {
            ...res.data,
            totalLavados: 0,
            montoLavado: 0,
            comisionAcumulada: 0,
            ordenesPendientesLiquidar: 0,
          } as Empleado;
          setEmpleados((prev) => [...prev, newEmp]);
          resolve(true);
        } else {
          toast.error(res.error || "Ocurrió un error");
          resolve(false);
        }
      });
    });
  };

  const handleEditSave = async (
    id: string,
    data: {
      nombre: string;
      apellido: string;
      telefono: string;
      rol: "admin" | "supervisor" | "cajero" | "lavador";
    }
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const res = await actualizarEmpleado(id, data);

        if (res.success && res.data) {
          toast.success("Ficha de personal actualizada");
          setEmpleados((prev) =>
            prev.map((emp) =>
              emp.id === id
                ? {
                    ...emp,
                    nombre: res.data.nombre,
                    apellido: res.data.apellido,
                    telefono: res.data.telefono,
                    rol: res.data.rol as Empleado["rol"],
                  }
                : emp
            )
          );
          resolve(true);
        } else {
          toast.error(res.error || "Ocurrió un error");
          resolve(false);
        }
      });
    });
  };

  const handleToggleStatus = async (id: string, active: boolean) => {
    startTransition(async () => {
      const res = await cambiarEstadoEmpleado(id, active);

      if (res.success) {
        toast.success(
          active
            ? "Personal dado de alta con éxito"
            : "Personal dado de baja con éxito"
        );
        setEmpleados((prev) =>
          prev.map((emp) => (emp.id === id ? { ...emp, activo: active } : emp))
        );
      } else {
        toast.error(res.error || "No se pudo cambiar el estado del personal.");
      }
    });
  };

  const handleEditClick = (emp: Empleado) => {
    setSelectedEmpleado(emp);
    setIsEditOpen(true);
  };

  const handleLiquidarClick = async (emp: Empleado) => {
    setLiquidarEmpleado(emp);
    const rows = await getOrdenesPendientesLiquidacion(emp.id);
    setOrdenesPendientes(rows);
    setLiquidarOpen(true);
  };

  const handleLiquidacionSuccess = (montoLiquidado: number, ordenesLiquidadas: number) => {
    if (!liquidarEmpleado) return;
    setEmpleados((prev) =>
      prev.map((emp) =>
        emp.id === liquidarEmpleado.id
          ? {
              ...emp,
              comisionAcumulada: Math.max(0, emp.comisionAcumulada - montoLiquidado),
              ordenesPendientesLiquidar: Math.max(
                0,
                (emp.ordenesPendientesLiquidar ?? emp.totalLavados) - ordenesLiquidadas
              ),
            }
          : emp
      )
    );
  };

  // KPIs
  const empleadosActivos = empleados.filter((e) => e.activo);
  const totalPersonal = empleadosActivos.length;
  const totalLavadores = empleadosActivos.filter((e) => e.rol === "lavador").length;
  const totalServiciosLavados = empleados.reduce((acc, curr) => acc + curr.totalLavados, 0);
  const totalComisiones = empleadosActivos.reduce(
    (acc, curr) => acc + curr.comisionAcumulada,
    0
  );

  return (
    <div
      suppressHydrationWarning
      className="space-y-5 sm:space-y-6 text-foreground transition-opacity duration-300"
    >
      {/* Header */}
      <div
        suppressHydrationWarning
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div suppressHydrationWarning>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCog className="h-7 w-7 text-secondary" />
            Gestión de Empleados y Comisiones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Directorio de personal, productividad en bahía y liquidación de comisiones (30%).
          </p>
        </div>
        <div suppressHydrationWarning className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowGuide((prev) => !prev)}
            className="h-10 text-xs font-bold gap-1.5 rounded-xl border-border bg-card/80 hover:bg-muted text-foreground cursor-pointer shadow-xs"
          >
            <Lightbulb className="size-4 text-amber-500" />
            <span className="hidden sm:inline">Política de Comisiones</span>
            {showGuide ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-xl shadow-sm"
          >
            <UserPlus className="h-4.5 w-4.5" />
            Registrar Personal
          </Button>
        </div>
      </div>

      {/* Guía desplegable de comisiones */}
      {showGuide && (
        <div className="p-4 rounded-2xl border border-secondary/25 bg-secondary/5 text-secondary text-xs space-y-2 leading-relaxed animate-in fade-in-0">
          <p className="font-bold text-secondary flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-secondary shrink-0" />
            ¿Cómo funciona el cálculo y liquidación de comisiones?
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-1">
            <li>
              <strong>Base de Cálculo:</strong> Cada orden completada o cobrada asignada a un lavador suma automáticamente a su producción.
            </li>
            <li>
              <strong>Comisión del 30%:</strong> Los operarios de lavado devengan una comisión fija del <strong>30%</strong> sobre el importe de los servicios atendidos.
            </li>
            <li>
              <strong>Liquidación Directa:</strong> Haz clic en <em>Liquidar Comisión</em> en la tarjeta del lavador para seleccionar los tickets pendientes y registrar el pago.
            </li>
          </ul>
        </div>
      )}

      {/* 4-Card Compact KPI Dock */}
      <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
          {/* 1. Personal Activo */}
          <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
            <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <UserCog className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                Personal Activo
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                  {totalPersonal}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  de {empleados.length} registrados
                </span>
              </div>
            </div>
          </div>

          {/* 2. Lavadores en Patio */}
          <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors border-l border-border/50 lg:border-l-0">
            <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <ClipboardCheck className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
                Operarios de Lavado
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                  {totalLavadores}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  en bahías activas
                </span>
              </div>
            </div>
          </div>

          {/* 3. Servicios Atendidos */}
          <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
            <div className="size-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shrink-0">
              <Sparkles className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider block truncate">
                Órdenes Atendidas
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                  {totalServiciosLavados}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  lavados completados
                </span>
              </div>
            </div>
          </div>

          {/* 4. Comisiones por Pagar */}
          <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors border-l border-border/50 lg:border-l-0">
            <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <Coins className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
                Comisiones por Liquidar
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                  {formatCurrency(totalComisiones)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  tasa 30%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Employees Grid Component */}
      <EmpleadosGrid
        empleados={empleados}
        currentUserId={currentUserId}
        onEditClick={handleEditClick}
        onToggleStatus={handleToggleStatus}
        onLiquidarClick={handleLiquidarClick}
      />

      {/* CREATE EMPLOYEE MODAL */}
      <CrearEmpleadoModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        isPending={isPending}
        onSave={handleSave}
      />

      {/* EDIT EMPLOYEE MODAL */}
      <EditarEmpleadoModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEmpleado(null);
        }}
        isPending={isPending}
        empleado={selectedEmpleado}
        currentUserId={currentUserId}
        onSave={handleEditSave}
      />

      {/* LIQUIDAR COMISION MODAL */}
      <LiquidarComisionModal
        open={liquidarOpen}
        onOpenChange={setLiquidarOpen}
        empleadoId={liquidarEmpleado?.id || ""}
        empleadoNombre={
          liquidarEmpleado
            ? `${liquidarEmpleado.nombre} ${liquidarEmpleado.apellido || ""}`.trim()
            : ""
        }
        ordenesPendientes={ordenesPendientes}
        onSuccess={handleLiquidacionSuccess}
      />
    </div>
  );
}
