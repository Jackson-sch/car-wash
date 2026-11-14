export interface VehiculoItem {
  id: string;
  placa: string;
  tipo: string | null;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  color: string | null;
  clienteId: string;
  clienteNombre: string;
  clienteApellido: string | null;
  clienteTelefono: string | null;
  totalOrdenes: number;
}

export type VehiculoFilterType =
  | "todos"
  | "sedan"
  | "suv"
  | "pickup"
  | "moto"
  | "otros"
  | "con_ordenes";

export const TIPO_LABELS: Record<string, string> = {
  sedan: "Sedán",
  suv: "SUV",
  pickup: "Pick-up",
  moto: "Moto",
  camion: "Camión",
  furgon: "Furgón",
  otro: "Otro",
};
