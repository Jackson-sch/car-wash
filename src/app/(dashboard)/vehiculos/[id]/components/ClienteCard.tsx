"use client";

import Link from "next/link";
import { User, Phone, Mail, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getInitials } from "@/lib/formats";
import { VehiculoData } from "../types";

interface ClienteCardProps {
  vehiculo: VehiculoData;
}

function OwnerAvatar({ nombre, apellido }: { nombre: string; apellido?: string | null }) {
  const initials = getInitials(nombre, apellido || "");
  return (
    <div className="h-14 w-14 rounded-full bg-linear-to-tr from-secondary to-sky-400 text-white flex items-center justify-center text-base font-black shrink-0 shadow-md">
      {initials || <User className="h-6 w-6" />}
    </div>
  );
}

export function ClienteCard({ vehiculo }: ClienteCardProps) {
  return (
    <Card className="p-6 border-border bg-card shadow-sm hover:border-zinc-350 dark:hover:border-zinc-700 transition-all duration-300 rounded-2xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5 flex items-center gap-2">
        <User className="h-4 w-4 text-secondary" />
        Propietario / Cliente
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <OwnerAvatar nombre={vehiculo.clienteNombre} apellido={vehiculo.clienteApellido} />
        
        <div className="space-y-3 w-full min-w-0">
          <div>
            <Link
              href={`/clientes?search=${encodeURIComponent(vehiculo.clienteNombre)}`}
              className="text-base font-extrabold text-foreground hover:text-secondary transition-colors inline-block"
            >
              {vehiculo.clienteNombre} {vehiculo.clienteApellido || ""}
            </Link>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Cliente Registrado</p>
          </div>
          
          <div className="space-y-1.5 text-xs">
            {vehiculo.clienteTelefono && (
              <div className="flex items-center gap-2.5 bg-muted/40 px-3 py-2 rounded-xl border border-border/40 justify-center sm:justify-start">
                <Phone className="h-3.5 w-3.5 text-secondary shrink-0" />
                <a href={`tel:${vehiculo.clienteTelefono}`} className="font-bold text-foreground hover:text-secondary transition-colors">
                  {vehiculo.clienteTelefono}
                </a>
              </div>
            )}
            {vehiculo.clienteEmail && (
              <div className="flex items-center gap-2.5 bg-muted/40 px-3 py-2 rounded-xl border border-border/40 justify-center sm:justify-start min-w-0">
                <Mail className="h-3.5 w-3.5 text-secondary shrink-0" />
                <a href={`mailto:${vehiculo.clienteEmail}`} className="font-bold text-foreground hover:text-secondary transition-colors truncate block w-full text-center sm:text-left" title={vehiculo.clienteEmail}>
                  {vehiculo.clienteEmail}
                </a>
              </div>
            )}
          </div>
          
          {/* Direct Action buttons */}
          {vehiculo.clienteTelefono && (
            <div className="pt-2.5 flex flex-wrap gap-2 justify-center sm:justify-start">
              <a
                href={`https://wa.me/${vehiculo.clienteTelefono.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 rounded-xl font-bold transition-all shadow-xs border border-emerald-500/10 cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 fill-emerald-650/10" />
                WhatsApp
              </a>
              <a
                href={`tel:${vehiculo.clienteTelefono}`}
                className="inline-flex items-center gap-1.5 text-[10px] text-secondary hover:text-secondary-foreground hover:bg-secondary/15 bg-secondary/5 px-3 py-2 rounded-xl font-bold transition-all border border-secondary/10 cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                Llamar
              </a>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
