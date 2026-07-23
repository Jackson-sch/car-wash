import React from "react";

export function CarDiagramSVG() {
  return (
    <svg
      viewBox="0 0 640 320"
      className="w-full h-full select-none pointer-events-none drop-shadow-[0_0_20px_rgba(56,189,248,0.25)]"
      style={{ minHeight: "220px" }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="30%" stopColor="#1e293b" />
          <stop offset="70%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
          <stop offset="50%" stopColor="rgba(14, 165, 233, 0.2)" />
          <stop offset="100%" stopColor="rgba(2, 132, 199, 0.3)" />
        </linearGradient>

        <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="taillightGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Blueprint Grid Lines */}
      <g stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" strokeDasharray="6 6">
        <line x1="80" y1="30" x2="80" y2="290" />
        <line x1="180" y1="30" x2="180" y2="290" />
        <line x1="320" y1="30" x2="320" y2="290" />
        <line x1="460" y1="30" x2="460" y2="290" />
        <line x1="560" y1="30" x2="560" y2="290" />
        <line x1="40" y1="160" x2="600" y2="160" />
      </g>

      {/* Outer Car Outline Body */}
      {/* Hood -> Cabin -> Trunk Outline */}
      <path
        d="M 90,160 C 90,85 130,55 210,55 L 430,55 C 510,55 550,85 550,160 C 550,235 510,265 430,265 L 210,265 C 130,265 90,235 90,160 Z"
        fill="url(#carBodyGrad)"
        stroke="#38bdf8"
        strokeWidth="2.5"
      />

      {/* Front Bumper & Hood Section (Capó / Frente) */}
      <path
        d="M 90,160 C 92,110 120,68 180,62 L 180,258 C 120,252 92,210 90,160 Z"
        fill="rgba(56, 189, 248, 0.08)"
        stroke="#0284c7"
        strokeWidth="1.5"
      />

      {/* Front Grille Pattern */}
      <path d="M 92,130 Q 100,160 92,190" fill="none" stroke="#38bdf8" strokeWidth="2" />
      <line x1="90" y1="145" x2="105" y2="145" stroke="#0284c7" strokeWidth="1.5" />
      <line x1="90" y1="160" x2="108" y2="160" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="90" y1="175" x2="105" y2="175" stroke="#0284c7" strokeWidth="1.5" />

      {/* Hood Accent Lines */}
      <path d="M 95,110 Q 140,115 180,112" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
      <path d="M 95,210 Q 140,205 180,208" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />

      {/* Front Windshield */}
      <path
        d="M 200,75 C 235,75 255,88 262,160 C 255,232 235,245 200,245 C 185,215 185,105 200,75 Z"
        fill="url(#glassGradient)"
        stroke="#38bdf8"
        strokeWidth="2"
      />

      {/* Cabin Roof Frame */}
      <rect
        x="262"
        y="72"
        width="135"
        height="176"
        rx="16"
        fill="#0f172a"
        stroke="#0284c7"
        strokeWidth="2"
      />

      {/* Sunroof / Glass Roof */}
      <rect
        x="285"
        y="92"
        width="90"
        height="136"
        rx="10"
        fill="url(#glassGradient)"
        stroke="#38bdf8"
        strokeWidth="1.5"
      />
      <line x1="330" y1="92" x2="330" y2="228" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Rear Windshield */}
      <path
        d="M 440,75 C 405,75 385,88 378,160 C 385,232 405,245 440,245 C 455,215 455,105 440,75 Z"
        fill="url(#glassGradient)"
        stroke="#38bdf8"
        strokeWidth="2"
      />

      {/* Rear Trunk Section (Maletera) */}
      <path
        d="M 550,160 C 548,110 520,68 460,62 L 460,258 C 520,252 548,210 550,160 Z"
        fill="rgba(56, 189, 248, 0.08)"
        stroke="#0284c7"
        strokeWidth="1.5"
      />

      {/* Trunk Lid Contour */}
      <path d="M 475,95 Q 515,105 535,160 Q 515,215 475,225" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />

      {/* LED Headlights (Frente) */}
      <path d="M 94,75 C 110,75 125,85 120,105 C 105,100 96,90 94,75 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <path d="M 94,245 C 110,245 125,235 120,215 C 105,220 96,230 94,245 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />

      {/* LED Taillights (Posterior) */}
      <path d="M 546,75 C 530,75 515,85 520,105 C 535,100 544,90 546,75 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
      <path d="M 546,245 C 530,245 515,235 520,215 C 535,220 544,230 546,245 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
      {/* Rear Lightbar */}
      <path d="M 532,105 C 542,130 542,190 532,215" fill="none" stroke="#ef4444" strokeWidth="2.5" />

      {/* Side Mirrors */}
      <path d="M 195,54 L 205,32 Q 220,32 215,54 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
      <path d="M 195,266 L 205,288 Q 220,288 215,266 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />

      {/* Tires & Alloy Wheels */}
      {/* Front Left Tire */}
      <rect x="135" y="32" width="65" height="20" rx="5" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="145" y="36" width="45" height="12" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
      {/* Front Right Tire */}
      <rect x="135" y="268" width="65" height="20" rx="5" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="145" y="272" width="45" height="12" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
      {/* Rear Left Tire */}
      <rect x="440" y="32" width="65" height="20" rx="5" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="450" y="36" width="45" height="12" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
      {/* Rear Right Tire */}
      <rect x="440" y="268" width="65" height="20" rx="5" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x="450" y="272" width="45" height="12" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1" />

      {/* Blueprint Zone Labels with Cyan Badges */}
      <g fontFamily="monospace" fontWeight="900" fontSize="11" textAnchor="middle">
        {/* Capó / Frente */}
        <rect x="108" y="146" width="64" height="26" rx="6" fill="#0369a1" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="1" />
        <text x="140" y="163" fill="#ffffff">CAPÓ</text>

        {/* Techo / Cabina */}
        <rect x="298" y="146" width="64" height="26" rx="6" fill="#0f172a" fillOpacity="0.9" stroke="#38bdf8" strokeWidth="1" />
        <text x="330" y="163" fill="#38bdf8">TECHO</text>

        {/* Maletera */}
        <rect x="468" y="146" width="76" height="26" rx="6" fill="#0369a1" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="1" />
        <text x="506" y="163" fill="#ffffff">MALETERA</text>

        {/* Side Labels */}
        <rect x="235" y="6" width="170" height="22" rx="5" fill="#090d16" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
        <text x="320" y="21" fill="#38bdf8" fontSize="10">LATERAL IZQUIERDO (PILOTO)</text>

        <rect x="235" y="292" width="170" height="22" rx="5" fill="#090d16" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
        <text x="320" y="307" fill="#38bdf8" fontSize="10">LATERAL DERECHO (COPILOTO)</text>
      </g>
    </svg>
  );
}
