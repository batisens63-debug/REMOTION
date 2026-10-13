import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  darken,
  Drop,
  IsoBox,
  IsoCylinder,
  IsoPipe,
  IsoPoly,
  lighten,
  Particles,
  P3,
  pathD,
  prog,
  project,
  U,
} from "./iso";
import {
  COLORS as K,
  explodeAt,
  HEAT,
  lift,
  liftAll,
  NET,
  ROOF,
  roofLift,
  roofTopZ,
  serpentine,
  SOLAR_LINE,
  SOLAR_LINE_LOW,
  T,
  VENT,
} from "./scene";

const TERRAIN = { x0: -1, x1: 15.5, y0: -1, y1: 8 };

// A window drawn flat on a wall's interior face.
const WindowY: React.FC<{ x0: number; x1: number; z0: number; z1: number; y: number }> = ({
  x0,
  x1,
  z0,
  z1,
  y,
}) => (
  <g>
    <IsoPoly points={[[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]} fill="#ffffff" stroke="#9aa7b3" />
    <IsoPoly
      points={[[x0 + 0.1, y, z0 + 0.1], [x1 - 0.1, y, z0 + 0.1], [x1 - 0.1, y, z1 - 0.1], [x0 + 0.1, y, z1 - 0.1]]}
      fill="#bfe3f5"
    />
    <path d={pathD([[(x0 + x1) / 2, y, z0 + 0.1], [(x0 + x1) / 2, y, z1 - 0.1]])} stroke="#fff" strokeWidth={3} />
    <path
      d={pathD([[x0 + 0.3, y, z1 - 0.3], [x0 + 0.7, y, z0 + 0.5]])}
      stroke="#ffffff"
      strokeWidth={5}
      opacity={0.6}
      strokeLinecap="round"
    />
  </g>
);

const WindowX: React.FC<{ y0: number; y1: number; z0: number; z1: number; x: number }> = ({
  y0,
  y1,
  z0,
  z1,
  x,
}) => (
  <g>
    <IsoPoly points={[[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]]} fill="#ffffff" stroke="#9aa7b3" />
    <IsoPoly
      points={[[x, y0 + 0.1, z0 + 0.1], [x, y1 - 0.1, z0 + 0.1], [x, y1 - 0.1, z1 - 0.1], [x, y0 + 0.1, z1 - 0.1]]}
      fill="#bfe3f5"
    />
    <path d={pathD([[x, (y0 + y1) / 2, z0 + 0.1], [x, (y0 + y1) / 2, z1 - 0.1]])} stroke="#fff" strokeWidth={3} />
    <path
      d={pathD([[x, y0 + 0.3, z1 - 0.3], [x, y0 + 0.7, z0 + 0.5]])}
      stroke="#ffffff"
      strokeWidth={5}
      opacity={0.6}
      strokeLinecap="round"
    />
  </g>
);

// Circle drawn on a plane of constant y (e.g. the fan of the heat pump).
const circleY = (cx: number, y: number, cz: number, r: number): P3[] =>
  new Array(28).fill(0).map((_, i) => {
    const a = (i / 28) * Math.PI * 2;
    return [cx + r * Math.cos(a), y, cz + r * Math.sin(a)];
  });

const Tree: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const [tx, ty] = project([x, y, 1.6 * s]);
  return (
    <g>
      <IsoBox x={x - 0.1} y={y - 0.1} w={0.2} d={0.2} z={0} h={1.6 * s} color="#8a6146" />
      <ellipse cx={tx + 6} cy={ty + 8} rx={46 * s} ry={40 * s} fill="#5f9e55" />
      <ellipse cx={tx - 10} cy={ty - 12} rx={40 * s} ry={36 * s} fill="#77b665" />
      <ellipse cx={tx - 18} cy={ty - 22} rx={16 * s} ry={13 * s} fill="#9ad08a" />
    </g>
  );
};

