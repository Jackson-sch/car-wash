"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";

interface TimeElapsedProps {
  createdAt: Date | null;
}

export function TimeElapsed({ createdAt }: TimeElapsedProps) {
  const [elapsed, setElapsed] = useState("");
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
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

  if (!createdAt) return null;

  const dotColor = minutes > 30 ? "bg-rose-500 animate-pulse" : minutes > 15 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-900 bg-background/50 px-1.5 py-1.5 rounded-full border border-border/50 shrink-0" suppressHydrationWarning>
      <div className={`size-1.5 rounded-full ${dotColor}`} />
      <Clock className="size-3" />
      <span className="whitespace-nowrap">{elapsed}</span>
    </div>
  );
}
