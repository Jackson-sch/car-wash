"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ajustarPuntosCliente } from "@/lib/actions/clientes";

import { ClienteHero } from "./components/ClienteHero";
import { ClienteStats } from "./components/ClienteStats";
import { ClienteVehiculosCard } from "./components/ClienteVehiculosCard";
import { ClientePuntosCard } from "./components/ClientePuntosCard";
import { ClienteHistorialOrdenes } from "./components/ClienteHistorialOrdenes";
import { ClienteEditModal } from "./components/ClienteEditModal";
import { AjustarPuntosModal } from "@/app/(dashboard)/clientes/components/AjustarPuntosModal";

import type { ClienteDetailData, ClienteData, PuntosLogItem } from "./types";

interface ClienteDetailClientProps {
  data: ClienteDetailData;
}

export function ClienteDetailClient({ data }: ClienteDetailClientProps) {
  const [cliente, setCliente] = useState<ClienteData>(data.cliente);
  const [puntos, setPuntos] = useState<PuntosLogItem[]>(data.puntos);
  const [stats, setStats] = useState(data.stats);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPuntosModalOpen, setIsPuntosModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClientUpdated = (updated: Partial<ClienteData>) => {
    setCliente((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleSavePuntos = async (
    tipo: "ganado" | "canjeado" | "ajuste",
    cantPuntos: number,
    descripcion: string
  ) => {
    startTransition(async () => {
      const res = await ajustarPuntosCliente({
        clienteId: cliente.id,
        puntos: tipo === "canjeado" ? -cantPuntos : cantPuntos,
        tipo,
        descripcion: descripcion || (tipo === "canjeado" ? "Canje de puntos" : "Ajuste manual"),
      });

      if (res.success && res.data) {
        toast.success("Puntos actualizados correctamente");
        const newDelta = tipo === "canjeado" ? -cantPuntos : cantPuntos;
        const newTotalPuntos = (cliente.totalPuntos || 0) + newDelta;

        setCliente((prev) => ({
          ...prev,
          totalPuntos: newTotalPuntos,
        }));

        setStats((prev) => ({
          ...prev,
          totalPuntos: newTotalPuntos,
          valorPuntosSoles: newTotalPuntos * 0.20,
        }));

        setPuntos((prev) => [
          {
            id: res.data!.id,
            puntos: newDelta,
            tipo,
            descripcion: descripcion || "Ajuste manual",
            createdAt: new Date(),
          },
          ...prev,
        ]);

        setIsPuntosModalOpen(false);
      } else {
        toast.error(res.error || "No se pudieron actualizar los puntos");
      }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto text-foreground pb-12">
      {/* Return to Clients List */}
      <div>
        <Link
          href="/clientes"
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="size-7 rounded-lg border border-border/80 bg-card flex items-center justify-center shadow-xs group-hover:border-secondary transition-colors">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span>Volver a Clientes</span>
        </Link>
      </div>

      {/* 1. Hero Header */}
      <ClienteHero
        cliente={cliente}
        onEditClick={() => setIsEditModalOpen(true)}
        onPuntosClick={() => setIsPuntosModalOpen(true)}
      />

      {/* 2. Compact Bento Stats */}
      <ClienteStats stats={stats} />

      {/* 3. Two Columns: Left (Vehículos & Puntos), Right (Historial Órdenes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Flota y Fidelización (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ClienteVehiculosCard vehiculos={data.vehiculos} />
          <ClientePuntosCard
            totalPuntos={cliente.totalPuntos}
            puntos={puntos}
            onAjustarClick={() => setIsPuntosModalOpen(true)}
          />
        </div>

        {/* Right Column: Órdenes y Servicios (7 cols) */}
        <div className="lg:col-span-7">
          <ClienteHistorialOrdenes ordenes={data.ordenes} />
        </div>
      </div>

      {/* Modals */}
      <ClienteEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cliente={cliente}
        onClientUpdated={handleClientUpdated}
      />

      <AjustarPuntosModal
        isOpen={isPuntosModalOpen}
        onClose={() => setIsPuntosModalOpen(false)}
        cliente={cliente}
        isPending={isPending}
        onSave={handleSavePuntos}
      />
    </div>
  );
}
