"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/client";
import { getOrdenById } from "@/lib/actions/ordenes";
import type { Orden } from "../components/OrdenesTable";

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Payload tipado de Supabase Realtime para cambios en la tabla `ordenes`.
 * @template T - La forma del registro (new/old).
 */
interface RealtimePostgresChangesPayload<T extends Record<string, unknown> = Record<string, unknown>> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
  errors: string[] | null;
}

/** Columnas de la tabla `ordenes` que nos interesan del payload de Realtime. */
interface OrdenRealtimeRecord {
  [key: string]: unknown;
  id: string;
  nro_ticket: string | null;
  estado: string;
  prioridad: number | null;
  total: string | null;
  notas: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const REALTIME_CHANNEL = "ordenes-realtime";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convierte el registro plano de la BD (snake_case) a un objeto `Orden` parcial.
 * Útil para UPDATEs cuando el payload ya contiene los campos que cambiaron.
 */
function mapRealtimeRecordToOrden(
  record: Partial<OrdenRealtimeRecord>,
): Partial<Orden> {
  const partial: Partial<Orden> = {};

  if (record.id) partial.id = record.id;
  if (record.nro_ticket !== undefined) partial.nroTicket = record.nro_ticket;
  if (record.estado !== undefined)
    partial.estado = record.estado as Orden["estado"];
  if (record.prioridad !== undefined) partial.prioridad = record.prioridad;
  if (record.total !== undefined) partial.total = record.total;
  if (record.notas !== undefined) partial.notas = record.notas;
  if (record.created_at !== undefined)
    partial.createdAt = record.created_at ? new Date(record.created_at) : null;
  if (record.updated_at !== undefined)
    partial.updatedAt = record.updated_at ? new Date(record.updated_at) : null;

  return partial;
}

/**
 * Determina si un payload de UPDATE contiene un cambio de estado, lo que
 * permite una actualización parcial sin fetch completo.
 *
 * NOTA: Solo hacemos merge parcial cuando el estado cambia. Para otros
 * cambios (asignación de lavador, notas, etc.) necesitamos fetch completo,
 * porque el payload de Realtime solo contiene columnas raw de la BD,
 * sin los datos JOINeados (nombre de lavador, cliente, vehículo, etc.).
 */
function hasEstadoChanged(
  oldRecord: Partial<OrdenRealtimeRecord>,
  newRecord: Partial<OrdenRealtimeRecord>,
): boolean {
  return oldRecord.estado !== undefined &&
    newRecord.estado !== undefined &&
    oldRecord.estado !== newRecord.estado;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook que se suscribe a cambios en tiempo real en la tabla `ordenes` vía
 * Supabase Realtime.
 *
 * - **DELETE**: filtra la orden de la lista local.
 * - **INSERT**: obtiene el detalle completo y lo agrega al inicio.
 * - **UPDATE**: si el payload trae suficientes datos (al menos `estado`),
 *   aplica un merge parcial; de lo contrario hace un fetch completo.
 *
 * @param setOrdenes - dispatch de estado de React para actualizar la lista.
 */
export function useOrdenesRealtime(
  setOrdenes: React.Dispatch<React.SetStateAction<Orden[]>>,
) {
  // Evita llamar a setOrdenes después de desmontar el componente
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const supabase = createClient();

    const channel = supabase.channel(REALTIME_CHANNEL);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = channel.on("postgres_changes" as any, // El tipado de Supabase para channel.on no exporta correctamente los overloads de Realtime
      {
        event: "*",
        schema: "public",
        table: "ordenes",
      },
      (payload: RealtimePostgresChangesPayload<OrdenRealtimeRecord>) => {
        if (!isMountedRef.current) return;

        switch (payload.eventType) {
          // ── DELETE ──────────────────────────────────────────────────────────
          case "DELETE": {
            const deletedId = payload.old.id;
            if (deletedId) {
              setOrdenes((prev) => prev.filter((o) => o.id !== deletedId));
            }
            return;
          }

          // ── INSERT ──────────────────────────────────────────────────────────
          case "INSERT": {
            const orderId = payload.new.id;
            if (!orderId) return;

            getOrdenById(orderId)
              .then((detail) => {
                if (!isMountedRef.current || !detail) return;

                const updatedOrden: Orden = buildOrdenFromDetail(detail);
                setOrdenes((prev) => {
                  if (prev.some((o) => o.id === orderId)) {
                    return prev.map((o) =>
                      o.id === orderId ? updatedOrden : o,
                    );
                  }
                  return [updatedOrden, ...prev];
                });
              })
              .catch((err) => {
                console.error(
                  "Error fetching realtime order detail:",
                  err,
                );
              });
            return;
          }

          // ── UPDATE ──────────────────────────────────────────────────────────
          case "UPDATE": {
            const orderId = payload.new.id;
            if (!orderId) return;

            // Merge parcial solo cuando cambia el estado (para mover tarjetas
            // en el Kanban instantáneamente). Para otros cambios (lavador,
            // notas, etc.) hacemos fetch completo porque el payload no
            // contiene datos JOINeados.
            if (hasEstadoChanged(payload.old, payload.new)) {
              const partial = mapRealtimeRecordToOrden(payload.new);
              setOrdenes((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, ...partial } : o)),
              );
            }

            // Siempre hacer fetch completo para mantener los datos
            // JOINeados actualizados (lavador, cliente, vehículo).
            getOrdenById(orderId)
              .then((detail) => {
                if (!isMountedRef.current || !detail) return;

                const updatedOrden: Orden = buildOrdenFromDetail(detail);
                setOrdenes((prev) =>
                  prev.map((o) =>
                    o.id === orderId ? updatedOrden : o,
                  ),
                );
              })
              .catch((err) => {
                console.error(
                  "Error fetching realtime order detail:",
                  err,
                );
              });
            return;
          }

          default:
            return;
        }
      },
    );

    subscription.subscribe();

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [setOrdenes]);
}

// ─── Util ──────────────────────────────────────────────────────────────────────

/**
 * Convierte el detalle devuelto por `getOrdenById` al tipo `Orden` de la UI.
 */
function buildOrdenFromDetail(detail: {
  id: string;
  nroTicket: string | null;
  estado: string;
  prioridad: number | null;
  total: string | null;
  notas: string | null;
  createdAt: Date | null;
  placa: string;
  vehiculoMarca: string | null;
  vehiculoModelo: string | null;
  vehiculoTipo: string | null;
  clienteNombre: string;
  clienteApellido: string | null;
  lavadorNombre: string | null;
  lavadorApellido: string | null;
  comprobanteTipo: string | null;
  comprobanteSerie: string | null;
  comprobanteNumero: string | null;
}): Orden {
  return {
    id: detail.id,
    nroTicket: detail.nroTicket,
    estado: detail.estado as Orden["estado"],
    prioridad: detail.prioridad,
    total: detail.total,
    notas: detail.notas,
    createdAt: detail.createdAt,
    updatedAt: detail.createdAt,
    placa: detail.placa,
    vehiculoMarca: detail.vehiculoMarca,
    vehiculoModelo: detail.vehiculoModelo,
    vehiculoTipo: detail.vehiculoTipo as Orden["vehiculoTipo"],
    clienteNombre: detail.clienteNombre,
    clienteApellido: detail.clienteApellido,
    lavadorNombre: detail.lavadorNombre,
    lavadorApellido: detail.lavadorApellido,
    comprobanteTipo: detail.comprobanteTipo,
    comprobanteSerie: detail.comprobanteSerie,
    comprobanteNumero: detail.comprobanteNumero,
  };
}
