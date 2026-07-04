"use client";

import { useState, useTransition } from "react";
import { UserCog, ClipboardCheck, Coins, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  registrarEmpleado,
  actualizarEmpleado,
  cambiarEstadoEmpleado,
} from "@/lib/actions/empleados";
import { StatsCard } from "@/components/shared/StatsCard";
import { toast } from "sonner";
import { EmpleadosGrid } from "./components/EmpleadosGrid";
import { CrearEmpleadoModal } from "./components/CrearEmpleadoModal";
import { EditarEmpleadoModal } from "./components/EditarEmpleadoModal";
import { formatCurrency } from "@/lib/formats";
import { useSession } from "@/lib/auth-client";

interface Empleado {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  rol: "superadmin" | "admin" | "supervisor" | "cajero" | "lavador";
  activo: boolean | null;
  totalLavados: number;
  montoLavado: number;
  comisionAcumulada: number;
  sucursalNombre?: string | null;
}

interface EmpleadosClientProps {
  initialEmpleados: Empleado[];
}

export function EmpleadosClient({ initialEmpleados }: EmpleadosClientProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [empleados, setEmpleados] = useState<Empleado[]>(initialEmpleados);
  const [isPending, startTransition] = useTransition();

  // Estados de modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  // Registrar empleado
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

  // Modificar empleado
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
                    rol: res.data.rol as any,
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

  // Dar de baja o reactivar empleado
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
          prev.map((emp) =>
            emp.id === id
              ? {
                  ...emp,
                  activo: active,
                }
              : emp
          )
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

  // KPIs (Only counting active employees for personal stats)
  const empleadosActivos = empleados.filter((e) => e.activo);
  const totalPersonal = empleadosActivos.length;
  const totalLavadores = empleadosActivos.filter((e) => e.rol === "lavador").length;
  const totalComisiones = empleadosActivos.reduce(
    (acc, curr) => acc + curr.comisionAcumulada,
    0
  );

  return (
    <div className="space-y-8 text-foreground animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCog className="h-7 w-7 text-secondary" />
            Gestión de Empleados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administración del personal, comisiones devengadas por servicios de
            lavado completados.
          </p>
        </div>
        <div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm"
          >
            <UserPlus className="h-4.5 w-4.5" />
            Registrar Personal
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Personal */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Total de Personal Activo
              </span>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                {totalPersonal} <span className="text-sm font-medium text-muted-foreground">colaboradores</span>
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110 duration-300">
              <UserCog className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            <span>Colaboradores registrados y activos</span>
          </div>
          {/* Subtle gradient glow */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 2: Lavadores Activos */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-500/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Lavadores Activos
              </span>
              <h3 className="text-3xl font-extrabold text-blue-500 tracking-tight">
                {totalLavadores} <span className="text-sm font-medium text-muted-foreground">lavadores</span>
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110 duration-300">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {totalPersonal > 0 ? (
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(totalLavadores / totalPersonal) * 100}%` }}
                />
              </div>
            ) : (
              <div className="h-1.5" />
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Operarios en bahía de lavado
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card 3: Comisiones */}
        <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-500/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Comisiones por Pagar
              </span>
              <h3 className="text-3xl font-extrabold text-emerald-500 tracking-tight">
                {formatCurrency(totalComisiones)}
              </h3>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110 duration-300">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Suma acumulada por pagar</span>
          </div>
          {/* Subtle gradient glow */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Explicación de comisiones de lavadores */}
      <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 text-secondary text-xs space-y-2 leading-relaxed">
        <p className="font-bold text-secondary flex items-center gap-1.5">
          💡 ¿Cómo funcionan las comisiones de lavado?
        </p>
        <p className="text-muted-foreground">
          La comisión devengada por el personal de lavado se calcula de manera transparente al completarse un servicio asignado:
        </p>
        <ul className="list-disc pl-5 text-muted-foreground/80 space-y-1">
          <li><strong>Monto del Lavado:</strong> Representa la facturación bruta total de los servicios que el lavador atendió directamente.</li>
          <li><strong>Comisión Acumulada:</strong> Por política de negocio, los lavadores reciben una tasa fija del <strong>30%</strong> calculada sobre el precio base de cada servicio realizado, acumulándose automáticamente en su saldo.</li>
        </ul>
      </div>

      {/* Employees Grid Component */}
      <EmpleadosGrid
        empleados={empleados}
        currentUserId={currentUserId}
        onEditClick={handleEditClick}
        onToggleStatus={handleToggleStatus}
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
    </div>
  );
}
