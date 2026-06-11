"use client";

import { useEffect, useRef } from "react";

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
        cursorOrbRef.current.style.transform =
          `translate(${posRef.current.x - 300}px, ${posRef.current.y - 300}px)`;
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
      <style>{`
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
      `}</style>

      {/* ── Wrapper fixed, full-screen, bajo el contenido ──────────────── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      >
        {/* Orbe 1 — top-right grande, el dominante */}
        <div
          className="absolute rounded-full"
          style={{
            width:  700,
            height: 700,
            top:    "-18%",
            right:  "-12%",
            background:
              "radial-gradient(circle at 40% 40%, var(--secondary) 0%, transparent 70%)",
            opacity: 0.09,
            filter:  "blur(90px)",
            animation: "orb-drift-1 18s ease-in-out infinite",
          }}
        />

        {/* Orbe 2 — bottom-left mediano */}
        <div
          className="absolute rounded-full"
          style={{
            width:  560,
            height: 560,
            bottom: "-12%",
            left:   "5%",
            background:
              "radial-gradient(circle at 60% 60%, var(--secondary) 0%, transparent 70%)",
            opacity: 0.08,
            filter:  "blur(80px)",
            animation: "orb-drift-2 22s ease-in-out infinite",
          }}
        />

        {/* Orbe 3 — centro-top pequeño, más nítido → da profundidad */}
        <div
          className="absolute rounded-full"
          style={{
            width:  320,
            height: 320,
            top:    "20%",
            left:   "35%",
            background:
              "radial-gradient(circle at 50% 50%, var(--secondary) 0%, transparent 65%)",
            opacity: 0.065,
            filter:  "blur(60px)",
            animation: "orb-drift-3 26s ease-in-out infinite",
          }}
        />

        {/* Orbe 4 — bottom-right, offset para asimetría */}
        <div
          className="absolute rounded-full"
          style={{
            width:  400,
            height: 400,
            bottom: "10%",
            right:  "8%",
            background:
              "radial-gradient(circle at 45% 55%, var(--chart-1) 0%, transparent 70%)",
            opacity: 0.04,
            filter:  "blur(70px)",
            animation: "orb-drift-4 20s ease-in-out infinite",
          }}
        />

        {/* Orbe cursor — sigue al mouse con lag suave */}
        <div
          ref={cursorOrbRef}
          className="absolute rounded-full will-change-transform"
          style={{
            width:      600,
            height:     600,
            top:        0,
            left:       0,
            background:
              "radial-gradient(circle at 50% 50%, var(--secondary) 0%, transparent 65%)",
            opacity: 0.07,
            filter:  "blur(80px)",
            // El translate real se aplica vía JS en el RAF
            transform:  "translate(-9999px, -9999px)",
          }}
        />

        {/* Noise grain — textura sutil de papel/película */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize:   "160px 160px",
            opacity:          0.025,
            mixBlendMode:     "overlay",
            animation:        "grain-shift 8s steps(1) infinite",
          }}
        />
      </div>
    </>
  );
}