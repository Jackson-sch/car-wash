"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";

interface TimeElapsedProps {
  createdAt: Date | null;
}

export function TimeElapsed({ createdAt }: TimeElapsedProps) {
  const [mounted, setMounted] = useState(false);
  const [elapsed, setElapsed] = useState("");
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!createdAt) return;
    
    const updateTime = () => {
      const date = new Date(createdAt);
      setElapsed(formatDistanceToNowStrict(date, { locale: es }));
      setMinutes(Math.floor((new Date().getTime() - date.getTime()) / 60000));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (!mounted || !createdAt) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-border/40 bg-muted/20 text-muted-foreground/50 shrink-0">
        <Clock className="size-3" />
        <span>--</span>
      </div>
    );
  }

  const isCritical = minutes > 45;
  const isWarning = minutes > 25 && !isCritical;

  const badgeStyle = isCritical
    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
    : isWarning
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";

  const dotColor = isCritical
    ? "bg-rose-500 animate-pulse"
    : isWarning
    ? "bg-amber-500"
    : "bg-emerald-500";

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 transition-colors ${badgeStyle}`}
      suppressHydrationWarning
    >
      <span className={`size-1.5 rounded-full ${dotColor}`} />
      <Clock className="size-3" />
      <span className="whitespace-nowrap tracking-tight">{elapsed}</span>
    </div>
  );
}
