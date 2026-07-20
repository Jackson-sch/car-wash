import {
  LayoutDashboard,
  Users,
  Layers,
  ClipboardList,
  Wallet,
  BarChart3,
  UserCog,
  Package,
  Settings,
  Tag,
  BadgeDollarSign,
  History,
  Tv,
} from "lucide-react";
import { canDo } from "@/lib/auth/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  show: boolean;
}

export const superAdminNavItems: NavItem[] = [
  {
    label: "Resumen Global",
    href: "/superadmin",
    icon: LayoutDashboard,
    show: true,
  },
  {
    label: "Empresas SaaS",
    href: "/superadmin/empresas",
    icon: Layers,
    show: true,
  },
  {
    label: "Planes",
    href: "/superadmin/planes",
    icon: BadgeDollarSign,
    show: true,
  },
  {
    label: "Auditoría",
    href: "/superadmin/logs",
    icon: History,
    show: true,
  },
  {
    label: "Configuración",
    href: "/superadmin/configuracion",
    icon: Settings,
    show: true,
  },
];


export function getMainNavItems(rol: string): NavItem[] {
  return [
    {
      label: "Resumen",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: "Kiosco Live (TV)",
      href: "/kiosco",
      icon: Tv,
      show: canDo(rol, "ordenes", "ver"),
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: Users,
      show: canDo(rol, "clientes", "ver"),
    },
    {
      label: "Vehículos",
      href: "/vehiculos",
      icon: Layers,
      show: canDo(rol, "clientes", "ver"),
    },
    {
      label: "Servicios",
      href: "/servicios",
      icon: Layers,
      show: canDo(rol, "configuracion", "ver") || canDo(rol, "ordenes", "crear"),
    },
    {
      label: "Órdenes",
      href: "/ordenes",
      icon: ClipboardList,
      show: canDo(rol, "ordenes", "ver"),
    },
  ];
}

export function getAdminNavItems(rol: string): NavItem[] {
  return [
    {
      label: "Caja y Turnos",
      href: "/caja",
      icon: Wallet,
      show: canDo(rol, "caja", "abrir"),
    },
    {
      label: "Cupones",
      href: "/cupones",
      icon: Tag,
      show: canDo(rol, "configuracion", "ver"),
    },
    {
      label: "Paquetes",
      href: "/paquetes",
      icon: Package,
      show: canDo(rol, "paquetes", "ver"),
    },
    {
      label: "Reportes",
      href: "/reportes",
      icon: BarChart3,
      show: canDo(rol, "reportes", "ver"),
    },
    {
      label: "Empleados",
      href: "/empleados",
      icon: UserCog,
      show: canDo(rol, "empleados", "ver"),
    },
    {
      label: "Inventario",
      href: "/inventario",
      icon: Package,
      show: canDo(rol, "configuracion", "ver") || rol === "supervisor",
    },
    {
      label: "Configuración",
      href: "/configuracion",
      icon: Settings,
      show: canDo(rol, "configuracion", "ver"),
    },
  ];
}
