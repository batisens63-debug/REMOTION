import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { seeded } from "./textures";

const lathe = (pts: number[][], segments = 96) =>
  new THREE.LatheGeometry(
    pts.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );

// ---------- Beer ----------

const BEER_PROFILE = [
  [0, 0],
  [0.34, 0],
  [0.37, 0.02],
  [0.38, 0.06],
  [0.38, 1.18],
  [0.37, 1.3],
  [0.3, 1.48],
  [0.2, 1.66],
  [0.15, 1.82],
  [0.135, 2.1],
  [0.15, 2.12],
  [0.15, 2.18],
  [0.13, 2.2],
  [0, 2.2],
];

const Droplets: React.FC<{ count: number; radius: number; y0: number; y1: number; seed: number }> = ({
  count,
  radius,
  y0,
  y1,
  seed,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const r = seeded(seed);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const theta = (r() - 0.5) * Math.PI * 1.3;
      const y = y0 + r() * (y1 - y0);
      const s = 0.004 + Math.pow(r(), 3) * 0.016;
      dummy.position.set(Math.sin(theta) * (radius + s * 0.25), y, Math.cos(theta) * (radius + s * 0.25));
      dummy.rotation.set(0, theta, 0);
      dummy.scale.set(s, s * (1 + r() * 0.6), s * 0.45);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [count, radius, y0, y1, seed]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 12, 8]} />
      <meshPhysicalMaterial color="#ffd9a8" roughness={0.02} transparent opacity={0.35} clearcoat={1} envMapIntensity={2.2} />
    </instancedMesh>
  );
};

export const BeerBottle: React.FC<{ label: THREE.Texture }> = ({ label }) => {
  const glass = useMemo(() => lathe(BEER_PROFILE), []);
  const liquid = useMemo(
    () =>
      lathe(
        BEER_PROFILE.filter(([, y]) => y < 1.8).map(([r, y]) => [r * 0.92, y + 0.03]).concat([[0, 1.8]]),
      ),
    [],
  );
  const labelLen = Math.PI * 2 * 0.86;
  return (
    <group>
      <mesh geometry={liquid}>
        <meshPhysicalMaterial color="#d98d14" roughness={0.15} emissive="#5c2c00" emissiveIntensity={0.25} transmission={0.25} thickness={0.5} />
      </mesh>
      <mesh geometry={glass}>
        <meshPhysicalMaterial
          color="#5a2a08"
          roughness={0.05}
          metalness={0}
          transmission={0.6}
          thickness={0.5}
          ior={1.52}
          clearcoat={1}
          clearcoatRoughness={0.03}
          attenuationColor="#8a4a10"
          attenuationDistance={0.6}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.383, 0.383, 0.66, 128, 1, true, -labelLen / 2, labelLen]} />
        <meshStandardMaterial map={label} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.97, 0]}>
        <cylinderGeometry args={[0.142, 0.142, 0.16, 64, 1, true]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0, 2.215, 0]}>
        <cylinderGeometry args={[0.16, 0.162, 0.07, 21]} />
        <meshStandardMaterial color="#d4ad55" metalness={1} roughness={0.25} />
      </mesh>
      <Droplets count={320} radius={0.38} y0={0.08} y1={1.22} seed={42} />
    </group>
  );
};

// ---------- Wine ----------

const WINE_PROFILE = [
  [0, 0.06],
  [0.2, 0.0],
  [0.36, 0],
  [0.38, 0.05],
  [0.38, 1.55],
  [0.37, 1.66],
  [0.3, 1.8],
  [0.19, 1.95],
  [0.145, 2.1],
  [0.135, 2.5],
  [0.15, 2.52],
  [0.15, 2.58],
  [0, 2.58],
];

export const WineBottle: React.FC<{ label: THREE.Texture }> = ({ label }) => {
  const glass = useMemo(() => lathe(WINE_PROFILE), []);
  const labelLen = Math.PI * 2 * 0.42;
  return (
    <group>
      <mesh geometry={glass}>
        <meshPhysicalMaterial
          color="#0d2412"
          roughness={0.04}
          transmission={0.3}
          thickness={0.6}
          ior={1.52}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.384, 0.384, 0.78, 128, 1, true, -labelLen / 2, labelLen]} />
        <meshStandardMaterial map={label} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.36, 0]}>
        <cylinderGeometry args={[0.153, 0.153, 0.46, 64]} />
        <meshStandardMaterial color="#5b0f1a" metalness={0.75} roughness={0.32} />
      </mesh>
    </group>
  );
};

