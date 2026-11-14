export interface InsumoOption {
  id: string;
  nombre: string;
  unidad: string | null;
  stock: string | null;
  precioCompra: string | null;
  proveedor: string | null;
}

export interface ItemCompraInput {
  insumoId: string;
  descripcion: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

export interface CompraDetalleItem {
  id: string;
  compraId: string;
  insumoId: string;
  descripcion: string;
  cantidad: string;
  costoUnitario: string;
  subtotal: string;
  createdAt: Date | null | undefined;
  insumo?: {
    id: string;
    nombre: string;
    unidad: string | null;
    stock: string | null;
  } | null;
}

export interface CompraItem {
  id: string;
  sucursalId: string;
  usuarioId: string | null;
  proveedorId?: string | null;
  proveedorNombre: string;
  proveedorRuc: string | null;
  tipoComprobante: string;
  numeroComprobante: string;
  fechaEmision: Date;
  metodoPago: string;
  estado: string;
  subtotal: string | null;
  igv: string | null;
  total: string;
  observaciones: string | null;
  createdAt: Date | null | undefined;
  updatedAt: Date | null | undefined;
  usuario?: {
    id: string;
    nombre: string | null;
    apellido: string | null;
  } | null;
  detalles: CompraDetalleItem[];
}

export interface ProveedorAutocompleteItem {
  id: string;
  ruc: string | null;
  razonSocial: string;
  nombreComercial: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  contactoNombre: string | null;
  banco: string | null;
  cuentaBancaria: string | null;
  cci: string | null;
}

export interface ProveedorDirectoryItem extends ProveedorAutocompleteItem {
  sucursalId: string;
  notas: string | null;
  activo: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  totalCompras: number;
  montoTotal: number;
  ultimaCompra: Date | null;
}

export type CompraFilterType = "todos" | "factura" | "boleta" | "completada" | "anulada";
