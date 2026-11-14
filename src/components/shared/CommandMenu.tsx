"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Tv,
  Car,
  PlusCircle,
  Wallet,
  Users,
  Package,
  BarChart3,
  Settings,
  ArrowRight,
  SunMoon,
} from "lucide-react";
import { useTheme } from "@/components/shared/theme-provider";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navegación" | "Acciones Rápidas" | "Sistema";
  icon: typeof Search;
  action: () => void;
  shortcut?: string;
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const handleOpen = () => {
    setQuery("");
    setSelectedIndex(0);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Atajo de teclado global Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIndex(0);
            return true;
          }
          return false;
        });
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const items: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-nueva-orden",
        title: "Nueva Orden de Lavado",
        subtitle: "Registrar vehículo, placa y servicios",
        category: "Acciones Rápidas",
        icon: PlusCircle,
        shortcut: "N",
        action: () => {
          handleClose();
          router.push("/ordenes/nueva");
        },
      },
      {
        id: "nav-patio",
        title: "Pantalla de Patio (Modo TV)",
        subtitle: "Monitoreo en vivo de bahías para Smart TV",
        category: "Acciones Rápidas",
        icon: Tv,
        shortcut: "T",
        action: () => {
          handleClose();
          router.push("/patio");
        },
      },
      {
        id: "nav-dashboard",
        title: "Resumen Operativo (Dashboard)",
        subtitle: "KPIs, ventas hoy y órdenes en cola",
        category: "Navegación",
        icon: LayoutDashboard,
        action: () => {
          handleClose();
          router.push("/dashboard");
        },
      },
      {
        id: "nav-caja",
        title: "Caja & Puntos de Venta (POS)",
        subtitle: "Turno activo, aperturas y cierres de caja",
        category: "Navegación",
        icon: Wallet,
        shortcut: "C",
        action: () => {
          handleClose();
          router.push("/caja");
        },
      },
      {
        id: "nav-ordenes",
        title: "Bandeja de Órdenes",
        subtitle: "Historial de servicios, estados y cobros",
        category: "Navegación",
        icon: Car,
        action: () => {
          handleClose();
          router.push("/ordenes");
        },
      },
      {
        id: "nav-clientes",
        title: "Directorio de Clientes",
        subtitle: "Búsqueda por DNI/RUC, vehículos y fidelidad",
        category: "Navegación",
        icon: Users,
        action: () => {
          handleClose();
          router.push("/clientes");
        },
      },
      {
        id: "nav-inventario",
        title: "Control de Inventario",
        subtitle: "Shampoos, ceras, stock mínimo y compras",
        category: "Navegación",
        icon: Package,
        action: () => {
          handleClose();
          router.push("/inventario");
        },
      },
      {
        id: "nav-reportes",
        title: "Reportes & Analítica",
        subtitle: "Ventas históricas y métricas de lavadores",
        category: "Navegación",
        icon: BarChart3,
        action: () => {
          handleClose();
          router.push("/reportes");
        },
      },
      {
        id: "nav-config",
        title: "Configuración de Sucursal",
        subtitle: "Parámetros de empresa, IGV y recibos",
        category: "Navegación",
        icon: Settings,
        action: () => {
          handleClose();
          router.push("/configuracion");
        },
      },
      {
        id: "sys-theme",
        title: "Alternar Tema Visual",
        subtitle: "Cambiar entre Modo Claro y Modo Oscuro",
        category: "Sistema",
        icon: SunMoon,
        action: () => {
          handleClose();
          toggleTheme();
        },
      },
    ],
    [router, toggleTheme]
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Manejo de flechas y Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredItems.at(selectedIndex);
      if (current) {
        current.action();
      }
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs group"
        title="Buscar o saltar a cualquier módulo (Ctrl + K)"
      >
        <Search className="h-3.5 w-3.5 text-muted-foreground group-hover:text-secondary transition-colors" />
        <span className="font-medium">Buscar o saltar a...</span>
        <kbd className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background border border-border text-[10px] font-mono text-muted-foreground">
          <span className="text-[9px]">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col text-foreground animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Input Row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/70">
          <Search className="h-4 w-4 text-secondary shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Buscar módulo, acción o atajo..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none text-foreground"
          />
          <kbd
            onClick={handleClose}
            className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-[10px] font-mono text-muted-foreground cursor-pointer hover:bg-muted/80"
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No se encontraron coincidencias para &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? "bg-secondary/15 text-foreground ring-1 ring-secondary/30"
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg border shrink-0 ${
                        isSelected
                          ? "bg-secondary text-secondary-foreground border-secondary shadow-xs"
                          : "bg-muted text-muted-foreground border-border/80"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-foreground truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-muted/80 border border-border text-[10px] font-mono text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <ArrowRight className="h-3.5 w-3.5 text-secondary animate-in slide-in-from-left-1" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-background border text-[10px]">↑</kbd>{" "}
              <kbd className="px-1 py-0.5 rounded bg-background border text-[10px]">↓</kbd> navegar
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-background border text-[10px]">↵</kbd> abrir
            </span>
          </div>
          <span>WashMaster Command</span>
        </div>
      </div>
    </div>
  );
}
