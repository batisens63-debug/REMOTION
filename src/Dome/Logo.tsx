import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, FONTS } from "./theme";

// Chaîne des Puys skyline, Puy de Dôme as the tallest rounded dome.
const PUYS = [
  { x: 0.06, w: 0.14, h: 0.32, crater: true },
  { x: 0.18, w: 0.12, h: 0.42, crater: false },
  { x: 0.31, w: 0.17, h: 0.5, crater: true },
  { x: 0.5, w: 0.2, h: 1.0, crater: false },
  { x: 0.67, w: 0.16, h: 0.55, crater: true },
  { x: 0.8, w: 0.13, h: 0.4, crater: false },
  { x: 0.93, w: 0.15, h: 0.3, crater: true },
];

export const skylinePath = (width: number, base: number, height: number) => {
  let d = `M0 ${base}`;
  for (const p of PUYS) {
    const cx = p.x * width;
    const hw = (p.w * width) / 2;
    const top = base - p.h * height;
    if (p.crater) {
      d += ` L${cx - hw} ${base} C${cx - hw * 0.5} ${base} ${cx - hw * 0.45} ${top} ${cx - hw * 0.18} ${top}`;
      d += ` Q${cx} ${top + height * 0.04} ${cx + hw * 0.18} ${top}`;
      d += ` C${cx + hw * 0.45} ${top} ${cx + hw * 0.5} ${base} ${cx + hw} ${base}`;
    } else {
      d += ` L${cx - hw} ${base} C${cx - hw * 0.45} ${base} ${cx - hw * 0.5} ${top} ${cx} ${top}`;
      d += ` C${cx + hw * 0.5} ${top} ${cx + hw * 0.45} ${base} ${cx + hw} ${base}`;
    }
  }
  return d + ` L${width} ${base}`;
};

export const Skyline: React.FC<{ width: number; base: number; height: number; draw: number; fill?: number; glow?: string }> = ({
  width,
  base,
  height,
  draw,
  fill = 0,
  glow = BRAND.lava,
}) => {
  const d = skylinePath(width, base, height);
  return (
    <svg width={width} height={base + 20} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="sky-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1b1e27" />
          <stop offset="1" stopColor="#0a0b0f" />
        </linearGradient>
      </defs>
      <path d={`${d} L${width} ${base + 400} L0 ${base + 400} Z`} fill="url(#sky-fill)" opacity={fill} />
      <path
        d={d}
        fill="none"
        stroke={glow}
        strokeWidth={3}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - draw}
        style={{ filter: `drop-shadow(0 0 10px ${glow})` }}
      />
    </svg>
  );
};

// Brand mark: the dome of the Puy de Dôme with a play button carved inside.
export const LogoMark: React.FC<{ size: number; progress: number }> = ({ size, progress }) => {
  const draw = interpolate(progress, [0, 0.7], [0, 1], { extrapolateRight: "clamp" });
  const play = interpolate(progress, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 200 124">
      <defs>
        <linearGradient id="logo-lava" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={BRAND.ember} />
          <stop offset="1" stopColor={BRAND.lava} />
        </linearGradient>
      </defs>
      <path
        d="M8 118 C40 118 50 10 100 10 C150 10 160 118 192 118"
        fill="none"
        stroke="url(#logo-lava)"
        strokeWidth={12}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - draw}
      />
      <path
        d="M86 56 L86 98 L122 77 Z"
        fill="url(#logo-lava)"
        transform={`translate(104 77) scale(${play}) translate(-104 -77)`}
      />
    </svg>
  );
};

export const Wordmark: React.FC<{ start: number; size: number; color?: string }> = ({ start, size, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = "DÔME MOTION".split("");
  return (
    <div style={{ display: "flex", fontFamily: FONTS.display, fontSize: size, color, letterSpacing: size * 0.08 }}>
      {letters.map((l, i) => {
        const s = spring({ frame: frame - start - i * 2, fps, config: { damping: 14 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${(1 - s) * 40}px)`,
              opacity: Math.min(1, s * 1.5),
              color: i >= 5 ? BRAND.lava : color,
              width: l === " " ? size * 0.3 : undefined,
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
};
