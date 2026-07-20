"use client";

import Link from "next/link";
import { Building2, Store, Users, Calendar, Eye, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";

interface EmpresaItem {
  id: string;
  nombre: string;
  plan: string;
  activo: boolean;
  createdAt: Date;
  totalSucursales: number;
  totalUsuarios: number;
}

interface EmpresaRowProps {
  emp: EmpresaItem;
  onEdit: (emp: EmpresaItem) => void;
  onToggleStatus: (id: string, current: boolean) => void;
}

export function EmpresaRow({ emp, onEdit, onToggleStatus }: EmpresaRowProps) {
  const isPro = emp.plan === "pro";
  const isEnterprise = emp.plan === "enterprise";

  return (
    <TableRow key={emp.id} className="border-b border-border hover:bg-muted/20 duration-150">
      <TableCell className="py-4 px-6 font-bold text-foreground">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg">
            <Building2 className="size-4" />
          </div>
          <div className="truncate max-w-[200px]">{emp.nombre}</div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        {isEnterprise ? (
          <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
            Enterprise
          </Badge>
        ) : isPro ? (
          <Badge className="bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/10 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
            Pro
          </Badge>
        ) : (
          <Badge className="bg-muted border-border text-muted-foreground hover:bg-muted text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
            Free
          </Badge>
        )}
      </TableCell>

      <TableCell className="py-4 text-center font-semibold text-muted-foreground">
        <div className="flex items-center justify-center gap-1.5">
          <Store className="size-3.5 text-muted-foreground/60" />
          <span>{emp.totalSucursales}</span>
        </div>
      </TableCell>

      <TableCell className="py-4 text-center font-semibold text-muted-foreground">
        <div className="flex items-center justify-center gap-1.5">
          <Users className="size-3.5 text-muted-foreground/60" />
          <span>{emp.totalUsuarios}</span>
        </div>
      </TableCell>

      <TableCell className="py-4 text-muted-foreground text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5 text-muted-foreground/60" />
          <span suppressHydrationWarning>{new Date(emp.createdAt).toLocaleDateString()}</span>
        </div>
      </TableCell>

      <TableCell className="py-4 text-center">
        <Badge className={`border-0 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
          emp.activo 
            ? "bg-emerald-500/10 text-emerald-500" 
            : "bg-destructive/10 text-destructive"
        }`}>
          {emp.activo ? "Activo" : "Suspendido"}
        </Badge>
      </TableCell>

      <TableCell className="py-4 text-right px-6">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/superadmin/empresas/${emp.id}`}
            aria-label="Ver detalle de empresa"
            className="size-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors">
            <Eye className="size-3.5" />
          </Link>
          <Button variant="ghost" size="icon" onClick={() => onEdit(emp)}
            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer">
            <Pencil className="size-3.5" />
          </Button>
          <span className="text-[10px] text-muted-foreground font-bold uppercase ml-1">
            {emp.activo ? "Desactivar" : "Activar"}
          </span>
          <Switch checked={emp.activo}
            onCheckedChange={() => onToggleStatus(emp.id, emp.activo)}
            className="data-[state=checked]:bg-secondary focus-visible:ring-ring/40" />
        </div>
      </TableCell>
    </TableRow>
  );
}
