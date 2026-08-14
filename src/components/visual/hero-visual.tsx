import { cn } from "@/lib/cn";

const STROKE = "#FFFFFF";
const ACCENT = "#FF5A1F";
const DIM = "rgba(255,255,255,0.55)";
const FAINT = "rgba(255,255,255,0.18)";

function Arrow({ x, y, up }: { x: number; y: number; up?: boolean }) {
  return (
    <path
      d={up ? `M ${x - 3} ${y - 4} L ${x} ${y} L ${x + 3} ${y - 4}` : `M ${x - 3} ${y + 4} L ${x} ${y} L ${x + 3} ${y + 4}`}
      fill="none"
      stroke={ACCENT}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export function HeroVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "technical-grid relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/70",
        className
      )}
      style={{ maskImage: "linear-gradient(to top, black 35%, transparent 100%)" }}
      role="img"
      aria-label="Schéma technique : conception et fabrication d'une pièce"
    >
      <svg viewBox="0 0 640 480" className="h-full w-full">
        {/* ---------- Orthographic view of a bracket ---------- */}
        <g stroke={STROKE} strokeWidth="1.6" fill="none">
          <rect x="150" y="340" width="240" height="34" rx="6" fill="rgba(255,255,255,0.02)" />
          <rect x="228" y="132" width="84" height="208" fill="rgba(255,255,255,0.02)" />
          <rect x="205" y="108" width="130" height="24" rx="4" fill="rgba(255,255,255,0.02)" />
          <circle cx="270" cy="245" r="42" strokeWidth="1.4" />
          <circle cx="270" cy="245" r="36" stroke={FAINT} strokeDasharray="2 5" />
          <circle cx="270" cy="120" r="9" />
          <circle cx="178" cy="357" r="7" />
          <circle cx="362" cy="357" r="7" />
        </g>

        {/* centerlines */}
        <g stroke={DIM} strokeWidth="1" strokeDasharray="10 4 1 4" fill="none">
          <path d="M270 95 V 385" />
          <path d="M185 245 H 355" />
        </g>

        {/* dimension — overall height */}
        <g stroke={ACCENT} strokeWidth="1.2" fill="none">
          <path d="M118 118 V 372" strokeWidth="1" opacity="0.7" />
          <path d="M104 118 H 150" />
          <path d="M104 372 H 150" />
          <path d="M105 126 V 366" strokeWidth="1.4" />
          <Arrow x={105} y={132} up />
          <Arrow x={105} y={360} />
        </g>
        <text
          x="88"
          y="251"
          textAnchor="middle"
          fill={ACCENT}
          fontSize="13"
          fontFamily="var(--font-display), monospace"
          fontWeight="600"
        >
          266
        </text>

        {/* dimension — base width */}
        <g stroke={ACCENT} strokeWidth="1.2" fill="none">
          <path d="M150 388 V 402 M390 388 V 402" strokeWidth="1" opacity="0.7" />
          <path d="M152 410 H 388" />
          <Arrow x={160} y={410} />
          <Arrow x={380} y={410} up />
        </g>
        <text
          x="270"
          y="406"
          textAnchor="middle"
          fill={ACCENT}
          fontSize="13"
          fontFamily="var(--font-display), monospace"
          fontWeight="600"
        >
          240
        </text>

        {/* bore callout */}
        <g stroke={DIM} strokeWidth="1.1" fill="none">
          <path d="M312 203 L 430 150 H 468" strokeDasharray="3 3" />
        </g>
        <text
          x="466"
          y="144"
          textAnchor="start"
          fill={DIM}
          fontSize="13"
          fontFamily="var(--font-display), monospace"
          fontWeight="600"
        >
          Ø80 H7
        </text>

        <text x="210" y="330" fontSize="11" fill={DIM} fontFamily="var(--font-sans), sans-serif">
          R8 ×2
        </text>

        {/* hatch + section marks */}
        <g stroke={DIM} strokeWidth="0.8">
          <path d="M428 74 V 96 M440 74 V 96 M452 74 V 96" />
          <path d="M422 96 H 464" />
          <path d="M434 58 V 70 M446 58 V 70" />
        </g>

        {/* ---------- Isometric stacked-layers part ---------- */}
        {(() => {
          const plates = 5;
          const cx = 505;
          const yTop0 = 312; // top surface of the bottom plate
          const h = 21;
          const aBase = 62;
          const taper = 0.09;
          const out = [];
          for (let i = plates - 1; i >= 0; i--) {
            const yTop = yTop0 - i * h;
            const a = aBase * (1 - taper * i);
            const yFront = yTop + a * 0.52;
            const yBot = yTop + h;
            out.push(
              <g key={i}>
                <path
                  d={`M ${cx - a} ${yTop} L ${cx} ${yFront} L ${cx + a} ${yTop} L ${cx} ${yTop - a * 0.52} Z`}
                  fill="rgba(255,255,255,0.05)"
                  stroke={ACCENT}
                  strokeWidth="1.2"
                  strokeOpacity="0.65"
                />
                <path
                  d={`M ${cx - a} ${yTop} L ${cx} ${yFront} L ${cx} ${yFront - h} L ${cx - a} ${yBot} Z`}
                  fill="rgba(0,0,0,0.25)"
                  stroke={STROKE}
                  strokeWidth="1.1"
                  strokeOpacity="0.5"
                />
                <path
                  d={`M ${cx + a} ${yTop} L ${cx} ${yFront} L ${cx} ${yFront - h} L ${cx + a} ${yBot} Z`}
                  fill="rgba(0,0,0,0.12)"
                  stroke={STROKE}
                  strokeWidth="1.1"
                  strokeOpacity="0.5"
                />
              </g>
            );
          }
          return out;
        })()}

        {/* height callout on the stack */}
        <g stroke={ACCENT} strokeWidth="1.1" fill="none" strokeDasharray="2 3" opacity="0.8">
          <path d="M452 300 V 225.5" />
          <path d="M448 300 H 505 M448 225.5 H 505" strokeDasharray="none" strokeOpacity="0.5" />
          <Arrow x={452} y={232} up />
          <Arrow x={452} y={294} />
        </g>
        <text x="428" y="264" textAnchor="end" fill={ACCENT} fontSize="12" fontFamily="var(--font-display), monospace" fontWeight="600">
          ×5
        </text>

        <g fill={DIM} fontSize="10" fontFamily="var(--font-sans), sans-serif" opacity="0.8">
          <text x="505" y="366" textAnchor="middle" letterSpacing="2">
            ISOMÉTRIQUE
          </text>
          <text x="505" y="380" textAnchor="middle" letterSpacing="2" fill={FAINT}>
            FDM · POLYCARBONATE
          </text>
        </g>
      </svg>
    </div>
  );
}