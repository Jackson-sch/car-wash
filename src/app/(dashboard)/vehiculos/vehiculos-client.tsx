"use client";

import { useMemo, useState } from "react";
import { Car, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQueryState, parseAsInteger } from "nuqs";
import type { VehiculoItem, VehiculoFilterType } from "./types";
import { VehiculosHeader } from "./components/VehiculosHeader";
import { VehiculosKpis } from "./components/VehiculosKpis";
import { VehiculosToolbar } from "./components/VehiculosToolbar";
import { VehiculosTable } from "./components/VehiculosTable";

interface VehiculosClientProps {
  initialVehiculos: VehiculoItem[];
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

  const [filterType, setFilterType] = useState<VehiculoFilterType>("todos");

  // Conteo dinámico de filtros
  const counts = useMemo(() => {
    let sedan = 0;
    let suv = 0;
    let pickup = 0;
    let moto = 0;
    let otros = 0;
    let con_ordenes = 0;

    initialVehiculos.forEach((v) => {
      const t = (v.tipo || "").toLowerCase();
      if (t === "sedan") sedan++;
      else if (t === "suv") suv++;
      else if (t === "pickup") pickup++;
      else if (t === "moto") moto++;
      else otros++;

      if (v.totalOrdenes > 0) con_ordenes++;
    });

    return {
      todos: initialVehiculos.length,
      sedan,
      suv,
      pickup,
      moto,
      otros,
      con_ordenes,
    };
  }, [initialVehiculos]);

  // Lista filtrada
  const filtered = useMemo(() => {
    return initialVehiculos.filter((v) => {
      // Búsqueda por texto (placa, marca, modelo, cliente)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesPlaca = v.placa.toLowerCase().includes(q);
        const matchesMarca = (v.marca || "").toLowerCase().includes(q);
        const matchesModelo = (v.modelo || "").toLowerCase().includes(q);
        const matchesCliente = `${v.clienteNombre} ${v.clienteApellido || ""}`
          .toLowerCase()
          .includes(q);

        if (!matchesPlaca && !matchesMarca && !matchesModelo && !matchesCliente) {
          return false;
        }
      }

      // Filtro de tipo o estado
      const t = (v.tipo || "").toLowerCase();
      if (filterType === "sedan") return t === "sedan";
      if (filterType === "suv") return t === "suv";
      if (filterType === "pickup") return t === "pickup";
      if (filterType === "moto") return t === "moto";
      if (filterType === "otros") return t !== "sedan" && t !== "suv" && t !== "pickup" && t !== "moto";
      if (filterType === "con_ordenes") return v.totalOrdenes > 0;

      return true;
    });
  }, [initialVehiculos, search, filterType]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const activePage = page || 1;
  const paginatedData = filtered.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const hasActiveFilters = Boolean(search.trim() || filterType !== "todos");

  const handleClearFilters = () => {
    setSearch("");
    setFilterType("todos");
    setPage(null);
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8 text-foreground pb-12">
      {/* 1. Header Ejecutivo con Exportar Excel */}
      <VehiculosHeader />

      {/* 2. Bento KPI Cards de Flota */}
      <VehiculosKpis vehiculos={initialVehiculos} />

      {/* 3. Toolbar con Búsqueda Universal y Filtros de Categoría */}
      <VehiculosToolbar
        searchQuery={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(null);
        }}
        filterType={filterType}
        onFilterChange={(type) => {
          setFilterType(type);
          setPage(null);
        }}
        counts={counts}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Tabla de Vehículos o Empty State */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/80 bg-card/40 rounded-3xl flex flex-col items-center justify-center space-y-3">
          <div className="size-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
            <Car className="size-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {hasActiveFilters
              ? "Sin resultados para los filtros aplicados"
              : "No hay vehículos registrados"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {hasActiveFilters
              ? "Prueba buscando con otra placa, marca o cliente, o restablece los filtros."
              : "Los vehículos aparecerán aquí al ser registrados en órdenes o en el perfil de cliente."}
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 text-xs font-bold h-9 rounded-xl border-border cursor-pointer"
            >
              Restablecer Filtros
            </Button>
          ) : (
            <Link href="/ordenes/nueva">
              <Button
                type="button"
                className="mt-2 text-xs font-bold h-9 rounded-xl bg-secondary text-secondary-foreground cursor-pointer shadow-xs"
              >
                <Plus className="size-3.5 mr-1" />
                Registrar en Nueva Orden
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <VehiculosTable
          vehiculos={paginatedData}
          activePage={activePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
