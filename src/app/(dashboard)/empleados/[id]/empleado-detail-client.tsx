"use client";

import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { buttonVariants } from "@/components/ui/variants";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar 
} from "lucide-react";
import { EmployeeKpis } from "./components/EmployeeKpis";
import dynamic from "next/dynamic";

const ProductivityChart = dynamic(
  () => import("./components/ProductivityChart").then((m) => ({ default: m.ProductivityChart })),
  { ssr: false }
);
import { RecentOrdersList } from "./components/RecentOrdersList";

interface Empleado {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  rol: "superadmin" | "admin" | "supervisor" | "cajero" | "lavador";
  activo: boolean | null;
  createdAt: Date | null;
}

interface KPIStats {
  totalServicios: number;
  montoTotal: number;
  comisionAcumulada: number;
  ticketPromedio: number;
  turnosTotales: number;
}

interface ProductividadPunto {
  fecha: string;
  cantidad: number;
  total: number;
}

interface OrdenReciente {
  id: string;
  nroTicket: string | null;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  total: string | null;
  createdAt: Date | null;
  placa: string;
  vehiculoMarca: string | null;
  vehiculoModelo: string | null;
  vehiculoTipo: "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro" | null;
  clienteNombre: string;
  clienteApellido: string | null;
}

interface EmpleadoDetailClientProps {
  data: {
    empleado: Empleado;
    kpis: KPIStats;
    productividadDiaria: ProductividadPunto[];
    ordenesRecientes: OrdenReciente[];
  };
}

const ROL_ESPANOL: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Administrador",
  supervisor: "Supervisor",
  cajero: "Cajero",
  lavador: "Lavador / Operario",
};

const ROL_COLORS: Record<string, string> = {
  superadmin: "border-indigo-200 text-indigo-800 bg-indigo-50 dark:border-indigo-800/40 dark:text-indigo-300 dark:bg-indigo-950/20",
  admin: "border-rose-200 text-rose-800 bg-rose-50 dark:border-rose-800/40 dark:text-rose-300 dark:bg-rose-950/20",
  supervisor: "border-purple-200 text-purple-800 bg-purple-50 dark:border-purple-800/40 dark:text-purple-300 dark:bg-purple-950/20",
  cajero: "border-blue-200 text-blue-800 bg-blue-50 dark:border-blue-800/40 dark:text-blue-300 dark:bg-blue-950/20",
  lavador: "border-emerald-200 text-emerald-800 bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-300 dark:bg-emerald-950/20",
};

export function EmpleadoDetailClient({ data }: EmpleadoDetailClientProps) {
  const { empleado, kpis, productividadDiaria, ordenesRecientes } = data;

  const formattedJoinDate = empleado.createdAt
    ? format(new Date(empleado.createdAt), "dd 'de' MMMM, yyyy", { locale: es })
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Header / Back Action */}
      <div className="flex items-center gap-3">
        <Link
          href="/empleados"
          className={`cursor-pointer ${buttonVariants({ variant: "outline", size: "icon-sm" })}`}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-base font-extrabold text-foreground tracking-tight">
            Ficha de Rendimiento
          </h1>
          <p className="text-[10px] text-muted-foreground">
            Perfil de personal, KPIs operativos y comisiones registradas
          </p>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <Card className="p-6 border border-border bg-card shadow-sm hover:border-zinc-350 transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted text-foreground font-black flex items-center justify-center text-xl uppercase border border-border shrink-0 shadow-inner">
              {empleado.nombre.charAt(0)}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-foreground leading-none">
                  {empleado.nombre} {empleado.apellido || ""}
                </h2>
                <span
                  className={`inline-block text-[9px] font-bold rounded px-1.5 py-0.5 border uppercase ${
                    ROL_COLORS[empleado.rol] || ""
                  }`}
                >
                  {ROL_ESPANOL[empleado.rol] || empleado.rol}
                </span>
                <span
                  className={`inline-block text-[9px] font-bold rounded px-1.5 py-0.5 border uppercase ${
                    empleado.activo
                      ? "border-emerald-200 text-emerald-800 bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-300 dark:bg-emerald-950/20"
                      : "border-zinc-300 text-zinc-500 bg-zinc-50 dark:border-zinc-700/40 dark:text-zinc-400 dark:bg-zinc-800/20"
                  }`}
                >
                  {empleado.activo ? "Activo" : "De Baja"}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-medium">
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{empleado.email}</span>
                </div>
                {empleado.telefono && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{empleado.telefono}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Ingreso: {formattedJoinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <EmployeeKpis rol={empleado.rol} kpis={kpis} />

      {/* Charts & Trends */}
      <div className="grid grid-cols-1 gap-6">
        <ProductivityChart data={productividadDiaria} rol={empleado.rol} />
      </div>

      {/* Recent Orders List */}
      <RecentOrdersList ordenes={ordenesRecientes} />
    </div>
  );
}
