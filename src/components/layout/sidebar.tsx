"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { getMiEmpresaNombre, getSucursalConfig } from "@/lib/actions/configuracion";
import { PlusCircle } from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { SidebarNavMenu } from "./SidebarNavMenu";
import { SidebarUserFooter } from "./SidebarUserFooter";
import {
  getMainNavItems,
  getAdminNavItems,
  superAdminNavItems,
} from "./nav-items";

interface SidebarProps extends React.ComponentProps<typeof ShadcnSidebar> {
  userRole?: string;
}

export function Sidebar({ className, userRole, ...props }: SidebarProps) {
  const { data: session } = useSession();
  const serverRol = session?.user?.rol || userRole;
  const rol = serverRol || "cajero";

  const [empresaNombre, setEmpresaNombre] = useState<string>("WashMaster Pro");
  const [logoUrl, setLogoUrl] = useState<string>("/logo-shield.png");

  useEffect(() => {
    getMiEmpresaNombre().then((nombre) => {
      if (nombre) {
        setEmpresaNombre(nombre);
      }
    });

    getSucursalConfig().then((sucursal) => {
      if (sucursal?.logoUrl) {
        setLogoUrl(sucursal.logoUrl);
      }
    });
  }, []);

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
              <div className="size-5 flex items-center justify-center shrink-0 relative overflow-hidden">
                <Image src={logoUrl} alt="Logo" fill className="object-contain rounded-md" sizes="20px" />
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
            {rol === "superadmin" ? (
              <SidebarNavMenu items={superAdminNavItems} />
            ) : (
              <SidebarNavMenu items={getMainNavItems(rol)} />
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration Section */}
        {rol !== "superadmin" && (
          <SidebarGroup className="mt-4 py-0">
            <SidebarGroupLabel className="px-2.5 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider group-data-[collapsible=icon]:hidden mb-1.5">
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarNavMenu items={getAdminNavItems(rol)} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarUserFooter />
    </ShadcnSidebar>
  );
}
