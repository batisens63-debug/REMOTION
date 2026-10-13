import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Studio } from "../three/Studio";
import { Dumbbell } from "../three/Objects";
import { FilmLook, p01, Tag } from "../ui";
import { FONTS } from "../theme";
import { GymHall } from "./backdrops";

const YELLOW = "#e6e23a";
const GREEN = "#8cc63f";

const BEAT = 18; // 100 BPM at 30 fps

const Slam: React.FC<{ text: string; at: number; until: number; size: number; color?: string; stroke?: boolean }> = ({
  text,
  at,
  until,
  size,
  color = "#fff",
  stroke,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame >= until) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 220 } });
  return (
    <div
      style={{
        fontFamily: FONTS.display,
        fontSize: size,
        lineHeight: 0.9,
        color: stroke ? "transparent" : color,
        WebkitTextStroke: stroke ? `3px ${color}` : undefined,
        transform: `scale(${1.6 - 0.6 * s})`,
        opacity: Math.min(1, s * 2),
        transformOrigin: "left center",
        letterSpacing: 2,
      }}
    >
      {text}
    </div>
  );
};

export const GymScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spin = frame * 0.045 + spring({ frame: frame - 70, fps, config: { damping: 20 } }) * Math.PI;
  const flash = Math.max(0, 1 - (frame % BEAT) / 6) * (frame > 10 ? 0.22 : 0);
  const promo = spring({ frame: frame - 100, fps, config: { damping: 9, stiffness: 160 } });
  const enter = p01(frame, 0, 20);
  return (
    <AbsoluteFill>
      <GymHall yellow={YELLOW} green={GREEN} />
      <Studio camera={[0, 0.4, 6.8]} target={[-1.5, 0, 0]} fov={30} exposure={1.1}>
        <spotLight position={[2, 4, 4]} angle={0.6} penumbra={0.7} intensity={80} color="#ffffff" />
        <pointLight position={[-3, 1, -2]} intensity={40} color={YELLOW} />
        <pointLight position={[3, -1, -2]} intensity={20} color="#ffffff" />
        <group rotation={[0.35 + Math.sin(frame * 0.05) * 0.1, spin, -0.25]} scale={1.15 * (0.6 + 0.4 * enter)}>
          <Dumbbell accent={YELLOW} />
        </group>
      </Studio>
      <AbsoluteFill style={{ background: YELLOW, opacity: flash * 0.6, mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: 120, top: 200, display: "flex", flexDirection: "column", gap: 10 }}>
        <Tag text="06 — SALLES DE SPORT" start={4} color={GREEN} />
        <div style={{ height: 20 }} />
        <Slam text="PLUS FORT." at={BEAT} until={999} size={170} />
        <Slam text="CHAQUE JOUR." at={BEAT * 2} until={999} size={170} color={YELLOW} stroke />
        <div style={{ height: 30 }} />
        {frame >= 100 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              transform: `scale(${0.4 + 0.6 * promo}) rotate(${(1 - promo) * -8}deg)`,
              transformOrigin: "left center",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 150,
                color: "#111",
                background: YELLOW,
                padding: "4px 28px 0",
                borderRadius: 14,
                boxShadow: "0 0 50px rgba(230,226,58,0.45)",
              }}
            >
              -30%
            </div>
            <div style={{ fontFamily: FONTS.sans, fontWeight: 800, fontSize: 34, color: "#fff", lineHeight: 1.25 }}>
              sur l'abonnement
              <br />
              <span style={{ fontWeight: 400, opacity: 0.8 }}>ce mois-ci seulement</span>
            </div>
          </div>
        ) : null}
        <div
          style={{
            marginTop: 26,
            fontFamily: FONTS.sans,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: 6,
            color: "rgba(255,255,255,0.75)",
            opacity: p01(frame, 125, 15),
          }}
        >
          MUSCU · CARDIO · COACHING
        </div>
      </div>
      <FilmLook vignette={0.65} />
    </AbsoluteFill>
  );
};
