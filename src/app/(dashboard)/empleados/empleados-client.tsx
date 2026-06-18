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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          label="Total de Personal Activo"
          value={totalPersonal}
          icon={<UserCog className="h-5 w-5" />}
        />
        <StatsCard
          label="Lavadores Activos"
          value={totalLavadores}
          icon={<ClipboardCheck className="h-5 w-5" />}
          iconColor="text-blue-500"
        />
        <StatsCard
          label="Comisiones por Pagar (30%)"
          value={`${formatCurrency(totalComisiones)}`}
          icon={<Coins className="h-5 w-5" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          valueColor="text-emerald-600"
        />
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
