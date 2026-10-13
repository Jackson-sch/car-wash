export interface ImpresoraConfig {
  modeloPreset:
    | "epson-80"
    | "xprinter-80"
    | "bixolon-80"
    | "3nstar-80"
    | "sunmi-58"
    | "generica-58"
    | "custom";
  nombrePersonalizado?: string;
  anchoPapel: "80mm" | "58mm";
  autocorte: boolean;
  abrirCajon: boolean;
  mostrarLogo: boolean;
  copias: 1 | 2;
  copiaLavador: boolean; // Si la 2da copia es ticket de trabajo para parabrisas
  mensajePie: string;
  densidadFuente: "normal" | "compacta";
}

export interface PresetImpresora {
  id: ImpresoraConfig["modeloPreset"];
  nombre: string;
  marca: string;
  descripcion: string;
  anchoPapel: "80mm" | "58mm";
  badge: string;
  popularidad: number; // 1-5 estrellas
  defaults: Omit<ImpresoraConfig, "modeloPreset">;
}

export const DEFAULT_IMPRESORA_CONFIG: ImpresoraConfig = {
  modeloPreset: "epson-80",
  anchoPapel: "80mm",
  autocorte: true,
  abrirCajon: true,
  mostrarLogo: true,
  copias: 1,
  copiaLavador: false,
  mensajePie: "¡Muchas gracias por su preferencia!\nConserve este ticket para retirar su vehículo.",
  densidadFuente: "normal",
};

export const PRESETS_IMPRESORAS_PERU: PresetImpresora[] = [
  {
    id: "epson-80",
    nombre: "Epson TM-T20III / TM-T88",
    marca: "Epson",
    descripcion:
      "El estándar de oro en cajas de Perú. Máxima durabilidad en ambientes húmedos y guillotina para 1.5M de cortes.",
    anchoPapel: "80mm",
    badge: "Estándar de Oro",
    popularidad: 5,
    defaults: {
      anchoPapel: "80mm",
      autocorte: true,
      abrirCajon: true,
      mostrarLogo: true,
      copias: 1,
      copiaLavador: false,
      mensajePie: "¡Muchas gracias por su preferencia!\nConserve este ticket para retirar su vehículo.",
      densidadFuente: "normal",
    },
  },
  {
    id: "xprinter-80",
    nombre: "Xprinter XP-N160II / Q200 / T80",
    marca: "Xprinter",
    descripcion:
      "La reina costo-beneficio más vendida en Wilson y Mercado Libre Perú. USB/Red con guillotina de autocorte.",
    anchoPapel: "80mm",
    badge: "Más Vendida en Perú",
    popularidad: 5,
    defaults: {
      anchoPapel: "80mm",
      autocorte: true,
      abrirCajon: true,
      mostrarLogo: true,
      copias: 1,
      copiaLavador: false,
      mensajePie: "¡Muchas gracias por su preferencia!\nConserve este ticket para retirar su vehículo.",
      densidadFuente: "normal",
    },
  },
  {
    id: "bixolon-80",
    nombre: "Bixolon SRP-330 / SRP-350",
    marca: "Bixolon (Samsung)",
    descripcion:
      "Gama alta retail y franquicias. Ultra rápida (250 mm/s) con excelente contraste de impresión en papel térmico.",
    anchoPapel: "80mm",
    badge: "Alta Velocidad",
    popularidad: 4,
    defaults: {
      anchoPapel: "80mm",
      autocorte: true,
      abrirCajon: true,
      mostrarLogo: true,
      copias: 1,
      copiaLavador: false,
      mensajePie: "¡Muchas gracias por su preferencia!\nConserve este ticket para retirar su vehículo.",
      densidadFuente: "normal",
    },
  },
  {
    id: "3nstar-80",
    nombre: "3nStar RPT006 / RPT010",
    marca: "3nStar",
    descripcion:
      "Muy extendida en comercios y cadenas de retail en Perú. Excelente compatibilidad nativa con ESC/POS.",
    anchoPapel: "80mm",
    badge: "Corporativa",
    popularidad: 4,
    defaults: {
      anchoPapel: "80mm",
      autocorte: true,
      abrirCajon: true,
      mostrarLogo: true,
      copias: 1,
      copiaLavador: false,
      mensajePie: "¡Muchas gracias por su preferencia!\nConserve este ticket para retirar su vehículo.",
      densidadFuente: "normal",
    },
  },
  {
    id: "sunmi-58",
    nombre: "Sunmi V2 / Terminal Android POS (58mm)",
    marca: "Sunmi / Android",
    descripcion:
      "Para terminales móviles de mano en el patio o recepción del car wash. Formato compacto de 58mm.",
    anchoPapel: "58mm",
    badge: "Móvil / Patio",
    popularidad: 4,
    defaults: {
      anchoPapel: "58mm",
      autocorte: false,
      abrirCajon: false,
      mostrarLogo: false,
      copias: 1,
      copiaLavador: false,
      mensajePie: "¡Gracias por su visita!\nTicket de control de patio.",
      densidadFuente: "compacta",
    },
  },
  {
    id: "generica-58",
    nombre: "Genérica POS-58 / Zjiang Bluetooth (58mm)",
    marca: "Genérica / Zjiang",
    descripcion:
      "Impresoras portátiles de bajo costo (Bluetooth/USB). Corte manual con diente de sierra.",
    anchoPapel: "58mm",
    badge: "Económica 58mm",
    popularidad: 3,
    defaults: {
      anchoPapel: "58mm",
      autocorte: false,
      abrirCajon: false,
      mostrarLogo: false,
      copias: 1,
      copiaLavador: false,
      mensajePie: "¡Muchas gracias por su preferencia!",
      densidadFuente: "compacta",
    },
  },
  {
    id: "custom",
    nombre: "Personalizada / Otra Marca",
    marca: "A Medida",
    descripcion:
      "Configura manualmente todas las variables (ancho de bobina, autocorte, copias y logotipos).",
    anchoPapel: "80mm",
    badge: "Manual",
    popularidad: 3,
    defaults: {
      anchoPapel: "80mm",
      autocorte: true,
      abrirCajon: false,
      mostrarLogo: true,
      copias: 1,
      copiaLavador: false,
      mensajePie: "¡Muchas gracias por su preferencia!",
      densidadFuente: "normal",
    },
  },
];
