"use client";

import { useState, useTransition } from "react";
import { Star, CheckCircle2, HeartHandshake, Sparkles, Send, Clock, Smile, Droplets, Gem, ThumbsUp, Frown, Meh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { guardarEvaluacionCSAT } from "@/lib/actions/evaluaciones";
import { toast } from "sonner";

interface EvaluacionClientProps {
  orden: {
    id: string;
    nroTicket: string | null;
    estado: string;
    placa: string | null;
    sucursalNombre: string;
  };
}

export function EvaluacionClient({ orden }: EvaluacionClientProps) {
  const [estrellas, setEstrellas] = useState<number>(5);
  const [hoverEstrellas, setHoverEstrellas] = useState<number>(0);
  const [aspectos, setAspectos] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [isPending, startTransition] = useTransition();

  const ASPECTOS_LIST = [
    { id: "Brillo y Limpieza Excelente", label: "Brillo y Limpieza Excelente", icon: Sparkles },
    { id: "Rapidez en la Entrega", label: "Rapidez en la Entrega", icon: Clock },
    { id: "Trato Amable y Profesional", label: "Trato Amable y Profesional", icon: Smile },
    { id: "Cuidado de Tapicería", label: "Cuidado de Tapicería", icon: Droplets },
    { id: "Gran Relación Calidad-Precio", label: "Gran Relación Calidad-Precio", icon: Gem },
  ];

  const toggleAspecto = (id: string) => {
    if (aspectos.includes(id)) {
      setAspectos(aspectos.filter((a) => a !== id));
    } else {
      setAspectos([...aspectos, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await guardarEvaluacionCSAT({
        nroTicket: orden.nroTicket || "",
        estrellas,
        comentario,
        aspectos,
      });

      if (res.success) {
        setEnviado(true);
        toast.success("¡Gracias por evaluar tu experiencia en WashMaster!");
      } else {
        toast.error(res.error || "Ocurrió un error al enviar tu calificación.");
      }
    });
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-border bg-card shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground">¡Gracias por tu Calificación!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tus comentarios nos ayudan a mantener los más altos estándares de calidad en {orden.sucursalNombre}.
          </p>
          <div className="pt-2 text-xs font-bold text-secondary flex items-center justify-center gap-1.5">
            <HeartHandshake className="h-4 w-4" />
            ¡Esperamos verte pronto nuevamente!
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 sm:p-8 space-y-6 border-zinc-800 bg-zinc-900 shadow-2xl rounded-3xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full text-xs font-bold text-secondary">
            <Sparkles className="h-3.5 w-3.5" />
            {orden.sucursalNombre}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">¿Cómo estuvo tu Servicio de Lavado?</h1>
          <p className="text-xs text-zinc-400">
            Vehículo Placa <span className="font-mono font-bold text-amber-400 uppercase">{orden.placa || "REGISTRADO"}</span> — Ticket #{orden.nroTicket}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Estrellas */}
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Califica tu satisfacción general:
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEstrellas(star)}
                  onMouseEnter={() => setHoverEstrellas(star)}
                  onMouseLeave={() => setHoverEstrellas(0)}
                  className="p-1.5 rounded-xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverEstrellas || estrellas) >= star
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "text-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              {estrellas === 5 ? (
                <>
                  <ThumbsUp className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ¡Excelente experiencia!
                </>
              ) : estrellas === 4 ? (
                <>
                  <ThumbsUp className="h-4 w-4 text-amber-400" />
                  ¡Muy Bueno!
                </>
              ) : estrellas === 3 ? (
                <>
                  <Meh className="h-4 w-4 text-amber-400" />
                  Aceptable
                </>
              ) : (
                <>
                  <Frown className="h-4 w-4 text-amber-400" />
                  Necesita Mejorar
                </>
              )}
            </span>
          </div>

          {/* Aspectos destacados */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              ¿Qué es lo que más te gustó?
            </label>
            <div className="flex flex-wrap gap-2">
              {ASPECTOS_LIST.map((asp) => {
                const IconComp = asp.icon;
                const selected = aspectos.includes(asp.id);
                return (
                  <button
                    key={asp.id}
                    type="button"
                    onClick={() => toggleAspecto(asp.id)}
                    className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selected
                        ? "bg-secondary text-secondary-foreground border-secondary shadow-md font-black"
                        : "bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <IconComp className="h-3.5 w-3.5" />
                    {asp.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comentarios */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Comentario u Observaciones Adicionales
            </label>
            <Textarea
              placeholder="Déjanos saber si tienes alguna sugerencia para mejorar nuestro servicio..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-xs min-h-[80px]"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 text-xs font-extrabold rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2 shadow-lg cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {isPending ? "Enviando Evaluación..." : "Enviar mi Opinión"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
