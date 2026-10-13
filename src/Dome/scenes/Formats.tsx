import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, FONTS } from "../theme";
import { FilmLook, p01, RevealText } from "../ui";
import { ChalkMenu } from "./Restaurant";
import { SalonCard } from "./Coiffeur";

const Device: React.FC<{
  index: number;
  label: string;
  children: React.ReactNode;
  width: number;
  height: number;
  radius: number;
  bezel: number;
  stand?: "laptop" | "tv" | "easel";
}> = ({ index, label, children, width, height, radius, bezel, stand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 20 - index * 9, fps, config: { damping: 13 } });
  const float = Math.sin(frame * 0.05 + index) * 6;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 26,
        transform: `translateY(${(1 - s) * 140 + float}px) scale(${0.8 + 0.2 * s})`,
        opacity: Math.min(1, s * 1.4),
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width,
            height,
            borderRadius: radius,
            padding: bezel,
            background: "#08090b",
            boxShadow: "0 30px 60px rgba(0,0,0,0.55), inset 0 0 0 2px #2a2d34",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: Math.max(2, radius - bezel), overflow: "hidden" }}>
            {children}
          </div>
        </div>
        {stand === "laptop" ? (
          <div style={{ width: width * 1.18, height: 16, background: "linear-gradient(#cfd3da, #8d939c)", borderRadius: "0 0 14px 14px" }} />
        ) : null}
        {stand === "tv" ? <div style={{ width: 120, height: 40, background: "#1b1d22", clipPath: "polygon(30% 0,70% 0,100% 100%,0 100%)" }} /> : null}
        {stand === "easel" ? (
          <svg width={width} height={50}>
            <path d={`M${width * 0.2} 0 L${width * 0.08} 50 M${width * 0.8} 0 L${width * 0.92} 50`} stroke="#6b4a2c" strokeWidth={8} />
          </svg>
        ) : null}
      </div>
      <div style={{ fontFamily: FONTS.sans, fontWeight: 600, fontSize: 24, color: "#fff", letterSpacing: 1 }}>{label}</div>
    </div>
  );
};

export const FormatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const gymPulse = 1 + 0.06 * Math.max(0, Math.sin(frame * 0.35));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #1f2330 0%, #0b0c10 70%)" }}>
      <div style={{ position: "absolute", top: 110, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <RevealText text="Un seul studio." start={4} size={72} weight={800} />
        <RevealText text="Tous vos formats." start={14} size={72} weight={800} color={BRAND.lava} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 320,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 70,
        }}
      >
        <Device index={0} label="Reels Instagram" width={230} height={440} radius={34} bezel={10}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, #3a0a0e, #0b0b0e)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 64, color: "#fff", lineHeight: 0.9, textAlign: "center" }}>
              PLUS
              <br />
              FORT.
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: FONTS.display,
                fontSize: 70,
                color: "#fff",
                background: "#e3262f",
                padding: "2px 14px 0",
                borderRadius: 8,
                transform: `scale(${gymPulse})`,
              }}
            >
              -30%
            </div>
          </div>
        </Device>
        <Device index={1} label="Écran vitrine" width={480} height={290} radius={10} bezel={10} stand="tv">
          <div style={{ fontSize: 40, position: "absolute", inset: 0 }}>
            <ChalkMenu frame={frame} delay={30} />
          </div>
        </Device>
        <Device index={2} label="Site web" width={430} height={270} radius={12} bezel={12} stand="laptop">
          <div style={{ position: "absolute", inset: 0, background: "#f6efe3" }}>
            <div style={{ height: 22, background: "#e4dccd", display: "flex", gap: 6, alignItems: "center", paddingLeft: 10 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <div key={c} style={{ width: 8, height: 8, borderRadius: 4, background: c }} />
              ))}
            </div>
            <div style={{ padding: "16px 20px", display: "flex", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTS.serif, fontWeight: 700, fontSize: 28, color: "#2b2118", lineHeight: 1.05 }}>
                  Fromagerie
                  <br />
                  du Sancy
                </div>
                <div style={{ marginTop: 10, fontFamily: FONTS.sans, fontSize: 11, color: "#6b5a48" }}>Saint-Nectaire fermier · Cantal · Bleu</div>
                <div style={{ marginTop: 14, display: "inline-block", padding: "6px 12px", background: "#2b2118", color: "#f6efe3", fontFamily: FONTS.sans, fontWeight: 600, fontSize: 11 }}>
                  Découvrir
                </div>
              </div>
              <div
                style={{
                  width: 140,
                  height: 160,
                  borderRadius: 8,
                  background: "radial-gradient(circle at 45% 55%, #f2e0b4 0 34%, #b9a48a 35% 48%, #8a5a35 49%)",
                  transform: `rotate(${frame * 0.4}deg)`,
                }}
              />
            </div>
          </div>
        </Device>
        <Device index={3} label="Affiche animée" width={260} height={360} radius={4} bezel={8} stand="easel">
          <div style={{ position: "absolute", inset: 0, background: "#0d0f14", display: "flex", alignItems: "center", justifyContent: "center", transform: "scale(0.45)" }}>
            <div style={{ transform: "scale(1)" }}>
              <SalonCard frame={frame} />
            </div>
          </div>
        </Device>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 150,
          width: "100%",
          textAlign: "center",
          fontFamily: FONTS.sans,
          fontSize: 26,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: 2,
          opacity: p01(frame, 80, 20),
        }}
      >
        Formats verticaux, carrés et paysage · livrés prêts à publier
      </div>
      <FilmLook />
    </AbsoluteFill>
  );
};
