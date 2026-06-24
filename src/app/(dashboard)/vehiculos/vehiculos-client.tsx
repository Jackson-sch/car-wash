"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Car, Search, X, Eye, Users, ClipboardList, Gauge, Truck, Bike, Van } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/shared/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";

interface VehiculoItem {
  id: string;
  placa: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  color: string | null;
  clienteId: string;
  clienteNombre: string;
  clienteApellido: string | null;
  clienteTelefono: string | null;
  totalOrdenes: number;
}

interface VehiculosClientProps {
  initialVehiculos: VehiculoItem[];
}

const TIPO_LABELS: Record<string, string> = {
  sedan: "Sedán",
  suv: "SUV",
  pickup: "Pick-up",
  moto: "Moto",
  camion: "Camión",
  furgon: "Furgón",
  otro: "Otro",
};

function TipoIcon({ tipo }: { tipo: string | null }) {
  const className = "h-4 w-4 text-secondary";
  const icon = (() => {
    switch (tipo) {
      case "sedan":
      case "suv":
        return <Car className={className} />;
      case "pickup":
        return <Truck className={className} />;
      case "moto":
        return <Bike className={className} />;
      case "camion":
        return <Truck className={className} />;
      case "furgon":
        return <Van className={className} />;
      default:
        return <Car className={className} />;
    }
  })();

  return (
    <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20 shrink-0">
      {icon}
    </div>
  );
}



export function VehiculosClient({ initialVehiculos }: VehiculosClientProps) {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );

  const filtered = useMemo(() => {
    return initialVehiculos.filter((v) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.placa.toLowerCase().includes(q) ||
        (v.marca || "").toLowerCase().includes(q) ||
        (v.modelo || "").toLowerCase().includes(q) ||
        v.clienteNombre.toLowerCase().includes(q) ||
        (v.clienteApellido || "").toLowerCase().includes(q)
      );
    });
  }, [initialVehiculos, search]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedData = filtered.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const totalVehiculos = initialVehiculos.length;
  const vehiculosConOrdenes = initialVehiculos.filter((v) => v.totalOrdenes > 0).length;
  const totalOrdenes = initialVehiculos.reduce((acc, v) => acc + v.totalOrdenes, 0);

  return (
    <div className="relative space-y-8 text-foreground">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-secondary/5 dark:bg-secondary/10 blur-3xl" />
      <div className="absolute top-40 left-10 -z-10 h-72 w-72 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Car className="h-7 w-7 text-secondary animate-pulse" />
            Vehículos Registrados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Busca y consulta el historial de vehículos por placa, marca o propietario.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          label="Total de Vehículos"
          value={totalVehiculos}
          icon={<Car className="h-5 w-5" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <StatsCard
          label="Con Órdenes"
          value={vehiculosConOrdenes}
          icon={<ClipboardList className="h-5 w-5" />}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
        />
        <StatsCard
          label="Órdenes Generadas"
          value={totalOrdenes}
          icon={<Gauge className="h-5 w-5" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-500"
          valueColor="text-emerald-600 dark:text-emerald-450"
        />
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por placa, marca, modelo o cliente..."
          value={search || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(null);
          }}
          className="pl-9 pr-9 bg-card border-border hover:border-zinc-350 dark:hover:border-zinc-750 focus-visible:ring-secondary/30 text-xs h-9 rounded-xl shadow-xs"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(null);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer animate-in fade-in zoom-in duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border">
              <TableHead className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-3">Placa</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-3">Vehículo</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-3">Propietario</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-3">Contacto</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-3 text-center">Órdenes</TableHead>
              <TableHead className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider py-3 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                  <Car className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30 animate-pulse" />
                  <p className="font-bold text-foreground/80">
                    {search ? "Sin resultados para tu búsqueda" : "No hay vehículos registrados"}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground/60">
                    {search
                      ? "Prueba con otros términos o limpia el filtro"
                      : "Los vehículos aparecerán aquí cuando se registren"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((v) => (
                <TableRow key={v.id} className="group hover:bg-muted/40 transition-colors duration-200">
                  <TableCell className="py-4">
                    <span className="inline-flex items-center justify-center font-mono font-bold tracking-wider text-foreground uppercase text-[10px] px-2 py-0.5 rounded-md bg-muted/70 dark:bg-muted/50 border border-border/80 shadow-xs select-all">
                      {v.placa}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <TipoIcon tipo={v.tipo} />
                      <div>
                        <div className="font-extrabold text-foreground text-xs leading-tight">
                          {v.marca || "—"} {v.modelo || ""}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="outline" className="text-[9px] font-extrabold py-0 px-1.5 h-4.5 bg-muted/30 border-border/50 text-muted-foreground tracking-wide uppercase">
                            {TIPO_LABELS[v.tipo || ""] || v.tipo || "—"}
                          </Badge>
                          {v.anio && (
                            <span className="text-[10px] text-muted-foreground/85 font-semibold">{v.anio}</span>
                          )}
                          {v.color && (
                            <>
                              <span className="text-[9px] text-muted-foreground/45">•</span>
                              <span className="text-[10px] text-muted-foreground/85 font-semibold capitalize">{v.color}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20">
                        <Users className="h-3 w-3 text-secondary" />
                      </div>
                      <span className="text-xs text-foreground font-extrabold">
                        {v.clienteNombre} {v.clienteApellido || ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-xs text-muted-foreground font-bold">{v.clienteTelefono || "—"}</span>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    {v.totalOrdenes > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20">
                        {v.totalOrdenes} {v.totalOrdenes === 1 ? "orden" : "órdenes"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                        0 órdenes
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Link href={`/vehiculos/${v.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg cursor-pointer hover:bg-secondary/15 hover:text-secondary text-muted-foreground transition-colors duration-200">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filtered.length > 0 && (
          <div className="p-4 border-t border-border bg-transparent">
            <PaginationControls
              activePage={activePage}
              totalPages={totalPages}
              onPageChange={setPage}
              showInfo
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