const GLASS_PROFILE = [
  [0, 0],
  [0.42, 0],
  [0.43, 0.015],
  [0.06, 0.04],
  [0.028, 0.1],
  [0.028, 0.82],
  [0.1, 0.9],
  [0.32, 1.02],
  [0.45, 1.25],
  [0.48, 1.48],
  [0.44, 1.78],
  [0.38, 2.0],
];

export const WineGlass: React.FC<{ fill?: number; wine?: string }> = ({ fill = 1, wine: wineColor = "#4a0512" }) => {
  const glass = useMemo(() => lathe(GLASS_PROFILE), []);
  const top = 0.93 + 0.5 * fill;
  const wine = useMemo(() => {
    const radiusAt = (y: number) => {
      for (let i = 1; i < GLASS_PROFILE.length; i++) {
        const [r0, y0] = GLASS_PROFILE[i - 1];
        const [r1, y1] = GLASS_PROFILE[i];
        if (y >= y0 && y <= y1 && y1 > y0) return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0);
      }
      return 0.4;
    };
    const pts: number[][] = [[0, 0.93]];
    for (let y = 0.93; y <= top; y += 0.03) pts.push([radiusAt(y) * 0.96, y]);
    pts.push([radiusAt(top) * 0.96, top], [0, top]);
    return lathe(pts);
  }, [top]);
  return (
    <group>
      <mesh geometry={wine}>
        <meshPhysicalMaterial color={wineColor} roughness={0.05} clearcoat={1} emissive={wineColor} emissiveIntensity={0.25} envMapIntensity={1.5} />
      </mesh>
      <mesh geometry={glass}>
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0}
          transparent
          opacity={0.14}
          depthWrite={false}
          side={THREE.DoubleSide}
          clearcoat={1}
          envMapIntensity={2.5}
        />
      </mesh>
    </group>
  );
};

// ---------- Terroir ----------

const CutFace: React.FC<{ theta: number; r: number; h: number; map: THREE.Texture }> = ({ theta, r, h, map }) => (
  <mesh position={[Math.sin(theta) * (r / 2), 0, Math.cos(theta) * (r / 2)]} rotation={[0, theta - Math.PI / 2, 0]}>
    <planeGeometry args={[r, h]} />
    <meshStandardMaterial map={map} roughness={0.85} side={THREE.DoubleSide} />
  </mesh>
);

export const CheeseWheel: React.FC<{
  rind: THREE.Texture;
  paste: THREE.Texture;
  gap: number;
  wedgeOut: number;
}> = ({ rind, paste, gap, wedgeOut }) => {
  const [r, h] = [1.0, 0.42];
  return (
    <group>
      <group position={[0, h / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[r, r * 0.985, h, 128, 1, false, gap / 2, Math.PI * 2 - gap]} />
          <meshStandardMaterial map={rind} roughness={0.9} />
        </mesh>
        <CutFace theta={gap / 2} r={r} h={h} map={paste} />
        <CutFace theta={-gap / 2} r={r} h={h} map={paste} />
      </group>
      {/* the cut wedge */}
      <group position={[0.15, h / 2, wedgeOut]} rotation={[0, 0.35, 0]}>
        <mesh>
          <cylinderGeometry args={[r, r * 0.985, h, 32, 1, false, -gap / 2, gap]} />
          <meshStandardMaterial map={rind} roughness={0.9} />
        </mesh>
        <CutFace theta={gap / 2} r={r} h={h} map={paste} />
        <CutFace theta={-gap / 2} r={r} h={h} map={paste} />
      </group>
    </group>
  );
};

export const Saucisson: React.FC<{ skin: THREE.Texture; slice: THREE.Texture }> = ({ skin, slice }) => {
  const sliceMats = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ map: skin, roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: slice, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ map: slice, roughness: 0.6 }),
    ],
    [skin, slice],
  );
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.17, 0]}>
        <capsuleGeometry args={[0.17, 1.5, 16, 48]} />
        <meshStandardMaterial map={skin} roughness={0.85} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          material={sliceMats}
          position={[1.15 + i * 0.22, 0.03 + i * 0.012, 0.25 + i * 0.05]}
          rotation={[-Math.PI / 2 + 0.05, 0, 0.2 * i]}
        >
          <cylinderGeometry args={[0.165, 0.165, 0.025, 48]} />
        </mesh>
      ))}
    </group>
  );
};

