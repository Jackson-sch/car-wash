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
  const className = "h-5 w-5 text-muted-foreground";
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
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Car className="h-7 w-7 text-secondary" />
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
        />
        <StatsCard
          label="Con Órdenes"
          value={vehiculosConOrdenes}
          icon={<ClipboardList className="h-5 w-5" />}
          iconColor="text-blue-500"
        />
        <StatsCard
          label="Órdenes Generadas"
          value={totalOrdenes}
          icon={<Gauge className="h-5 w-5" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          valueColor="text-emerald-600"
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
          className="pl-9 pr-9 bg-card border-zinc-300 hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(null);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Propietario</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-center">Órdenes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                  <Car className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="font-medium">
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
                <TableRow key={v.id} className="group">
                  <TableCell>
                    <span className="font-mono font-bold tracking-wider text-foreground uppercase text-sm">
                      {v.placa}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TipoIcon tipo={v.tipo} />
                      <div>
                        <div className="font-medium text-foreground text-sm">
                          {v.marca || "—"} {v.modelo || ""}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-[10px] font-normal py-0 h-4">
                            {TIPO_LABELS[v.tipo || ""] || v.tipo || "—"}
                          </Badge>
                          {v.anio && (
                            <span className="text-[11px] text-muted-foreground">{v.anio}</span>
                          )}
                          {v.color && (
                            <span className="text-[11px] text-muted-foreground">{v.color}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground font-medium">
                      {v.clienteNombre} {v.clienteApellido || ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{v.clienteTelefono || "—"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={v.totalOrdenes > 0 ? "secondary" : "outline"}
                      className="text-xs font-semibold"
                    >
                      {v.totalOrdenes}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/vehiculos/${v.id}`}>
                      <Button variant="ghost" size="icon" className="cursor-pointer">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PaginationControls
          activePage={activePage}
          totalPages={totalPages}
          onPageChange={setPage}
          showInfo
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}
