import type { ProjectVisualKey } from "@/data/projects";
import { cn } from "@/lib/cn";

const STROKE = "rgba(255,255,255,0.92)";
const DIM = "rgba(255,255,255,0.55)";
const FAINT = "rgba(255,255,255,0.16)";
const ACCENT = "#FF5A1F";

function Poster({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900",
        className
      )}
    >
      <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label={label}>
        {/* faint drafting grid */}
        <g stroke={FAINT} strokeWidth="1">
          <path d="M40 60 H360 M40 120 H360 M40 180 H360 M40 240 H360" />
          <path d="M40 50 V 260 M110 50 V 260 M180 50 V 260 M250 50 V 260 M320 50 V 260" />
        </g>
        {/* corner registration marks */}
        <g stroke={DIM} strokeWidth="1.4">
          <path d="M28 84 V28 H84" />
          <path d="M316 28 H372 V84" />
          <path d="M372 216 V272 H316" />
          <path d="M84 272 H28 V216" />
        </g>
        {children}
      </svg>
    </div>
  );
}

function PrinterArt() {
  return (
    <g fill="none">
      {/* frame */}
      <path d="M84 232 V64 M316 232 V64 M72 232 H328" stroke={STROKE} strokeWidth="2" />
      <path d="M84 60 H316" stroke={STROKE} strokeWidth="3" />
      {/* print head */}
      <rect x="176" y="96" width="48" height="30" stroke={STROKE} strokeWidth="2" />
      <path d="M200 126 L 194 140 H 206 Z" stroke={ACCENT} strokeWidth="2" />
      {/* printed stack */}
      <path d="M132 226 H268 M126 214 H274 M120 202 H280" stroke={STROKE} strokeWidth="3" />
      <path d="M168 232 V172 L 232 184 V 232 Z" stroke={DIM} strokeWidth="1.5" />
      {/* active layer accent */}
      <path d="M176 160 H224" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" />
      <path d="M200 150 V 158" stroke={ACCENT} strokeWidth="2" />
    </g>
  );
}

function CadArt() {
  return (
    <g fill="none">
      {/* wireframe cube */}
      <path d="M130 100 H280 V230 H130 Z" stroke={STROKE} strokeWidth="2" />
      <path d="M156 78 H306 V208 H156 Z" stroke={DIM} strokeWidth="1.5" />
      <path d="M130 100 L156 78 M280 100 L306 78 M130 230 L156 208 M280 230 L306 208" stroke={DIM} strokeWidth="1.5" />
      {/* highlighted edge */}
      <path d="M280 100 H306" stroke={ACCENT} strokeWidth="2.4" />
      {/* dimension arrows */}
      <path d="M312 78 H340 M312 78 V66 M340 78 V90" stroke={ACCENT} strokeWidth="1.4" />
      <path d="M310 74 H338" stroke={ACCENT} strokeWidth="1.4" />
      {/* cursor crosshair */}
      <path d="M92 96 H70 M81 86 V108" stroke={DIM} strokeWidth="1.6" />
      <path d="M250 265 V 285 M240 275 H 260" stroke={ACCENT} strokeWidth="1.6" />
    </g>
  );
}

function ProtoArt() {
  return (
    <g fill="none">
      {/* part being measured */}
      <path d="M120 205 a60 60 0 0 1 120 0 Z" stroke={STROKE} strokeWidth="2" />
      <path d="M180 205 V 145 M180 162 H120" stroke={DIM} strokeWidth="1.3" strokeDasharray="3 3" />
      {/* caliper jaws */}
      <path d="M118 210 V 236 M122 236 H 242 M238 210 V 236" stroke={STROKE} strokeWidth="2" />
      <path d="M240 154 H 300 V 236 H 258" stroke={STROKE} strokeWidth="2" />
      <path d="M298 200 H 268" stroke={ACCENT} strokeWidth="2.4" />
      <path d="M252 214 h 8 M252 224 h 8 M252 234 h 8" stroke={DIM} strokeWidth="1.4" />
    </g>
  );
}

function GearArt() {
  return (
    <g fill="none">
      {/* big gear */}
      <circle cx="165" cy="150" r="72" stroke={STROKE} strokeWidth="5" strokeDasharray="10 6" />
      <circle cx="165" cy="150" r="58" stroke={STROKE} strokeWidth="1.6" />
      <circle cx="165" cy="150" r="17" stroke={DIM} strokeWidth="1.4" />
      <path d="M165 150 V 92 M165 150 H 223" stroke={DIM} strokeWidth="1" strokeDasharray="6 3" />
      {/* small gear */}
      <circle cx="292" cy="186" r="34" stroke={STROKE} strokeWidth="4" strokeDasharray="9 6" />
      <circle cx="292" cy="186" r="26" stroke={STROKE} strokeWidth="1.4" />
      <circle cx="292" cy="186" r="8" stroke={DIM} strokeWidth="1.2" />
      {/* highlighted tooth */}
      <path d="M165 78 A72 72 0 0 1 172 78.6 L 172 66 H 158 Z" fill={ACCENT} stroke="none" />
      <path d="M96 92 l -8 6 M94 96 l 6 -8" stroke={ACCENT} strokeWidth="1.6" />
    </g>
  );
}