export const HoneyJar: React.FC<{ label: THREE.Texture }> = ({ label }) => {
  const labelLen = Math.PI * 2 * 0.5;
  return (
    <group>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.76, 64]} />
        <meshPhysicalMaterial color="#e39a1c" roughness={0.12} clearcoat={1} emissive="#8a4a00" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.41, 0.41, 0.9, 64]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0} transparent opacity={0.16} depthWrite={false} clearcoat={1} envMapIntensity={2.5} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.413, 0.413, 0.36, 96, 1, true, -labelLen / 2, labelLen]} />
        <meshStandardMaterial map={label} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.97, 0]}>
        <cylinderGeometry args={[0.43, 0.43, 0.16, 64]} />
        <meshStandardMaterial color="#b88a2e" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ---------- Gym ----------

export const Dumbbell: React.FC<{ accent?: string }> = ({ accent = "#e3262f" }) => {
  const chrome = <meshStandardMaterial color="#dfe3e8" metalness={1} roughness={0.12} />;
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 1.5, 48]} />
        {chrome}
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.42, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.08, 48]} />
            {chrome}
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.62, 0, 0]}>
            <cylinderGeometry args={[0.46, 0.46, 0.3, 6]} />
            <meshStandardMaterial color="#1a1a1c" roughness={0.55} metalness={0.1} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.62, 0, 0]}>
            <cylinderGeometry args={[0.462, 0.462, 0.05, 6]} />
            <meshStandardMaterial color={accent} roughness={0.4} emissive={accent} emissiveIntensity={0.25} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.8, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.06, 48]} />
            {chrome}
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ---------- Natural wine (Burgundy bottle, green wax) ----------

const BURGUNDY_PROFILE = [
  [0, 0.08],
  [0.22, 0.0],
  [0.37, 0],
  [0.395, 0.05],
  [0.395, 1.15],
  [0.38, 1.4],
  [0.33, 1.68],
  [0.24, 1.95],
  [0.16, 2.22],
  [0.145, 2.55],
  [0.15, 2.62],
  [0, 2.62],
];

export const NaturalWineBottle: React.FC<{ label: THREE.Texture }> = ({ label }) => {
  const glass = useMemo(() => lathe(BURGUNDY_PROFILE), []);
  const liquid = useMemo(
    () => lathe(BURGUNDY_PROFILE.filter(([, y]) => y < 2.05).map(([r, y]) => [r * 0.93, y + 0.03]).concat([[0, 2.05]])),
    [],
  );
  const drips = useMemo(() => {
    const r = seeded(91);
    return new Array(9).fill(0).map(() => ({ a: r() * Math.PI * 2, len: 0.08 + r() * 0.22 }));
  }, []);
  const labelLen = Math.PI * 2 * 0.36;
  const wax = <meshPhysicalMaterial color="#5f8f72" roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.3} />;
  return (
    <group>
      <mesh geometry={liquid}>
        <meshStandardMaterial color="#8a7424" roughness={0.2} emissive="#3a2e05" emissiveIntensity={0.4} />
      </mesh>
      <mesh geometry={glass}>
        <meshPhysicalMaterial
          color="#3a3812"
          roughness={0.05}
          transmission={0.35}
          thickness={0.5}
          ior={1.52}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.399, 0.399, 0.95, 128, 1, true, -labelLen / 2, labelLen]} />
        <meshStandardMaterial map={label} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* dipped wax top with drips */}
      <mesh position={[0, 2.47, 0]}>
        <cylinderGeometry args={[0.172, 0.17, 0.3, 48]} />
        {wax}
      </mesh>
      <mesh position={[0, 2.62, 0]} scale={[1, 0.45, 1]}>
        <sphereGeometry args={[0.172, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {wax}
      </mesh>
      {drips.map((d, i) => (
        <mesh key={i} position={[Math.sin(d.a) * 0.168, 2.32 - d.len / 2, Math.cos(d.a) * 0.168]}>
          <capsuleGeometry args={[0.025, d.len, 6, 12]} />
          {wax}
        </mesh>
      ))}
    </group>
  );
};

export const Barrel: React.FC<{ top: THREE.Texture; wood: THREE.Texture }> = ({ top, wood }) => (
  <group>
    <mesh position={[0, -1.2, 0]}>
      <cylinderGeometry args={[2.3, 2.15, 2.4, 96]} />
      <meshStandardMaterial map={wood} roughness={0.8} color="#9a8a76" />
    </mesh>
    <mesh position={[0, -0.02, 0]}>
      <cylinderGeometry args={[2.3, 2.3, 0.04, 96]} />
      <meshStandardMaterial map={top} roughness={0.85} />
    </mesh>
    {[-0.25, -2.0].map((y) => (
      <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.04, 12, 96]} />
        <meshStandardMaterial color="#2d2a28" metalness={0.7} roughness={0.5} />
      </mesh>
    ))}
  </group>
);
