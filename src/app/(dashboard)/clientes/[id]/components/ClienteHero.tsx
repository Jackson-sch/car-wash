"use client";

import { User, Phone, Mail, FileText, MessageCircle, Pencil, Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { ClienteData } from "../types";

interface ClienteHeroProps {
  cliente: ClienteData;
  onEditClick: () => void;
  onPuntosClick: () => void;
}

export function ClienteHero({
  cliente,
  onEditClick,
  onPuntosClick,
}: ClienteHeroProps) {
  const puntos = cliente.totalPuntos || 0;
  const isVipGold = puntos >= 100;
  const isSilver = puntos >= 50 && puntos < 100;

  const initials = `${cliente.nombre.charAt(0)}${cliente.apellido ? cliente.apellido.charAt(0) : ""}`.toUpperCase();

  const cleanPhone = cliente.telefono ? cliente.telefono.replace(/\D/g, "") : null;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/51${cleanPhone}?text=${encodeURIComponent(
        `Hola ${cliente.nombre}, te saludamos de Car Wash Pro Perú.`
      )}`
    : null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-6 md:p-8 shadow-xs">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Avatar & Personal Info */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
          <div className="size-16 sm:size-20 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center font-black text-2xl sm:text-3xl text-secondary shrink-0 shadow-2xs">
            {initials}
          </div>

          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground truncate">
                {cliente.nombre} {cliente.apellido || ""}
              </h1>

              {isVipGold ? (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-black uppercase tracking-wider px-2.5 py-0.5">
                  VIP Gold (⭐ {puntos} pts)
                </Badge>
              ) : isSilver ? (
                <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 text-xs font-black uppercase tracking-wider px-2.5 py-0.5">
                  Silver ({puntos} pts)
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs font-medium border-border text-muted-foreground px-2.5 py-0.5">
                  Cliente Registrado ({puntos} pts)
                </Badge>
              )}
            </div>

            {/* Contact Details */}
            <div className="flex items-center gap-3 sm:gap-5 flex-wrap text-xs text-muted-foreground font-medium pt-0.5">
              {cliente.tipoDoc && cliente.nroDoc && (
                <div className="flex items-center gap-1.5 font-mono">
                  <FileText className="size-3.5 text-secondary shrink-0" />
                  <span>
                    {cliente.tipoDoc}: {cliente.nroDoc}
                  </span>
                </div>
              )}

              {cliente.telefono && (
                <div className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-secondary shrink-0" />
                  <span className="font-mono">{cliente.telefono}</span>
                </div>
              )}

              {cliente.email && (
                <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                  <Mail className="size-3.5 text-secondary shrink-0" />
                  <span className="truncate">{cliente.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3.5 rounded-xl border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="size-4 fill-current" />
                <span>WhatsApp</span>
              </Button>
            </a>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPuntosClick}
            className="h-9 px-3.5 rounded-xl border-border hover:bg-muted text-xs font-bold gap-1.5 cursor-pointer shadow-2xs"
          >
            <Gift className="size-3.5 text-amber-500" />
            <span>Puntos</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="h-9 px-3.5 rounded-xl border-border hover:bg-muted text-xs font-bold gap-1.5 cursor-pointer shadow-2xs"
          >
            <Pencil className="size-3.5 text-muted-foreground" />
            <span>Editar</span>
          </Button>

          <Link href="/ordenes/nueva">
            <Button
              type="button"
              size="sm"
              className="h-9 px-4 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="size-4" />
              <span>Nueva Orden</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
