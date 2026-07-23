export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Ban, Car, Mail, Phone, ArrowUpRight, AlertTriangle } from "lucide-react";

export default function SuspendidoPage() {
  return (
    <div className="min-h-dvh bg-background overflow-hidden">

      {/* ── Keyframes ───────────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slide-right {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.4; transform: scale(1);    }
          50%       { opacity: 0.15; transform: scale(1.12); }
        }
        .anim-1 { animation: fade-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .anim-2 { animation: fade-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .anim-3 { animation: fade-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
        .anim-4 { animation: fade-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
        .anim-5 { animation: fade-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.45s both; }
        .anim-6 { animation: fade-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
        .bar-anim {
          transform-origin: left;
          animation: slide-right 1s cubic-bezier(0.22,1,0.36,1) 0.3s both;
        }
        .pulse-ring {
          animation: pulse-ring 3s ease-in-out infinite;
        }
        .contact-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .contact-card:hover {
          transform: translateY(-2px);
          border-color: rgb(186 26 26 / 0.8) !important;
          box-shadow: 0 8px 32px rgb(186 26 26 / 0.09);
        }
        .btn-primary-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-primary-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgb(0 0 0 / 0.15);
        }
        .btn-secondary-hover {
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .btn-secondary-hover:hover {
          border-color: rgb(186 26 26 / 0.9) !important;
          color: var(--destructive) !important;
        }
      ` }} />

      {/* ── Ambient background ──────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Blob top-right: destructive tint */}
        <div className="absolute top-[-15%] right-[-8%] w-[700px] h-[700px] rounded-full bg-destructive/10 blur-[120px]" />
        {/* Blob bottom-left: secondary tint */}
        <div className="absolute bottom-[-20%] left-[-5%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[100px]" />
        {/* Fine grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Narrow top bar ──────────────────────────────────────────────────── */}
      <div className="relative z-10 border-b border-border/40 anim-1">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-4.5 flex items-center justify-center shrink-0">
              <Image src="/logo-shield.png" alt="WashMaster Logo" width={18} height={18} className="h-full w-full object-contain" />
            </div>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/60">
              WashMaster Pro
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
            <span className="text-[10px] font-medium text-destructive/80 tracking-wide uppercase">
              Cuenta suspendida
            </span>
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20">

        {/* ── Hero section ────────────────────────────────────────────────── */}
        <div className="mb-16">
          {/* Eyebrow */}
          <div className="anim-2 flex items-center gap-3 mb-6">
            <div
              className="relative flex items-center justify-center size-10 rounded-xl bg-destructive/10 border border-destructive/20"
            >
              <Ban className="size-4.5 text-destructive" />
              {/* Pulse ring */}
              <div className="pulse-ring absolute inset-0 rounded-xl border border-destructive/40" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-destructive/30 bar-anim" />
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-destructive/70">
                Error de acceso
              </span>
            </div>
          </div>

          {/* Heading — editorial scale */}
          <h1 className="anim-3">
            <span
              className="block text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.03em] text-foreground"
            >
              Suscripción
            </span>
            <span
              className="block text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[0.92] tracking-[-0.03em]"
              style={{
                WebkitTextStroke: "1px rgb(186 26 26 / 0.8)",
                color: "transparent",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
            >
              Suspendida.
            </span>
          </h1>

          {/* Subheading */}
          <p className="anim-4 mt-6 max-w-lg text-base text-white/95 leading-relaxed font-medium">
            Tu acceso a la plataforma ha sido desactivado temporalmente.
            Revisa los motivos a continuación o contacta soporte para resolverlo.
          </p>
        </div>

        {/* ── Grid: Reasons + Contact ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 anim-5">

          {/* LEFT — Reasons */}
          <div className="space-y-3">
            <p className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-muted-foreground mb-4">
              Posibles motivos
            </p>
            {[
              {
                n: "01",
                label: "Factura pendiente",
                desc: "La suscripción mensual no ha sido procesada o el pago fue rechazado.",
              },
              {
                n: "02",
                label: "Periodo de prueba finalizado",
                desc: "El plan gratuito ha expirado sin renovación activa.",
              },
              {
                n: "03",
                label: "Términos del servicio",
                desc: "Se detectó actividad fuera de los términos permitidos.",
              },
              {
                n: "04",
                label: "Solicitud del administrador",
                desc: "El superadmin ha desactivado la cuenta manualmente.",
              },
            ].map((item) => (
              <div
                key={item.n}
                className="group flex items-start gap-4 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm transition-colors duration-200 hover:border-destructive/60 hover:bg-card/80"
              >
                {/* Number badge */}
                <span
                  className="shrink-0 text-[11px] font-black tabular-nums text-destructive/40 mt-0.5 w-7"
                >
                  {item.n}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                {/* Hover indicator */}
                <div className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertTriangle className="size-3.5 text-destructive/40" />
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — Contact + CTAs */}
          <div className="flex flex-col gap-4">

            {/* Contact cards */}
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-zinc-300 mb-4">
                Canales de soporte
              </p>
              <div className="space-y-3">
                {/* Email */}
                <div
                  className="contact-card p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="size-9 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center shrink-0">
                      <Mail className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-white">Correo electrónico</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Escríbenos con los detalles de tu caso
                      </p>
                      <p className="text-xs font-semibold text-secondary mt-2">
                        soporte@washmaster.pe
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div
                  className="contact-card p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="size-9 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center shrink-0">
                      <Phone className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-white">Llamada directa</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lun – Vie · 9:00 a 18:00 hrs
                      </p>
                      <p className="text-xs font-semibold text-secondary mt-2">
                        (01) 445 6789
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/40">
                Acciones
              </span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            {/* CTA buttons */}
            <div className="space-y-2.5">
              <Link
                href="/login"
                className="btn-primary-hover w-full flex items-center justify-between gap-2 px-5 py-3.5 bg-foreground text-background font-bold text-sm rounded-xl"
              >
                <span>Volver al login</span>
                <ArrowUpRight className="size-4 opacity-70" />
              </Link>
              <Link
                href="mailto:soporte@washmaster.pe?subject=Reactivación%20de%20cuenta&body=Hola,%20solicito%20la%20reactivación%20de%20mi%20suscripción."
                className="btn-secondary-hover w-full flex items-center justify-center gap-2 px-5 py-3 border border-border/70 text-muted-foreground font-semibold text-xs rounded-xl bg-transparent"
              >
                <Mail className="size-3.5" />
                Solicitar reactivación
              </Link>
            </div>

          </div>
        </div>

        {/* ── Bottom footnote ─────────────────────────────────────────────── */}
        <div className="anim-6 mt-16 pt-6 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="size-3.5 text-zinc-500" />
            <span className="text-[10px] text-zinc-400">
              WashMaster Pro — Sistema de Gestión para Car Washes
            </span>
          </div>
          <span className="text-[10px] tabular-nums text-zinc-500">
            ERR_SUBSCRIPTION_SUSPENDED
          </span>
        </div>

      </div>
    </div>
  );
}