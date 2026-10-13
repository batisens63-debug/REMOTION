import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ease, P3, Particles, prog, project, window01 } from "./iso";
import { House } from "./House";
import {
  COLORS as K,
  DURATION,
  explodeAt,
  lift,
  NET,
  roofTopZ,
  T,
} from "./scene";

export const buildingAdSchema = z.object({
  companyName: z.string(),
  tagline: z.string(),
  website: z.string(),
  accentColor: zColor(),
});

const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";
const W = 1920;
const H = 1080;

// ---------- Camera ----------

type Key = { f: number; at: P3 | [number, number]; zoom: number };

const OVERALL: [number, number] = [130, 120];
const FINAL: [number, number] = [470, 50];

const KEYS: Key[] = [
  { f: 0, at: OVERALL, zoom: 0.82 },
  { f: T.foundations - 5, at: OVERALL, zoom: 0.95 },
  { f: T.foundations + 20, at: [4, 8, -0.8], zoom: 1.7 },
  { f: T.networks - 10, at: [4, 8, -0.8], zoom: 1.7 },
  { f: T.networks + 25, at: [10, 3.5, -0.3], zoom: 1.45 },
  { f: T.structure - 10, at: [10, 3.5, -0.3], zoom: 1.45 },
  { f: T.structure + 25, at: OVERALL, zoom: 1.0 },
  { f: T.heating + 20, at: OVERALL, zoom: 1.0 },
  { f: T.heating + 55, at: [5.5, 3.5, 1.6], zoom: 1.25 },
  { f: T.ventilation - 10, at: [5.5, 3.5, 1.6], zoom: 1.25 },
  { f: T.ventilation + 25, at: [3.5, 3.0, 3.6], zoom: 1.15 },
  { f: T.energy - 10, at: [3.5, 3.0, 3.6], zoom: 1.15 },
  { f: T.energy + 25, at: [6, 2, 7.5], zoom: 1.2 },
  { f: T.final - 10, at: [6, 2, 7.5], zoom: 1.2 },
  { f: T.final + 30, at: FINAL, zoom: 0.88 },
  { f: DURATION, at: FINAL, zoom: 0.9 },
];

const keyPos = (k: Key): [number, number] =>
  k.at.length === 2 ? (k.at as [number, number]) : project(k.at as P3);

const useCamera = (frame: number) => {
  const fs = KEYS.map((k) => k.f);
  const opts = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
    easing: ease,
  };
  const cx = interpolate(frame, fs, KEYS.map((k) => keyPos(k)[0]), opts);
  const cy = interpolate(frame, fs, KEYS.map((k) => keyPos(k)[1]), opts);
  const zoom = interpolate(frame, fs, KEYS.map((k) => k.zoom), opts);
  const toScreen = (p: P3): [number, number] => {
    const [sx, sy] = project(p);
    return [(sx - cx) * zoom + W / 2, (sy - cy) * zoom + H / 2];
  };
  return { cx, cy, zoom, toScreen };
};

// ---------- Labels ----------

type LabelDef = {
  text: string;
  at: P3;
  dx: number;
  dy: number;
  color: string;
  start: number;
  end: number;
};

