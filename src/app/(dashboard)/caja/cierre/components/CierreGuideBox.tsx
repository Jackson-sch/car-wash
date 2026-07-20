"use client";

export function CierreGuideBox() {
  return (
    <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 text-secondary text-xs space-y-2 leading-relaxed print:hidden">
      <p className="font-bold text-secondary flex items-center gap-1.5">
        🔍 Guía de Conciliación y Arqueo de Caja
      </p>
      <p className="text-muted-foreground">
        Para realizar un cierre correcto, el cajero debe contar físicamente el dinero en efectivo y el saldo de las transacciones digitales antes de verificar las cifras del sistema:
      </p>
      <ul className="list-disc pl-5 text-muted-foreground/80 space-y-1">
        <li><strong>Monto Esperado:</strong> Representa la suma calculada en base a las ventas registradas durante el turno (<code>Monto Inicial + Ventas en Efectivo</code>).</li>
        <li><strong>Monto Real (Contado):</strong> Es el dinero físico contado en caja y los saldos reales de pasarelas digitales.</li>
        <li><strong>Descuadres:</strong> Si el balance arroja diferencias (faltantes o sobrantes), el sistema bloqueará el cierre y requerirá la firma de un supervisor autorizado.</li>
      </ul>
    </div>
  );
}
