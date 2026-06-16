"use client";

import { useState, useTransition } from "react";
import { UserCog, ClipboardCheck, Coins, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registrarEmpleado } from "@/lib/actions/empleados";
import { StatsCard } from "@/components/shared/StatsCard";
import { toast } from "sonner";
import { EmpleadosGrid } from "./components/EmpleadosGrid";
import { CrearEmpleadoModal } from "./components/CrearEmpleadoModal";
import { formatCurrency } from "@/lib/formats";

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
  const [empleados, setEmpleados] = useState<Empleado[]>(initialEmpleados);
  const [isPending, startTransition] = useTransition();

  // Estados del modal de registro
  const [isOpen, setIsOpen] = useState(false);

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

  // KPIs
  const totalPersonal = empleados.length;
  const totalLavadores = empleados.filter((e) => e.rol === "lavador").length;
  const totalComisiones = empleados.reduce(
    (acc, curr) => acc + curr.comisionAcumulada,
    0,
  );

  return (
    <div className="space-y-8 text-foreground">
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
            onClick={() => setIsOpen(true)}
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
          label="Total de Personal"
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
      <EmpleadosGrid empleados={empleados} />

      {/* CREATE EMPLOYEE MODAL */}
      <CrearEmpleadoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isPending={isPending}
        onSave={handleSave}
      />
    </div>
  );
}
