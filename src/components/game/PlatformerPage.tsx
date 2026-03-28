import { useEffect, useRef, useState, useCallback } from "react";
import { type Page } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface PlatformerPageProps {
  setCurrentPage: (page: Page) => void;
}

interface Rect { x: number; y: number; w: number; h: number; }
interface Platform extends Rect { type: "ground" | "brick" | "stone" | "snow" | "lava"; }
interface Enemy { x: number; y: number; w: number; h: number; vx: number; minX: number; maxX: number; dead: boolean; deadTimer: number; type: "goomba" | "koopa"; }
interface Coin { x: number; y: number; collected: boolean; anim: number; }
interface LevelData {
  platforms: Platform[];
  enemies: Enemy[];
  coins: Coin[];
  startX: number; startY: number;
  finishX: number; finishY: number;
  bg: string; bgColor2: string;
  name: string;
  requiredCoins: number;
  requiredKills: number;
}

const W = 800, H = 400;
const TILE = 16;

// ── УРОВНИ ─────────────────────────────────────────────────────────────────
function makeLevel1(): LevelData {
  return {
    name: "1-1: Грибное королевство",
    bg: "#5c94fc", bgColor2: "#a8d8f0",
    startX: 48, startY: 300,
    finishX: 720, finishY: 270,
    requiredCoins: 8,
    requiredKills: 2,
    platforms: [
      // ground
      { x: 0,   y: 368, w: 800, h: 32, type: "ground" },
      // platforms
      { x: 80,  y: 300, w: 96,  h: 16, type: "brick" },
      { x: 240, y: 264, w: 80,  h: 16, type: "brick" },
      { x: 360, y: 224, w: 80,  h: 16, type: "brick" },
      { x: 480, y: 264, w: 96,  h: 16, type: "brick" },
      { x: 624, y: 284, w: 128, h: 16, type: "brick" },
      { x: 160, y: 196, w: 64,  h: 16, type: "stone" },
    ],
    enemies: [
      { x: 96,  y: 348, w: 28, h: 20, vx: 1.0, minX: 0,   maxX: 170, dead: false, deadTimer: 0, type: "goomba" },
      { x: 490, y: 244, w: 28, h: 20, vx: 1.1, minX: 480, maxX: 570, dead: false, deadTimer: 0, type: "goomba" },
    ],
    coins: [
      { x: 104, y: 280, collected: false, anim: 0 },
      { x: 128, y: 280, collected: false, anim: 2 },
      { x: 152, y: 280, collected: false, anim: 4 },
      { x: 264, y: 244, collected: false, anim: 1 },
      { x: 288, y: 244, collected: false, anim: 3 },
      { x: 376, y: 204, collected: false, anim: 0 },
      { x: 400, y: 204, collected: false, anim: 2 },
      { x: 504, y: 244, collected: false, anim: 1 },
      { x: 528, y: 244, collected: false, anim: 3 },
      { x: 648, y: 264, collected: false, anim: 0 },
    ],
  };
}

function makeLevel2(): LevelData {
  return {
    name: "1-2: Ледяные пещеры",
    bg: "#c8e8ff", bgColor2: "#e8f4ff",
    startX: 32, startY: 316,
    finishX: 720, finishY: 220,
    requiredCoins: 8,
    requiredKills: 3,
    platforms: [
      { x: 0,   y: 348, w: 140, h: 52, type: "snow" },
      { x: 180, y: 320, w: 80,  h: 16, type: "snow" },
      { x: 300, y: 288, w: 80,  h: 16, type: "snow" },
      { x: 180, y: 248, w: 64,  h: 16, type: "snow" },
      { x: 80,  y: 208, w: 80,  h: 16, type: "snow" },
      { x: 220, y: 180, w: 64,  h: 16, type: "snow" },
      { x: 340, y: 212, w: 80,  h: 16, type: "stone" },
      { x: 460, y: 248, w: 80,  h: 16, type: "stone" },
      { x: 580, y: 216, w: 80,  h: 16, type: "snow" },
      { x: 680, y: 200, w: 96,  h: 16, type: "snow" },
    ],
    enemies: [
      { x: 192, y: 300, w: 28, h: 20, vx: 0.8, minX: 180, maxX: 255, dead: false, deadTimer: 0, type: "goomba" },
      { x: 352, y: 192, w: 28, h: 20, vx: 1.0, minX: 340, maxX: 415, dead: false, deadTimer: 0, type: "koopa" },
      { x: 590, y: 196, w: 28, h: 20, vx: 0.9, minX: 580, maxX: 655, dead: false, deadTimer: 0, type: "goomba" },
    ],
    coins: [
      { x: 200, y: 300, collected: false, anim: 0 },
      { x: 320, y: 268, collected: false, anim: 2 },
      { x: 196, y: 228, collected: false, anim: 1 },
      { x: 96,  y: 188, collected: false, anim: 3 },
      { x: 240, y: 160, collected: false, anim: 0 },
      { x: 364, y: 192, collected: false, anim: 2 },
      { x: 476, y: 228, collected: false, anim: 1 },
      { x: 596, y: 196, collected: false, anim: 3 },
      { x: 700, y: 180, collected: false, anim: 0 },
      { x: 724, y: 180, collected: false, anim: 2 },
    ],
  };
}