// Wavy lines rising from the heated floor.
const HeatWaves: React.FC<{ opacity: number; e: number }> = ({ opacity, e }) => {
  const frame = useCurrentFrame();
  const spots: P3[] = [
    [4.5, 3.5, 0.4],
    [6.2, 4.6, 0.4],
    [8.4, 3.0, 0.4],
    [4.6, 6.4, 0.4],
    [8.8, 7.0, 0.4],
    [3.0, 2.6, 3.4],
    [5.0, 2.0, 3.4],
  ];
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity} fill="none" strokeLinecap="round">
      {spots.map((s, i) => {
        const cycle = ((frame + i * 13) % 60) / 60;
        const base = lift(s, e);
        const rise = cycle * 1.4;
        const wave: P3[] = new Array(12).fill(0).map((_, k) => {
          const z = base[2] + rise + k * 0.09;
          const off = Math.sin(k * 0.9 + frame * 0.15 + i) * 0.12;
          return [base[0] + off, base[1] - off, z];
        });
        return (
          <path
            key={i}
            d={pathD(wave)}
            stroke={K.hot}
            strokeWidth={3}
            opacity={Math.sin(cycle * Math.PI) * 0.8}
          />
        );
      })}
    </g>
  );
};

export const House: React.FC = () => {
  const frame = useCurrentFrame();
  const e = explodeAt(frame);
  const upShift = `translate(0 ${(-e * U).toFixed(2)})`;
  const roofShift = `translate(0 ${(-roofLift(e) * U).toFixed(2)})`;

  // Underground networks are fully visible during their scene,
  // dimmed afterwards and brought back for the final overview.
  const netOpacity =
    frame < T.structure + 40
      ? 1
      : interpolate(frame, [T.structure + 40, T.structure + 70, T.final, T.final + 30], [1, 0.45, 0.45, 1], {
          extrapolateRight: "clamp",
        });
  const xray = interpolate(
    frame,
    [T.networks, T.networks + 20, T.structure + 10, T.structure + 40],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const wallGrow = prog(frame, T.structure + 20, 30);
  const upWallGrow = prog(frame, T.structure + 70, 30);
  const heatOn = interpolate(frame, [T.heating + 100, T.heating + 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = 0.55 + 0.45 * Math.sin(frame * 0.12);

  return (
    <g>
      {/* Soft shadow under the diorama */}
      <Drop start={T.terrain} from={6}>
        <ellipse cx={project([7, 4, -3])[0]} cy={project([7, 4, -3])[1] + 70} rx={560} ry={120} fill="#5b6f82" opacity={0.18} filter="url(#blur)" />
      </Drop>

      {/* ---------- Terrain (soil strata) ---------- */}
      <Drop start={T.terrain} from={6}>
        <IsoBox x={TERRAIN.x0} y={TERRAIN.y0} w={TERRAIN.x1 - TERRAIN.x0} d={TERRAIN.y1 - TERRAIN.y0} z={-3} h={1.2} color={K.rock} />
      </Drop>
      <Drop start={T.terrain + 8} from={6}>
        <IsoBox x={TERRAIN.x0} y={TERRAIN.y0} w={TERRAIN.x1 - TERRAIN.x0} d={TERRAIN.y1 - TERRAIN.y0} z={-1.8} h={1.3} color={K.clay} />
      </Drop>
      <Drop start={T.terrain + 16} from={6}>
        <IsoBox
          x={TERRAIN.x0}
          y={TERRAIN.y0}
          w={TERRAIN.x1 - TERRAIN.x0}
          d={TERRAIN.y1 - TERRAIN.y0}
          z={-0.5}
          h={0.5}
          color={K.topsoil}
          top={K.grass}
        />
        {/* Street */}
        <IsoPoly points={[[13.6, -1, 0], [14.0, -1, 0], [14.0, 8, 0], [13.6, 8, 0]]} fill="#d9d6cf" />
        <IsoPoly points={[[14.0, -1, 0], [15.5, -1, 0], [15.5, 8, 0], [14.0, 8, 0]]} fill="#5d6670" />
        <path d={pathD([[14.75, -1, 0], [14.75, 8, 0]])} stroke="#f4f4f4" strokeWidth={2.5} strokeDasharray="14 12" />
        {/* Garden path */}
        <IsoPoly points={[[10, 7, 0], [13.6, 7, 0], [13.6, 7.6, 0], [10, 7.6, 0]]} fill="#e7dcc8" />
      </Drop>

      {/* X-ray tint while showing buried networks */}
      <IsoPoly
        points={[[TERRAIN.x0, TERRAIN.y0, 0], [TERRAIN.x1, TERRAIN.y0, 0], [TERRAIN.x1, TERRAIN.y1, 0], [TERRAIN.x0, TERRAIN.y1, 0]]}
        fill="#1d3550"
        opacity={xray * 0.38}
      />

      {/* ---------- Foundations ---------- */}
      <g opacity={prog(frame, T.foundations + 10, 15)}>
        <IsoPoly points={[[0, 0, 0], [10, 0, 0], [10, 8, 0], [0, 8, 0]]} fill="#4f3b2c" />
      </g>
      <Drop start={T.foundations + 25} from={3}>
        <IsoBox x={0} y={7.3} w={10} d={0.7} z={-1.3} h={0.4} color={K.concrete} hide={["right"]} />
        <path d={pathD([[0.2, 8, -1.2], [9.8, 8, -1.2]])} stroke="#6f7782" strokeWidth={2} />
        <path d={pathD([[0.2, 8, -1.0], [9.8, 8, -1.0]])} stroke="#6f7782" strokeWidth={2} />
      </Drop>
      <Drop start={T.foundations + 35} from={3}>
        <IsoBox x={0} y={7.6} w={10} d={0.4} z={-0.9} h={0.45} color={darken(K.concrete, 0.05)} hide={["right"]} />
      </Drop>
      <Drop start={T.foundations + 45} from={3}>
        <IsoBox x={0} y={0} w={10} d={8} z={-0.45} h={0.25} color={K.gravel} hide={["right"]} />
      </Drop>
      <Drop start={T.foundations + 55} from={3}>
        <IsoBox x={0} y={0} w={10} d={8} z={-0.2} h={0.2} color={K.insulation} hide={["right"]} />
      </Drop>

      {/* ---------- Buried networks ---------- */}
      <g opacity={netOpacity}>
        <IsoPipe points={NET.water} color={K.water} progress={prog(frame, T.networks + 20, 40)} />
        <IsoPipe points={NET.elec} color={K.elec} progress={prog(frame, T.networks + 35, 40)} width={5} />
        <IsoPipe points={NET.fiber} color={K.fiber} progress={prog(frame, T.networks + 50, 40)} width={4} />
        <IsoPipe points={NET.sewer} color={K.sewer} progress={prog(frame, T.networks + 65, 40)} width={8} flowSpeed={0.8} />
      </g>

      {/* ---------- Ground floor ---------- */}
      <Drop start={T.structure} from={4}>
        <IsoBox x={0} y={0} w={10} d={8} z={0} h={0.3} color={K.concrete} top={K.wood} />
        <IsoPoly points={[[0.35, 0.35, 0.3], [3.0, 0.35, 0.3], [3.0, 5.2, 0.3], [0.35, 5.2, 0.3]]} fill={K.tech} />
        <IsoPoly points={[[5.4, 4.6, 0.3], [9.4, 4.6, 0.3], [9.4, 7.5, 0.3], [5.4, 7.5, 0.3]]} fill="#d9b48a" opacity={0.7} />
      </Drop>

      {/* Underfloor heating (shown in transparency through the floor) */}
      <g opacity={0.6 + 0.4 * heatOn}>
        <IsoPipe points={HEAT.feed} color={K.hot} progress={prog(frame, T.heating + 70, 15)} width={4} flow={false} />
        <IsoPipe
          points={serpentine()}
          color={heatOn > 0 ? K.hot : "#e07a5f"}
          progress={prog(frame, T.heating + 80, 50)}
          width={3}
          flowSpeed={1.6}
        />
      </g>
      {heatOn > 0 ? (
        <path d={pathD(serpentine())} stroke={K.hot} strokeWidth={10} fill="none" opacity={0.18 * glow * heatOn} filter="url(#blur)" />
      ) : null}

      {/* Back walls: insulation + masonry, interior plaster */}
      {wallGrow > 0 ? (
        <g>
          <IsoBox x={0} y={0} w={10} d={0.12} z={0.3} h={2.7 * wallGrow} color={K.insulation} />
          <IsoBox x={0} y={0.12} w={10} d={0.23} z={0.3} h={2.7 * wallGrow} color={K.brick} left={K.plaster} />
          <IsoBox x={0} y={0.35} w={0.12} d={7.65} z={0.3} h={2.7 * wallGrow} color={K.insulation} />
          <IsoBox x={0.12} y={0.35} w={0.23} d={7.65} z={0.3} h={2.7 * wallGrow} color={K.brick} right={lighten(K.plaster, 0)} />
        </g>
      ) : null}
      <g opacity={prog(frame, T.structure + 50, 15)}>
        <WindowY x0={6.0} x1={8.0} z0={1.5} z1={2.5} y={0.36} />
        <WindowX y0={5.2} y1={7.4} z0={0.6} z1={2.6} x={0.36} />
      </g>

      {/* Kitchen, dining, living */}
      <Drop start={T.structure + 110} from={2}>
        <IsoBox x={5.0} y={0.35} w={4.0} d={0.65} z={0.3} h={0.9} color="#ffffff" top="#c9a27a" />
      </Drop>
      <Drop start={T.structure + 116} from={2}>
        <IsoBox x={5.7} y={2.7} w={0.1} d={0.1} z={0.3} h={0.7} color="#8a6146" />
        <IsoBox x={7.2} y={2.7} w={0.1} d={0.1} z={0.3} h={0.7} color="#8a6146" />
        <IsoBox x={5.7} y={3.5} w={0.1} d={0.1} z={0.3} h={0.7} color="#8a6146" />
        <IsoBox x={7.2} y={3.5} w={0.1} d={0.1} z={0.3} h={0.7} color="#8a6146" />
        <IsoBox x={5.6} y={2.6} w={1.8} d={1.1} z={1.0} h={0.08} color="#b98a5e" />
      </Drop>
      <Drop start={T.structure + 122} from={2}>
        <IsoBox x={6.0} y={5.3} w={2.6} d={0.3} z={0.3} h={0.95} color="#5c7fa3" />
        <IsoBox x={6.0} y={5.6} w={0.3} d={0.9} z={0.3} h={0.65} color="#5c7fa3" />
        <IsoBox x={6.3} y={5.6} w={2.0} d={0.9} z={0.3} h={0.45} color="#6f93b8" />
        <IsoBox x={8.3} y={5.6} w={0.3} d={0.9} z={0.3} h={0.65} color="#5c7fa3" />
      </Drop>

      {/* Electrical panel + fibre box on the technical wall */}
      <Drop start={T.networks + 110} from={1.5}>
        <IsoBox x={0.35} y={4.4} w={0.15} d={0.7} z={1.2} h={1.2} color="#eef1f4" right="#f9fafb" />
        <IsoPoly points={[[0.51, 4.5, 1.3], [0.51, 5.0, 1.3], [0.51, 5.0, 2.3], [0.51, 4.5, 2.3]]} fill="#dfe5ea" stroke="#9aa7b3" />
        <path d={pathD([[0.51, 4.55, 1.75], [0.51, 4.95, 1.75]])} stroke={K.elec} strokeWidth={3} />
        <path d={pathD([[0.51, 4.55, 2.0], [0.51, 4.95, 2.0]])} stroke={K.elec} strokeWidth={3} />
        <IsoBox x={0.35} y={4.4} w={0.12} d={0.5} z={0.65} h={0.4} color="#ffffff" />
        <circle cx={project([0.47, 4.8, 0.85])[0]} cy={project([0.47, 4.8, 0.85])[1]} r={2.5} fill={K.fiber} />
      </Drop>

      {/* Heating equipment */}
      <Drop start={T.heating + 30} from={2.5}>
        <IsoBox x={0.4} y={0.5} w={0.7} d={0.8} z={0.3} h={1.8} color="#f4f6f8" />
        <IsoPoly points={[[1.1, 0.7, 1.5], [1.1, 1.1, 1.5], [1.1, 1.1, 1.9], [1.1, 0.7, 1.9]]} fill="#2c3e50" />
        <circle cx={project([1.1, 0.9, 1.7])[0]} cy={project([1.1, 0.9, 1.7])[1]} r={3} fill="#5ee38f" opacity={glow} />
      </Drop>
      <Drop start={T.heating + 40} from={2.5}>
        <IsoCylinder id="ballon" cx={0.95} cy={2.1} z={0.3} r={0.45} h={1.6} color="#e8edf1" />
      </Drop>
      <g>
        <IsoPipe points={HEAT.hot} color={K.hot} progress={prog(frame, T.heating + 50, 30)} width={5} />
        <IsoPipe points={HEAT.ret} color={K.cold} progress={prog(frame, T.heating + 55, 30)} width={5} />
        <IsoPipe points={liftAll(HEAT.riserLow, e)} color={K.hot} progress={prog(frame, T.heating + 90, 15)} width={4} flow={false} />
      </g>

      {/* Ventilation unit + ducts (ground floor) */}
      <Drop start={T.ventilation + 10} from={2}>
        <IsoBox x={0.4} y={2.9} w={0.8} d={1.2} z={1.9} h={0.8} color="#c9d3dc" />
        <IsoPoly points={[[1.2, 3.1, 2.0], [1.2, 3.9, 2.0], [1.2, 3.9, 2.6], [1.2, 3.1, 2.6]]} fill="#aebccb" />
      </Drop>
      <IsoPipe points={VENT.outLow} color={K.airOut} progress={prog(frame, T.ventilation + 30, 30)} width={9} flow={false} />
      <IsoPipe points={VENT.inLow} color={K.airIn} progress={prog(frame, T.ventilation + 25, 30)} width={9} flow={false} />
      <IsoPipe points={liftAll(VENT.riserLow, e)} color={K.airIn} progress={prog(frame, T.ventilation + 40, 10)} width={9} flow={false} />
      <IsoPipe points={liftAll(VENT.exhaust, e)} color="#9aa7b3" progress={prog(frame, T.ventilation + 40, 10)} width={9} flow={false} />

      {/* Solar line (ground floor part) */}
      <IsoPipe points={liftAll(SOLAR_LINE_LOW, e)} color={K.elec} progress={prog(frame, T.energy + 60, 25)} width={4} flow={false} />
      <IsoPipe points={liftAll(SOLAR_LINE, e)} color={K.elec} progress={prog(frame, T.energy + 45, 20)} width={4} flow={false} />

      {/* Flows on the ground floor */}
      <g opacity={prog(frame, T.heating + 85, 20)}>
        <Particles points={HEAT.hot} color={K.hot} count={8} speed={0.1} size={4} />
        <Particles points={HEAT.ret} color={K.cold} count={8} speed={0.1} size={4} />
      </g>
      <g opacity={prog(frame, T.ventilation + 70, 20)}>
        <Particles points={VENT.inLow} color={K.airIn} count={7} speed={0.09} />
        <Particles points={VENT.outLow} color={K.airOut} count={6} speed={0.09} />
      </g>
      <g opacity={prog(frame, T.energy + 90, 20)}>
        <Particles points={liftAll([...SOLAR_LINE, ...SOLAR_LINE_LOW], e)} color={K.elec} count={6} speed={0.1} size={4} />
      </g>

      {/* ---------- Upper floor (lifted in exploded view) ---------- */}
      <g transform={upShift}>
        <Drop start={T.structure + 60} from={3}>
          <IsoBox x={0} y={0} w={10} d={4.5} z={3.0} h={0.3} color={K.concrete} top={K.wood} />
          <path d={pathD([[0, 4.5, 3.15], [10, 4.5, 3.15]])} stroke={K.insulation} strokeWidth={3} />
        </Drop>
        {upWallGrow > 0 ? (
          <g>
            <IsoBox x={0} y={0} w={10} d={0.12} z={3.3} h={2.7 * upWallGrow} color={K.insulation} />
            <IsoBox x={0} y={0.12} w={10} d={0.23} z={3.3} h={2.7 * upWallGrow} color={K.brick} left={K.plaster} />
            <IsoBox x={0} y={0.35} w={0.12} d={4.15} z={3.3} h={2.7 * upWallGrow} color={K.insulation} />
            <IsoBox x={0.12} y={0.35} w={0.23} d={4.15} z={3.3} h={2.7 * upWallGrow} color={K.brick} right={K.plaster} />
          </g>
        ) : null}
        <g opacity={prog(frame, T.structure + 100, 15)}>
          <WindowY x0={3.0} x1={4.6} z0={4.2} z1={5.4} y={0.36} />
          <WindowX y0={2.1} y1={3.5} z0={4.5} z1={5.5} x={0.36} />
        </g>
        <Drop start={T.structure + 128} from={2}>
          <IsoBox x={6.2} y={0.6} w={2.2} d={0.3} z={3.3} h={1.0} color="#8a6146" />
          <IsoBox x={6.2} y={0.9} w={2.2} d={2.2} z={3.3} h={0.5} color="#f4f1ec" top="#ffffff" />
          <IsoBox x={6.4} y={1.0} w={1.8} d={0.45} z={3.8} h={0.15} color="#dfe7ee" />
          <IsoBox x={6.2} y={2.0} w={2.2} d={1.1} z={3.8} h={0.06} color="#ef8f6a" />
          <IsoBox x={2.6} y={0.4} w={1.4} d={0.6} z={3.3} h={0.75} color="#c9a27a" />
        </Drop>
        {/* Radiator */}
        <Drop start={T.heating + 95} from={1.5}>
          <IsoBox x={0.35} y={2.0} w={0.15} d={1.4} z={3.6} h={0.65} color="#ffffff" />
          {[2.2, 2.5, 2.8, 3.1].map((y) => (
            <path key={y} d={pathD([[0.5, y, 3.65], [0.5, y, 4.2]])} stroke="#c8d0d8" strokeWidth={2} />
          ))}
          <IsoPoly
            points={[[0.51, 2.0, 3.6], [0.51, 3.4, 3.6], [0.51, 3.4, 4.25], [0.51, 2.0, 4.25]]}
            fill={K.hot}
            opacity={0.25 * heatOn * glow}
          />
        </Drop>
        <IsoPipe points={HEAT.riserHigh} color={K.hot} progress={prog(frame, T.heating + 100, 15)} width={4} flow={false} />
        <IsoPipe points={VENT.inHigh} color={K.airIn} progress={prog(frame, T.ventilation + 50, 30)} width={9} flow={false} />
        <IsoPipe points={VENT.exhaustHigh} color="#9aa7b3" progress={prog(frame, T.ventilation + 50, 20)} width={9} flow={false} />
      </g>

      <HeatWaves opacity={heatOn} e={e} />
      <g opacity={prog(frame, T.ventilation + 70, 20)}>
        <Particles points={liftAll(VENT.inHigh, e)} color={K.airIn} count={7} speed={0.09} />
        <Particles points={liftAll(VENT.exhaustHigh, e)} color={K.airOut} count={4} speed={0.09} />
      </g>

      {/* ---------- Roof + solar panels ---------- */}
      <g transform={roofShift}>
        <Drop start={T.structure + 105} from={4}>
          <IsoPoly
            points={[
              [ROOF.x1, ROOF.y0, ROOF.zHigh],
              [ROOF.x1, ROOF.y1, ROOF.zLow],
              [ROOF.x1, ROOF.y1, ROOF.zLow + ROOF.t],
              [ROOF.x1, ROOF.y0, ROOF.zHigh + ROOF.t],
            ]}
            fill="#59636e"
            stroke="#3a4048"
          />
          <IsoPoly
            points={[
              [ROOF.x0, ROOF.y1, ROOF.zLow],
              [ROOF.x1, ROOF.y1, ROOF.zLow],
              [ROOF.x1, ROOF.y1, ROOF.zLow + ROOF.t],
              [ROOF.x0, ROOF.y1, ROOF.zLow + ROOF.t],
            ]}
            fill="#6b7580"
            stroke="#3a4048"
          />
          <IsoPoly
            points={[
              [ROOF.x0, ROOF.y0, roofTopZ(ROOF.y0)],
              [ROOF.x1, ROOF.y0, roofTopZ(ROOF.y0)],
              [ROOF.x1, ROOF.y1, roofTopZ(ROOF.y1)],
              [ROOF.x0, ROOF.y1, roofTopZ(ROOF.y1)],
            ]}
            fill="#8b96a1"
            stroke="#3a4048"
          />
          {/* insulation line visible on the roof cut */}
          <path
            d={pathD([[ROOF.x0, ROOF.y1, ROOF.zLow + 0.12], [ROOF.x1, ROOF.y1, ROOF.zLow + 0.12]])}
            stroke={K.insulation}
            strokeWidth={4}
          />
        </Drop>
        {[0, 1].map((row) =>
          [0, 1, 2, 3].map((col) => {
            const x0 = 0.9 + col * 2.15;
            const y0 = 0.15 + row * 2.0;
            const [x1, y1] = [x0 + 2.0, y0 + 1.85];
            const zp = (y: number) => roofTopZ(y) + 0.05;
            const start = T.energy + 10 + (row * 4 + col) * 4;
            const shine = interpolate((frame - start) % 90, [0, 30], [0, 1], {
              extrapolateRight: "clamp",
            });
            return (
              <Drop key={`${row}-${col}`} start={start} from={2}>
                <IsoPoly
                  points={[[x0, y0, zp(y0)], [x1, y0, zp(y0)], [x1, y1, zp(y1)], [x0, y1, zp(y1)]]}
                  fill={K.solar}
                  stroke="#c9d6e6"
                  strokeWidth={1.4}
                />
                {[1, 2, 3].map((k) => {
                  const x = x0 + (k * (x1 - x0)) / 4;
                  return <path key={k} d={pathD([[x, y0, zp(y0)], [x, y1, zp(y1)]])} stroke="#3c5a8c" strokeWidth={1} />;
                })}
                {[1, 2].map((k) => {
                  const y = y0 + (k * (y1 - y0)) / 3;
                  return <path key={k} d={pathD([[x0, y, zp(y)], [x1, y, zp(y)]])} stroke="#3c5a8c" strokeWidth={1} />;
                })}
                <path
                  d={pathD([
                    [x0 + (x1 - x0) * shine, y0, zp(y0)],
                    [x0 + (x1 - x0) * Math.max(0, shine - 0.25), y1, zp(y1)],
                  ])}
                  stroke="#ffffff"
                  strokeWidth={6}
                  opacity={0.35 * Math.sin(shine * Math.PI)}
                />
              </Drop>
            );
          }),
        )}
        {/* VMC roof outlet */}
        <Drop start={T.ventilation + 60} from={1.5}>
          <IsoBox x={0.4} y={3.3} w={0.4} d={0.4} z={roofTopZ(3.7)} h={0.45} color="#9aa7b3" />
        </Drop>
      </g>

      {/* ---------- Garden equipment (front-right) ---------- */}
      <Drop start={T.networks + 80} from={2}>
        <IsoBox x={12.6} y={1.5} w={0.7} d={0.7} z={0} h={0.08} color="#7d8791" />
        <IsoBox x={12.6} y={2.7} w={0.6} d={0.45} z={0} h={1.1} color="#e9e4d8" />
        <IsoPoly points={[[12.75, 3.15, 0.45], [13.05, 3.15, 0.45], [13.05, 3.15, 0.85], [12.75, 3.15, 0.85]]} fill={K.elec} />
        <IsoBox x={12.7} y={3.5} w={0.5} d={0.5} z={0} h={0.08} color="#7d8791" />
        <IsoBox x={12.6} y={5.9} w={0.7} d={0.7} z={0} h={0.08} color="#6b737b" />
      </Drop>
      <Drop start={T.heating + 20} from={3}>
        <IsoBox x={10.8} y={0.5} w={1.3} d={0.75} z={0} h={1.1} color="#f2f4f6" />
        <IsoPoly points={circleY(11.45, 1.25, 0.55, 0.38)} fill="#c5ced6" stroke="#8796a5" />
        <g
          transform={`rotate(${(frame * 14) % 360} ${project([11.45, 1.25, 0.55])[0]} ${project([11.45, 1.25, 0.55])[1]})`}
        >
          {[0, 1, 2].map((k) => {
            const [cx, cy] = project([11.45, 1.25, 0.55]);
            return (
              <ellipse
                key={k}
                cx={cx}
                cy={cy - 8}
                rx={4}
                ry={9}
                fill="#7b8a99"
                transform={`rotate(${k * 120} ${cx} ${cy})`}
              />
            );
          })}
        </g>
      </Drop>
      <Drop start={T.structure + 135} from={3}>
        <Tree x={12.9} y={7.0} s={1.1} />
      </Drop>
    </g>
  );
};

