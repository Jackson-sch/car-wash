"use client";

import { useState, useReducer, useRef } from "react";
import { Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createEmpresa, toggleEmpresaStatus, updateEmpresa } from "@/lib/actions/superadmin";
import { toast } from "sonner";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { EmpresaRow } from "./components/EmpresaRow";
import { CreateEmpresaSheet } from "./components/CreateEmpresaSheet";
import { EditEmpresaSheet } from "./components/EditEmpresaSheet";

interface EmpresaItem {
  id: string;
  nombre: string;
  plan: string;
  activo: boolean;
  createdAt: Date;
  totalSucursales: number;
  totalUsuarios: number;
}

interface CreateFormState {
  nombreEmpresa: string;
  plan: "free" | "pro" | "enterprise";
  adminNombre: string;
  adminApellido: string;
  adminEmail: string;
  adminTelefono: string;
}

type CreateFormAction =
  | { type: "SET_FIELD"; field: string; value: unknown }
  | { type: "RESET" };

function createFormReducer(state: CreateFormState, action: CreateFormAction): CreateFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return { nombreEmpresa: "", plan: "pro", adminNombre: "", adminApellido: "", adminEmail: "", adminTelefono: "" };
    default:
      return state;
  }
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

  const copiedRef = useRef(false);

  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaItem | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPlan, setEditPlan] = useState("pro");

  const [createForm, dispatchCreate] = useReducer(createFormReducer, {
    nombreEmpresa: "",
    plan: "pro" as const,
    adminNombre: "",
    adminApellido: "",
    adminEmail: "",
    adminTelefono: "",
  });
  const { nombreEmpresa, plan, adminNombre, adminApellido, adminEmail, adminTelefono } = createForm;
  const sf = (field: string, value: unknown) => dispatchCreate({ type: "SET_FIELD", field, value });

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

        dispatchCreate({ type: "RESET" });
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

  const _copyToClipboard = () => {
    if (!createdCredentials) return;
    const text = `Credenciales de Acceso - ${createdCredentials.empresaNombre}\n` +
      `Enlace: ${window.location.origin}/login\n` +
      `Usuario/Email: ${createdCredentials.email}\n` +
      `Contraseña Temporal: ${createdCredentials.pass}\n\n` +
      `* Nota: Por seguridad, se recomienda cambiar la contraseña en el primer inicio de sesión.`;
    
    navigator.clipboard.writeText(text);
    copiedRef.current = true;
    toast.success("Credenciales copiadas al portapapeles");
    setTimeout(() => { copiedRef.current = false; }, 2000);
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
            aria-label="Buscar empresas"
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
            aria-label="Filtrar por plan"
            className="bg-muted/50 border border-border text-xs font-semibold rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-ring"
          >
            <option value="todos">Todos los Planes</option>
            <option value="free">Plan Free</option>
            <option value="pro">Plan Pro</option>
            <option value="enterprise">Plan Enterprise</option>
          </select>

          <CreateEmpresaSheet
            isOpen={isOpen}
            onOpenChange={(val) => {
              setIsOpen(val);
              if (!val) setCreatedCredentials(null);
            }}
            isSubmitting={isSubmitting}
            createForm={createForm}
            createdCredentials={createdCredentials}
            onFormChange={sf}
            onSubmit={handleCreateEmpresa}
            onClose={() => setCreatedCredentials(null)}
          />
        </div>

      </div>

      {/* Edit empresa sheet */}
      <EditEmpresaSheet
        isOpen={editSheetOpen}
        onOpenChange={(val) => { setEditSheetOpen(val); if (!val) setEditingEmpresa(null); }}
        empresaNombre={editingEmpresa?.nombre || null}
        editNombre={editNombre}
        editPlan={editPlan}
        isSubmitting={isSubmitting}
        onNombreChange={setEditNombre}
        onPlanChange={setEditPlan}
        onSubmit={handleSaveEdit}
        onClose={() => setEditingEmpresa(null)}
      />

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
              paginatedEmpresas.map((emp) => (
                <EmpresaRow
                  key={emp.id}
                  emp={emp}
                  onEdit={handleOpenEdit}
                  onToggleStatus={handleToggleStatus}
                />
              ))
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
