import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { seeded } from "../three/textures";

// Backgrounds are drawn sharp then blurred, like a shallow depth of field photo.
const Blurred: React.FC<{ blur: number; children: React.ReactNode; scale?: number }> = ({ blur, children, scale = 1.05 }) => (
  <AbsoluteFill style={{ filter: `blur(${blur}px)`, transform: `scale(${scale})` }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {children}
    </svg>
  </AbsoluteFill>
);

// ---------- Wine shop: white wall, dark beams, shelves of bottles ----------
export const WineShop: React.FC = () => {
  const frame = useCurrentFrame();
  const r = seeded(101);
  const foil = ["#f1efe9", "#f1efe9", "#7a1020", "#1f2a5a", "#f1efe9", "#2d2a28", "#c9a24a"];
  const standing = new Array(26).fill(0).map((_, i) => ({ x: 40 + i * 72 + r() * 10, c: r() > 0.5 ? "#1d2a14" : "#3b2a12", lab: r() > 0.3 }));
  const lying = (y: number, seed: number) => {
    const q = seeded(seed);
    return new Array(34).fill(0).map((_, i) => ({ x: 30 + i * 56, y: y + (i % 2) * 6, c: foil[Math.floor(q() * foil.length)] }));
  };
  const drift = Math.sin(frame * 0.01) * 10;
  return (
    <AbsoluteFill style={{ background: "#d9d4ca" }}>
      <Blurred blur={7}>
        <g transform={`translate(${drift} 0)`}>
          <rect width={1920} height={1080} fill="#e3ded4" />
          {/* ceiling beams */}
          <path d="M-100 0 L620 0 L250 230 L-100 330 Z" fill="#4a3426" />
          <path d="M1080 0 L1500 0 L1250 160 L960 200 Z" fill="#3e2b20" />
          <path d="M1700 0 L2000 0 L2000 140 L1820 170 Z" fill="#3e2b20" />
          {/* top shelf, standing bottles */}
          {standing.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={330} width={34} height={150} rx={10} fill={b.c} />
              <rect x={b.x + 10} y={280} width={14} height={60} rx={5} fill={b.c} />
              {b.lab ? <rect x={b.x + 3} y={420} width={28} height={40} fill="#f1ede4" /> : null}
            </g>
          ))}
          <rect x={0} y={480} width={1920} height={26} fill="#6b4a32" />
          {/* lying bottles: we only see the bottoms & foils */}
          {[560, 700, 840].map((y, k) => (
            <g key={y}>
              {lying(y, 200 + k).map((b, i) => (
                <g key={i}>
                  <circle cx={b.x} cy={b.y} r={24} fill="#1c1a16" />
                  <circle cx={b.x} cy={b.y} r={17} fill={b.c} />
                </g>
              ))}
              <rect x={0} y={y + 34} width={1920} height={20} fill="#5e412c" />
            </g>
          ))}
          <rect x={0} y={920} width={1920} height={160} fill="#3b2a1e" />
        </g>
      </Blurred>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(20,12,8,0.25) 0%, rgba(20,12,8,0.15) 40%, rgba(20,12,8,0.85) 72%)" }} />
    </AbsoluteFill>
  );
};

