"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { canDo } from "@/lib/auth/permissions";
import {
  Car,
  LayoutDashboard,
  Users,
  Layers,
  ClipboardList,
  Wallet,
  BarChart3,
  UserCog,
  Package,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const rol = session?.user?.rol || "cajero";

  const navItems = [
    {
      label: "Resumen",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
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
      icon: Car,
      show: canDo(rol, "clientes", "ver"), // Si ve clientes, navega a vehículos
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
    {
      label: "Caja y Turnos",
      href: "/caja",
      icon: Wallet,
      show: canDo(rol, "caja", "abrir"),
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

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col justify-between h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/10">
          <Car className="h-5 w-5 text-zinc-950 font-bold" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            CarWash
          </span>
          <span className="font-semibold text-lg text-zinc-100 tracking-tight"> Pro</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                  isActive
                    ? "bg-teal-500/10 text-teal-400 border-l-2 border-teal-500"
                    : "hover:bg-zinc-800/50 hover:text-zinc-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive ? "text-teal-400" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? "text-teal-400" : "text-zinc-600"
                  }`}
                />
              </Link>
            );
          })}
      </nav>

      {/* User Info / LogOut */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center font-bold text-white text-sm">
            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{session?.user?.name || "Usuario"}</p>
            <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider mt-0.5">
              {rol}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 justify-start gap-3 h-9 px-3 rounded-lg font-semibold text-xs cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
