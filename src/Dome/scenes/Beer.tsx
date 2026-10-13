import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ContactShadow, Studio, useTextures } from "../three/Studio";
import { BeerBottle } from "../three/Objects";
import { beerLabel } from "../three/textures";
import { Bokeh, FilmLook, p01, SectorTitle } from "../ui";

export const BeerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const label = useTextures(beerLabel);
  const rot = interpolate(frame, [0, 180], [-1.2, -0.12]);
  const camZ = interpolate(frame, [0, 180], [7.4, 6.4]);
  const sweep = interpolate(frame, [20, 110], [-3, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = p01(frame, 0, 30);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 45%, #3a2412 0%, #120b06 55%, #050302 100%)" }}>
      <Bokeh color="#ffb347" count={30} seed={3} rise={1.4} />
      {label ? (
        <Studio camera={[-1.6, 1.6, camZ]} target={[-1.0, 1.05, 0]} fov={28} exposure={1.05} envIntensity={0.9}>
          <spotLight position={[3, 5, 4]} angle={0.5} penumbra={0.8} intensity={60} color="#fff1d6" />
          <pointLight position={[-2.5, 2, -2]} intensity={25} color="#ffa040" />
          <pointLight position={[2.5, 1.5, -2]} intensity={18} color="#ffd9a0" />
          <pointLight position={[0.6, 2.4, -1.4]} intensity={14} color="#ffffff" />
          <pointLight position={[sweep, 1.2, 2]} intensity={6} color="#ffffff" distance={4} />
          <group position={[0, (1 - rise) * -0.6, 0]} rotation={[0, rot, 0]}>
            <BeerBottle label={label} />
          </group>
          <ContactShadow size={2.2} opacity={0.8} />
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[6, 64]} />
            <meshStandardMaterial color="#1a120c" roughness={0.35} metalness={0.2} />
          </mesh>
        </Studio>
      ) : null}
      <SectorTitle
        index="01"
        label="BRASSERIES"
        title="Bulle après bulle."
        chips={["Packshot 3D réaliste", "Lancement produit", "Pubs Reels"]}
        color="#ffb347"
      />
      <FilmLook />
    </AbsoluteFill>
  );
};