function makeLevel3(): LevelData {
  return {
    name: "1-3: Замок Боузера",
    bg: "#1a0500", bgColor2: "#2a0800",
    startX: 32, startY: 336,
    finishX: 720, finishY: 128,
    requiredCoins: 10,
    requiredKills: 5,
    platforms: [
      { x: 0,   y: 368, w: 110, h: 32, type: "lava" },
      { x: 140, y: 344, w: 70,  h: 16, type: "lava" },
      { x: 240, y: 312, w: 70,  h: 16, type: "lava" },
      { x: 340, y: 280, w: 70,  h: 16, type: "lava" },
      { x: 450, y: 248, w: 70,  h: 16, type: "lava" },
      { x: 340, y: 208, w: 70,  h: 16, type: "stone" },
      { x: 220, y: 224, w: 70,  h: 16, type: "stone" },
      { x: 110, y: 260, w: 70,  h: 16, type: "stone" },
      { x: 110, y: 180, w: 70,  h: 16, type: "stone" },
      { x: 240, y: 152, w: 70,  h: 16, type: "stone" },
      { x: 370, y: 168, w: 70,  h: 16, type: "stone" },
      { x: 500, y: 176, w: 70,  h: 16, type: "stone" },
      { x: 624, y: 144, w: 130, h: 16, type: "stone" },
    ],
    enemies: [
      { x: 150, y: 324, w: 28, h: 20, vx: 1.0, minX: 140, maxX: 205, dead: false, deadTimer: 0, type: "koopa" },
      { x: 252, y: 292, w: 28, h: 20, vx: 1.1, minX: 240, maxX: 305, dead: false, deadTimer: 0, type: "goomba" },
      { x: 460, y: 228, w: 28, h: 20, vx: 1.2, minX: 450, maxX: 515, dead: false, deadTimer: 0, type: "koopa" },
      { x: 512, y: 156, w: 28, h: 20, vx: 1.0, minX: 500, maxX: 565, dead: false, deadTimer: 0, type: "goomba" },
      { x: 636, y: 124, w: 28, h: 20, vx: 0.9, minX: 624, maxX: 748, dead: false, deadTimer: 0, type: "koopa" },
    ],
    coins: [
      { x: 156, y: 324, collected: false, anim: 0 },
      { x: 256, y: 292, collected: false, anim: 2 },
      { x: 360, y: 260, collected: false, anim: 1 },
      { x: 464, y: 228, collected: false, anim: 3 },
      { x: 356, y: 188, collected: false, anim: 0 },
      { x: 124, y: 240, collected: false, anim: 2 },
      { x: 124, y: 160, collected: false, anim: 1 },
      { x: 256, y: 132, collected: false, anim: 3 },
      { x: 384, y: 148, collected: false, anim: 0 },
      { x: 648, y: 124, collected: false, anim: 2 },
      { x: 672, y: 124, collected: false, anim: 1 },
      { x: 696, y: 124, collected: false, anim: 3 },
    ],
  };
}

const LEVELS = [makeLevel1, makeLevel2, makeLevel3];

