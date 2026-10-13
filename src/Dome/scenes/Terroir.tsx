import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ContactShadow, Studio, useTextures } from "../three/Studio";
import { CheeseWheel, HoneyJar, Saucisson } from "../three/Objects";
import {
  honeyLabel,
  pasteTexture,
  rindTexture,
  saucissonSkin,
  saucissonSlice,
  woodTexture,
} from "../three/textures";
import { FilmLook, p01, SectorTitle } from "../ui";
import { FONTS } from "../theme";

const makeTextures = () => ({
  wood: woodTexture(5, "#8a5a35"),
  rind: rindTexture(),
  paste: pasteTexture(),
  skin: saucissonSkin(),
  slice: saucissonSlice(),
  honey: honeyLabel(),
});

export const TerroirScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tex = useTextures(makeTextures);
  const camX = interpolate(frame, [0, 180], [0.6, 1.6]);
  const wedge = p01(frame, 25, 50) * 0.75;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #2b2118 0%, #15100b 70%)" }}>
      {tex ? (
        <Studio camera={[camX, 3.6, 6.4]} target={[0.3, 0.35, 0]} fov={32} exposure={1.05} envIntensity={0.9}>
          <directionalLight position={[-4, 6, 3]} intensity={3.2} color="#fff0d8" />
          <pointLight position={[3, 2, -2]} intensity={20} color="#ffc27a" />
          <group position={[1.4, 0, 0]}>
            <mesh position={[0, 0.07, 0]}>
              <boxGeometry args={[4.6, 0.14, 3]} />
              <meshStandardMaterial map={tex.wood} roughness={0.65} />
            </mesh>
            <group position={[0.25, 0.14, -0.35]}>
              <ContactShadow size={2.6} opacity={0.55} />
              <CheeseWheel rind={tex.rind} paste={tex.paste} gap={0.8} wedgeOut={0.15 + wedge} />
            </group>
            <group position={[-1.35, 0.14, 0.75]} rotation={[0, 0.35, 0]}>
              <ContactShadow size={2.2} opacity={0.4} x={0.4} />
              <Saucisson skin={tex.skin} slice={tex.slice} />
            </group>
            <group position={[1.65, 0.14, -0.6]}>
              <ContactShadow size={1.4} opacity={0.5} />
              <HoneyJar label={tex.honey} />
            </group>
          </group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#2a1f17" roughness={0.9} />
          </mesh>
        </Studio>
      ) : null}
      <SectorTitle
        index="03"
        label="PRODUITS DU TERROIR"
        title="Faites saliver vos clients."
        chips={["Fromageries", "Salaisons", "Épiceries fines"]}
        color="#f2c14e"
        titleFont={FONTS.serif}
        titleSize={92}
      />
      <FilmLook vignette={0.6} />
    </AbsoluteFill>
  );
};
