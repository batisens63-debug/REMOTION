import { interpolate } from "remotion";
import { ease, P3 } from "./iso";

export const FPS = 30;
export const DURATION = 1290;

// Start frames of each part of the film.
export const T = {
  terrain: 60,
  foundations: 105,
  networks: 250,
  structure: 430,
  heating: 600,
  ventilation: 790,
  energy: 960,
  final: 1110,
};

export const COLORS = {
  bg1: "#f1f5f8",
  bg2: "#d9e4ec",
  ink: "#1d2b3a",
  grass: "#9cc77a",
  topsoil: "#7c5c45",
  clay: "#b98a5e",
  rock: "#8f877e",
  concrete: "#c4c8ce",
  gravel: "#aaa196",
  insulation: "#f3cf5e",
  brick: "#d49a72",
  plaster: "#f6f1ea",
  wood: "#e6c9a1",
  tech: "#d3d9de",
  water: "#2f8be0",
  sewer: "#8a6d5a",
  elec: "#f2b705",
  fiber: "#22b38a",
  hot: "#ef5a3c",
  cold: "#4a90e2",
  airIn: "#3fb6e8",
  airOut: "#f08a3c",
  solar: "#1f3b6e",
  accent: "#ef5a3c",
};

// Exploded view: the upper level lifts so the ground floor stays readable.
export const EXPLODE = 2.5;
export const ROOF_FLOAT = 0.6;

export const explodeAt = (frame: number) =>
  interpolate(frame, [T.heating, T.heating + 40], [0, EXPLODE], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

// Lifts a world point according to the level it belongs to.
// The roof floats a bit more once the building is exploded.
export const roofLift = (e: number) => e + ROOF_FLOAT + e * 0.6;

export const lift = (p: P3, e: number): P3 => {
  if (p[2] >= 6.2) return [p[0], p[1], p[2] + roofLift(e)];
  if (p[2] >= 3) return [p[0], p[1], p[2] + e];
  return p;
};
export const liftAll = (ps: P3[], e: number) => ps.map((p) => lift(p, e));

// ---------- Roof (mono-pitch) ----------
export const ROOF = { x0: -0.3, x1: 10.3, y0: -0.3, y1: 4.8, zHigh: 7.2, zLow: 6.3, t: 0.25 };
export const roofTopZ = (y: number) =>
  ROOF.zLow + ROOF.t + ((ROOF.y1 - y) / (ROOF.y1 - ROOF.y0)) * (ROOF.zHigh - ROOF.zLow);

// ---------- Networks (VRD), from the street (x = 15.5) ----------
export const NET = {
  water: [
    [15.5, 1.8, -0.9],
    [1.6, 1.8, -0.9],
    [1.6, 1.8, 0.6],
    [1.35, 2.0, 0.6],
  ] as P3[],
  elec: [
    [15.5, 3.0, -0.7],
    [1.0, 3.0, -0.7],
    [1.0, 4.75, -0.7],
    [1.0, 4.75, 1.3],
    [0.5, 4.75, 1.3],
  ] as P3[],
  fiber: [
    [15.5, 3.7, -0.55],
    [1.3, 3.7, -0.55],
    [1.3, 4.6, -0.55],
    [1.3, 4.6, 0.85],
    [0.5, 4.6, 0.85],
  ] as P3[],
  sewer: [
    [6.5, 6.2, 0.35],
    [6.5, 6.2, -1.0],
    [15.5, 6.2, -1.5],
  ] as P3[],
};

// ---------- Heating ----------
export const HEAT = {
  hot: [
    [10.8, 0.95, 0.7],
    [10.2, 0.95, 0.7],
    [10.2, 1.25, 0.33],
    [1.3, 1.25, 0.33],
    [1.3, 0.9, 0.33],
    [1.12, 0.9, 0.6],
  ] as P3[],
  ret: [
    [10.8, 1.15, 0.5],
    [10.4, 1.15, 0.5],
    [10.4, 1.5, 0.33],
    [1.5, 1.5, 0.33],
    [1.5, 1.1, 0.33],
    [1.12, 1.1, 0.5],
  ] as P3[],
  feed: [
    [1.15, 1.0, 0.45],
    [3.2, 1.0, 0.45],
    [3.2, 2.0, 0.33],
  ] as P3[],
  riserLow: [
    [0.75, 1.4, 1.6],
    [0.75, 1.4, 3.0],
  ] as P3[],
  riserHigh: [
    [0.75, 1.4, 3.3],
    [0.75, 1.4, 3.75],
    [0.6, 2.0, 3.75],
  ] as P3[],
};

export const serpentine = (): P3[] => {
  const out: P3[] = [];
  const [x0, x1] = [3.2, 9.6];
  let row = 0;
  for (let y = 2.0; y <= 7.6; y += 0.4) {
    const [a, b] = row % 2 === 0 ? [x0, x1] : [x1, x0];
    out.push([a, y, 0.33], [b, y, 0.33]);
    row++;
  }
  return out;
};

// ---------- Ventilation (VMC double flux) ----------
export const VENT = {
  inLow: [
    [1.2, 3.3, 2.5],
    [1.6, 3.3, 2.85],
    [8.5, 3.3, 2.85],
    [8.5, 6.0, 2.85],
  ] as P3[],
  outLow: [
    [8.0, 2.1, 2.9],
    [1.6, 2.1, 2.9],
    [1.2, 3.0, 2.5],
  ] as P3[],
  riserLow: [
    [0.9, 4.0, 2.7],
    [0.9, 4.0, 3.0],
  ] as P3[],
  inHigh: [
    [0.9, 4.0, 3.3],
    [0.9, 4.0, 5.75],
    [7.5, 4.0, 5.75],
    [7.5, 2.5, 5.75],
  ] as P3[],
  exhaust: [
    [0.6, 3.5, 2.7],
    [0.6, 3.5, 3.0],
  ] as P3[],
  exhaustHigh: [
    [0.6, 3.5, 3.3],
    [0.6, 3.5, 6.75],
  ] as P3[],
};

// ---------- Solar ----------
export const SOLAR_LINE: P3[] = [
  [0.5, 4.3, 6.39],
  [0.5, 4.3, 3.3],
];
export const SOLAR_LINE_LOW: P3[] = [
  [0.5, 4.3, 3.0],
  [0.5, 4.3, 2.45],
  [0.5, 4.6, 2.45],
];
