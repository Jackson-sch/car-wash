"use client";

import { useState } from "react";
import { 
  Zap, 
  Shield, 
  Crown, 
  UserCheck, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ArrowRight,
  KeyRound,
  Info
} from "lucide-react";
import { toast } from "sonner";

export interface DevAccount {
  id: string;
  name: string;
  role: "superadmin" | "admin" | "supervisor" | "cajero" | "lavador";
  roleLabel: string;
  email: string;
  password: string;
  description: string;
  badgeClass: string;
  icon: typeof Shield;
}

const DEV_ACCOUNTS: DevAccount[] = [
  {
    id: "superadmin",
    name: "Super Admin",
    role: "superadmin",
    roleLabel: "Super Admin",
    email: "superadmin@washmaster.com",
    password: "CarWash2026!",
    description: "Multi-empresa y administración global",
    badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30 group-hover:border-purple-400/50",
    icon: Shield,
  },
  {
    id: "admin",
    name: "Administrador",
    role: "admin",
    roleLabel: "Administrador",
    email: "admin@carwashpro.com",
    password: "CarWash2026!",
    description: "Gestión total de sucursal & inventario",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30 group-hover:border-amber-400/50",
    icon: Crown,
  },
  {
    id: "supervisor",
    name: "Roberto Supervisor",
    role: "supervisor",
    roleLabel: "Supervisor",
    email: "roberto.mira@carwashpro.com",
    password: "CarWash2026!",
    description: "Control de patio, turnos y aprobaciones",
    badgeClass: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30 group-hover:border-cyan-400/50",
    icon: UserCheck,
  },
  {
    id: "cajero",
    name: "Doris Cajera",
    role: "cajero",
    roleLabel: "Cajera / POS",
    email: "doris.mira@carwashpro.com",
    password: "CarWash2026!",
    description: "Punto de venta, cobros y apertura de caja",
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30 group-hover:border-blue-400/50",
    icon: Zap,
  },
  {
    id: "lavador",
    name: "Carlos Lavador",
    role: "lavador",
    roleLabel: "Lavador / Patio",
    email: "carlos.lav@carwashpro.com",
    password: "CarWash2026!",
    description: "Vista de patio y avance de servicios",
    badgeClass: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 group-hover:border-slate-400/50",
    icon: Sparkles,
  },
];

interface DevQuickLoginProps {
  onSelectAccount: (account: DevAccount, autoSubmit?: boolean) => void;
  disabled?: boolean;
}

export function DevQuickLogin({ onSelectAccount, disabled = false }: DevQuickLoginProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleSelect = (account: DevAccount, autoSubmit = false) => {
    setSelectedId(account.id);
    onSelectAccount(account, autoSubmit);
    if (!autoSubmit) {
      toast.success(`Datos de ${account.roleLabel} cargados`, {
        description: `${account.email} • Contraseña lista`,
      });
    }
  };

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    toast.info(`${label} copiado al portapapeles`);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="mt-6 pt-5 border-t border-border/70 border-dashed">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 transition-colors text-left group cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground tracking-tight">
              Acceso Rápido de Prueba
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-secondary/20 text-secondary border border-secondary/30">
              Dev Mode
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
          <span className="text-[11px] font-medium hidden sm:inline">
            {isOpen ? "Ocultar usuarios" : "Mostrar usuarios"}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="mt-3 space-y-2 animate-in fade-in-50 duration-200">
          <p className="text-xs text-slate-600 dark:text-slate-300 px-1 flex items-center gap-1.5 font-medium">
            <KeyRound className="h-3.5 w-3.5 text-secondary shrink-0" />
            <span>Haz clic en un usuario para autocompletar credenciales o ingresar directamente:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEV_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const isSelected = selectedId === account.id;

              return (
                <div
                  key={account.id}
                  onClick={() => !disabled && handleSelect(account, false)}
                  className={`group relative p-3 rounded-xl border transition-all duration-200 text-left flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "bg-secondary/15 border-secondary ring-1 ring-secondary/50 shadow-sm shadow-secondary/20"
                      : "bg-card/90 hover:bg-card border-border/90 hover:border-secondary/60"
                  } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {/* Top row: Role tag + Quick Login button */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${account.badgeClass}`}
                      >
                        <Icon className="h-3 w-3" />
                        {account.roleLabel}
                      </span>
                    </div>

                    <button
                      type="button"
                      title="Entrar directamente con esta cuenta"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) handleSelect(account, true);
                      }}
                      className="opacity-90 group-hover:opacity-100 hover:scale-105 px-2 py-0.5 rounded-md bg-secondary text-slate-950 font-black shadow-xs transition-all text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Entrar</span>
                      <ArrowRight className="h-3 w-3 text-slate-950" />
                    </button>
                  </div>

                  {/* Name and email */}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-secondary transition-colors">
                      {account.name}
                    </p>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate" title={account.email}>
                        {account.email}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, account.email, "Correo")}
                        title="Copiar correo"
                        className="text-slate-500 hover:text-foreground transition-colors p-0.5"
                      >
                        {copiedEmail === account.email ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password & role hint */}
                  <div className="mt-2 pt-1.5 border-t border-border/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    <span className="truncate pr-1">{account.description}</span>
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold text-foreground shrink-0 border border-border/60">
                      {account.password}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Helper notes */}
          <div className="p-2.5 rounded-lg bg-muted/50 border border-border/70 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between font-medium">
            <span>
              <span className="inline-flex items-center gap-1.5"><Info className="size-3.5 text-secondary shrink-0" /><strong>Tip:</strong> Puedes hacer clic en &quot;Entrar&quot; para iniciar sesión inmediatamente o en la tarjeta para rellenar el formulario.</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
