"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import {
  MapPin,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/shared/theme-provider";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { useState, useEffect, useCallback } from "react";
import {
  getEmpresaSucursales,
  switchActiveBranch,
} from "@/lib/actions/branch-switcher";
import { getTurnoActivo } from "@/lib/actions/caja";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const [branches, setBranches] = useState<{ id: string; nombre: string }[]>(
    [],
  );
  const [activeBranch, setActiveBranch] = useState<{
    id: string;
    nombre: string;
  } | null>(null);

  const [turnoActivo, setTurnoActivo] = useState<any>(null);
  const [loadingCaja, setLoadingCaja] = useState(true);

  const fetchCajaStatus = useCallback(async () => {
    if (session?.user && session.user.rol !== "superadmin") {
      try {
        console.log("Fetching caja status, session user is:", session.user);
        const turno = await getTurnoActivo();
        console.log("Turno fetched successfully:", turno);
        setTurnoActivo(turno);
      } catch (err) {
        console.error("Error checking caja status:", err);
      } finally {
        setLoadingCaja(false);
      }
    } else {
      console.log("Skipping caja status fetch, session:", session);
      setLoadingCaja(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user && session.user.rol !== "superadmin") {
      getEmpresaSucursales().then((data) => {
        setBranches(data);
        const active = data.find((b) => b.id === session.user.sucursalId);
        if (active) {
          setActiveBranch(active);
        } else if (data.length > 0) {
          setActiveBranch(data[0]);
        }
      });
    }
  }, [session]);

  useEffect(() => {
    fetchCajaStatus();
  }, [fetchCajaStatus, pathname]);

  useEffect(() => {
    const handleCajaChange = () => {
      fetchCajaStatus();
    };

    window.addEventListener("caja-status-changed", handleCajaChange);
    return () => {
      window.removeEventListener("caja-status-changed", handleCajaChange);
    };
  }, [fetchCajaStatus]);

  const handleBranchChange = async (sucursalId: string) => {
    const res = await switchActiveBranch(sucursalId);
    if (res.success) {
      toast.success(`Cambiado a: ${res.sucursalNombre}`);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      toast.error(res.error || "No se pudo cambiar de sucursal.");
    }
  };

  // Generate Breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label: label.replace(/-/g, " "), href };
  });

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
    <header className="h-16 border-b bg-background/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-45">
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar Button */}
        <SidebarTrigger
          size="icon-lg"
          className="size-9 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl cursor-pointer"
        />
        <Separator orientation="vertical" className="h-9 bg-border" />

        {/* Breadcrumbs Navigation */}
        <nav
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Inicio
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" />
              {index === breadcrumbs.length - 1 ? (
                <span
                  className="text-secondary font-extrabold"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Quick Action Controls */}
      <div className="flex items-center gap-4">
        {/* Super Admin indicator */}
        {session?.user?.rol === "superadmin" && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-extrabold rounded-xl uppercase tracking-wider">
            Super Admin
          </div>
        )}

        {/* Sucursal Indicator / Switcher (solo para usuarios de sucursal) */}
        {session?.user?.rol !== "superadmin" &&
          (session?.user?.rol === "admin" && branches.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border text-xs font-semibold text-muted-foreground hover:bg-muted/50 cursor-pointer"
                  />
                }
              >
                <MapPin className="h-3.5 w-3.5 text-secondary" />
                <span>{activeBranch?.nombre || "Cargando sucursal..."}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border bg-popover text-popover-foreground shadow-xl rounded-2xl p-1.5 animate-in fade-in-50 zoom-in-95"
              >
                <DropdownMenuLabel className="font-bold px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Cambiar Sucursal
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40 my-1" />
                {branches.map((b) => (
                  <DropdownMenuItem
                    key={b.id}
                    onClick={() => handleBranchChange(b.id)}
                    className={`focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-between text-foreground ${
                      b.id === activeBranch?.id
                        ? "bg-secondary/10 text-secondary! font-bold"
                        : ""
                    }`}
                  >
                    <span>{b.nombre}</span>
                    {b.id === activeBranch?.id && (
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-xs font-semibold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-secondary" />
              <span>
                {activeBranch ? activeBranch.nombre : "Cargando..."}
              </span>
            </div>
          ))}

        {/* Caja Quick Access Badge */}
        {session?.user?.rol !== "superadmin" && !loadingCaja && (
          turnoActivo ? (
            <Link href="/caja" passHref>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer shadow-xs transition-all duration-300"
                title="Caja Abierta - Gestionar o Cerrar Turno"
              >
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="whitespace-nowrap">Caja: S/ {(() => {
                  const efectivoPago = turnoActivo.pagos?.find((p: any) => p.metodo === "efectivo")?.total || 0;
                  return (parseFloat(turnoActivo.montoInicial || "0") + efectivoPago).toFixed(2);
                })()}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/caja" passHref>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 hover:bg-red-500/15 text-xs font-bold text-red-600 dark:text-red-400 cursor-pointer shadow-xs transition-all duration-300"
                title="Caja Cerrada - Abrir Turno"
              >
                <div className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="whitespace-nowrap">Abrir Caja</span>
              </Button>
            </Link>
          )
        )}

        {/* Theme Toggle Button */}
        <AnimatedThemeToggler
          duration={600}
          variant="circle"
          fromCenter
          theme={theme === "dark" ? "dark" : "light"}
          onThemeChange={toggleTheme}
        />

        {/* Notifications Dropdown */}
        {session?.user?.rol !== "superadmin" && <NotificationDropdown />}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-lg"
                className="h-9 w-9 p-0 rounded-full bg-linear-to-tr from-blue-600 to-sky-400 hover:scale-105 text-zinc-950 flex items-center justify-center font-bold text-xs border border-sky-400/25 shadow-md shadow-secondary/10 cursor-pointer transition-all duration-300"
              >
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </Button>
            }
          />
          <DropdownMenuContent
            align="end"
            className="w-56 border bg-popover text-popover-foreground shadow-xl rounded-2xl p-1.5 animate-in fade-in-50 zoom-in-95"
          >
            <DropdownMenuLabel className="font-bold px-2.5 py-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              Mi Cuenta
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40 my-1" />
            <DropdownMenuItem
              onClick={() => router.push("/perfil")}
              className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground"
            >
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Ver Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/configuracion")}
              className="focus:bg-muted cursor-pointer py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 text-foreground"
            >
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40 my-1" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-450 cursor-pointer text-foreground py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              <LogOut className="mr-2 h-4 w-4 text-rose-500/70" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
