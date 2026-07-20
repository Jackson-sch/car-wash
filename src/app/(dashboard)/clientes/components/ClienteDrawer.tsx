"use client";

import { X, Car, History, Gift, Phone, Mail, FileText, CreditCard, Clock } from "lucide-react";
import type { Cliente } from "./ClientesTable";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";

export interface Vehiculo {
  id: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  tipo: string | null;
}

export interface PuntosLog {
  id: string;
  puntos: number;
  tipo: "ganado" | "canjeado" | "ajuste";
  descripcion: string | null;
  createdAt: Date | null;
}

export interface OrdenVisita {
  id: string;
  nroTicket: string | null;
  estado: string;
  total: string | null;
  createdAt: Date | null;
  placa: string;
  marca: string | null;
  modelo: string | null;
}

interface ClienteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  fichaData: {
    vehiculos: Vehiculo[];
    puntos: PuntosLog[];
    ordenes: OrdenVisita[];
  } | null;
}

const estadoBadge: Record<string, string> = {
  pendiente: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  en_proceso: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  completado: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cobrado: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancelado: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const tipoVehiculoIcon: Record<string, string> = {
  sedan: "Sedán",
  suv: "SUV",
  pickup: "Pickup",
  moto: "Moto",
  camion: "Camión",
  furgon: "Furgón",
};

export function ClienteDrawer({
  isOpen,
  onClose,
  cliente,
  fichaData,
}: ClienteDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="h-screen max-h-none rounded-r-none border-l bg-card text-foreground data-[vaul-drawer-direction=right]:sm:max-w-2xl w-full">
        {cliente && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-linear-to-r from-secondary/5 to-transparent shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-lg border border-secondary/20">
                  {cliente.nombre.charAt(0).toUpperCase()}
                  {cliente.apellido?.charAt(0).toUpperCase() || ""}
                </div>
                <div>
                  <DrawerDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Ficha de Cliente
                  </DrawerDescription>
                  <DrawerTitle className="text-lg font-bold text-foreground mt-0.5">
                    {cliente.nombre} {cliente.apellido || ""}
                  </DrawerTitle>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Ficha Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!fichaData ? (
                <div className="p-12 text-center text-muted-foreground text-xs font-bold">
                  Cargando historial...
                </div>
              ) : (
                <>
                  {/* Contact Info Mini Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {cliente.telefono && (
                      <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5">
                        <Phone className="h-4 w-4 text-secondary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Teléfono</p>
                          <p className="text-xs font-bold text-foreground truncate">{cliente.telefono}</p>
                        </div>
                      </div>
                    )}
                    {cliente.email && (
                      <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5">
                        <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Email</p>
                          <p className="text-xs font-bold text-foreground truncate">{cliente.email}</p>
                        </div>
                      </div>
                    )}
                    {cliente.nroDoc && (
                      <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5">
                        <CreditCard className="h-4 w-4 text-amber-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">{cliente.tipoDoc || "Doc"}</p>
                          <p className="text-xs font-bold text-foreground truncate">{cliente.nroDoc}</p>
                        </div>
                      </div>
                    )}
                    {cliente.notas && (
                      <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Notas</p>
                          <p className="text-xs font-bold text-foreground truncate">{cliente.notas}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vehicles List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-secondary" />
                      Vehículos Registrados
                      <span className="text-muted-foreground font-normal normal-case ml-1">({fichaData.vehiculos.length})</span>
                    </h4>
                    {fichaData.vehiculos.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Ningún vehículo registrado aún.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fichaData.vehiculos.map((v) => (
                          <div
                            key={v.id}
                            className="p-4 rounded-xl bg-muted/30 border border-border hover:border-secondary/30 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2.5 py-0.5 bg-card text-foreground font-mono font-bold text-xs rounded-md border border-border tracking-wider shadow-sm">
                                {v.placa}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                {tipoVehiculoIcon[v.tipo || ""] || v.tipo || "Auto"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground font-semibold">
                              {v.marca || "Genérico"} {v.modelo || ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Visit History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <History className="h-4 w-4 text-blue-500" />
                      Historial de Visitas
                      <span className="text-muted-foreground font-normal normal-case ml-1">({fichaData.ordenes.length})</span>
                    </h4>
                    {fichaData.ordenes.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Ningún servicio realizado en el local.</p>
                    ) : (
                      <div className="border border-border rounded-xl overflow-hidden bg-card">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                              <th className="py-2.5 pl-4">Fecha</th>
                              <th className="py-2.5">Ticket</th>
                              <th className="py-2.5">Vehículo</th>
                              <th className="py-2.5 text-center">Estado</th>
                              <th className="py-2.5 text-right pr-4">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {fichaData.ordenes.map((o) => (
                              <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-2.5 pl-4 text-muted-foreground">
                                  <div className="flex items-center gap-1.5" suppressHydrationWarning>
                                    <Clock className="h-3 w-3" />
                                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}
                                  </div>
                                </td>
                                <td className="py-2.5 font-bold text-foreground">{o.nroTicket}</td>
                                <td className="py-2.5 text-muted-foreground uppercase font-semibold">
                                  {o.placa}{o.marca ? ` (${o.marca})` : ""}
                                </td>
                                <td className="py-2.5 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${estadoBadge[o.estado] || "bg-muted text-muted-foreground border-border"}`}>
                                    {o.estado === "en_proceso" ? "En proceso" : o.estado}
                                  </span>
                                </td>
                                <td className="py-2.5 text-right pr-4 font-extrabold text-foreground">
                                  S/ {parseFloat(o.total || "0").toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Points Ledger */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Gift className="h-4 w-4 text-amber-500" />
                      Puntos de Lealtad
                      <span className="text-muted-foreground font-normal normal-case ml-1">({fichaData.puntos.length} movimientos)</span>
                    </h4>
                    {fichaData.puntos.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No hay movimientos de puntos registrados.</p>
                    ) : (
                      <div className="space-y-2">
                        {fichaData.puntos.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:border-secondary/20 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                log.tipo === "canjeado"
                                  ? "bg-rose-500/10 text-rose-500"
                                  : log.tipo === "ajuste"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-emerald-500/10 text-emerald-500"
                              }`}>
                                <Gift className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {log.descripcion || (log.tipo === "ganado" ? "Ganado por consumo" : log.tipo === "canjeado" ? "Canjeado por premio" : "Ajuste manual")}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5" suppressHydrationWarning>
                                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`font-extrabold text-sm ml-3 ${
                                log.tipo === "canjeado" ? "text-rose-500" : "text-emerald-500"
                              }`}
                            >
                              {log.puntos > 0 ? `+${log.puntos}` : log.puntos}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