// ── ПИКСЕЛЬНЫЕ ТЕКСТУРЫ ────────────────────────────────────────────────────
function drawTile(ctx: CanvasRenderingContext2D, type: Platform["type"], x: number, y: number, w: number, h: number) {
  const ts = TILE;
  if (type === "ground") {
    // Mario-style ground
    ctx.fillStyle = "#e06b30";
    ctx.fillRect(x, y, w, h);
    for (let tx = x; tx < x + w; tx += ts) {
      for (let ty = y; ty < y + h; ty += ts) {
        ctx.fillStyle = "#c8531a";
        ctx.fillRect(tx, ty, ts - 1, ts - 1);
        ctx.fillStyle = "#f08040";
        ctx.fillRect(tx + 1, ty + 1, ts - 3, 3);
        ctx.fillRect(tx + 1, ty + 1, 3, ts - 3);
      }
    }
    // top grass strip
    ctx.fillStyle = "#5cb840";
    ctx.fillRect(x, y, w, 5);
    ctx.fillStyle = "#7add50";
    ctx.fillRect(x, y, w, 2);
  } else if (type === "brick") {
    ctx.fillStyle = "#c8531a";
    ctx.fillRect(x, y, w, h);
    // brick pattern
    for (let tx = x; tx < x + w; tx += ts * 2) {
      for (let ty = y; ty < y + h; ty += 8) {
        const offset = (Math.floor((ty - y) / 8) % 2) * ts;
        ctx.fillStyle = "#a83e10";
        ctx.fillRect(tx + offset, ty, ts * 2 - 2, 7);
        ctx.fillStyle = "#e07030";
        ctx.fillRect(tx + offset + 1, ty + 1, ts * 2 - 4, 2);
      }
    }
    ctx.fillStyle = "#f09050";
    ctx.fillRect(x, y, w, 2);
  } else if (type === "stone") {
    ctx.fillStyle = "#888888";
    ctx.fillRect(x, y, w, h);
    for (let tx = x; tx < x + w; tx += ts) {
      for (let ty = y; ty < y + h; ty += ts) {
        ctx.fillStyle = "#666";
        ctx.fillRect(tx, ty, ts - 1, ts - 1);
        ctx.fillStyle = "#aaa";
        ctx.fillRect(tx + 1, ty + 1, ts - 3, 2);
        ctx.fillRect(tx + 1, ty + 1, 2, ts - 3);
      }
    }
    ctx.fillStyle = "#ccc";
    ctx.fillRect(x, y, w, 1);
  } else if (type === "snow") {
    ctx.fillStyle = "#8ab4cc";
    ctx.fillRect(x, y, w, h);
    for (let tx = x; tx < x + w; tx += ts) {
      for (let ty = y; ty < y + h; ty += ts) {
        ctx.fillStyle = "#6698b8";
        ctx.fillRect(tx, ty, ts - 1, ts - 1);
      }
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, w, 5);
    ctx.fillStyle = "#ddeeff";
    ctx.fillRect(x, y, w, 2);
  } else if (type === "lava") {
    ctx.fillStyle = "#8b1a00";
    ctx.fillRect(x, y, w, h);
    for (let tx = x; tx < x + w; tx += ts) {
      for (let ty = y; ty < y + h; ty += ts) {
        ctx.fillStyle = "#6e1200";
        ctx.fillRect(tx, ty, ts - 1, ts - 1);
      }
    }
    ctx.fillStyle = "#ff4400";
    ctx.fillRect(x, y, w, 4);
    ctx.fillStyle = "#ff8800";
    ctx.fillRect(x, y, w, 2);
  }
}

function drawMario(ctx: CanvasRenderingContext2D, x: number, y: number, facingRight: boolean, walkAnim: number, onGround: boolean, dead: boolean) {
  const px = Math.round(x), py = Math.round(y);
  ctx.save();
  if (!facingRight) {
    ctx.translate(px + 24, 0);
    ctx.scale(-1, 1);
    ctx.translate(-px, 0);
  }

  if (dead) {
    ctx.fillStyle = "#e84040";
    ctx.fillRect(px + 4, py + 8, 16, 24);
    ctx.fillStyle = "#f5c07a";
    ctx.fillRect(px + 4, py, 16, 12);
    ctx.fillStyle = "#c00";
    ctx.fillRect(px + 2, py - 4, 20, 6);
    ctx.restore();
    return;
  }

  // hat (red)
  ctx.fillStyle = "#cc0000";
  ctx.fillRect(px + 2, py - 2, 20, 4);
  ctx.fillRect(px + 6, py - 8, 12, 6);

  // hair / face
  ctx.fillStyle = "#f5c07a";
  ctx.fillRect(px + 4, py, 16, 12);

  // eyes
  ctx.fillStyle = "#333";
  ctx.fillRect(px + 8, py + 3, 2, 2);
  ctx.fillRect(px + 14, py + 3, 2, 2);

  // mustache
  ctx.fillStyle = "#7a4400";
  ctx.fillRect(px + 6, py + 6, 12, 3);

  // body (blue overalls)
  ctx.fillStyle = "#3355cc";
  ctx.fillRect(px + 4, py + 12, 16, 14);

  // shirt (red)
  ctx.fillStyle = "#cc0000";
  ctx.fillRect(px + 4, py + 12, 6, 8);
  ctx.fillRect(px + 14, py + 12, 6, 8);

  // buttons
  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(px + 10, py + 14, 3, 3);

  // legs animation
  const legPhase = onGround ? Math.sin(walkAnim * 0.28) : 0;
  ctx.fillStyle = "#3355cc";
  ctx.fillRect(px + 4, py + 26, 7, 6 + (legPhase > 0 ? 2 : 0));
  ctx.fillRect(px + 13, py + 26, 7, 6 + (legPhase < 0 ? 2 : 0));

  // shoes
  ctx.fillStyle = "#5a2a00";
  ctx.fillRect(px + 2, py + 30 + (legPhase > 0 ? 2 : 0), 10, 4);
  ctx.fillRect(px + 12, py + 30 + (legPhase < 0 ? 2 : 0), 10, 4);

  ctx.restore();
}

