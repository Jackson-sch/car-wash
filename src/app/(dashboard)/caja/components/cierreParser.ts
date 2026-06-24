import { ParsedCierreDetails } from "./types";

// Función para parsear la cadena estructurada de las observaciones de cierre
export function parseObservaciones(obsText: string | null): ParsedCierreDetails | null {
  if (!obsText) return null;

  if (!obsText.includes("[CORTE DE CAJA DETALLADO")) {
    return {
      legacy: true,
      tipoCierre: "Estándar",
      fondoInicial: "0.00",
      metodos: [],
      desglose: [],
      observaciones: obsText,
      supervisor: null,
    };
  }

  const result: ParsedCierreDetails = {
    legacy: false,
    tipoCierre: obsText.includes("ARQUEO A CIEGAS") ? "Arqueo a Ciegas" : "Estándar",
    fondoInicial: "0.00",
    metodos: [],
    desglose: [],
    observaciones: "",
    supervisor: null,
  };

  const lines = obsText.split("\n");
  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("[CORTE DE CAJA DETALLADO")) {
      currentSection = "totales";
      continue;
    } else if (trimmed.startsWith("[DESGLOSE DE EFECTIVO]")) {
      currentSection = "desglose";
      continue;
    } else if (trimmed.startsWith("[OBSERVACIONES GENERALES]")) {
      currentSection = "observaciones";
      continue;
    }

    if (currentSection === "totales") {
      if (trimmed.startsWith("- Fondo Inicial:")) {
        result.fondoInicial = trimmed.replace("- Fondo Inicial: S/", "").trim();
      } else if (trimmed.includes("Esperado:") && trimmed.includes("Contado:")) {
        const match = trimmed.match(/-\s*([^:]+)\s*Esperado:\s*S\/\s*([\d.-]+)\s*\|\s*Contado:\s*S\/\s*([\d.-]+)\s*\(Dif:\s*S\/\s*([\d.-]+)\)/);
        if (match) {
          result.metodos.push({
            nombre: match[1].trim(),
            esperado: parseFloat(match[2]),
            contado: parseFloat(match[3]),
            diferencia: parseFloat(match[4]),
          });
        }
      }
    } else if (currentSection === "desglose") {
      if (trimmed.startsWith("*")) {
        const match = trimmed.match(/\*\s*([^:]+):\s*(\d+)\s*u\.\s*=\s*S\/\s*([\d.-]+)/);
        if (match) {
          result.desglose.push({
            denominacion: match[1].trim(),
            cantidad: parseInt(match[2]),
            total: parseFloat(match[3]),
          });
        }
      }
    } else if (currentSection === "observaciones") {
      if (trimmed.startsWith("[AUTORIZADO POR SUPERVISOR:")) {
        result.supervisor = trimmed.replace("[AUTORIZADO POR SUPERVISOR:", "").replace("]", "").trim();
      } else {
        result.observaciones += (result.observaciones ? "\n" : "") + trimmed;
      }
    }
  }

  return result;
}
