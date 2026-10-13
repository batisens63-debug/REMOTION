import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Isometric projection: x goes right-down, y goes left-down, z goes up.
// One world unit is roughly one meter.
export const U = 40;
const C = Math.cos(Math.PI / 6);

export type P3 = [number, number, number];
export type P2 = [number, number];

export const project = ([x, y, z]: P3): P2 => [
  (x - y) * C * U,
  (x + y) * 0.5 * U - z * U,
];

export const pts = (ps: P3[]) =>
  ps
    .map((p) => {
      const [sx, sy] = project(p);
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

export const pathD = (ps: P3[]) =>
  ps
    .map((p, i) => {
      const [sx, sy] = project(p);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(" ");

// ---------- Colors ----------

const toRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

const mix = (hex: string, target: number, amt: number) => {
  const rgb = toRgb(hex).map((c) => Math.round(c + (target - c) * amt));
  return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

export const lighten = (hex: string, amt: number) => mix(hex, 255, amt);
export const darken = (hex: string, amt: number) => mix(hex, 0, amt);

// ---------- Timing ----------

export const ease = Easing.bezier(0.33, 0, 0.2, 1);

export const prog = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

// Fades in at `start`, fades out at `end`.
export const window01 = (
  frame: number,
  start: number,
  end: number,
  fade = 12,
) =>
  Math.min(prog(frame, start, fade), 1 - prog(frame, end - fade, fade));

// ---------- Primitives ----------

type BoxProps = {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
  top?: string;
  left?: string;
  right?: string;
  opacity?: number;
  edge?: boolean;
  hide?: Array<"left" | "right" | "top">;
};

// `left` is the +y face (left on screen), `right` the +x face.
export const IsoBox: React.FC<BoxProps> = ({
  x,
  y,
  z,
  w,
  d,
  h,
  color,
  top,
  left,
  right,
  opacity = 1,
  edge = true,
  hide = [],
}) => {
  const hh = Math.max(h, 0.001);
  const stroke = edge ? darken(color, 0.38) : "none";
  const common = {
    stroke,
    strokeWidth: 0.7,
    strokeLinejoin: "round" as const,
  };
  return (
    <g opacity={opacity}>
      {hide.includes("left") ? null : <polygon
        points={pts([
          [x, y + d, z],
          [x + w, y + d, z],
          [x + w, y + d, z + hh],
          [x, y + d, z + hh],
        ])}
        fill={left ?? color}
        {...common}
      />}
      {hide.includes("right") ? null : <polygon
        points={pts([
          [x + w, y, z],
          [x + w, y + d, z],
          [x + w, y + d, z + hh],
          [x + w, y, z + hh],
        ])}
        fill={right ?? darken(color, 0.16)}
        {...common}
      />}
      {hide.includes("top") ? null : <polygon
        points={pts([
          [x, y, z + hh],
          [x + w, y, z + hh],
          [x + w, y + d, z + hh],
          [x, y + d, z + hh],
        ])}
        fill={top ?? lighten(color, 0.16)}
        {...common}
      />}
    </g>
  );
};

export const IsoPoly: React.FC<{
  points: P3[];
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}> = ({ points, fill, stroke = "none", strokeWidth = 0.7, opacity = 1 }) => (
  <polygon
    points={pts(points)}
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinejoin="round"
    opacity={opacity}
  />
);

export const IsoCylinder: React.FC<{
  id: string;
  cx: number;
  cy: number;
  z: number;
  r: number;
  h: number;
  color: string;
}> = ({ id, cx, cy, z, r, h, color }) => {
  const [bx, by] = project([cx, cy, z]);
  const ty = by - h * U;
  const rx = r * Math.SQRT2 * C * U;
  const ry = r * Math.SQRT2 * 0.5 * U;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={lighten(color, 0.1)} />
          <stop offset="0.45" stopColor={lighten(color, 0.35)} />
          <stop offset="1" stopColor={darken(color, 0.22)} />
        </linearGradient>
      </defs>
      <path
        d={`M${bx - rx} ${ty} L${bx - rx} ${by} A${rx} ${ry} 0 0 0 ${bx + rx} ${by} L${bx + rx} ${ty} Z`}
        fill={`url(#${id})`}
        stroke={darken(color, 0.38)}
        strokeWidth={0.7}
      />
      <ellipse
        cx={bx}
        cy={ty}
        rx={rx}
        ry={ry}
        fill={lighten(color, 0.3)}
        stroke={darken(color, 0.38)}
        strokeWidth={0.7}
      />
    </g>
  );
};

// ---------- Pipes & flows ----------

const segLengths = (ps: P3[]) => {
  const lens: number[] = [];
  for (let i = 1; i < ps.length; i++) {
    const [a, b] = [ps[i - 1], ps[i]];
    lens.push(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  return lens;
};

export const pointAt = (ps: P3[], t: number): P3 => {
  const lens = segLengths(ps);
  const total = lens.reduce((a, b) => a + b, 0);
  let dist = t * total;
  for (let i = 0; i < lens.length; i++) {
    if (dist <= lens[i] || i === lens.length - 1) {
      const k = lens[i] === 0 ? 0 : Math.min(dist / lens[i], 1);
      const [a, b] = [ps[i], ps[i + 1]];
      return [
        a[0] + (b[0] - a[0]) * k,
        a[1] + (b[1] - a[1]) * k,
        a[2] + (b[2] - a[2]) * k,
      ];
    }
    dist -= lens[i];
  }
  return ps[ps.length - 1];
};

export const pathLength = (ps: P3[]) =>
  segLengths(ps).reduce((a, b) => a + b, 0);

// A tube drawn on screen progressively; once complete, a dashed flow runs along it.
export const IsoPipe: React.FC<{
  points: P3[];
  color: string;
  width?: number;
  progress: number;
  flow?: boolean;
  flowSpeed?: number;
  opacity?: number;
}> = ({
  points,
  color,
  width = 6,
  progress,
  flow = true,
  flowSpeed = 1.2,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  if (progress <= 0) return null;
  const d = pathD(points);
  const dash = { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - progress };
  const flowOpacity = interpolate(progress, [0.95, 1], [0, 1], {
    extrapolateLeft: "clamp",
  });
  return (
    <g opacity={opacity} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={darken(color, 0.4)} strokeWidth={width + 3} {...dash} />
      <path d={d} stroke={color} strokeWidth={width} {...dash} />
      <path
        d={d}
        stroke={lighten(color, 0.55)}
        strokeWidth={width * 0.3}
        {...dash}
      />
      {flow ? (
        <path
          d={d}
          stroke="#ffffff"
          strokeWidth={width * 0.45}
          strokeDasharray="4 22"
          strokeDashoffset={-frame * flowSpeed}
          opacity={flowOpacity * 0.85}
        />
      ) : null}
    </g>
  );
};

// Small glowing particles travelling along a path (air, energy...).
export const Particles: React.FC<{
  points: P3[];
  color: string;
  count?: number;
  speed?: number;
  size?: number;
  opacity?: number;
}> = ({ points, color, count = 6, speed = 0.08, size = 5, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const len = pathLength(points);
  return (
    <g opacity={opacity}>
      {new Array(count).fill(0).map((_, i) => {
        const t = ((frame * speed) / len + i / count) % 1;
        const [sx, sy] = project(pointAt(points, t));
        const edgeFade = Math.min(t * 8, (1 - t) * 8, 1);
        return (
          <g key={i} opacity={edgeFade}>
            <circle cx={sx} cy={sy} r={size * 2} fill={color} opacity={0.25} />
            <circle cx={sx} cy={sy} r={size} fill={color} />
            <circle cx={sx} cy={sy} r={size * 0.4} fill="#fff" />
          </g>
        );
      })}
    </g>
  );
};

// Falls from above with a spring, as in isometric "drop-in" animations.
export const Drop: React.FC<{
  start: number;
  from?: number;
  children: React.ReactNode;
}> = ({ start, from = 4, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  const p = spring({
    frame: frame - start,
    fps,
    config: { damping: 13, stiffness: 120, mass: 0.8 },
  });
  return (
    <g
      transform={`translate(0 ${(-(1 - p) * from * U).toFixed(2)})`}
      opacity={Math.min(1, (frame - start) / 6)}
    >
      {children}
    </g>
  );
};