function drawGoomba(ctx: CanvasRenderingContext2D, e: Enemy, animFrame: number) {
  const px = Math.round(e.x), py = Math.round(e.y);
  if (e.dead) {
    // squished
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(px, py + e.h - 6, e.w, 6);
    ctx.fillStyle = "#a0522d";
    ctx.fillRect(px + 2, py + e.h - 9, e.w - 4, 5);
    return;
  }
  const walk = Math.floor(animFrame / 12) % 2;

  // body
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(px + 2, py + 6, e.w - 4, e.h - 6);

  // head
  ctx.fillStyle = "#a0522d";
  ctx.fillRect(px, py, e.w, 12);

  // eyebrows (angry)
  ctx.fillStyle = "#3a1a00";
  ctx.fillRect(px + 3, py + 2, 7, 3);
  ctx.fillRect(px + e.w - 10, py + 2, 7, 3);

  // eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 3, py + 4, 6, 5);
  ctx.fillRect(px + e.w - 9, py + 4, 6, 5);
  ctx.fillStyle = "#000";
  ctx.fillRect(px + 5, py + 5, 3, 3);
  ctx.fillRect(px + e.w - 7, py + 5, 3, 3);

  // feet
  ctx.fillStyle = "#3a1a00";
  if (walk === 0) {
    ctx.fillRect(px, py + e.h - 4, 10, 4);
    ctx.fillRect(px + e.w - 8, py + e.h - 2, 8, 2);
  } else {
    ctx.fillRect(px, py + e.h - 2, 8, 2);
    ctx.fillRect(px + e.w - 10, py + e.h - 4, 10, 4);
  }
}

function drawKoopa(ctx: CanvasRenderingContext2D, e: Enemy, animFrame: number) {
  const px = Math.round(e.x), py = Math.round(e.y);
  if (e.dead) {
    ctx.fillStyle = "#2d7a2d";
    ctx.fillRect(px + 2, py + 4, e.w - 4, e.h - 4);
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(px + 6, py + 6, e.w - 12, e.h - 10);
    return;
  }

  // shell
  ctx.fillStyle = "#2d7a2d";
  ctx.fillRect(px + 2, py + 6, e.w - 4, e.h - 6);
  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(px + 5, py + 9, e.w - 10, e.h - 14);
  ctx.fillStyle = "#2d7a2d";
  for (let i = 0; i < 3; i++) ctx.fillRect(px + 5, py + 9 + i * 3, e.w - 10, 1);

  // head
  ctx.fillStyle = "#5ab82a";
  ctx.fillRect(px + 4, py, e.w - 8, 10);

  // eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 5, py + 2, 5, 4);
  ctx.fillRect(px + e.w - 10, py + 2, 5, 4);
  ctx.fillStyle = "#000";
  ctx.fillRect(px + 7, py + 3, 2, 2);
  ctx.fillRect(px + e.w - 8, py + 3, 2, 2);

  // legs
  const walk = Math.floor(animFrame / 10) % 2;
  ctx.fillStyle = "#5ab82a";
  ctx.fillRect(px + 2, py + e.h - 5, 8, walk === 0 ? 5 : 3);
  ctx.fillRect(px + e.w - 10, py + e.h - 5, 8, walk === 1 ? 5 : 3);
}

