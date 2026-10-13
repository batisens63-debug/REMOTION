import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ContactShadow, Studio, useTextures } from "../three/Studio";
import { Barrel, NaturalWineBottle, WineGlass } from "../three/Objects";
import { barrelTop, naturalWineLabel, woodTexture } from "../three/textures";
import { FilmLook, p01, SectorTitle } from "../ui";
import { FONTS } from "../theme";
import { WineShop } from "./backdrops";

const makeTextures = () => ({
  label: naturalWineLabel(),
  top: barrelTop(),
  wood: woodTexture(14, "#6b4a32"),
});

export const WineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tex = useTextures(makeTextures);
  const camX = interpolate(frame, [0, 150], [0.4, 1.3]);
  const camY = interpolate(frame, [0, 150], [1.5, 1.8]);
  const rot = interpolate(frame, [0, 150], [-0.5, 0.1]);
  const fill = p01(frame, 15, 60);
  return (
    <AbsoluteFill>
      <WineShop />
      {tex ? (
        <Studio camera={[camX, camY, 7.6]} target={[1.5, 1.25, 0]} fov={27} exposure={1.0} envIntensity={1}>
          <directionalLight position={[-4, 6, 4]} intensity={2.6} color="#fff6ea" />
          <pointLight position={[2.5, 2.5, -2]} intensity={22} color="#ffe2b8" />
          <pointLight position={[-2, 2, -2.5]} intensity={16} color="#ffffff" />
          <group position={[-0.3, 0, 0]} rotation={[0, rot, 0]}>
            <NaturalWineBottle label={tex.label} />
          </group>
          <group position={[0.85, 0, 0.75]} scale={0.9}>
            <WineGlass fill={fill} wine="#b8932c" />
          </group>
          <ContactShadow size={1.8} x={-0.3} y={0.004} opacity={0.6} />
          <ContactShadow size={1.1} x={0.85} z={0.75} y={0.004} opacity={0.4} />
          <Barrel top={tex.top} wood={tex.wood} />
        </Studio>
      ) : null}
      <SectorTitle
        index="02"
        label="VIGNERONS & CAVISTES"
        title="Sublimez votre cuvée."
        chips={["Côtes d'Auvergne", "Vins nature", "Caves & salons"]}
        color="#8fbf9a"
        titleFont={FONTS.serif}
        titleSize={96}
        align="right"
      />
      <FilmLook vignette={0.5} />
    </AbsoluteFill>
  );
};
