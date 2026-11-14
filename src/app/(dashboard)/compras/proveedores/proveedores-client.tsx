"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ProveedoresHeader } from "./components/ProveedoresHeader";
import { ProveedoresKpis } from "./components/ProveedoresKpis";
import {
  ProveedoresToolbar,
  type ProveedorFilterType,
} from "./components/ProveedoresToolbar";
import { ProveedoresTable } from "./components/ProveedoresTable";
import { ProveedorFormModal } from "./components/ProveedorFormModal";
import type { ProveedorDirectoryItem } from "../types";

interface ProveedoresClientProps {
  initialProveedores: ProveedorDirectoryItem[];
}

export function ProveedoresClient({ initialProveedores }: ProveedoresClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ProveedorFilterType>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<ProveedorDirectoryItem | null>(null);

  const counts = useMemo(() => {
    return {
      todos: initialProveedores.length,
      activos: initialProveedores.filter((p) => p.activo).length,
      con_ruc: initialProveedores.filter((p) => Boolean(p.ruc)).length,
      con_banco: initialProveedores.filter((p) => Boolean(p.banco || p.cuentaBancaria || p.cci)).length,
      inactivos: initialProveedores.filter((p) => !p.activo).length,
    };
  }, [initialProveedores]);

  const filtered = useMemo(() => {
    return initialProveedores.filter((p) => {
      if (filterType === "activos" && !p.activo) return false;
      if (filterType === "inactivos" && p.activo) return false;
      if (filterType === "con_ruc" && !p.ruc) return false;
      if (filterType === "con_banco" && !p.banco && !p.cuentaBancaria && !p.cci) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = p.razonSocial.toLowerCase().includes(q);
        const matchCom = (p.nombreComercial || "").toLowerCase().includes(q);
        const matchRuc = (p.ruc || "").toLowerCase().includes(q);
        const matchTel = (p.telefono || "").toLowerCase().includes(q);
        const matchCon = (p.contactoNombre || "").toLowerCase().includes(q);

        if (!matchName && !matchCom && !matchRuc && !matchTel && !matchCon) {
          return false;
        }
      }

      return true;
    });
  }, [initialProveedores, filterType, searchTerm]);

  const handleNew = () => {
    setEditingProveedor(null);
    setModalOpen(true);
  };

  const handleEdit = (prov: ProveedorDirectoryItem) => {
    setEditingProveedor(prov);
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <ProveedoresHeader onNewProveedor={handleNew} />

      <ProveedoresKpis proveedores={initialProveedores} />

      <ProveedoresToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        counts={counts}
      />

      <ProveedoresTable
        proveedores={filtered}
        onEdit={handleEdit}
        onNew={handleNew}
      />

      <ProveedorFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        proveedor={editingProveedor}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