function ToolArt() {
  return (
    <g fill="none">
      {/* jig block */}
      <path d="M96 150 H300 V242 H96 Z" stroke={STROKE} strokeWidth="2" />
      <circle cx="198" cy="196" r="30" stroke={STROKE} strokeWidth="1.6" />
      <circle cx="198" cy="196" r="13" stroke={ACCENT} strokeWidth="2.2" />
      {/* drill bush above */}
      <path d="M198 124 V 158" stroke={STROKE} strokeWidth="2" />
      <path d="M186 128 H210 M186 136 H210" stroke={DIM} strokeWidth="1.4" />
      {/* wrench */}
      <path d="M258 210 H320 M284 210 V 178 A16 16 0 0 1 300 178 V 210" stroke={STROKE} strokeWidth="2" />
      {/* screw holes */}
      <circle cx="124" cy="178" r="6" stroke={DIM} strokeWidth="1.4" />
      <circle cx="272" cy="178" r="6" stroke={DIM} strokeWidth="1.4" />
    </g>
  );
}

function MoldArt() {
  return (
    <g fill="none">
      {/* mold halves */}
      <path d="M120 90 H280 V210 H120 Z" stroke={STROKE} strokeWidth="2" />
      <path d="M120 220 H280 V254 H120 Z" stroke={STROKE} strokeWidth="2" strokeOpacity="0.55" />
      {/* parting line */}
      <path d="M120 216 H280" stroke={ACCENT} strokeWidth="2.4" />
      {/* cavity / part */}
      <path d="M180 120 H220 V 180 H180 Z" stroke={STROKE} strokeWidth="1.8" strokeOpacity="0.85" />
      {/* runner + sprue */}
      <path d="M200 190 V 210" stroke={ACCENT} strokeWidth="2" />
      <circle cx="200" cy="132" r="4" stroke={ACCENT} strokeWidth="1.4" />
      {/* ejector pins */}
      <path d="M156 216 V 240 M244 216 V 240" stroke={DIM} strokeWidth="1.6" strokeDasharray="2 3" />
      {/* guide pins */}
      <path d="M120 90 V 60 H 140 M280 90 V 60 H 260" stroke={STROKE} strokeWidth="1.6" />
    </g>
  );
}

function CncArt() {
  return (
    <g fill="none">
      {/* milled part (plate with pocket) */}
      <path d="M90 170 H310 V 256 H90 Z" stroke={STROKE} strokeWidth="2" />
      <path d="M150 186 H250 V 240 H150 Z" stroke={STROKE} strokeWidth="1.6" strokeOpacity="0.6" />
      <circle cx="200" cy="213" r="12" stroke={ACCENT} strokeWidth="2" />
      <circle cx="128" cy="222" r="6" stroke={DIM} strokeWidth="1.3" />
      <circle cx="272" cy="222" r="6" stroke={DIM} strokeWidth="1.3" />
      {/* spindle */}
      <path d="M200 60 H196 V 86 H204 Z" stroke={STROKE} strokeWidth="2" />
      <path d="M200 86 V 128" stroke={DIM} strokeWidth="4" strokeLinecap="round" />
      <path d="M200 128 V 140" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
      {/* chips */}
      <path d="M212 148 h 6 M216 156 h 7 M210 162 h 5" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" />
      {/* dimension */}
      <path d="M90 150 V 164 M110 164 H 170" stroke={DIM} strokeWidth="1.3" />
    </g>
  );
}

const ART: Record<ProjectVisualKey, React.ComponentType> = {
  printer: PrinterArt,
  cad: CadArt,
  proto: ProtoArt,
  gear: GearArt,
  tool: ToolArt,
  mold: MoldArt,
  cnc: CncArt,
};

export function ProjectVisual({
  visual,
  className,
  label,
  imageSrc,
}: {
  visual: ProjectVisualKey;
  className?: string;
  label?: string;
  imageSrc?: string | null;
}) {
  const Art = ART[visual] ?? PrinterArt;
  if (imageSrc) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-white/10 bg-ink-800",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={label ?? ""}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <Poster className={className} label={label}>
      <Art />
    </Poster>
  );
}