// ---------- Gym: industrial hall, LED strips, yellow & green signage ----------
export const GymHall: React.FC<{ yellow: string; green: string }> = ({ yellow, green }) => {
  const frame = useCurrentFrame();
  const drift = frame * 0.6;
  return (
    <AbsoluteFill style={{ background: "#1a1b1d" }}>
      <Blurred blur={4} scale={1.08}>
        <g transform={`translate(${-drift} 0)`}>
          {/* corrugated ceiling */}
          <rect width={2200} height={330} fill="#b9bcc0" />
          {new Array(60).fill(0).map((_, i) => (
            <line key={i} x1={i * 40} y1={0} x2={i * 40 - 120} y2={330} stroke="#9a9ea3" strokeWidth={6} />
          ))}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={200 + i * 700}
              y={60 + i * 40}
              width={600}
              height={14}
              fill="#ffffff"
              transform={`rotate(-14 ${500 + i * 700} 80)`}
              style={{ filter: "drop-shadow(0 0 20px #fff)" }}
            />
          ))}
          {/* back wall */}
          <rect y={330} width={2200} height={400} fill="#eceeef" />
          {[300, 900, 1500, 2100].map((x) => (
            <rect key={x} x={x} y={330} width={18} height={400} fill={green} />
          ))}
          {/* dark sign panels */}
          <rect x={160} y={360} width={620} height={300} fill="#3a3d42" />
          <text x={470} y={490} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={70} fill="#fff">
            MUSCULATION
          </text>
          <text x={470} y={580} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={70} fill={green}>
            LIBRE
          </text>
          <rect x={980} y={360} width={620} height={300} fill="#2f3236" />
          <text x={1290} y={490} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={70} fill="#fff">
            MUSCULATION
          </text>
          <text x={1290} y={580} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={70} fill={green}>
            GUIDÉE
          </text>
          {/* machines silhouettes with yellow arms */}
          {[260, 620, 1100, 1500, 1880].map((x, i) => (
            <g key={x}>
              <rect x={x} y={600} width={26} height={180} fill="#111" />
              <rect x={x - 60} y={640 + (i % 2) * 20} width={170} height={22} fill={yellow} transform={`rotate(-25 ${x} 650)`} />
              <circle cx={x + 90} cy={760} r={46} fill="#141414" stroke="#2a2a2a" strokeWidth={10} />
            </g>
          ))}
          {/* rubber floor tiles in perspective */}
          <rect y={730} width={2200} height={350} fill="#232427" />
          {new Array(14).fill(0).map((_, i) => (
            <line key={`h${i}`} x1={0} y1={730 + i * i * 2.4 + i * 10} x2={2200} y2={730 + i * i * 2.4 + i * 10} stroke="#2f3034" strokeWidth={2} />
          ))}
          {new Array(30).fill(0).map((_, i) => (
            <line key={`v${i}`} x1={i * 90} y1={730} x2={(i - 15) * 220 + 1100} y2={1080} stroke="#2f3034" strokeWidth={2} />
          ))}
        </g>
      </Blurred>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,8,10,0.92) 0%, rgba(8,8,10,0.7) 45%, rgba(8,8,10,0.25) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- Barber shop: warm, dark, shelves & mirror lights ----------
export const BarberShop: React.FC = () => {
  const r = seeded(303);
  return (
    <AbsoluteFill style={{ background: "#1b130d" }}>
      <Blurred blur={12}>
        <rect width={1920} height={1080} fill="#2a1d14" />
        {/* mirror frames with warm bulbs */}
        {[1150, 1600].map((x) => (
          <g key={x}>
            <rect x={x} y={150} width={330} height={520} rx={20} fill="#3a2a1e" stroke="#6b4a2c" strokeWidth={14} />
            {new Array(6).fill(0).map((_, i) => (
              <circle key={i} cx={x + 30 + i * 54} cy={140} r={14} fill="#ffd9a0" style={{ filter: "drop-shadow(0 0 22px #ffb35a)" }} />
            ))}
          </g>
        ))}
        {/* product shelf */}
        <rect x={100} y={300} width={800} height={14} fill="#6b4a2c" />
        {new Array(14).fill(0).map((_, i) => (
          <rect key={i} x={120 + i * 55} y={300 - (60 + r() * 60)} width={36} height={60 + r() * 60} rx={6} fill={r() > 0.5 ? "#c9b49a" : "#3d2c20"} />
        ))}
        <rect x={0} y={760} width={1920} height={320} fill="#140e09" />
        {/* barber chair silhouette */}
        <path d="M1240 980 L1290 700 L1460 700 L1500 980 Z" fill="#0d0907" />
      </Blurred>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,7,5,0.9) 0%, rgba(10,7,5,0.6) 45%, rgba(10,7,5,0.2) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- Restaurant: copper perforated pendants, teal wall, backlit bar ----------
const Pendant: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={0} y1={-400} x2={0} y2={0} stroke="#111" strokeWidth={3} />
    <ellipse cx={0} cy={150} rx={150} ry={50} fill="#ffcf7a" opacity={0.5} style={{ filter: "blur(30px)" }} />
    <path d="M-110 120 C-110 20 -60 -10 0 -10 C60 -10 110 20 110 120 Z" fill="#d0743a" />
    {new Array(40).fill(0).map((_, i) => {
      const row = Math.floor(i / 10);
      const col = i % 10;
      const w = 30 + row * 20;
      return <circle key={i} cx={-w + (col * (2 * w)) / 9} cy={20 + row * 26} r={3.5} fill="#ffe6b0" />;
    })}
    <ellipse cx={0} cy={120} rx={110} ry={16} fill="#fff1c9" style={{ filter: "drop-shadow(0 0 25px #ffc46b)" }} />
  </g>
);

