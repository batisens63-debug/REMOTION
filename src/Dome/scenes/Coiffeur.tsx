import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../theme";
import { FilmLook, p01, SectorTitle } from "../ui";
import { BarberShop } from "./backdrops";
import { seeded } from "../three/textures";

const GOLD = "#d9a46c";

const Blade: React.FC<{ angle: number; flip?: boolean }> = ({ angle, flip }) => (
  <g transform={`rotate(${angle})`}>
    <path
      d={flip ? "M0 0 L330 10 Q340 0 330 -6 L0 -14 Z" : "M0 0 L330 -10 Q340 0 330 6 L0 14 Z"}
      fill="url(#gold-blade)"
      stroke="#8a6a2a"
      strokeWidth={1.5}
    />
    <ellipse
      cx={-110}
      cy={flip ? -42 : 42}
      rx={62}
      ry={40}
      fill="none"
      stroke="url(#gold-blade)"
      strokeWidth={16}
    />
    <path d={`M0 0 L-60 ${flip ? -22 : 22}`} stroke="url(#gold-blade)" strokeWidth={18} strokeLinecap="round" />
  </g>
);

export const Scissors: React.FC<{ open: number; size?: number }> = ({ open, size = 1 }) => (
  <svg width={620 * size} height={300 * size} viewBox="-220 -150 620 300" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="gold-blade" x1="0" x2="0" y1="-1" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.4" stopColor="#c3cad2" />
        <stop offset="0.7" stopColor="#7d8893" />
        <stop offset="1" stopColor="#3e464f" />
      </linearGradient>
    </defs>
    <Blade angle={-open} />
    <Blade angle={open} flip />
    <circle r={10} fill="#e9edf1" stroke="#3e464f" strokeWidth={2} />
  </svg>
);

// Price card, reused in the formats montage.
export const SalonCard: React.FC<{ frame: number; scale?: number }> = ({ frame, scale = 1 }) => {
  const pulse = 1 + 0.04 * Math.max(0, Math.sin(frame * 0.18));
  return (
    <div
      style={{
        width: 520 * scale,
        padding: `${34 * scale}px ${40 * scale}px`,
        border: `${2 * scale}px solid ${GOLD}`,
        background: "rgba(10,10,10,0.75)",
        color: "#f4ead5",
        textAlign: "center",
      }}
    >
      <div style={{ fontFamily: FONTS.serif, fontWeight: 700, fontSize: 56 * scale, letterSpacing: 6 * scale, color: GOLD }}>L'ATELIER</div>
      <div style={{ fontFamily: FONTS.sans, fontSize: 18 * scale, letterSpacing: 6 * scale, marginTop: 4 * scale }}>COIFFEUR · BARBIER</div>
      <div style={{ height: 1, background: GOLD, margin: `${20 * scale}px ${40 * scale}px`, opacity: 0.6 }} />
      <div style={{ fontFamily: FONTS.serif, fontStyle: "italic", fontSize: 34 * scale }}>
        Coupe + barbe <span style={{ color: GOLD, fontStyle: "normal", fontWeight: 700 }}>35 €</span>
      </div>
      <div
        style={{
          display: "inline-block",
          marginTop: 22 * scale,
          padding: `${12 * scale}px ${30 * scale}px`,
          background: GOLD,
          color: "#111",
          fontFamily: FONTS.sans,
          fontWeight: 800,
          fontSize: 22 * scale,
          letterSpacing: 2 * scale,
          transform: `scale(${pulse})`,
        }}
      >
        RÉSERVER EN LIGNE
      </div>
    </div>
  );
};

// Long steel cutting comb, as used by barbers.
const Comb: React.FC = () => (
  <svg width={720} height={120} viewBox="0 0 720 120" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="steel-comb" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#f4f6f8" />
        <stop offset="0.5" stopColor="#a7b0ba" />
        <stop offset="1" stopColor="#59636e" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={720} height={44} rx={8} fill="url(#steel-comb)" stroke="#3e464f" strokeWidth={1.5} />
    {new Array(70).fill(0).map((_, i) => (
      <rect key={i} x={10 + i * 10} y={40} width={5} height={i < 35 ? 60 : 44} fill="url(#steel-comb)" />
    ))}
    {new Array(12).fill(0).map((_, i) => (
      <circle key={i} cx={30 + i * 56} cy={22} r={3} fill="#3e464f" />
    ))}
  </svg>
);

const FallingHair: React.FC<{ frame: number }> = ({ frame }) => {
  const r = seeded(404);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {new Array(26).fill(0).map((_, i) => {
        const x0 = 1180 + r() * 420;
        const start = 30 + r() * 120;
        const t = Math.max(0, frame - start);
        const y = 330 + t * (2.2 + r() * 1.5);
        const rot = t * (2 + r() * 4);
        const len = 10 + r() * 22;
        return t > 0 && y < 1080 ? (
          <path
            key={i}
            d={`M0 0 q${len / 2} ${len / 4} ${len} 0`}
            stroke="#4a3426"
            strokeWidth={1.6}
            fill="none"
            transform={`translate(${x0 + Math.sin(t * 0.1 + i) * 14} ${y}) rotate(${rot})`}
          />
        ) : null;
      })}
    </svg>
  );
};

export const CoiffeurScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snip = Math.abs(Math.sin(frame * 0.16)) * 22 + 2;
  const travel = interpolate(frame, [0, 90], [-300, 0], { extrapolateRight: "clamp" });
  const card = spring({ frame: frame - 85, fps, config: { damping: 15 } });
  return (
    <AbsoluteFill>
      <BarberShop />
      <div style={{ position: "absolute", left: 1060, top: 200, transform: `rotate(-12deg) translateY(${Math.sin(frame * 0.05) * 6}px)`, opacity: p01(frame, 0, 15) }}>
        <Comb />
      </div>
      <FallingHair frame={frame} />
      {/* golden line being cut */}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        
      </svg>
      <div style={{ position: "absolute", left: 1150 + travel, top: 250, transform: "rotate(-12deg)" }}>
        <Scissors open={snip} size={0.8} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 160,
          top: 520,
          opacity: card,
          transform: `translateY(${(1 - card) * 60}px)`,
        }}
      >
        <SalonCard frame={frame} />
      </div>
      <SectorTitle
        index="05"
        label="COIFFEURS & BARBIERS"
        title="L'élégance qui remplit l'agenda."
        chips={["Tarifs animés", "Avant / après", "Réservation"]}
        color={GOLD}
        titleFont={FONTS.serif}
        titleSize={84}
      />
      <FilmLook vignette={0.6} />
    </AbsoluteFill>
  );
};
