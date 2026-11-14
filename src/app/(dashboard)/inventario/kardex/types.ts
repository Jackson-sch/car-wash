export interface KardexMovimiento {
  id: string;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: number;
  motivo: string;
  createdAt: string | null;
  insumoId: string;
  insumoNombre: string;
  insumoUnidad: string;
  costoUnitario: number;
  valorizadoAprox: number;
  usuarioResponsable: string;
}

export interface InsumoSimple {
  id: string;
  nombre: string;
  unidad: string | null;
  stock: string | null;
}
