"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, PlusCircle, Search, Power, CreditCard, Calendar, Users, Store, Copy, Check, Info, ShieldCheck, Pencil, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { createEmpresa, toggleEmpresaStatus, updateEmpresa, getPlanesActivos } from "@/lib/actions/superadmin";
import { toast } from "sonner";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";

interface EmpresaItem {
  id: string;
  nombre: string;
  plan: string;
  activo: boolean;
  createdAt: Date;
  totalSucursales: number;
  totalUsuarios: number;
}

interface EmpresasClientProps {
  initialEmpresas: EmpresaItem[];
}

export function EmpresasClientList({ initialEmpresas }: EmpresasClientProps) {
  const [empresas, setEmpresas] = useState<EmpresaItem[]>(initialEmpresas);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("todos");
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    empresaNombre: string;
    email: string;
    pass: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaItem | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPlan, setEditPlan] = useState("pro");

  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [plan, setPlan] = useState<"free" | "pro" | "enterprise">("pro");
  const [adminNombre, setAdminNombre] = useState("");
  const [adminApellido, setAdminApellido] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminTelefono, setAdminTelefono] = useState("");

  const handleCreateEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreEmpresa || !adminNombre || !adminApellido || !adminEmail) {
      toast.error("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createEmpresa({
        nombreEmpresa,
        plan,
        adminNombre,
        adminApellido,
        adminEmail,
        adminTelefono,
      });

      if (res.success && res.data) {
        toast.success("Empresa creada exitosamente");
        
        const newEmp: EmpresaItem = {
          id: res.data.empresa.id,
          nombre: res.data.empresa.nombre,
          plan: res.data.empresa.plan,
          activo: res.data.empresa.activo,
          createdAt: new Date(res.data.empresa.createdAt),
          totalSucursales: 1,
          totalUsuarios: 1,
        };

        setEmpresas([newEmp, ...empresas]);
        setCreatedCredentials({
          empresaNombre: res.data.empresa.nombre,
          email: res.data.admin.email,
          pass: res.data.passwordDefault,
        });

        setNombreEmpresa("");
        setPlan("pro");
        setAdminNombre("");
        setAdminApellido("");
        setAdminEmail("");
        setAdminTelefono("");
      } else {
        toast.error(res.error || "No se pudo crear la empresa.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error inesperado al registrar la empresa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      setEmpresas(prev => 
        prev.map(emp => emp.id === id ? { ...emp, activo: newStatus } : emp)
      );

      const res = await toggleEmpresaStatus(id, newStatus);
      if (res.success) {
        toast.success(newStatus ? "Empresa activada" : "Empresa desactivada");
      } else {
        setEmpresas(prev => 
          prev.map(emp => emp.id === id ? { ...emp, activo: currentStatus } : emp)
        );
        toast.error(res.error || "No se pudo actualizar el estado de la empresa.");
      }
    } catch (err) {
      console.error(err);
      setEmpresas(prev => 
        prev.map(emp => emp.id === id ? { ...emp, activo: currentStatus } : emp)
      );
      toast.error("Error al actualizar estado.");
    }
  };

  const handleOpenEdit = (emp: EmpresaItem) => {
    setEditingEmpresa(emp);
    setEditNombre(emp.nombre);
    setEditPlan(emp.plan);
    setEditSheetOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmpresa || !editNombre.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await updateEmpresa(editingEmpresa.id, {
        nombre: editNombre.trim(),
        plan: editPlan,
      });

      if (res.success) {
        setEmpresas((prev) =>
          prev.map((emp) =>
            emp.id === editingEmpresa.id
              ? { ...emp, nombre: editNombre.trim(), plan: editPlan }
              : emp
          )
        );
        toast.success("Empresa actualizada");
        setEditSheetOpen(false);
      } else {
        toast.error(res.error || "Error al actualizar");
      }
    } catch {
      toast.error("Error al actualizar empresa");
    } finally {
      setIsSubmitting(false);
      setEditingEmpresa(null);
    }
  };

  const copyToClipboard = () => {
    if (!createdCredentials) return;
    const text = `Credenciales de Acceso - ${createdCredentials.empresaNombre}\n` +
      `Enlace: ${window.location.origin}/login\n` +
      `Usuario/Email: ${createdCredentials.email}\n` +
      `Contraseña Temporal: ${createdCredentials.pass}\n\n` +
      `* Nota: Por seguridad, se recomienda cambiar la contraseña en el primer inicio de sesión.`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credenciales copiadas al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredEmpresas = empresas.filter((emp) => {
    const matchesSearch = emp.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "todos" || emp.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredEmpresas.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedEmpresas = filteredEmpresas.slice(
    (activePage - 1) * itemsPerPage,
    (activePage - 1) * itemsPerPage + itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto bg-muted/50 border border-border px-3 py-1.5 rounded-xl max-w-md">
          <Search className="size-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(null);
            }}
            className="bg-transparent border-0 text-sm text-foreground focus:outline-none w-full focus:ring-0 placeholder-muted-foreground"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(null);
            }}
            className="bg-muted/50 border border-border text-xs font-semibold rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-ring"
          >
            <option value="todos">Todos los Planes</option>
            <option value="free">Plan Free</option>
            <option value="pro">Plan Pro</option>
            <option value="enterprise">Plan Enterprise</option>
          </select>

          <Sheet open={isOpen} onOpenChange={(val) => {
            setIsOpen(val);
            if (!val) setCreatedCredentials(null);
          }}>
            <SheetTrigger render={
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2 cursor-pointer shadow-sm">
                <PlusCircle className="size-4.5" />
                Registrar Empresa
              </Button>
            } />
            <SheetContent side="right" className="bg-card text-foreground border-l border-border p-6 w-full max-w-md overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-xl font-bold text-foreground">Nueva Empresa Inquilina</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Crea una nueva organización aislada, asigna un plan y configura su administrador principal.
                </SheetDescription>
              </SheetHeader>

              {createdCredentials ? (
                <div className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-200">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex flex-col items-center text-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-500 rounded-full">
                      <ShieldCheck className="size-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-500">¡Empresa Registrada!</h3>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        La empresa y el usuario administrador han sido creados correctamente en la base de datos.
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4 relative">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">Credenciales de Acceso</h4>
                    
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="text-muted-foreground block">Empresa</span>
                        <span className="font-semibold text-foreground">{createdCredentials.empresaNombre}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Usuario / Email</span>
                        <span className="font-mono text-foreground select-all">{createdCredentials.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Contraseña Temporal</span>
                        <span className="font-mono text-foreground select-all font-bold tracking-wider">{createdCredentials.pass}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 p-3 bg-secondary/5 border border-secondary/10 rounded-xl">
                      <Info className="size-4.5 text-secondary shrink-0 mt-0.5" />
                      <p className="text-[10px] text-secondary/80 leading-normal">
                        Copia estas credenciales y proporciónalas al administrador. Se le sugerirá cambiar la contraseña en su primer acceso.
                      </p>
                    </div>

                    <Button 
                      onClick={copyToClipboard}
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2 cursor-pointer py-5.5 mt-2 rounded-xl"
                    >
                      {copied ? <Check className="size-4.5" /> : <Copy className="size-4.5" />}
                      {copied ? "¡Copiado!" : "Copiar Credenciales"}
                    </Button>
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsOpen(false);
                      setCreatedCredentials(null);
                    }}
                    className="w-full text-muted-foreground hover:text-foreground font-semibold py-5.5 rounded-xl border border-border hover:bg-muted/50"
                  >
                    Cerrar Panel
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateEmpresa} className="space-y-5">
                  <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Datos de la Empresa</h3>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="nombreEmpresa" className="text-xs font-semibold text-foreground">Nombre del Car Wash</Label>
                      <Input
                        id="nombreEmpresa"
                        required
                        value={nombreEmpresa}
                        onChange={(e) => setNombreEmpresa(e.target.value)}
                        placeholder="Ej. Car Wash Los Amigos S.A."
                        className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="plan" className="text-xs font-semibold text-foreground">Plan de Suscripción</Label>
                      <select
                        id="plan"
                        value={plan}
                        onChange={(e) => setPlan(e.target.value as any)}
                        className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-ring"
                      >
                        <option value="free">Plan Free (1 Sucursal - Prueba)</option>
                        <option value="pro">Plan Pro (Multi-Sucursal)</option>
                        <option value="enterprise">Plan Enterprise (Ilimitado)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">Administrador Principal</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="adminNombre" className="text-xs font-semibold text-foreground">Nombre</Label>
                        <Input
                          id="adminNombre"
                          required
                          value={adminNombre}
                          onChange={(e) => setAdminNombre(e.target.value)}
                          placeholder="Ej. Juan"
                          className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="adminApellido" className="text-xs font-semibold text-foreground">Apellido</Label>
                        <Input
                          id="adminApellido"
                          required
                          value={adminApellido}
                          onChange={(e) => setAdminApellido(e.target.value)}
                          placeholder="Ej. Pérez"
                          className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="adminEmail" className="text-xs font-semibold text-foreground">Correo Electrónico (Login)</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="adminTelefono" className="text-xs font-semibold text-foreground">Teléfono (Opcional)</Label>
                      <Input
                        id="adminTelefono"
                        value={adminTelefono}
                        onChange={(e) => setAdminTelefono(e.target.value)}
                        placeholder="Ej. 987654321"
                        className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <SheetClose render={
                      <Button type="button" variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground border border-border py-5.5 rounded-xl cursor-pointer">
                        Cancelar
                      </Button>
                    } />
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-5.5 rounded-xl cursor-pointer"
                    >
                      {isSubmitting ? "Registrando..." : "Crear Empresa"}
                    </Button>
                  </div>
                </form>
              )}
            </SheetContent>
          </Sheet>
        </div>

      </div>

      {/* Edit empresa sheet */}
      <Sheet open={editSheetOpen} onOpenChange={(val) => { setEditSheetOpen(val); if (!val) setEditingEmpresa(null); }}>
        <SheetContent side="right" className="bg-card text-foreground border-l border-border p-6 w-full max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-foreground">Editar Empresa</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Modifica los datos de {editingEmpresa?.nombre}.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSaveEdit} className="space-y-5">
            <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Datos de la Empresa</h3>

              <div className="space-y-1.5">
                <Label htmlFor="editNombre" className="text-xs font-semibold text-foreground">Nombre del Car Wash</Label>
                <Input
                  id="editNombre"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editPlan" className="text-xs font-semibold text-foreground">Plan de Suscripción</Label>
                <select
                  id="editPlan"
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-ring"
                >
                  <option value="free">Plan Free (1 Sucursal - Prueba)</option>
                  <option value="pro">Plan Pro (Multi-Sucursal)</option>
                  <option value="enterprise">Plan Enterprise (Ilimitado)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <SheetClose render={
                <Button type="button" variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground border border-border py-5.5 rounded-xl cursor-pointer">
                  Cancelar
                </Button>
              } />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-5.5 rounded-xl cursor-pointer"
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-bold text-muted-foreground py-4.5 px-6">Empresa</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground py-4.5">Plan</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground py-4.5 text-center">Sucursales</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground py-4.5 text-center">Usuarios</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground py-4.5">Fecha de Registro</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground py-4.5 text-center">Estado</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground py-4.5 text-right px-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmpresas.length === 0 ? (
              <TableRow className="hover:bg-transparent border-b-0">
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-xs">
                  No se encontraron empresas con los filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmpresas.map((emp) => {
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
                        <span>{new Date(emp.createdAt).toLocaleDateString()}</span>
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
                        <Link
                          href={`/superadmin/empresas/${emp.id}`}
                          className="size-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(emp)}
                          className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase ml-1">
                          {emp.activo ? "Desactivar" : "Activar"}
                        </span>
                        <Switch
                          checked={emp.activo}
                          onCheckedChange={() => handleToggleStatus(emp.id, emp.activo)}
                          className="data-[state=checked]:bg-secondary focus-visible:ring-ring/40"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="p-4 border-t border-border bg-muted/10">
            <PaginationControls
              activePage={activePage}
              totalPages={totalPages}
              onPageChange={setPage}
              showInfo
              totalItems={filteredEmpresas.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
