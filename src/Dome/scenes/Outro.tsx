import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoMark, Skyline, Wordmark } from "../Logo";
import { BRAND, FONTS } from "../theme";
import { FilmLook, p01 } from "../ui";

const Contact: React.FC<{ icon: React.ReactNode; text: string; start: number }> = ({ icon, text, start }) => {
  const frame = useCurrentFrame();
  const p = p01(frame, start, 16);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontFamily: FONTS.sans,
        fontWeight: 600,
        fontSize: 34,
        color: "#fff",
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      {icon}
      {text}
    </div>
  );
};

const InstaIcon = (
  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={BRAND.ember} strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill={BRAND.ember} />
  </svg>
);

const WebIcon = (
  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={BRAND.ember} strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
  </svg>
);

export const OutroScene: React.FC<{ instagram: string; website: string }> = ({ instagram, website }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const logo = p01(frame, 5, 35);
  const cta = spring({ frame: frame - 95, fps, config: { damping: 12 } });
  const pulse = 1 + 0.035 * Math.max(0, Math.sin((frame - 110) * 0.15));
  const glow = interpolate(frame, [0, 240], [0.3, 0.7]);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #07080c 0%, #141823 65%, #2a1a14 100%)" }}>
      <div
        style={{
          position: "absolute",
          left: width / 2 - 600,
          top: 520,
          width: 1200,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,110,40,${glow}) 0%, transparent 65%)`,
        }}
      />
      <Skyline width={width} base={1040} height={200} draw={1} fill={1} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 120, flexDirection: "column", gap: 8 }}>
        <div style={{ opacity: logo, transform: `scale(${0.8 + 0.2 * logo})` }}>
          <LogoMark size={170} progress={logo} />
        </div>
        <Wordmark start={14} size={130} />
        <div style={{ fontFamily: FONTS.sans, fontSize: 30, letterSpacing: 5, color: BRAND.cream, opacity: p01(frame, 35, 20) }}>
          STUDIO DE MOTION DESIGN · CLERMONT-FERRAND
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: FONTS.serif,
            fontStyle: "italic",
            fontSize: 54,
            color: BRAND.ember,
            opacity: p01(frame, 50, 20),
          }}
        >
          Donnons vie à vos produits.
        </div>
        <div style={{ display: "flex", gap: 80, marginTop: 40 }}>
          <Contact icon={InstaIcon} text={instagram} start={70} />
          <Contact icon={WebIcon} text={website} start={80} />
        </div>
        <div
          style={{
            marginTop: 44,
            padding: "20px 46px",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${BRAND.ember}, ${BRAND.lava})`,
            fontFamily: FONTS.sans,
            fontWeight: 800,
            fontSize: 34,
            color: "#160a04",
            boxShadow: "0 0 60px rgba(255,90,31,0.5)",
            transform: `scale(${cta * pulse})`,
          }}
        >
          Demandez votre devis gratuit
        </div>
      </AbsoluteFill>
      <FilmLook />
    </AbsoluteFill>
  );
};
