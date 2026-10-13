import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, FONTS } from "./theme";
import { seeded } from "./three/textures";

export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

export const p01 = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

// Words slide up from a mask, one after the other.
export const RevealText: React.FC<{
  text: string;
  start: number;
  size: number;
  font?: string;
  color?: string;
  weight?: number | string;
  stagger?: number;
  italic?: boolean;
  letterSpacing?: number;
  style?: React.CSSProperties;
}> = ({ text, start, size, font = FONTS.sans, color = "#fff", weight = 800, stagger = 4, italic, letterSpacing = 0, style }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.05,
        letterSpacing,
        fontStyle: italic ? "italic" : "normal",
        display: "flex",
        flexWrap: "wrap",
        columnGap: size * 0.25,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = p01(frame, start + i * stagger, 18);
        return (
          <span key={i} style={{ overflow: "hidden", display: "inline-block", paddingBottom: size * 0.08 }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`, opacity: p > 0 ? 1 : 0 }}>
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Tag: React.FC<{ text: string; start: number; color?: string }> = ({ text, start, color = BRAND.lava }) => {
  const frame = useCurrentFrame();
  const p = p01(frame, start, 14);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: FONTS.sans,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: 4,
        color: "#fff",
        opacity: p,
        transform: `translateX(${(1 - p) * -30}px)`,
      }}
    >
      <div style={{ width: 46 * p, height: 3, background: color }} />
      {text}
    </div>
  );
};

export const Chip: React.FC<{ text: string; start: number; color?: string; dark?: boolean }> = ({
  text,
  start,
  color = BRAND.lava,
  dark,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 160 } });
  if (frame < start) return null;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 22px",
        borderRadius: 999,
        background: dark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.25)",
        backdropFilter: "blur(8px)",
        fontFamily: FONTS.sans,
        fontWeight: 600,
        fontSize: 24,
        color: "#fff",
        transform: `scale(${0.6 + 0.4 * s}) translateY(${(1 - s) * 20}px)`,
        opacity: Math.min(1, s * 1.5),
        transformOrigin: "left center",
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: 5, background: color, boxShadow: `0 0 12px ${color}` }} />
      {text}
    </div>
  );
};

// Soft floating light particles.
export const Bokeh: React.FC<{ color: string; count?: number; seed?: number; rise?: number; maxSize?: number }> = ({
  color,
  count = 26,
  seed = 1,
  rise = 1.2,
  maxSize = 60,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const r = seeded(seed);
  const items = new Array(count).fill(0).map(() => ({
    x: r() * width,
    y: r() * height,
    s: 6 + r() * maxSize,
    sp: 0.3 + r() * rise,
    o: 0.08 + r() * 0.3,
    ph: r() * 6,
  }));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {items.map((b, i) => {
        const y = (((b.y - frame * b.sp) % height) + height) % height;
        const x = b.x + Math.sin(frame * 0.02 + b.ph) * 20;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: b.s,
              height: b.s,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              opacity: b.o * (0.7 + 0.3 * Math.sin(frame * 0.05 + b.ph)),
              filter: b.s > 40 ? "blur(3px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Film grain + vignette: the small imperfections that make CG look filmed.
export const FilmLook: React.FC<{ vignette?: number }> = ({ vignette = 0.55 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id={`grain-${frame % 4}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 4} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame % 4})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Subtitle: React.FC<{ text: string; start: number; end: number }> = ({ text, start, end }) => {
  const frame = useCurrentFrame();
  const o = Math.min(p01(frame, start, 8), 1 - p01(frame, end - 8, 8));
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 46,
        display: "flex",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          padding: "10px 24px",
          borderRadius: 12,
          background: "rgba(0,0,0,0.55)",
          fontFamily: FONTS.sans,
          fontWeight: 600,
          fontSize: 28,
          color: "#fff",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Sector header used by each showcase scene.
export const SectorTitle: React.FC<{
  index: string;
  label: string;
  title: string;
  chips: string[];
  color: string;
  titleFont?: string;
  titleSize?: number;
  align?: "left" | "right";
  italic?: boolean;
}> = ({ index, label, title, chips, color, titleFont = FONTS.sans, titleSize = 92, align = "left", italic }) => (
  <div
    style={{
      position: "absolute",
      top: 230,
      [align]: 120,
      width: 760,
      display: "flex",
      flexDirection: "column",
      gap: 28,
      alignItems: "flex-start",
    }}
  >
    <Tag text={`${index} — ${label}`} start={6} color={color} />
    <RevealText text={title} start={12} size={titleSize} font={titleFont} weight={titleFont === FONTS.sans ? 800 : 700} italic={italic} />
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8 }}>
      {chips.map((c, i) => (
        <Chip key={c} text={c} start={40 + i * 10} color={color} />
      ))}
    </div>
  </div>
);