const LABELS: LabelDef[] = [
  // Foundations
  { text: "Semelles filantes en béton armé", at: [2.5, 8, -1.1], dx: -60, dy: 120, color: "#7d8791", start: T.foundations + 50, end: T.networks - 5 },
  { text: "Hérisson drainant", at: [5.5, 8, -0.33], dx: 40, dy: 170, color: K.gravel, start: T.foundations + 62, end: T.networks - 5 },
  { text: "Isolant sous dalle", at: [8.5, 8, -0.1], dx: 150, dy: 100, color: "#d9a92a", start: T.foundations + 74, end: T.networks - 5 },
  // Networks
  { text: "Eau potable", at: [14.2, 1.8, -0.9], dx: 170, dy: -170, color: K.water, start: T.networks + 60, end: T.structure - 5 },
  { text: "Électricité (Enedis)", at: [14.2, 3.0, -0.7], dx: 210, dy: -80, color: "#d39e00", start: T.networks + 75, end: T.structure - 5 },
  { text: "Fibre optique", at: [14.2, 3.7, -0.55], dx: 230, dy: 10, color: K.fiber, start: T.networks + 90, end: T.structure - 5 },
  { text: "Eaux usées → tout-à-l'égout", at: [14.2, 6.2, -1.45], dx: 150, dy: 110, color: K.sewer, start: T.networks + 105, end: T.structure - 5 },
  // Structure
  { text: "Murs maçonnés + isolation", at: [0.17, 8, 1.6], dx: -170, dy: 40, color: K.brick, start: T.structure + 60, end: T.heating - 5 },
  { text: "Dalle béton sur isolant", at: [8, 8, 0.15], dx: 110, dy: 120, color: "#8f969f", start: T.structure + 75, end: T.heating - 5 },
  { text: "Plancher intermédiaire", at: [10, 2.2, 3.15], dx: 160, dy: -20, color: "#8f969f", start: T.structure + 90, end: T.heating - 5 },
  { text: "Toiture isolée", at: [10.3, 2.5, 6.8], dx: 150, dy: -60, color: "#59636e", start: T.structure + 120, end: T.heating - 5 },
  // Heating
  { text: "Pompe à chaleur air / eau", at: [11.45, 0.9, 1.1], dx: 140, dy: -110, color: K.hot, start: T.heating + 70, end: T.ventilation - 5 },
  { text: "Module hydraulique", at: [1.1, 1.0, 1.0], dx: -230, dy: -40, color: K.hot, start: T.heating + 85, end: T.ventilation - 5 },
  { text: "Ballon d'eau chaude", at: [0.95, 2.1, 1.6], dx: -200, dy: 50, color: K.water, start: T.heating + 95, end: T.ventilation - 5 },
  { text: "Plancher chauffant basse température", at: [8.0, 6.8, 0.33], dx: 120, dy: 120, color: K.hot, start: T.heating + 120, end: T.ventilation - 5 },
  { text: "Radiateur à l'étage", at: [0.45, 2.7, 4.2], dx: -170, dy: -40, color: K.hot, start: T.heating + 130, end: T.ventilation - 5 },
  // Ventilation
  { text: "VMC double flux (récupération de chaleur)", at: [0.8, 3.5, 2.3], dx: -150, dy: 120, color: "#6c7c8c", start: T.ventilation + 70, end: T.energy - 5 },
  { text: "Air neuf insufflé", at: [8.5, 4.8, 2.85], dx: 170, dy: 60, color: K.airIn, start: T.ventilation + 85, end: T.energy - 5 },
  { text: "Air vicié extrait", at: [6.0, 2.1, 2.9], dx: 170, dy: -120, color: K.airOut, start: T.ventilation + 100, end: T.energy - 5 },
  { text: "Rejet en toiture", at: [0.6, 3.5, 6.6], dx: -170, dy: -50, color: "#6c7c8c", start: T.ventilation + 115, end: T.energy - 5 },
  // Energy
  { text: "Panneaux photovoltaïques", at: [9, 2.5, roofTopZ(2.5)], dx: 170, dy: -70, color: K.solar, start: T.energy + 60, end: T.final - 5 },
  { text: "Tableau électrique", at: [0.5, 4.75, 1.8], dx: -190, dy: -60, color: "#d39e00", start: T.energy + 90, end: T.final - 5 },
];

const Label: React.FC<{ def: LabelDef; anchor: [number, number]; frame: number }> = ({
  def,
  anchor,
  frame,
}) => {
  const vis = window01(frame, def.start, def.end, 10);
  if (vis <= 0) return null;
  const line = prog(frame, def.start, 12);
  const box = prog(frame, def.start + 8, 12) * vis;
  const [ax, ay] = anchor;
  const [tx, ty] = [ax + def.dx * line, ay + def.dy * line];
  const w = def.text.length * 11.2 + 50;
  const right = def.dx >= 0;
  const bx = right ? tx : tx - w;
  return (
    <g opacity={vis} fontFamily={FONT}>
      <circle cx={ax} cy={ay} r={10} fill={def.color} opacity={0.25} />
      <circle cx={ax} cy={ay} r={5} fill="#fff" stroke={def.color} strokeWidth={3} />
      <line x1={ax} y1={ay} x2={tx} y2={ty} stroke={K.ink} strokeWidth={2} opacity={0.7} />
      <g opacity={box} transform={`translate(${bx} ${ty - 22})`}>
        <rect width={w} height={44} rx={22} fill="#ffffff" stroke="#e1e7ee" filter="url(#shadow)" />
        <circle cx={22} cy={22} r={7} fill={def.color} />
        <text x={38} y={29} fontSize={20} fontWeight={600} fill={K.ink}>
          {def.text}
        </text>
      </g>
    </g>
  );
};

