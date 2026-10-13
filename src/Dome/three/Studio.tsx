import React, { useEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { continueRender, delayRender, useVideoConfig } from "remotion";
import { fontsReady } from "../theme";
import { shadowTexture } from "./textures";

// Studio-like image based lighting, generated locally (no HDR download).
const Environment: React.FC<{ intensity: number }> = ({ intensity }) => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  useEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = intensity;
  }, [scene, env, intensity]);
  return null;
};

const CameraRig: React.FC<{ position: [number, number, number]; target: [number, number, number]; fov: number }> = ({
  position,
  target,
  fov,
}) => {
  const { camera } = useThree();
  camera.position.set(...position);
  (camera as THREE.PerspectiveCamera).fov = fov;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  camera.lookAt(...target);
  return null;
};

export const Studio: React.FC<{
  children: React.ReactNode;
  camera: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  exposure?: number;
  envIntensity?: number;
}> = ({ children, camera, target = [0, 1, 0], fov = 30, exposure = 1, envIntensity = 1 }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0 }}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: exposure,
      }}
      camera={{ position: camera, fov }}
    >
      <Environment intensity={envIntensity} />
      <CameraRig position={camera} target={target} fov={fov} />
      {children}
    </ThreeCanvas>
  );
};

// Textures that draw text must wait for the web fonts.
export function useTextures<T>(make: () => T): T | null {
  const [handle] = useState(() => delayRender("3D textures"));
  const [tex, setTex] = useState<T | null>(null);
  useEffect(() => {
    fontsReady().then(() => {
      setTex(make());
      continueRender(handle);
    });
    // make is a stable factory per scene
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
  return tex;
}

export const ContactShadow: React.FC<{ size: number; opacity?: number; y?: number; x?: number; z?: number }> = ({
  size,
  opacity = 0.7,
  y = 0.002,
  x = 0,
  z = 0,
}) => {
  const tex = useMemo(() => shadowTexture(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, y, z]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
};
