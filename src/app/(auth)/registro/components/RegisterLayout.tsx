"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Car } from "lucide-react";

interface RegisterLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function RegisterLayout({ leftPanel, rightPanel }: RegisterLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground overflow-hidden relative selection:bg-secondary/20 selection:text-foreground">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10 bg-card/40 border-r border-border overflow-y-auto max-h-screen">
        <div className="flex items-center justify-between mb-6 lg:mb-0 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <img src="/logo-shield.png" alt="WashMaster Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                WashMaster
              </span>
              <span className="font-semibold text-xl text-secondary tracking-tight"> Pro</span>
            </div>
          </Link>
        </div>

        {leftPanel}

        <div className="text-center lg:text-left shrink-0 mt-6 lg:mt-0">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            ← Volver al inicio
          </Link>
        </div>
      </div>

      {rightPanel}
    </div>
  );
}