// ---------- Scene title cards ----------

const CARDS = [
  { from: T.foundations, to: T.networks, title: "Fondations", sub: "Semelles en béton armé, hérisson drainant et isolant sous dalle : la base de tout." },
  { from: T.networks, to: T.structure, title: "Réseaux enterrés", sub: "Eau, électricité, fibre et assainissement raccordés depuis la voirie." },
  { from: T.structure, to: T.heating, title: "Structure & enveloppe", sub: "Dalle, murs isolés, plancher et toiture : une enveloppe performante." },
  { from: T.heating, to: T.ventilation, title: "Chauffage", sub: "Pompe à chaleur air/eau, plancher chauffant et eau chaude sanitaire." },
  { from: T.ventilation, to: T.energy, title: "Ventilation", sub: "VMC double flux : l'air neuf est préchauffé par l'air extrait." },
  { from: T.energy, to: T.final, title: "Énergie solaire", sub: "Les panneaux photovoltaïques alimentent la maison en direct." },
];

const TitleCard: React.FC<{ frame: number; accent: string }> = ({ frame, accent }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {CARDS.map((c, i) => {
        const vis = window01(frame, c.from + 10, c.to, 12);
        if (vis <= 0) return null;
        const s = spring({ frame: frame - c.from - 10, fps, config: { damping: 16 } });
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: 70,
              bottom: 70,
              width: 560,
              padding: "30px 34px",
              background: "rgba(255,255,255,0.94)",
              borderRadius: 28,
              boxShadow: "0 20px 50px rgba(29,43,58,0.16)",
              fontFamily: FONT,
              color: K.ink,
              opacity: vis,
              transform: `translateX(${(1 - s) * -80}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: accent,
                  color: "#fff",
                  fontSize: 26,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -0.5, whiteSpace: "nowrap" }}>{c.title}</div>
            </div>
            <div style={{ fontSize: 22, lineHeight: 1.4, marginTop: 14, color: "#4a5a6b" }}>{c.sub}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              {CARDS.map((_, k) => (
                <div
                  key={k}
                  style={{
                    height: 6,
                    flex: 1,
                    borderRadius: 3,
                    background: k <= i ? accent : "#dde4ea",
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------- Brand mark (isometric cube) ----------

const CubeLogo: React.FC<{ size: number; accent: string }> = ({ size, accent }) => {
  const c = Math.cos(Math.PI / 6) * size;
  const h = size / 2;
  return (
    <svg width={c * 2} height={size * 2} viewBox={`${-c} ${-size} ${c * 2} ${size * 2}`}>
      <polygon points={`0,${-size} ${c},${-h} 0,0 ${-c},${-h}`} fill="#ffd27a" />
      <polygon points={`${-c},${-h} 0,0 0,${size} ${-c},${h}`} fill={accent} />
      <polygon points={`${c},${-h} 0,0 0,${size} ${c},${h}`} fill="#b8432c" />
    </svg>
  );
};

// ---------- Main composition ----------

export const BuildingAd: React.FC<z.infer<typeof buildingAdSchema>> = ({
  companyName,
  tagline,
  website,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { cx, cy, zoom, toScreen } = useCamera(frame);
  const e = explodeAt(frame);

  // Intro
  const introIn = spring({ frame, fps, config: { damping: 14 } });
  const introOut = prog(frame, 55, 25);

  // Sun during the energy scene
  const sunVis = Math.max(window01(frame, T.energy, T.final + 10, 20), 0);
  const sun: [number, number] = [210, 170];

  // Final panel
  const outro = spring({ frame: frame - T.final - 25, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 60% 40%, ${K.bg1} 0%, ${K.bg2} 100%)` }}>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <pattern id="isogrid" width={69.28} height={40} patternUnits="userSpaceOnUse">
            <path d="M0 0 L69.28 40 M69.28 0 L0 40" stroke="#c4d1dc" strokeWidth={1} />
          </pattern>
          <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="shadow" x="-20%" y="-40%" width="140%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1d2b3a" floodOpacity="0.14" />
          </filter>
          <radialGradient id="sunGlow">
            <stop offset="0" stopColor="#ffe08a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffe08a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#isogrid)" opacity={0.45} />

        {/* World */}
        <g transform={`translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-cx} ${-cy})`}>
          <House />
          <g opacity={prog(frame, T.networks + 70, 20) * (frame < T.structure + 40 || frame > T.final ? 1 : 0.4)}>
            <Particles points={NET.elec} color={K.elec} count={7} speed={0.1} size={3.5} />
            <Particles points={NET.water} color={K.water} count={7} speed={0.1} size={3.5} />
          </g>
        </g>

        {/* Sun rays toward the panels */}
        {sunVis > 0 ? (
          <g opacity={sunVis}>
            <circle cx={sun[0]} cy={sun[1]} r={150} fill="url(#sunGlow)" />
            <g transform={`rotate(${frame * 0.6} ${sun[0]} ${sun[1]})`}>
              {new Array(12).fill(0).map((_, i) => (
                <rect
                  key={i}
                  x={sun[0] - 4}
                  y={sun[1] - 92}
                  width={8}
                  height={24}
                  rx={4}
                  fill="#ffc94a"
                  transform={`rotate(${i * 30} ${sun[0]} ${sun[1]})`}
                />
              ))}
            </g>
            <circle cx={sun[0]} cy={sun[1]} r={52} fill="#ffcf4a" />
            {[[2, 1], [5, 1], [8, 1], [3.5, 3], [7, 3]].map(([x, y], i) => {
              const target = toScreen(lift([x, y, roofTopZ(y)], e));
              return (
                <line
                  key={i}
                  x1={sun[0]}
                  y1={sun[1]}
                  x2={target[0]}
                  y2={target[1]}
                  stroke="#ffc94a"
                  strokeWidth={3}
                  strokeDasharray="10 14"
                  strokeDashoffset={-frame * 2}
                  opacity={0.7 * prog(frame, T.energy + 40, 20)}
                />
              );
            })}
          </g>
        ) : null}

        {/* Labels */}
        {LABELS.map((l) => (
          <Label key={l.text} def={l} anchor={toScreen(lift(l.at, e))} frame={frame} />
        ))}
      </svg>

      <TitleCard frame={frame} accent={accentColor} />

      {/* Intro */}
      {introOut < 1 ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            color: K.ink,
            opacity: 1 - introOut,
            transform: `translateY(${-introOut * 120}px)`,
          }}
        >
          <div style={{ transform: `scale(${0.8 + introIn * 0.2})`, opacity: introIn, textAlign: "center" }}>
            <CubeLogo size={60} accent={accentColor} />
            <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: -3, marginTop: 10 }}>{companyName}</div>
            <div style={{ fontSize: 36, fontWeight: 500, color: "#4a5a6b", marginTop: 6 }}>{tagline}</div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Final panel */}
      {frame > T.final + 20 ? (
        <div
          style={{
            position: "absolute",
            right: 80,
            top: 120,
            width: 620,
            padding: "46px 50px",
            borderRadius: 36,
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 30px 70px rgba(29,43,58,0.18)",
            fontFamily: FONT,
            color: K.ink,
            opacity: outro,
            transform: `translateX(${(1 - outro) * 120}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <CubeLogo size={30} accent={accentColor} />
            <div style={{ fontSize: 50, fontWeight: 900, letterSpacing: -1 }}>{companyName}</div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 22, lineHeight: 1.25 }}>
            Un seul interlocuteur,
            <br />
            de la fondation à la toiture.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px", marginTop: 30 }}>
            {[
              ["Fondations", "#8f969f"],
              ["Réseaux VRD", K.water],
              ["Gros œuvre", K.brick],
              ["Chauffage PAC", K.hot],
              ["Ventilation", K.airIn],
              ["Photovoltaïque", K.solar],
            ].map(([label, color], i) => {
              const s = prog(frame, T.final + 45 + i * 6, 12);
              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 23,
                    fontWeight: 600,
                    opacity: s,
                    transform: `translateY(${(1 - s) * 16}px)`,
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 5, background: color }} />
                  {label}
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 38,
              background: accentColor,
              color: "#fff",
              borderRadius: 18,
              padding: "20px 26px",
              fontSize: 27,
              fontWeight: 800,
              textAlign: "center",
              opacity: prog(frame, T.final + 90, 15),
              transform: `scale(${1 + 0.03 * Math.sin(Math.max(0, frame - T.final - 105) * 0.15)})`,
            }}
          >
            Demandez votre étude gratuite
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 24,
              fontWeight: 600,
              textAlign: "center",
              color: "#4a5a6b",
              opacity: prog(frame, T.final + 100, 15),
            }}
          >
            {website}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
