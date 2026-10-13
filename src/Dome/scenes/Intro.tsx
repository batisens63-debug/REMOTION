import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoMark, Skyline, Wordmark } from "../Logo";
import { BRAND, FONTS } from "../theme";
import { FilmLook, p01 } from "../ui";
import { seeded } from "../three/textures";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const draw = p01(frame, 0, 55);
  const sun = p01(frame, 15, 70);
  const logo = p01(frame, 40, 35);
  const zoom = interpolate(frame, [0, 150], [1, 1.06]);
  const r = seeded(17);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #07080c 0%, #141823 60%, #2a1a14 100%)` }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {new Array(70).fill(0).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r() * width,
              top: r() * height * 0.6,
              width: 2,
              height: 2,
              borderRadius: 1,
              background: "#fff",
              opacity: (0.2 + r() * 0.6) * (0.6 + 0.4 * Math.sin(frame * 0.1 + i)),
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: width * 0.5 - 450,
            top: 700 - sun * 140,
            width: 900,
            height: 900,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,140,60,${0.55 * sun}) 0%, rgba(255,90,31,${0.2 * sun}) 35%, transparent 70%)`,
          }}
        />
        <Skyline width={width} base={1000} height={300} draw={draw} fill={p01(frame, 30, 30)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, paddingBottom: 120 }}>
        <div style={{ transform: `scale(${0.7 + 0.3 * logo})`, opacity: logo }}>
          <LogoMark size={220} progress={logo} />
        </div>
        <Wordmark start={55} size={150} />
        <div
          style={{
            fontFamily: FONTS.sans,
            fontWeight: 400,
            fontSize: 34,
            letterSpacing: 3,
            color: BRAND.cream,
            opacity: p01(frame, 85, 20),
            transform: `translateY(${(1 - p01(frame, 85, 20)) * 20}px)`,
          }}
        >
          Le motion design, <span style={{ fontWeight: 800, color: BRAND.ember }}>made in Clermont-Ferrand</span>
        </div>
      </AbsoluteFill>
      <FilmLook />
    </AbsoluteFill>
  );
};