function drawCoin(ctx: CanvasRenderingContext2D, cx: number, cy: number, anim: number) {
  const scale = 0.8 + 0.2 * Math.abs(Math.sin(anim * 0.05));
  const r = 7 * scale;
  ctx.fillStyle = "#FFD700";
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#FFA500";
  ctx.beginPath(); ctx.arc(cx - 1.5, cy - 1.5, r * 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath(); ctx.arc(cx - 2, cy - 2, r * 0.25, 0, Math.PI * 2); ctx.fill();
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number, y: number, locked: boolean) {
  ctx.fillStyle = locked ? "#888" : "#228B22";
  ctx.fillRect(x + 18, y, 4, 50);
  if (locked) {
    ctx.fillStyle = "#888";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText("🔒", x + 20, y + 60);
  } else {
    ctx.fillStyle = "#cc0000";
    ctx.beginPath();
    ctx.moveTo(x + 22, y);
    ctx.lineTo(x + 42, y + 12);
    ctx.lineTo(x + 22, y + 24);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, lvl: LevelData, frame: number, levelIdx: number) {
  // sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, lvl.bg);
  grad.addColorStop(1, lvl.bgColor2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  if (levelIdx === 0) {
    // clouds
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    const cx = [80, 220, 420, 600];
    for (const x of cx) {
      const bob = Math.sin(frame * 0.01 + x * 0.05) * 3;
      ctx.beginPath(); ctx.arc(x, 60 + bob, 24, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 28, 56 + bob, 30, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 58, 62 + bob, 22, 0, Math.PI * 2); ctx.fill();
    }
    // hills
    ctx.fillStyle = "#5cb840";
    ctx.beginPath(); ctx.arc(150, 370, 80, 0, Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(550, 370, 100, 0, Math.PI); ctx.fill();
    // bushes
    ctx.fillStyle = "#4aaa30";
    ctx.beginPath(); ctx.arc(300, 370, 28, 0, Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(680, 370, 22, 0, Math.PI); ctx.fill();
  } else if (levelIdx === 1) {
    // snowflakes
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 137 + frame * 0.5) % W);
      const sy = ((i * 61 + frame * 0.8) % H);
      ctx.fillRect(sx, sy, 2, 2);
    }
    // mountains
    ctx.fillStyle = "#b0cce0";
    ctx.beginPath(); ctx.moveTo(0, 370); ctx.lineTo(120, 200); ctx.lineTo(240, 370); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(200, 370); ctx.lineTo(380, 160); ctx.lineTo(560, 370); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(500, 370); ctx.lineTo(680, 210); ctx.lineTo(800, 370); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.moveTo(90, 240); ctx.lineTo(120, 200); ctx.lineTo(150, 240); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(340, 195); ctx.lineTo(380, 160); ctx.lineTo(420, 195); ctx.closePath(); ctx.fill();
  } else {
    // lava glow at bottom
    const lvg = ctx.createLinearGradient(0, H, 0, H - 80);
    lvg.addColorStop(0, "rgba(255,80,0,0.6)");
    lvg.addColorStop(1, "rgba(255,80,0,0)");
    ctx.fillStyle = lvg;
    ctx.fillRect(0, H - 80, W, 80);
    // lava bubbles
    for (let i = 0; i < 5; i++) {
      const bx = 80 + i * 150, by = H - 20 + Math.sin(frame * 0.05 + i) * 5;
      ctx.fillStyle = "rgba(255,120,0,0.7)";
      ctx.beginPath(); ctx.arc(bx, by, 8 + Math.sin(frame * 0.08 + i * 2) * 3, 0, Math.PI * 2); ctx.fill();
    }
    // torches
    ctx.fillStyle = "#5a3010";
    ctx.fillRect(50, 310, 6, 40);
    ctx.fillRect(750, 310, 6, 40);
    const flicker = Math.sin(frame * 0.2) * 3;
    ctx.fillStyle = "#ff8800";
    ctx.beginPath(); ctx.arc(53, 306 + flicker, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath(); ctx.arc(53, 308 + flicker, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ff8800";
    ctx.beginPath(); ctx.arc(753, 306 + flicker, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath(); ctx.arc(753, 308 + flicker, 4, 0, Math.PI * 2); ctx.fill();
  }
}

// ── ГЛАВНЫЙ КОМПОНЕНТ ──────────────────────────────────────────────────────
export default function PlatformerPage({ setCurrentPage }: PlatformerPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    p: { x: 48, y: 300, w: 24, h: 34, vx: 0, vy: 0, onGround: false, coyoteTime: 0, jumpBuffer: 0, facingRight: true, dead: false, deathTimer: 0 },
    level: null as LevelData | null,
    keys: {} as Record<string, boolean>,
    coins: 0,
    kills: 0,
    currentLevel: 0,
    status: "playing" as "playing" | "dead" | "win" | "levelwin",
    levelWinTimer: 0,
    animFrame: 0,
    walkAnim: 0,
  });

  const [uiState, setUiState] = useState({
    currentLevel: 0, coins: 0, kills: 0,
    status: "playing" as "playing" | "dead" | "win" | "levelwin",
    totalCoins: 10, requiredKills: 2, finishLocked: true,
  });

  const loadLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx]();
    const s = stateRef.current;
    s.level = lvl;
    s.currentLevel = idx;
    s.coins = 0;
    s.kills = 0;
    s.status = "playing";
    s.levelWinTimer = 0;
    s.p = { x: lvl.startX, y: lvl.startY, w: 24, h: 34, vx: 0, vy: 0, onGround: false, coyoteTime: 0, jumpBuffer: 0, facingRight: true, dead: false, deathTimer: 0 };
    setUiState({ currentLevel: idx, coins: 0, kills: 0, status: "playing", totalCoins: lvl.coins.length, requiredKills: lvl.requiredKills, finishLocked: true });
  }, []);

  useEffect(() => { loadLevel(0); }, [loadLevel]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = true;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => { stateRef.current.keys[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  const setTouchKey = (key: string, val: boolean) => { stateRef.current.keys[key] = val; };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const GRAVITY = 0.5;
    const JUMP_FORCE = -11.5;
    const SPEED = 3.8;

    function rectOverlap(a: Rect, b: Rect) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function update() {
      const s = stateRef.current;
      if (!s.level) return;
      const { p, level, keys } = s;

      if (s.status === "levelwin") {
        s.levelWinTimer++;
        if (s.levelWinTimer > 100) {
          if (s.currentLevel < 2) loadLevel(s.currentLevel + 1);
          else { s.status = "win"; setUiState(u => ({ ...u, status: "win" })); }
        }
        return;
      }

      if (s.status === "dead") {
        p.deathTimer++;
        p.vy += GRAVITY;
        p.y += p.vy;
        if (p.deathTimer > 90) loadLevel(s.currentLevel);
        return;
      }

      s.animFrame++;
      const left = keys["ArrowLeft"] || keys["KeyA"];
      const right = keys["ArrowRight"] || keys["KeyD"];
      const jumpKey = keys["ArrowUp"] || keys["KeyW"] || keys["Space"];

      // horizontal
      if (left)  { p.vx = -SPEED; p.facingRight = false; }
      else if (right) { p.vx = SPEED; p.facingRight = true; }
      else { p.vx *= 0.7; if (Math.abs(p.vx) < 0.1) p.vx = 0; }

      if ((left || right) && p.onGround) s.walkAnim++;

      // jump buffer: remember jump key for 10 frames
      if (jumpKey) p.jumpBuffer = 10;
      else if (p.jumpBuffer > 0) p.jumpBuffer--;

      // coyote time: can jump for 6 frames after leaving platform
      if (p.onGround) p.coyoteTime = 6;
      else if (p.coyoteTime > 0) p.coyoteTime--;

      // apply jump
      if (p.jumpBuffer > 0 && p.coyoteTime > 0) {
        p.vy = JUMP_FORCE;
        p.jumpBuffer = 0;
        p.coyoteTime = 0;
        p.onGround = false;
      }

      // variable jump height: release early = lower jump
      if (!jumpKey && p.vy < -4) p.vy += 1.5;

      p.vy += GRAVITY;
      if (p.vy > 16) p.vy = 16;

      // move X
      p.x += p.vx;
      p.onGround = false;

      // platform collision X
      for (const pl of level.platforms) {
        if (rectOverlap(p, pl)) {
          if (p.vx > 0) p.x = pl.x - p.w;
          else if (p.vx < 0) p.x = pl.x + pl.w;
          p.vx = 0;
        }
      }

      // move Y
      p.y += p.vy;

      // platform collision Y
      for (const pl of level.platforms) {
        if (rectOverlap(p, pl)) {
          if (p.vy > 0) { p.y = pl.y - p.h; p.vy = 0; p.onGround = true; }
          else if (p.vy < 0) { p.y = pl.y + pl.h; p.vy = 0; }
        }
      }

      // bounds
      p.x = Math.max(0, Math.min(W - p.w, p.x));

      // fall death
      if (p.y > H + 40) {
        s.status = "dead";
        p.dead = true;
        p.deathTimer = 0;
        p.vy = -8;
        setUiState(u => ({ ...u, status: "dead" }));
        return;
      }

      // enemies
      for (const e of level.enemies) {
        if (e.dead) { e.deadTimer++; continue; }
        e.x += e.vx;
        if (e.x <= e.minX) { e.x = e.minX; e.vx = Math.abs(e.vx); }
        if (e.x + e.w >= e.maxX) { e.x = e.maxX - e.w; e.vx = -Math.abs(e.vx); }

        // update enemy y to sit on platforms
        const er: Rect = { x: e.x, y: e.y, w: e.w, h: e.h };
        if (rectOverlap(p, er)) {
          const playerFeet = p.y + p.h;
          const enemyTop = e.y;
          if (p.vy > 0 && playerFeet - enemyTop < 18) {
            e.dead = true;
            e.deadTimer = 0;
            p.vy = -8;
            s.kills++;
            setUiState(u => {
              const newKills = s.kills;
              const locked = newKills < s.level!.requiredKills || s.coins < s.level!.requiredCoins;
              return { ...u, kills: newKills, finishLocked: locked };
            });
          } else {
            // die
            s.status = "dead";
            p.dead = true;
            p.deathTimer = 0;
            p.vy = -8;
            setUiState(u => ({ ...u, status: "dead" }));
            return;
          }
        }
      }

      // coins
      for (const c of level.coins) {
        if (c.collected) continue;
        c.anim++;
        const dx = p.x + p.w / 2 - c.x;
        const dy = p.y + p.h / 2 - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < 18) {
          c.collected = true;
          s.coins++;
          setUiState(u => {
            const newCoins = s.coins;
            const locked = s.kills < s.level!.requiredKills || newCoins < s.level!.requiredCoins;
            return { ...u, coins: newCoins, finishLocked: locked };
          });
        }
      }

      // finish — locked until conditions met
      const finishUnlocked = s.coins >= level.requiredCoins && s.kills >= level.requiredKills;
      if (finishUnlocked) {
        const fRect: Rect = { x: level.finishX, y: level.finishY, w: 44, h: 50 };
        if (rectOverlap(p, fRect)) {
          s.status = "levelwin";
          s.levelWinTimer = 0;
          setUiState(u => ({ ...u, status: "levelwin" }));
        }
      }
    }

    function draw() {
      const s = stateRef.current;
      if (!s.level) return;
      const { p, level } = s;
      ctx.clearRect(0, 0, W, H);

      drawBackground(ctx, level, s.animFrame, s.currentLevel);

      // platforms
      for (const pl of level.platforms) drawTile(ctx, pl.type, pl.x, pl.y, pl.w, pl.h);

      // coins
      for (const c of level.coins) {
        if (!c.collected) drawCoin(ctx, c.x, c.y, c.anim);
      }

      // enemies
      for (const e of level.enemies) {
        if (e.deadTimer > 40) continue;
        if (e.type === "goomba") drawGoomba(ctx, e, s.animFrame);
        else drawKoopa(ctx, e, s.animFrame);
      }

      // finish flag
      const finishUnlocked = s.coins >= level.requiredCoins && s.kills >= level.requiredKills;
      drawFlag(ctx, level.finishX, level.finishY, !finishUnlocked);

      // player
      drawMario(ctx, p.x, p.y, p.facingRight, s.walkAnim, p.onGround, p.dead);

      // overlays
      if (s.status === "dead") {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ff4444";
        ctx.font = "bold 40px 'VT323', monospace";
        ctx.textAlign = "center";
        ctx.fillText("💥 ОЙ!", W / 2, H / 2 - 10);
        ctx.fillStyle = "#fff";
        ctx.font = "18px 'IBM Plex Mono', monospace";
        ctx.fillText("Перезапуск...", W / 2, H / 2 + 28);
      }
      if (s.status === "levelwin") {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 44px 'VT323', monospace";
        ctx.textAlign = "center";
        const msgs = ["🎉 УРОВЕНЬ 1 ПРОЙДЕН!", "🎉 УРОВЕНЬ 2 ПРОЙДЕН!", "🏆 ЗАМОК ВЗЯТ!"];
        ctx.fillText(msgs[s.currentLevel] ?? "🎉", W / 2, H / 2 - 10);
        ctx.fillStyle = "#fff";
        ctx.font = "17px 'IBM Plex Mono', monospace";
        ctx.fillText(s.currentLevel < 2 ? "Следующий уровень..." : "Ты победил Боузера!", W / 2, H / 2 + 32);
      }
      if (s.status === "win") {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 46px 'VT323', monospace";
        ctx.textAlign = "center";
        ctx.fillText("🏆 ВСЕ УРОВНИ ПРОЙДЕНЫ!", W / 2, H / 2 - 20);
        ctx.fillStyle = "#aaffaa";
        ctx.font = "19px 'IBM Plex Mono', monospace";
        ctx.fillText("Нажми R чтобы сыграть снова", W / 2, H / 2 + 28);
      }
    }

    function loop() { update(); draw(); raf = requestAnimationFrame(loop); }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyR" && stateRef.current.status === "win") loadLevel(0);
    };
    window.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", onKey); };
  }, [loadLevel]);

  const lvlNames = ["1-1: Грибное королевство", "1-2: Ледяные пещеры", "1-3: Замок Боузера"];

  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      <div className="ms-panel w-full max-w-3xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-title text-base text-ms-primary">🕹️ ПЛАТФОРМЕР</span>
            <span className="ms-badge">{lvlNames[uiState.currentLevel]}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="ms-display gap-2">
              <span>🪙</span>
              <span className={`font-digit ${uiState.coins >= (uiState.totalCoins) ? "text-ms-success" : "text-ms-danger"}`}>
                {uiState.coins}/{uiState.totalCoins}
              </span>
            </div>
            <div className="ms-display gap-2">
              <span>💀</span>
              <span className={`font-digit ${uiState.kills >= uiState.requiredKills ? "text-ms-success" : "text-ms-danger"}`}>
                {uiState.kills}/{uiState.requiredKills}
              </span>
            </div>
            {uiState.finishLocked && uiState.status === "playing" && (
              <span className="ms-badge ms-badge-danger text-xs">🔒 Финиш закрыт</span>
            )}
            {!uiState.finishLocked && uiState.status === "playing" && (
              <span className="ms-badge ms-badge-success text-xs">🚩 Финиш открыт!</span>
            )}
            <button onClick={() => loadLevel(uiState.currentLevel)} className="ms-btn-secondary text-xs flex items-center gap-1">
              <Icon name="RotateCcw" size={12} /> Рестарт
            </button>
            <button onClick={() => setCurrentPage("game")} className="ms-btn-secondary text-xs flex items-center gap-1">
              <Icon name="ChevronLeft" size={13} /> Сапёр
            </button>
          </div>
        </div>
      </div>

      <div className="ms-board-container" style={{ maxWidth: "100%", overflowX: "auto" }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", imageRendering: "pixelated" }} />
      </div>

      <div className="flex items-center gap-3">
        <button onPointerDown={() => setTouchKey("ArrowLeft", true)} onPointerUp={() => setTouchKey("ArrowLeft", false)} onPointerLeave={() => setTouchKey("ArrowLeft", false)} className="ms-btn-secondary w-14 h-14 text-xl flex items-center justify-center select-none">◀</button>
        <button onPointerDown={() => setTouchKey("Space", true)} onPointerUp={() => setTouchKey("Space", false)} onPointerLeave={() => setTouchKey("Space", false)} className="ms-btn-primary w-16 h-14 text-2xl flex items-center justify-center select-none">↑</button>
        <button onPointerDown={() => setTouchKey("ArrowRight", true)} onPointerUp={() => setTouchKey("ArrowRight", false)} onPointerLeave={() => setTouchKey("ArrowRight", false)} className="ms-btn-secondary w-14 h-14 text-xl flex items-center justify-center select-none">▶</button>
      </div>

      <div className="text-xs font-mono text-ms-muted text-center">
        ⌨️ ←→ / WASD — движение · ↑ / W / Пробел — прыжок · 👾 Прыгай на врагов! · 🔒 Собери монеты и убей врагов чтобы открыть финиш
      </div>
    </div>
  );
}
