import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, FONTS } from "../theme";
import { FilmLook, p01, RevealText } from "../ui";

// A deliberately bad "AI generated" poster: garbled text, plastic look.
const BadPoster: React.FC<{ frame: number }> = ({ frame }) => {
  const jitter = Math.sin(frame * 1.7) * 2;
  return (
    <div
      style={{
        width: 460,
        height: 640,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(160deg, #ff3fd0 0%, #7a3cff 40%, #00e1ff 100%)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        filter: "saturate(1.6) contrast(1.15)",
      }}
    >
      {/* melted bottle */}
      <svg width={460} height={640} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="plastic" cx="0.35" cy="0.3">
            <stop offset="0" stopColor="#fff6a0" />
            <stop offset="0.5" stopColor="#ffb300" />
            <stop offset="1" stopColor="#b85c00" />
          </radialGradient>
        </defs>
        <path
          d={`M200 150 C205 120 255 118 258 152 L262 250 C330 300 300 420 315 520 C320 560 150 575 150 520 C160 420 120 330 196 255 Z`}
          fill="url(#plastic)"
          transform={`translate(${jitter} 0)`}
        />
        <ellipse cx="230" cy="420" rx="70" ry="40" fill="#ff47c8" opacity="0.8" />
        <path d="M120 600 Q230 560 340 610" stroke="#fff" strokeWidth="6" fill="none" opacity="0.6" />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 26,
          width: "100%",
          textAlign: "center",
          fontFamily: "serif",
          fontWeight: 900,
          fontSize: 50,
          color: "#fffb00",
          textShadow: "3px 0 #ff0044, -3px 0 #00ffee",
          transform: `skewX(-6deg) translateX(${-jitter}px)`,
          lineHeight: 1,
        }}
      >
        BIÉRRE
        <br />
        ARTIZANALLE
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 22,
          width: "100%",
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 22,
          color: "#fff",
          opacity: 0.9,
          letterSpacing: -1,
        }}
      >
        D'AUVERGGNE · Brasé avék amöur
      </div>
    </div>
  );
};

const Flaw: React.FC<{ text: string; start: number }> = ({ text, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 180 } });
  if (frame < start) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: FONTS.sans,
        fontWeight: 800,
        fontSize: 44,
        color: "#fff",
        transform: `translateX(${(1 - s) * 60}px)`,
        opacity: Math.min(1, s * 1.5),
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          background: "#e3262f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
        }}
      >
        ✕
      </div>
      {text}
    </div>
  );
};

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const posterIn = spring({ frame, fps, config: { damping: 15 } });
  const cross = p01(frame, 72, 14);
  const out = p01(frame, 96, 22);
  const part2 = frame >= 104;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1d2029 0%, #0b0c10 70%)" }}>
      {!part2 || out < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 - out * 0.15})` }}>
          <div style={{ position: "absolute", left: 200, top: 120, fontFamily: FONTS.display, fontSize: 72, color: "#9aa3b2", letterSpacing: 2 }}>
            LES AFFICHES « IA » ?
          </div>
          <div
            style={{
              position: "absolute",
              left: 200,
              top: 230,
              transform: `rotate(${-4 + (1 - posterIn) * -20}deg) scale(${0.7 + 0.3 * posterIn})`,
              opacity: posterIn,
            }}
          >
            <BadPoster frame={frame} />
            <svg width={460} height={640} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              <path d="M-30 -30 L490 670" stroke="#e3262f" strokeWidth={22} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - cross} />
              <path
                d="M490 -30 L-30 670"
                stroke="#e3262f"
                strokeWidth={22}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - p01(frame, 80, 12)}
              />
            </svg>
          </div>
          <div style={{ position: "absolute", left: 860, top: 360, display: "flex", flexDirection: "column", gap: 40 }}>
            <Flaw text="Textes illisibles" start={22} />
            <Flaw text="Rendu plastique" start={36} />
            <Flaw text="Zéro émotion" start={50} />
          </div>
        </AbsoluteFill>
      ) : null}
      {part2 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <RevealText text="Vos produits méritent" start={108} size={52} weight={400} color="#c9cfd8" />
          <div style={{ position: "relative" }}>
            <RevealText text="UN RENDU RÉALISTE." start={116} size={190} font={FONTS.display} stagger={5} letterSpacing={3} />
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 18,
                height: 14,
                width: `${p01(frame, 140, 20) * 100}%`,
                background: BRAND.lava,
                opacity: 0.9,
                zIndex: -1,
              }}
            />
          </div>
          <RevealText text="Qui donne envie." start={150} size={80} font={FONTS.serif} weight={400} italic color={BRAND.ember} />
        </AbsoluteFill>
      ) : null}
      <FilmLook />
    </AbsoluteFill>
  );
};
