"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { canDo } from "@/lib/auth/permissions";
import { getMiEmpresaNombre } from "@/lib/actions/configuracion";
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
  EllipsisVertical,
  PlusCircle,
  Tag,
  BadgeDollarSign,
  History,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface SidebarProps extends React.ComponentProps<typeof ShadcnSidebar> {
  userRole?: string;
}

export function Sidebar({ className, userRole, ...props }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const serverRol = session?.user?.rol || userRole;
  const rol = serverRol || "cajero";

  const [empresaNombre, setEmpresaNombre] = useState<string>("WashMaster Pro");

  useEffect(() => {
    getMiEmpresaNombre().then((nombre) => {
      if (nombre) {
        setEmpresaNombre(nombre);
      }
    });
  }, []);

  const superAdminNavItems = [
    {
      label: "Resumen Global",
      href: "/superadmin",
      icon: LayoutDashboard,
      show: rol === "superadmin",
    },
    {
      label: "Empresas SaaS",
      href: "/superadmin/empresas",
      icon: Layers,
      show: rol === "superadmin",
    },
    {
      label: "Planes",
      href: "/superadmin/planes",
      icon: BadgeDollarSign,
      show: rol === "superadmin",
    },
    {
      label: "Auditoría",
      href: "/superadmin/logs",
      icon: History,
      show: rol === "superadmin",
    },
    {
      label: "Configuración",
      href: "/superadmin/configuracion",
      icon: Settings,
      show: rol === "superadmin",
    },
  ];

  const mainNavItems = [
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

  const adminNavItems = [
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
    <ShadcnSidebar collapsible="icon" variant="inset" className={className} {...props}>
      {/* Brand Header (Acme Inc. Style) */}
      <SidebarHeader className="p-4 shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent focus:bg-transparent active:bg-transparent"
              render={<Link href="/dashboard" />}
            >
              <div className="size-5 flex items-center justify-center shrink-0">
                <img src="/logo-shield.png" alt="WashMaster Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-base font-semibold text-white/90 truncate group-data-[collapsible=icon]:hidden">
                {empresaNombre}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Quick Create Button Row */}
      {rol !== "superadmin" && (
        <SidebarGroup className="py-0 shrink-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="px-1">
                <SidebarMenuButton
                  tooltip="Nueva Orden"
                  render={<Link href="/ordenes/nueva" />}
                  className="w-full bg-secondary text-secondary-foreground duration-200 ease-linear hover:bg-secondary/90 hover:text-secondary-foreground active:bg-secondary/90 active:text-secondary-foreground font-bold h-8 rounded-md shadow-md shadow-secondary/15"
                >
                  <PlusCircle className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden text-sm">Nueva Orden</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* Navigation Content */}
      <SidebarContent className="px-2 py-3">
        {/* Main Section */}
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {(rol === "superadmin" ? superAdminNavItems : mainNavItems)
                .filter((item) => item.show)
                .map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                        className={`w-full group/btn transition-all duration-200 active:scale-[0.98] h-8.5 px-2.5 rounded-md ${
                          isActive
                            ? "bg-secondary/10 text-secondary! font-bold"
                            : "text-sidebar-foreground hover:text-white hover:bg-sidebar-accent/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 w-full">
                          <Icon
                            className={`h-4 w-4 transition-colors duration-200 ${
                              isActive ? "text-secondary!" : "text-sidebar-foreground group-hover/btn:text-white"
                            }`}
                          />
                          <span className="group-data-[collapsible=icon]:hidden text-sm">{item.label}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration Section */}
        {rol !== "superadmin" && (
          <SidebarGroup className="mt-4 py-0">
            <SidebarGroupLabel className="px-2.5 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider group-data-[collapsible=icon]:hidden mb-1.5">
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {adminNavItems
                  .filter((item) => item.show)
                  .map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          render={<Link href={item.href} />}
                          className={`w-full group/btn transition-all duration-200 active:scale-[0.98] h-8.5 px-2.5 rounded-md ${
                            isActive
                              ? "bg-secondary/10 text-secondary! font-bold"
                              : "text-sidebar-foreground hover:text-white hover:bg-sidebar-accent/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 w-full">
                            <Icon
                              className={`h-4 w-4 transition-colors duration-200 ${
                                isActive ? "text-secondary!" : "text-sidebar-foreground group-hover/btn:text-white"
                              }`}
                            />
                            <span className="group-data-[collapsible=icon]:hidden text-sm">{item.label}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* User Footer (Session Details) */}
      <SidebarFooter className="border-t border-sidebar-border/50 p-3 bg-sidebar-accent/5 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-sidebar-accent/50 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-sidebar-border/50 data-[state=open]:bg-sidebar-accent/50"
              />
            }
          >
            <div className="h-8.5 w-8.5 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs border border-secondary/20 shrink-0 shadow-md shadow-secondary/15">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
              <p className="text-xs font-bold text-white/90 truncate">{session?.user?.name || "Usuario"}</p>
              <span className="inline-block text-[8px] text-white/70 font-extrabold uppercase tracking-widest mt-0.5 bg-white/10 px-1.5 py-0.5 rounded">
                {rol}
              </span>
            </div>
            <EllipsisVertical className="h-4 w-4 text-zinc-400 ml-auto shrink-0 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={12}
            className="w-56 border bg-popover text-popover-foreground shadow-xl rounded-2xl p-1.5 animate-in fade-in-50 zoom-in-95 dark"
          >
            <DropdownMenuLabel className="px-2.5 py-2 font-normal">
              <div className="flex items-center gap-2.5 text-left text-sm">
                <div className="h-8.5 w-8.5 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs border border-secondary/20 shrink-0 shadow-md">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-foreground">{session?.user?.name || "Usuario"}</span>
                  <span className="truncate text-[10px] text-muted-foreground font-medium">
                    {session?.user?.email || "usuario@washmaster.com"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40 my-1" />
            <DropdownMenuItem
              onClick={() => router.push("/configuracion")}
              className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40 my-1" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-450 cursor-pointer text-foreground py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              <LogOut className="h-4 w-4 text-rose-500/70" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
