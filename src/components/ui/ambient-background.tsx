"use client";

import { useEffect, useRef } from "react";

const DRIFT_KEYFRAMES = `
@keyframes orb-drift-1 {
  0%,100% { transform: translate(0px,   0px)   scale(1);    }
  33%      { transform: translate(60px,  -40px) scale(1.08); }
  66%      { transform: translate(-30px,  50px) scale(0.95); }
}
@keyframes orb-drift-2 {
  0%,100% { transform: translate(0px,  0px)   scale(1);    }
  40%      { transform: translate(-70px, 30px) scale(1.1);  }
  70%      { transform: translate(40px, -60px) scale(0.92); }
}
@keyframes orb-drift-3 {
  0%,100% { transform: translate(0px,  0px)   scale(1);    }
  30%      { transform: translate(50px,  40px) scale(1.06); }
  65%      { transform: translate(-40px,-30px) scale(0.97); }
}
@keyframes orb-drift-4 {
  0%,100% { transform: translate(0px,  0px)   scale(1);    }
  45%      { transform: translate(-50px,-50px) scale(1.12); }
  80%      { transform: translate(30px,  40px) scale(0.94); }
}
@keyframes grain-shift {
  0%,100% { transform: translate(0, 0); }
  20%      { transform: translate(-2%, -3%); }
  40%      { transform: translate(2%,  1%); }
  60%      { transform: translate(-1%, 2%); }
  80%      { transform: translate(3%, -1%); }
}
`;

const ORB1_STYLE: React.CSSProperties = {
  width: 250,
  height: 250,
  top: "-8%",
  right: "-5%",
  background: "radial-gradient(circle at 40% 40%, var(--secondary) 0%, transparent 60%)",
  opacity: 0.12,
  filter: "blur(8px)",
  animation: "orb-drift-1 18s ease-in-out infinite",
};

const ORB2_STYLE: React.CSSProperties = {
  width: 200,
  height: 200,
  bottom: "-5%",
  left: "8%",
  background: "radial-gradient(circle at 60% 60%, var(--secondary) 0%, transparent 60%)",
  opacity: 0.10,
  filter: "blur(8px)",
  animation: "orb-drift-2 22s ease-in-out infinite",
};

const ORB3_STYLE: React.CSSProperties = {
  width: 140,
  height: 140,
  top: "22%",
  left: "38%",
  background: "radial-gradient(circle at 50% 50%, var(--secondary) 0%, transparent 55%)",
  opacity: 0.08,
  filter: "blur(6px)",
  animation: "orb-drift-3 26s ease-in-out infinite",
};

const ORB4_STYLE: React.CSSProperties = {
  width: 180,
  height: 180,
  bottom: "12%",
  right: "10%",
  background: "radial-gradient(circle at 45% 55%, var(--chart-1) 0%, transparent 60%)",
  opacity: 0.06,
  filter: "blur(8px)",
  animation: "orb-drift-4 20s ease-in-out infinite",
};

const CURSOR_ORB_STYLE: React.CSSProperties = {
  width: 220,
  height: 220,
  top: 0,
  left: 0,
  background: "radial-gradient(circle at 50% 50%, var(--secondary) 0%, transparent 55%)",
  opacity: 0.09,
  filter: "blur(8px)",
  transform: "translate(-9999px, -9999px)",
};

const NOISE_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "160px 160px",
  opacity: 0.025,
  mixBlendMode: "overlay" as const,
  animation: "grain-shift 8s steps(1) infinite",
};

/**
 * AmbientBackground
 *
 * Reemplaza los dos divs de blur estáticos por un fondo vivo con:
 * - 4 orbes con movimiento suave e independiente (CSS keyframes)
 * - Orbe adicional que sigue el cursor con lag suave (requestAnimationFrame)
 * - Noise grain overlay sutil para textura premium
 * - Totalmente basado en --secondary y variables del tema (light/dark safe)
 * - Zero dependencias extra, solo CSS + un pequeño hook de mouse
 *
 * Uso:
 *   Colócalo como primer hijo del layout o page wrapper, antes del contenido.
 *
 *   <AmbientBackground />
 *   <main>...</main>
 */
export function AmbientBackground() {
  const cursorOrbRef = useRef<HTMLDivElement>(null);
  const posRef       = useRef({ x: 0, y: 0 });
  const targetRef    = useRef({ x: 0, y: 0 });
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      posRef.current.x = lerp(posRef.current.x, targetRef.current.x, 0.06);
      posRef.current.y = lerp(posRef.current.y, targetRef.current.y, 0.06);

      if (cursorOrbRef.current) {
        // Centrar el orb de 220px bajo el cursor (mitad de 220 = 110)
        cursorOrbRef.current.style.transform =
          `translate(${posRef.current.x - 110}px, ${posRef.current.y - 110}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* ── Keyframe animations ─────────────────────────────────────────── */}
      <style>{DRIFT_KEYFRAMES}</style>

      {/* ── Wrapper fixed, full-screen, bajo el contenido ──────────────── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden print:hidden"
      >
        {/* Orbe 1 — top-right grande, el dominante */}
        <div
          className="absolute rounded-full"
          style={ORB1_STYLE}
        />

        {/* Orbe 2 — bottom-left mediano */}
        <div
          className="absolute rounded-full"
          style={ORB2_STYLE}
        />

        {/* Orbe 3 — centro-top pequeño, más nítido → da profundidad */}
        <div
          className="absolute rounded-full"
          style={ORB3_STYLE}
        />

        {/* Orbe 4 — bottom-right, offset para asimetría */}
        <div
          className="absolute rounded-full"
          style={ORB4_STYLE}
        />

        {/* Orbe cursor — sigue al mouse con lag suave */}
        <div
          ref={cursorOrbRef}
          className="absolute rounded-full will-change-transform"
          style={CURSOR_ORB_STYLE}
        />

        {/* Noise grain — textura sutil de papel/película */}
        <div
          className="absolute inset-0"
          style={NOISE_STYLE}
        />
      </div>
    </>
  );
}