export const RestaurantRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.04) * 2;
  return (
    <AbsoluteFill style={{ background: "#141313" }}>
      <Blurred blur={5}>
        {/* ceiling + spots */}
        <rect width={1920} height={300} fill="#1b1a1c" />
        {[300, 700, 1100, 1500, 1800].map((x) => (
          <circle key={x} cx={x} cy={70} r={9} fill="#fff6dd" style={{ filter: "drop-shadow(0 0 18px #fff)" }} />
        ))}
        {/* teal wall left, dark wall elsewhere */}
        <rect y={300} width={520} height={520} fill="#2f6f73" />
        <rect x={520} y={300} width={1400} height={520} fill="#1d1c1c" />
        {/* orange ceiling band and backlit bar shelves */}
        <rect x={600} y={290} width={1100} height={40} fill="#c86a3a" />
        {new Array(4).fill(0).map((_, row) => (
          <g key={row}>
            <rect x={700} y={380 + row * 85} width={900} height={70} fill="#e9b26a" opacity={0.65} />
            {new Array(22).fill(0).map((_, i) => (
              <rect key={i} x={712 + i * 40} y={392 + row * 85} width={20} height={52} rx={4} fill="#5a3a1e" opacity={0.85} />
            ))}
          </g>
        ))}
        {/* ribbed bar counter + stools */}
        <rect x={640} y={720} width={1020} height={160} fill="#1a1d22" />
        {new Array(50).fill(0).map((_, i) => (
          <line key={i} x1={650 + i * 20} y1={720} x2={650 + i * 20} y2={880} stroke="#2c3138" strokeWidth={5} />
        ))}
        {[760, 960, 1160, 1360].map((x) => (
          <g key={x}>
            <path d={`M${x - 45} 760 Q${x} 700 ${x + 45} 760 L${x + 40} 800 L${x - 40} 800 Z`} fill="#8a4f2e" />
            <line x1={x - 30} y1={800} x2={x - 45} y2={960} stroke="#b08d5c" strokeWidth={6} />
            <line x1={x + 30} y1={800} x2={x + 45} y2={960} stroke="#b08d5c" strokeWidth={6} />
          </g>
        ))}
        {/* warm wood floor */}
        <rect y={880} width={1920} height={200} fill="#7a4a2a" />
        {/* palm */}
        {new Array(9).fill(0).map((_, i) => (
          <path key={i} d={`M1720 860 Q${1600 + i * 30} ${600 + (i % 3) * 30} ${1520 + i * 50} ${620 + (i % 4) * 40}`} stroke="#2e5a2a" strokeWidth={14} fill="none" />
        ))}
      </Blurred>
      {/* pendants stay a bit sharper: they are closer to camera */}
      <AbsoluteFill style={{ filter: "blur(1.5px)" }}>
        <svg width={1920} height={1080}>
          <g transform={`rotate(${sway} 960 0)`}>
            <Pendant x={250} y={110} s={1.1} />
            <Pendant x={980} y={90} s={0.9} />
            <Pendant x={1760} y={150} s={0.7} />
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(12,10,9,0.88) 0%, rgba(12,10,9,0.55) 42%, rgba(12,10,9,0.1) 100%)" }} />
    </AbsoluteFill>
  );
};
