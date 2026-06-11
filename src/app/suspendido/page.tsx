import Link from "next/link";
import { Ban, Car, Mail, Phone, Clock, ArrowRight } from "lucide-react";

export default function SuspendidoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-5%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-card border border-border/60 rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60">
              {/* LEFT: Message + Reasons */}
              <div className="p-8 sm:p-10 space-y-7">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                      <Ban className="size-6 text-destructive" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 size-5 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center">
                      <span className="text-[8px] font-black text-destructive">!</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                      Suscripción Suspendida
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tu cuenta ha sido desactivada temporalmente.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Factura pendiente de pago", desc: "La suscripción mensual no ha sido procesada." },
                    { label: "Periodo de prueba finalizado", desc: "El plan gratuito ha expirado sin renovación." },
                    { label: "Términos del servicio", desc: "Se ha detectado una actividad fuera de lo permitido." },
                    { label: "Solicitud del administrador", desc: "El superadmin ha desactivado la cuenta manualmente." },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50"
                    >
                      <div className="size-5 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-black text-destructive">{i + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                  <Clock className="size-3 shrink-0" />
                  <span>Si crees que es un error, contáctanos por los canales de la derecha.</span>
                </div>
              </div>

              {/* RIGHT: Contact + Actions */}
              <div className="p-8 sm:p-10 flex flex-col justify-between gap-7">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/60" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                      Para resolverlo
                    </span>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 space-y-2">
                      <div className="size-8 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center">
                        <Mail className="size-4" />
                      </div>
                      <p className="text-xs font-bold text-foreground">Escríbenos</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Envía un correo a{" "}
                        <span className="text-secondary font-semibold">soporte@washmaster.pe</span>{" "}
                        con los detalles de tu caso.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 space-y-2">
                      <div className="size-8 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center">
                        <Phone className="size-4" />
                      </div>
                      <p className="text-xs font-bold text-foreground">Llámanos</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Comunícate al{" "}
                        <span className="text-secondary font-semibold">(01) 445 6789</span>{" "}
                        en horario de oficina.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                    <Clock className="size-3" />
                    <span>Lun – Vie, 9:00 a 18:00</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-bold text-sm rounded-xl hover:bg-secondary/90 transition-all active:scale-[0.98]"
                  >
                    Volver al Login
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="mailto:soporte@washmaster.pe?subject=Reactivación%20de%20cuenta&body=Hola,%20solicito%20la%20reactivación%20de%20mi%20suscripción."
                    className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-transparent text-muted-foreground font-semibold text-xs rounded-xl border border-border hover:bg-muted/30 hover:text-foreground transition-all"
                  >
                    <Mail className="size-3.5" />
                    Solicitar Reactivación
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-muted-foreground/60">
            <Car className="size-3" />
            <span>WashMaster Pro — Sistema de Gestión para Car Washes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
