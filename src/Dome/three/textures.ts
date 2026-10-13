import * as THREE from "three";
import { FONTS } from "../theme";

// Deterministic pseudo-random generator so every render is identical.
export const seeded = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const makeCanvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;
  return { c, ctx };
};

const toTexture = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const paperNoise = (ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, alpha = 0.05) => {
  const r = seeded(seed);
  for (let i = 0; i < (w * h) / 60; i++) {
    ctx.fillStyle = `rgba(80,60,40,${r() * alpha})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
};

const volcano = (ctx: CanvasRenderingContext2D, cx: number, base: number, w: number, h: number) => {
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, base);
  ctx.bezierCurveTo(cx - w * 0.25, base - h * 0.3, cx - w * 0.22, base - h, cx - w * 0.08, base - h);
  ctx.lineTo(cx + w * 0.08, base - h);
  ctx.bezierCurveTo(cx + w * 0.22, base - h, cx + w * 0.25, base - h * 0.3, cx + w / 2, base);
  ctx.closePath();
};

// ---------- Beer label (wraps ~290° around the bottle) ----------
export const beerLabel = () => {
  const [w, h] = [2048, 640];
  const { c, ctx } = makeCanvas(w, h);
  ctx.fillStyle = "#f3e6cc";
  ctx.fillRect(0, 0, w, h);
  paperNoise(ctx, w, h, 3, 0.08);
  // border
  ctx.strokeStyle = "#1c1a17";
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, w - 48, h - 48);
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, w - 88, h - 88);
  const cx = w / 2;
  // volcano emblem
  ctx.fillStyle = "#1c1a17";
  volcano(ctx, cx, 250, 300, 150);
  ctx.fill();
  ctx.fillStyle = "#e0661f";
  ctx.beginPath();
  ctx.arc(cx, 120, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = "#1c1a17";
  ctx.font = `200px ${FONTS.display}`;
  ctx.fillText("VOLCANE", cx, 440);
  ctx.font = `600 40px ${FONTS.sans}`;
  ctx.fillText("BIÈRE BLONDE D'AUVERGNE", cx, 510);
  ctx.font = `italic 34px ${FONTS.serif}`;
  ctx.fillStyle = "#7a3b12";
  ctx.fillText("Brassée au pied des volcans", cx, 568);
  // side text
  ctx.font = `600 34px ${FONTS.sans}`;
  ctx.fillStyle = "#1c1a17";
  ctx.fillText("33 cl · 5,5 % vol.", cx - 640, 330);
  ctx.fillText("Brasserie artisanale", cx + 640, 330);
  ctx.font = `90px ${FONTS.display}`;
  ctx.fillText("63", cx - 640, 260);
  ctx.fillText("★", cx + 640, 260);
  return toTexture(c);
};

// ---------- Wine label ----------
export const wineLabel = () => {
  const [w, h] = [1600, 900];
  const { c, ctx } = makeCanvas(w, h);
  ctx.fillStyle = "#f7f1e4";
  ctx.fillRect(0, 0, w, h);
  paperNoise(ctx, w, h, 11, 0.06);
  const cx = w / 2;
  ctx.strokeStyle = "#b08d3c";
  ctx.lineWidth = 6;
  ctx.strokeRect(cx - 420, 40, 840, h - 80);
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 400, 60, 800, h - 120);
  ctx.textAlign = "center";
  ctx.fillStyle = "#3b0a14";
  ctx.font = `italic 56px ${FONTS.serif}`;
  ctx.fillText("Domaine des", cx, 200);
  ctx.font = `700 120px ${FONTS.serif}`;
  ctx.fillText("Coulées", cx, 320);
  // vines line art
  ctx.strokeStyle = "#b08d3c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 250, 380);
  ctx.lineTo(cx + 250, 380);
  ctx.stroke();
  ctx.fillStyle = "#2a2a2a";
  volcano(ctx, cx, 560, 340, 120);
  ctx.fill();
  ctx.fillStyle = "#3b0a14";
  ctx.font = `600 42px ${FONTS.sans}`;
  ctx.fillText("CÔTES D'AUVERGNE", cx, 650);
  ctx.font = `400 30px ${FONTS.sans}`;
  ctx.fillText("Appellation Côtes d'Auvergne Contrôlée", cx, 705);
  ctx.font = `italic 400 48px ${FONTS.serif}`;
  ctx.fillText("Rouge · 2023", cx, 790);
  return toTexture(c);
};

// ---------- Honey jar label ----------
export const honeyLabel = () => {
  const [w, h] = [1400, 420];
  const { c, ctx } = makeCanvas(w, h);
  ctx.fillStyle = "#1f2a1c";
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.fillStyle = "#e9b949";
  ctx.font = `italic 70px ${FONTS.serif}`;
  ctx.fillText("Miel de montagne", w / 2, 170);
  ctx.font = `600 34px ${FONTS.sans}`;
  ctx.fillText("PARC DES VOLCANS D'AUVERGNE", w / 2, 250);
  ctx.font = `400 30px ${FONTS.sans}`;
  ctx.fillStyle = "#d8cdb0";
  ctx.fillText("Récolte d'été · 250 g", w / 2, 320);
  return toTexture(c);
};

// ---------- Wood ----------
export const woodTexture = (seed = 5, base = "#8a5a35") => {
  const [w, h] = [1024, 1024];
  const { c, ctx } = makeCanvas(w, h);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const r = seeded(seed);
  for (let i = 0; i < 260; i++) {
    const y = r() * h;
    ctx.strokeStyle = `rgba(${40 + r() * 40},${20 + r() * 20},10,${0.08 + r() * 0.18})`;
    ctx.lineWidth = 1 + r() * 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 32) {
      ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 6 + (r() - 0.5) * 2);
    }
    ctx.stroke();
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

// ---------- Cheese rind (Saint-Nectaire style) ----------
export const rindTexture = () => {
  const [w, h] = [1024, 512];
  const { c, ctx } = makeCanvas(w, h);
  ctx.fillStyle = "#b9a48a";
  ctx.fillRect(0, 0, w, h);
  const r = seeded(21);
  const tones = ["#d8c6a8", "#8f7a64", "#c9906a", "#e3d8c4", "#a69680", "#d6a77c"];
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = tones[Math.floor(r() * tones.length)];
    ctx.globalAlpha = 0.15 + r() * 0.35;
    ctx.beginPath();
    ctx.arc(r() * w, r() * h, 2 + r() * 14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

export const pasteTexture = () => {
  const [w, h] = [512, 256];
  const { c, ctx } = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#c8ad84");
  g.addColorStop(0.08, "#efdcae");
  g.addColorStop(0.92, "#f2e0b4");
  g.addColorStop(1, "#c8ad84");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = seeded(4);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = "rgba(190,160,110,0.55)";
    ctx.beginPath();
    ctx.ellipse(r() * w, 30 + r() * (h - 60), 2 + r() * 6, 1 + r() * 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(c);
};

// ---------- Dry sausage (saucisson) ----------
export const saucissonSkin = () => {
  const [w, h] = [1024, 256];
  const { c, ctx } = makeCanvas(w, h);
  ctx.fillStyle = "#6e2e24";
  ctx.fillRect(0, 0, w, h);
  const r = seeded(9);
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = r() > 0.5 ? "rgba(240,235,225,0.55)" : "rgba(120,60,50,0.6)";
    ctx.beginPath();
    ctx.arc(r() * w, r() * h, 1 + r() * 6, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

export const saucissonSlice = () => {
  const [w, h] = [512, 512];
  const { c, ctx } = makeCanvas(w, h);
  ctx.fillStyle = "#9b2f2f";
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
  ctx.fill();
  const r = seeded(13);
  for (let i = 0; i < 160; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * (w / 2 - 20);
    ctx.fillStyle = r() > 0.25 ? "rgba(245,228,215,0.95)" : "rgba(70,20,20,0.6)";
    ctx.beginPath();
    ctx.ellipse(w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, 4 + r() * 12, 3 + r() * 8, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#4a1c16";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 2 - 7, 0, Math.PI * 2);
  ctx.stroke();
  return toTexture(c);
};

// ---------- Soft contact shadow ----------
export const shadowTexture = () => {
  const [w, h] = [512, 512];
  const { c, ctx } = makeCanvas(w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(0,0,0,0.75)");
  g.addColorStop(0.4, "rgba(0,0,0,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return toTexture(c);
};

// ---------- Natural wine label: off-white paper, organic black shapes ----------
export const naturalWineLabel = () => {
  const [w, h] = [1000, 1100];
  const { c, ctx } = makeCanvas(w, h);
  ctx.fillStyle = "#ecebe3";
  ctx.fillRect(0, 0, w, h);
  paperNoise(ctx, w, h, 31, 0.05);
  const r = seeded(77);
  const cx = w / 2;
  const cy = 470;
  ctx.fillStyle = "#121212";
  // a cluster of soft pebble-like blobs held in a hand-drawn frame
  const blob = (x: number, y: number, rx: number, ry: number) => {
    ctx.beginPath();
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = 0.82 + r() * 0.3;
      const px = x + Math.cos(a) * rx * k;
      const py = y + Math.sin(a) * ry * k;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.quadraticCurveTo(x + Math.cos(a - 0.35) * rx * 1.1, y + Math.sin(a - 0.35) * ry * 1.1, px, py);
    }
    ctx.closePath();
    ctx.fill();
  };
  blob(cx - 120, cy - 60, 95, 120);
  blob(cx + 40, cy - 110, 80, 60);
  blob(cx + 150, cy - 20, 60, 150);
  blob(cx - 10, cy + 90, 110, 70);
  blob(cx - 210, cy + 110, 45, 60);
  ctx.strokeStyle = "#121212";
  ctx.lineWidth = 26;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 280, cy - 230);
  ctx.quadraticCurveTo(cx - 300, cy + 60, cx - 270, cy + 230);
  ctx.quadraticCurveTo(cx, cy + 250, cx + 250, cy + 220);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 240, cy - 240);
  ctx.quadraticCurveTo(cx + 270, cy - 120, cx + 245, cy + 40);
  ctx.stroke();
  // tiny ivory "eye" holes inside blobs
  ctx.fillStyle = "#ecebe3";
  ctx.beginPath();
  ctx.ellipse(cx + 30, cy - 105, 22, 16, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx - 20, cy + 95, 30, 14, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `600 40px ${FONTS.sans}`;
  ctx.fillText("C O U L É E S", cx, 880);
  ctx.font = `400 26px ${FONTS.sans}`;
  ctx.fillStyle = "#555";
  ctx.fillText("vin d'Auvergne · nature · 2023", cx, 935);
  return toTexture(c);
};

// ---------- Weathered barrel top (wine shop table) ----------
export const barrelTop = () => {
  const [w, h] = [1024, 1024];
  const { c, ctx } = makeCanvas(w, h);
  const r = seeded(55);
  const planks = 7;
  for (let i = 0; i < planks; i++) {
    const x0 = (i / planks) * w;
    const tone = 160 + r() * 30;
    ctx.fillStyle = `rgb(${tone + 10},${tone},${tone - 18})`;
    ctx.fillRect(x0, 0, w / planks, h);
    for (let k = 0; k < 40; k++) {
      ctx.strokeStyle = `rgba(90,75,60,${0.08 + r() * 0.15})`;
      ctx.lineWidth = 1 + r() * 2;
      const gx = x0 + r() * (w / planks);
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.bezierCurveTo(gx + 8, h * 0.3, gx - 8, h * 0.6, gx + 4, h);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(40,30,20,0.55)";
    ctx.fillRect(x0, 0, 4, h);
  }
  // old blue paint patches, like a reused shop barrel
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = `rgba(52,120,190,${0.45 + r() * 0.35})`;
    ctx.save();
    ctx.translate(560 + r() * 400, 300 + r() * 500);
    ctx.rotate(-0.5 + r() * 0.3);
    ctx.fillRect(0, 0, 60 + r() * 180, 20 + r() * 60);
    ctx.restore();
  }
  return toTexture(c);
};
