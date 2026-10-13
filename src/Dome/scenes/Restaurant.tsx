import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../theme";
import { FilmLook, p01, SectorTitle } from "../ui";
import { RestaurantRoom } from "./backdrops";

const MENU = [
  ["Truffade au Cantal", "16 €"],
  ["Pounti maison", "9 €"],
  ["Aligot & saucisse", "15 €"],
  ["Tarte aux myrtilles", "7 €"],
];

// The slate menu itself (reused in the formats montage).
export const ChalkMenu: React.FC<{ frame: number; delay?: number }> = ({ frame, delay = 0 }) => {
  const f = frame - delay;
  const title = p01(f, 0, 30);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 40% 30%, #3a3d3c 0%, #1e201f 80%)",
        padding: "6% 8%",
        color: "#f1efe8",
        fontFamily: FONTS.hand,
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: "1em", opacity: 0.85, clipPath: `inset(0 ${(1 - title) * 100}% 0 0)` }}>
        <div style={{ fontSize: "1.25em", fontWeight: 700 }}>L'Ardoise du jour</div>
        <svg width="60%" height="0.3em" viewBox="0 0 300 12" preserveAspectRatio="none">
          <path d="M2 8 Q80 2 150 7 T298 5" stroke="#f2c14e" strokeWidth={3} fill="none" />
        </svg>
      </div>
      <div style={{ marginTop: "0.4em", display: "flex", flexDirection: "column", gap: "0.18em" }}>
        {MENU.map(([dish, price], i) => {
          const p = p01(f, 25 + i * 14, 16);
          return (
            <div
              key={dish}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.3em",
                fontSize: "0.72em",
                opacity: p,
                transform: `translateX(${(1 - p) * -20}px)`,
              }}
            >
              <span>{dish}</span>
              <span style={{ flex: 1, borderBottom: "3px dotted rgba(241,239,232,0.45)", transform: "translateY(-0.2em)" }} />
              <span style={{ color: "#f2c14e", fontWeight: 700 }}>{price}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Steam: React.FC<{ frame: number; x: number; y: number }> = ({ frame, x, y }) => (
  <svg width={160} height={220} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 20) % 60) / 60;
      return (
        <path
          key={i}
          d={`M${50 + i * 30} 200 C${20 + i * 30} 150 ${80 + i * 30} 110 ${50 + i * 30} 60`}
          stroke="#fff"
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          opacity={Math.sin(t * Math.PI) * 0.35}
          transform={`translate(0 ${-t * 50})`}
          style={{ filter: "blur(3px)" }}
        />
      );
    })}
  </svg>
);

export const RestaurantScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tv = spring({ frame: frame - 4, fps, config: { damping: 16 } });
  const stamp = spring({ frame: frame - 95, fps, config: { damping: 10, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <RestaurantRoom />
      {/* wall screen */}
      <div
        style={{
          position: "absolute",
          right: 110,
          top: 200,
          width: 900,
          height: 540,
          borderRadius: 18,
          background: "#0c0c0d",
          padding: 18,
          boxShadow: "0 40px 90px rgba(0,0,0,0.7), 0 0 120px rgba(255,170,90,0.15)",
          transform: `perspective(1600px) rotateY(${-14 + (1 - tv) * -20}deg) translateY(${(1 - tv) * 60}px)`,
          opacity: tv,
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 6, overflow: "hidden", fontSize: 60 }}>
          <ChalkMenu frame={frame} delay={10} />
          <div
            style={{
              position: "absolute",
              right: 36,
              top: 30,
              width: 170,
              height: 170,
              borderRadius: "50%",
              border: "4px dashed #f2c14e",
              color: "#f2c14e",
              fontFamily: FONTS.hand,
              fontWeight: 700,
              fontSize: 40,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              transform: `rotate(${-12 + frame * 0.2}deg) scale(${stamp})`,
            }}
          >
            Fait
            <br />
            maison
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(255,255,255,0.08) 0%, transparent 40%)" }} />
        </div>
      </div>
      <Steam frame={frame} x={1240} y={60} />
      <SectorTitle
        index="04"
        label="RESTAURANTS"
        title="Des menus qui donnent faim."
        chips={["Écrans en salle", "Menus du jour", "Stories"]}
        color="#d0743a"
        titleSize={82}
      />
      <FilmLook />
    </AbsoluteFill>
  );
};
