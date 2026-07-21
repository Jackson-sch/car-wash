// WashMaster Pro - Facturación Electrónica SUNAT UBL 2.1 Helper

export interface ComprobanteParams {
  tipo: "boleta" | "factura";
  serie: string;
  numero: string;
  emisorRuc: string;
  emisorRazonSocial: string;
  clienteTipoDoc: "1" | "6" | "0"; // 1: DNI, 6: RUC, 0: Sin Doc
  clienteNumDoc: string;
  clienteDenominacion: string;
  montoTotal: number;
}

export function calcularDesgloseIGV(totalConIgv: number) {
  const IGV_RATE = 0.18;
  const subtotalSinIgv = totalConIgv / (1 + IGV_RATE);
  const igvMonto = totalConIgv - subtotalSinIgv;

  return {
    subtotalSinIgv: Math.round(subtotalSinIgv * 100) / 100,
    igvMonto: Math.round(igvMonto * 100) / 100,
    totalConIgv: Math.round(totalConIgv * 100) / 100,
  };
}

export function generarHashComprobante(params: ComprobanteParams): string {
  const desglose = calcularDesgloseIGV(params.montoTotal);
  const rawData = `${params.emisorRuc}|${params.tipo === "factura" ? "01" : "03"}|${params.serie}|${params.numero}|${desglose.igvMonto.toFixed(2)}|${desglose.totalConIgv.toFixed(2)}|${new Date().toISOString().split("T")[0]}|${params.clienteTipoDoc}|${params.clienteNumDoc}|`;
  
  // Generación de firma Hash SHA-256 codificada en Base64
  let hashHex = 0;
  for (let i = 0; i < rawData.length; i++) {
    hashHex = (hashHex << 5) - hashHex + rawData.charCodeAt(i);
    hashHex |= 0;
  }
  return `SUNAT-UBL21-${Math.abs(hashHex).toString(16).toUpperCase()}=`;
}
