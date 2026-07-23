export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { empresas, sucursales, usuarios } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  Building2,
  ArrowLeft,
  Store,
  Users,
  Calendar,
  BadgeDollarSign,
  Check,
  X,
  Circle,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";


interface PageProps {
  params: Promise<{ id: string }>;
}

const planColors: Record<string, string> = {
  free: "bg-muted border-border text-muted-foreground",
  pro: "bg-secondary/10 border-secondary/30 text-secondary",
  enterprise: "bg-amber-500/10 border-amber-500/30 text-amber-500",
};

export default async function EmpresaDetallePage({ params }: PageProps) {
  const { id } = await params;

  const [empresa] = await db
    .select()
    .from(empresas)
    .where(eq(empresas.id, id))
    .limit(1);

  if (!empresa) notFound();

  const [branches, users] = await Promise.all([
    db
      .select()
      .from(sucursales)
      .where(eq(sucursales.empresaId, id))
      .orderBy(sucursales.nombre),
    db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        email: usuarios.email,
        rol: usuarios.rol,
        activo: usuarios.activo,
        sucursalId: usuarios.sucursalId,
        createdAt: usuarios.createdAt,
      })
      .from(usuarios)
      .where(eq(usuarios.empresaId, id))
      .orderBy(usuarios.nombre),
  ]);

  const planBadgeColor = planColors[empresa.plan] || planColors.free;

  return (
    <div className="space-y-8 -50 transition-opacity duration-300">
      {/* Back button */}
      <Link
        href="/superadmin/empresas"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Volver a empresas
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-2xl">
            <Building2 className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{empresa.nombre}</h1>
            <div className="flex items-center gap-2.5 mt-1.5">
              <Badge className={`${planBadgeColor} border text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md`}>
                {empresa.plan === "enterprise" ? "Enterprise" : empresa.plan === "pro" ? "Pro" : "Free"}
              </Badge>
              <Badge
                className={`border-0 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  empresa.activo
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {empresa.activo ? "Activo" : "Suspendido"}
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="size-3" />
                Creada el {new Date(empresa.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl">
              <Store className="size-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Sucursales</span>
              <p className="text-2xl font-black text-foreground">{branches.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 text-violet-500 border border-violet-500/20 rounded-xl">
              <Users className="size-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Usuarios</span>
              <p className="text-2xl font-black text-foreground">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
              <BadgeDollarSign className="size-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Plan</span>
              <p className="text-2xl font-black text-foreground capitalize">{empresa.plan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sucursales */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Store className="size-4 text-secondary" />
            Sucursales ({branches.length})
          </h2>
        </div>
        {branches.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No hay sucursales registradas.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {branches.map((b) => (
              <div key={b.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Circle
                    className={`size-2 shrink-0 ${b.activa ? "fill-emerald-500 text-emerald-500" : "fill-destructive/50 text-destructive/50"}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{b.nombre}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{b.direccion || "Sin dirección"}</p>
                  </div>
                </div>
                <Badge
                  className={`border-0 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ml-3 ${
                    b.activa
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {b.activa ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usuarios */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="size-4 text-secondary" />
            Usuarios ({users.length})
          </h2>
        </div>
        {users.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No hay usuarios registrados.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u) => {
              const branchName = branches.find((b) => b.id === u.sucursalId)?.nombre;

              return (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center font-bold text-xs shrink-0">
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {u.nombre} {u.apellido || ""}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Mail className="size-3" />
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {branchName && (
                      <span className="text-[10px] text-muted-foreground hidden sm:block truncate max-w-[140px]">
                        {branchName}
                      </span>
                    )}
                    <Badge className="bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/10 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                      {u.rol}
                    </Badge>
                    {u.activo ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <X className="size-3.5 text-destructive" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
