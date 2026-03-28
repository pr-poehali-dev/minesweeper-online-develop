import { useEffect, useRef, useState, useCallback } from "react";
import { type Page } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface PlatformerPageProps { setCurrentPage: (page: Page) => void; }
interface Rect { x: number; y: number; w: number; h: number; }
interface Platform extends Rect { type: "ground" | "brick" | "qblock" | "stone" | "snow" | "lava" | "pipe"; }
interface Enemy { x: number; y: number; w: number; h: number; vx: number; minX: number; maxX: number; dead: boolean; deadTimer: number; type: "goomba" | "koopa"; }
interface Coin { x: number; y: number; collected: boolean; anim: number; }
interface LevelData {
  platforms: Platform[];
  enemies: Enemy[];
  coins: Coin[];
  startX: number; startY: number;
  finishX: number; finishY: number;   // финиш = верх флагштока; блоки-постамент генерируются автоматически
  finishGroundY: number;              // y земли под флагштоком
  bg: string; bgColor2: string;
  name: string;
  requiredCoins: number;
  requiredKills: number;
}

const W = 800, H = 400;

// NES-палитра
const C = {
  skyBlue:  "#5c94fc", skyBlue2: "#9ab8fc",
  brickDk:  "#8b2800", brickMd: "#c84010", brickLt: "#e05828",
  groundDk: "#8b4020", groundMd: "#c85830", groundLt: "#e07040", groundGrass: "#5cb840", groundGrassLt: "#78d050",
  qblockYel:"#e8b000", qblockLt: "#f8d000", qblockDk: "#b07800", qblockEye: "#000",
  stoneDk:  "#505050", stoneMd: "#787878", stoneLt: "#a8a8a8",
  snowDk:   "#6898b8", snowMd:  "#8ab4cc", snowWht: "#e8f4ff", snowTop: "#ffffff",
  lavaDk:   "#6a1000", lavaMd:  "#a02000", lavaLt:  "#cc3000", lavaGlow: "#ff5500",
  pipeDk:   "#007000", pipeMd:  "#00a800", pipeLt:  "#00d000", pipeSh:  "#005000",
};

// ── УРОВНИ ───────────────────────────────────────────────────────────────────
function makeLevel1(): LevelData {
  // Финиш на x=720, земля y=368. Флагшток стоит на двух каменных блоках 720..752 y=336..368
  return {
    name: "1-1: Грибное королевство",
    bg: C.skyBlue, bgColor2: C.skyBlue2,
    startX: 48, startY: 300,
    finishX: 728, finishY: 240, finishGroundY: 368,
    requiredCoins: 8, requiredKills: 2,
    platforms: [
      { x: 0,   y: 368, w: 800, h: 32, type: "ground" },
      // подиум финиша — 2 каменных блока
      { x: 720, y: 336, w: 32, h: 32, type: "stone" },
      // платформы уровня
      { x: 80,  y: 300, w: 96,  h: 16, type: "brick" },
      { x: 240, y: 264, w: 80,  h: 16, type: "brick" },
      { x: 360, y: 224, w: 80,  h: 16, type: "qblock" },
      { x: 480, y: 264, w: 96,  h: 16, type: "brick" },
      { x: 160, y: 196, w: 64,  h: 16, type: "stone" },
      // труба-декорация
      { x: 580, y: 320, w: 48,  h: 48, type: "pipe" },
    ],
    enemies: [
      { x: 96,  y: 348, w: 28, h: 20, vx: 1.0, minX: 0,   maxX: 170, dead: false, deadTimer: 0, type: "goomba" },
      { x: 490, y: 244, w: 28, h: 20, vx: 1.1, minX: 480, maxX: 570, dead: false, deadTimer: 0, type: "goomba" },
    ],
    coins: [
      { x: 104, y: 278, collected: false, anim: 0 },
      { x: 128, y: 278, collected: false, anim: 2 },
      { x: 152, y: 278, collected: false, anim: 4 },
      { x: 264, y: 242, collected: false, anim: 1 },
      { x: 288, y: 242, collected: false, anim: 3 },
      { x: 376, y: 202, collected: false, anim: 0 },
      { x: 400, y: 202, collected: false, anim: 2 },
      { x: 504, y: 242, collected: false, anim: 1 },
      { x: 528, y: 242, collected: false, anim: 3 },
      { x: 184, y: 174, collected: false, anim: 0 },
    ],
  };
}

function makeLevel2(): LevelData {
  return {
    name: "1-2: Ледяные пещеры",
    bg: "#c8e8ff", bgColor2: "#e8f4ff",
    startX: 32, startY: 316,
    finishX: 724, finishY: 168, finishGroundY: 348,
    requiredCoins: 8, requiredKills: 3,
    platforms: [
      { x: 0,   y: 348, w: 140, h: 52, type: "snow" },
      // подиум финиша
      { x: 712, y: 200, w: 48,  h: 16, type: "stone" },
      { x: 712, y: 216, w: 48,  h: 16, type: "stone" },
      { x: 712, y: 232, w: 48,  h: 16, type: "stone" },
      { x: 712, y: 248, w: 48,  h: 16, type: "stone" },
      { x: 712, y: 264, w: 48,  h: 16, type: "stone" },
      { x: 712, y: 280, w: 48,  h: 16, type: "stone" },
      { x: 712, y: 296, w: 48,  h: 16, type: "stone" },
      { x: 712, y: 312, w: 48,  h: 16, type: "stone" },
      { x: 712, y: 328, w: 48,  h: 36, type: "stone" },
      // платформы
      { x: 180, y: 320, w: 80,  h: 16, type: "snow" },
      { x: 300, y: 288, w: 80,  h: 16, type: "snow" },
      { x: 180, y: 248, w: 64,  h: 16, type: "snow" },
      { x: 80,  y: 208, w: 80,  h: 16, type: "snow" },
      { x: 220, y: 180, w: 64,  h: 16, type: "snow" },
      { x: 340, y: 212, w: 80,  h: 16, type: "stone" },
      { x: 460, y: 248, w: 80,  h: 16, type: "stone" },
      { x: 560, y: 216, w: 80,  h: 16, type: "snow" },
    ],
    enemies: [
      { x: 192, y: 300, w: 28, h: 20, vx: 0.8, minX: 180, maxX: 255, dead: false, deadTimer: 0, type: "goomba" },
      { x: 352, y: 192, w: 28, h: 20, vx: 1.0, minX: 340, maxX: 415, dead: false, deadTimer: 0, type: "koopa" },
      { x: 572, y: 196, w: 28, h: 20, vx: 0.9, minX: 560, maxX: 635, dead: false, deadTimer: 0, type: "goomba" },
    ],
    coins: [
      { x: 200, y: 300, collected: false, anim: 0 },
      { x: 320, y: 268, collected: false, anim: 2 },
      { x: 196, y: 228, collected: false, anim: 1 },
      { x: 96,  y: 188, collected: false, anim: 3 },
      { x: 240, y: 160, collected: false, anim: 0 },
      { x: 364, y: 192, collected: false, anim: 2 },
      { x: 476, y: 228, collected: false, anim: 1 },
      { x: 584, y: 196, collected: false, anim: 3 },
      { x: 232, y: 160, collected: false, anim: 0 },
      { x: 104, y: 188, collected: false, anim: 2 },
    ],
  };
}

function makeLevel3(): LevelData {
  return {
    name: "1-3: Замок Боузера",
    bg: "#1a0500", bgColor2: "#2a0800",
    startX: 32, startY: 336,
    finishX: 724, finishY: 112, finishGroundY: 368,
    requiredCoins: 10, requiredKills: 5,
    platforms: [
      { x: 0,   y: 368, w: 110, h: 32, type: "lava" },
      // подиум финиша — башня из блоков от земли
      { x: 712, y: 144, w: 48, h: 224, type: "stone" },
      // платформы
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
      { x: 600, y: 144, w: 80,  h: 16, type: "stone" },
    ],
    enemies: [
      { x: 150, y: 324, w: 28, h: 20, vx: 1.0, minX: 140, maxX: 205, dead: false, deadTimer: 0, type: "koopa" },
      { x: 252, y: 292, w: 28, h: 20, vx: 1.1, minX: 240, maxX: 305, dead: false, deadTimer: 0, type: "goomba" },
      { x: 460, y: 228, w: 28, h: 20, vx: 1.2, minX: 450, maxX: 515, dead: false, deadTimer: 0, type: "koopa" },
      { x: 512, y: 156, w: 28, h: 20, vx: 1.0, minX: 500, maxX: 565, dead: false, deadTimer: 0, type: "goomba" },
      { x: 610, y: 124, w: 28, h: 20, vx: 0.9, minX: 600, maxX: 675, dead: false, deadTimer: 0, type: "koopa" },
    ],
    coins: [
      { x: 156, y: 322, collected: false, anim: 0 },
      { x: 256, y: 290, collected: false, anim: 2 },
      { x: 360, y: 258, collected: false, anim: 1 },
      { x: 464, y: 226, collected: false, anim: 3 },
      { x: 356, y: 186, collected: false, anim: 0 },
      { x: 124, y: 238, collected: false, anim: 2 },
      { x: 124, y: 158, collected: false, anim: 1 },
      { x: 256, y: 130, collected: false, anim: 3 },
      { x: 384, y: 146, collected: false, anim: 0 },
      { x: 516, y: 154, collected: false, anim: 2 },
      { x: 616, y: 122, collected: false, anim: 1 },
      { x: 640, y: 122, collected: false, anim: 3 },
    ],
  };
}

const LEVELS = [makeLevel1, makeLevel2, makeLevel3];

// ══════════════════════════════════════════════════════════════════════════════
//  ПИКСЕЛЬНЫЕ ТЕКСТУРЫ
// ══════════════════════════════════════════════════════════════════════════════

const T = 16; // tile size

function drawGroundTile(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // NES-стиль земляного блока: оранжево-коричневый кирпич с тёмными линиями
  ctx.fillStyle = C.groundMd; ctx.fillRect(x, y, T, T);
  // тёмные разделители
  ctx.fillStyle = C.groundDk;
  ctx.fillRect(x, y, T, 1);
  ctx.fillRect(x, y, 1, T);
  // светлые пиксели левый верх
  ctx.fillStyle = C.groundLt;
  ctx.fillRect(x + 1, y + 1, 6, 1);
  ctx.fillRect(x + 1, y + 1, 1, 6);
}

function drawGround(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // верхняя полоска травы
  ctx.fillStyle = C.groundGrass;
  ctx.fillRect(x, y, w, 8);
  ctx.fillStyle = C.groundGrassLt;
  ctx.fillRect(x, y, w, 3);
  // тело
  for (let ty = y + 8; ty < y + h; ty += T) {
    for (let tx = x; tx < x + w; tx += T) {
      drawGroundTile(ctx, tx, ty);
    }
  }
  // тёмная линия под травой
  ctx.fillStyle = C.groundDk;
  ctx.fillRect(x, y + 8, w, 2);
}

function drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.brickMd;
  ctx.fillRect(x, y, w, h);
  for (let ty = 0; ty < h; ty += 8) {
    const offset = (Math.floor(ty / 8) % 2 === 0) ? 0 : T;
    for (let tx = -offset; tx < w + T; tx += T * 2) {
      // тёмный разделитель по вертикали
      ctx.fillStyle = C.brickDk;
      ctx.fillRect(x + tx + T - 1, y + ty, 2, 8);
    }
    // горизонтальная линия
    ctx.fillStyle = C.brickDk;
    ctx.fillRect(x, y + ty + 7, w, 1);
    // светлый блик
    ctx.fillStyle = C.brickLt;
    ctx.fillRect(x, y + ty, w, 1);
  }
  // общий блик сверху
  ctx.fillStyle = C.brickLt;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
}

function drawQBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  const bounce = Math.floor(frame / 8) % 4;
  // основа
  ctx.fillStyle = C.qblockYel;
  ctx.fillRect(x, y, w, h);
  // рамка
  ctx.fillStyle = C.qblockDk;
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillRect(x, y, 2, h);
  ctx.fillRect(x + w - 2, y, 2, h);
  ctx.fillStyle = C.qblockLt;
  ctx.fillRect(x + 2, y + 2, w - 4, 2);
  ctx.fillRect(x + 2, y + 2, 2, h - 4);
  // символ ?
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.floor(h * 0.75)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", x + w / 2 + (bounce > 1 ? 1 : 0), y + h / 2);
}

function drawStone(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.stoneMd;
  ctx.fillRect(x, y, w, h);
  for (let ty = y; ty < y + h; ty += T) {
    const rowOffset = (Math.floor((ty - y) / T) % 2) * (T / 2);
    for (let tx = x - rowOffset; tx < x + w + T; tx += T) {
      ctx.fillStyle = C.stoneDk;
      ctx.fillRect(Math.max(x, tx + T - 1), ty, 1, T - 1);
      ctx.fillRect(x, ty + T - 1, w, 1);
      ctx.fillStyle = C.stoneLt;
      ctx.fillRect(Math.max(x, tx), ty, Math.min(3, w), 1);
      ctx.fillRect(Math.max(x, tx), ty, 1, Math.min(3, T - 1));
    }
  }
  ctx.fillStyle = C.stoneLt;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
}

function drawSnow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.snowMd;
  ctx.fillRect(x, y, w, h);
  // снежная шапка
  ctx.fillStyle = C.snowWht;
  ctx.fillRect(x, y, w, 6);
  ctx.fillStyle = C.snowTop;
  ctx.fillRect(x, y, w, 2);
  // текстура льда
  ctx.fillStyle = C.snowDk;
  for (let ty = y + 6; ty < y + h; ty += T) {
    ctx.fillRect(x, ty, w, 1);
    for (let tx = x; tx < x + w; tx += T) {
      ctx.fillRect(tx, ty, 1, T);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(tx + 2, ty + 2, 4, 2);
      ctx.fillStyle = C.snowDk;
    }
  }
}

function drawLava(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  ctx.fillStyle = C.lavaMd;
  ctx.fillRect(x, y, w, h);
  for (let ty = y + 4; ty < y + h; ty += T) {
    for (let tx = x; tx < x + w; tx += T) {
      ctx.fillStyle = C.lavaDk;
      ctx.fillRect(tx, ty, T - 1, T - 1);
      ctx.fillStyle = C.lavaLt;
      ctx.fillRect(tx + 1, ty + 1, 3, 2);
    }
  }
  // анимированный верх лавы
  ctx.fillStyle = C.lavaGlow;
  ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = "#ff8800";
  ctx.fillRect(x, y, w, 2);
  // пузыри
  const bubbleOffset = (frame * 2) % (w + 20);
  ctx.fillStyle = "rgba(255,140,0,0.7)";
  ctx.beginPath();
  ctx.arc(x + bubbleOffset % w, y + 1, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // тело трубы
  ctx.fillStyle = C.pipeMd;
  ctx.fillRect(x + 4, y + 16, w - 8, h - 16);
  // тёмные полосы
  ctx.fillStyle = C.pipeDk;
  ctx.fillRect(x + 4, y + 16, 4, h - 16);
  ctx.fillStyle = C.pipeLt;
  ctx.fillRect(x + 8, y + 16, 3, h - 16);
  // голова трубы (шире)
  ctx.fillStyle = C.pipeMd;
  ctx.fillRect(x, y + 4, w, 12);
  ctx.fillStyle = C.pipeDk;
  ctx.fillRect(x, y + 4, 4, 12);
  ctx.fillStyle = C.pipeLt;
  ctx.fillRect(x + 4, y + 4, 3, 12);
  // верх голова
  ctx.fillStyle = C.pipeDk;
  ctx.fillRect(x, y, w, 5);
  ctx.fillStyle = C.pipeMd;
  ctx.fillRect(x, y + 1, w, 3);
  ctx.fillStyle = C.pipeLt;
  ctx.fillRect(x + 1, y + 1, w - 2, 1);
  // блик на правом краю
  ctx.fillStyle = C.pipeSh;
  ctx.fillRect(x + w - 6, y + 4, 5, h - 4);
  ctx.fillRect(x + w - 5, y + 16, 4, h - 16);
}

function drawPlatform(ctx: CanvasRenderingContext2D, pl: Platform, frame: number) {
  if (pl.type === "ground") { drawGround(ctx, pl.x, pl.y, pl.w, pl.h); return; }
  if (pl.type === "brick")  { drawBrick(ctx, pl.x, pl.y, pl.w, pl.h); return; }
  if (pl.type === "qblock") { drawQBlock(ctx, pl.x, pl.y, pl.w, pl.h, frame); return; }
  if (pl.type === "stone")  { drawStone(ctx, pl.x, pl.y, pl.w, pl.h); return; }
  if (pl.type === "snow")   { drawSnow(ctx, pl.x, pl.y, pl.w, pl.h); return; }
  if (pl.type === "lava")   { drawLava(ctx, pl.x, pl.y, pl.w, pl.h, frame); return; }
  if (pl.type === "pipe")   { drawPipe(ctx, pl.x, pl.y, pl.w, pl.h); return; }
}

// ── ВРАГИ ────────────────────────────────────────────────────────────────────
function drawGoomba(ctx: CanvasRenderingContext2D, e: Enemy, frame: number) {
  const px = Math.round(e.x), py = Math.round(e.y);
  if (e.dead) {
    ctx.fillStyle = "#6b3000";
    ctx.fillRect(px, py + e.h - 7, e.w, 7);
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(px + 2, py + e.h - 12, e.w - 4, 7);
    ctx.fillStyle = "#fff";
    ctx.fillRect(px + 3, py + e.h - 11, 4, 3);
    ctx.fillRect(px + e.w - 7, py + e.h - 11, 4, 3);
    return;
  }
  const walk = Math.floor(frame / 10) % 2;
  // ноги
  ctx.fillStyle = "#3a1a00";
  ctx.fillRect(px + (walk ? 2 : 0), py + e.h - 5, 8, 5);
  ctx.fillRect(px + e.w - (walk ? 10 : 8), py + e.h - 5, 8, 5);
  // тело
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(px + 2, py + 8, e.w - 4, e.h - 12);
  // голова
  ctx.fillStyle = "#a0522d";
  ctx.fillRect(px, py, e.w, 12);
  // нависающие брови
  ctx.fillStyle = "#3a1a00";
  ctx.fillRect(px + 2, py + 2, 7, 3);
  ctx.fillRect(px + e.w - 9, py + 2, 7, 3);
  // угол бровей (angry)
  ctx.fillRect(px + 2, py + 2, 2, 5);
  ctx.fillRect(px + e.w - 4, py + 2, 2, 5);
  // белки глаз
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 3, py + 4, 6, 5);
  ctx.fillRect(px + e.w - 9, py + 4, 6, 5);
  // зрачки
  ctx.fillStyle = "#000";
  ctx.fillRect(px + 5, py + 5, 3, 3);
  ctx.fillRect(px + e.w - 7, py + 5, 3, 3);
  // усики
  ctx.fillStyle = "#3a1a00";
  ctx.fillRect(px + 1, py + 10, 4, 1);
  ctx.fillRect(px + e.w - 5, py + 10, 4, 1);
}

function drawKoopa(ctx: CanvasRenderingContext2D, e: Enemy, frame: number) {
  const px = Math.round(e.x), py = Math.round(e.y);
  if (e.dead) {
    ctx.fillStyle = "#1a6600";
    ctx.fillRect(px + 2, py + 2, e.w - 4, e.h - 4);
    ctx.fillStyle = "#f0c000";
    ctx.fillRect(px + 5, py + 5, e.w - 10, e.h - 10);
    // крестообразный шов
    ctx.fillStyle = "#1a6600";
    ctx.fillRect(px + 5, py + (e.h / 2) - 1, e.w - 10, 2);
    ctx.fillRect(px + (e.w / 2) - 1, py + 5, 2, e.h - 10);
    return;
  }
  const walk = Math.floor(frame / 10) % 2;
  // ноги
  ctx.fillStyle = "#5ab82a";
  ctx.fillRect(px + (walk ? 0 : 2), py + e.h - 6, 9, 6);
  ctx.fillRect(px + e.w - (walk ? 9 : 11), py + e.h - 6, 9, 6);
  // панцирь
  ctx.fillStyle = "#1a8000";
  ctx.fillRect(px + 2, py + 6, e.w - 4, e.h - 8);
  ctx.fillStyle = "#f0c000";
  ctx.fillRect(px + 5, py + 9, e.w - 10, e.h - 16);
  ctx.fillStyle = "#1a8000";
  // швы панциря
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(px + 5, py + 9 + i * 4, e.w - 10, 1);
  }
  ctx.fillRect(px + (e.w / 2) - 1, py + 9, 1, e.h - 16);
  // шея
  ctx.fillStyle = "#5ab82a";
  ctx.fillRect(px + 5, py + 1, e.w - 10, 7);
  // голова
  ctx.fillStyle = "#5ab82a";
  ctx.fillRect(px + 4, py - 5, e.w - 8, 8);
  // глаза
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 5, py - 4, 5, 4);
  ctx.fillRect(px + e.w - 10, py - 4, 5, 4);
  ctx.fillStyle = "#000";
  ctx.fillRect(px + 7, py - 3, 2, 2);
  ctx.fillRect(px + e.w - 8, py - 3, 2, 2);
}

// ── МАРИО ────────────────────────────────────────────────────────────────────
function drawMario(ctx: CanvasRenderingContext2D, x: number, y: number, facingRight: boolean, walkAnim: number, onGround: boolean, dead: boolean) {
  const px = Math.round(x), py = Math.round(y);
  ctx.save();
  if (!facingRight) {
    ctx.translate(px + 24, py);
    ctx.scale(-1, 1);
    ctx.translate(-px, -py);
  }

  if (dead) {
    // кепка
    ctx.fillStyle = "#e40000"; ctx.fillRect(px + 3, py - 1, 18, 4);
    ctx.fillRect(px + 7, py - 6, 10, 5);
    // лицо
    ctx.fillStyle = "#fba870"; ctx.fillRect(px + 4, py + 3, 16, 10);
    // тело перевёрнутое (подбрасывание)
    ctx.fillStyle = "#0038a8"; ctx.fillRect(px + 5, py + 13, 14, 10);
    ctx.fillStyle = "#e40000"; ctx.fillRect(px + 5, py + 13, 5, 8);
    ctx.fillRect(px + 14, py + 13, 5, 8);
    ctx.restore();
    return;
  }

  const legPhase = onGround ? Math.sin(walkAnim * 0.3) : 0;
  const airPose = !onGround;

  // === КЕПКА ===
  ctx.fillStyle = "#e40000";
  ctx.fillRect(px + 2, py, 20, 5);          // козырёк
  ctx.fillRect(px + 6, py - 7, 12, 7);      // верх кепки
  // белый край кепки
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 6, py - 1, 12, 1);

  // === ВОЛОСЫ (тёмно-коричневые) ===
  ctx.fillStyle = "#6b3000";
  ctx.fillRect(px + 6, py + 2, 4, 3);
  ctx.fillRect(px + 16, py + 2, 4, 3);

  // === ЛИЦО ===
  ctx.fillStyle = "#fba870";
  ctx.fillRect(px + 4, py + 4, 16, 10);

  // глаза
  ctx.fillStyle = "#000";
  ctx.fillRect(px + 7, py + 6, 3, 3);
  ctx.fillRect(px + 14, py + 6, 3, 3);
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 8, py + 6, 1, 1);
  ctx.fillRect(px + 15, py + 6, 1, 1);

  // нос
  ctx.fillStyle = "#e07a50";
  ctx.fillRect(px + 12, py + 9, 4, 3);

  // === УСЫ ===
  ctx.fillStyle = "#6b3000";
  ctx.fillRect(px + 6, py + 11, 12, 3);
  // форма усов
  ctx.fillStyle = "#fba870";
  ctx.fillRect(px + 11, py + 11, 2, 1);

  // === РУБАШКА (красная) ===
  ctx.fillStyle = "#e40000";
  ctx.fillRect(px + 4, py + 14, 16, 10);
  // воротник
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 9, py + 14, 6, 2);

  // === КОМБИНЕЗОН (синий) ===
  ctx.fillStyle = "#0038a8";
  ctx.fillRect(px + 4, py + 21, 16, 7);
  // пуговицы
  ctx.fillStyle = "#f0c000";
  ctx.fillRect(px + 7, py + 22, 3, 3);
  ctx.fillRect(px + 14, py + 22, 3, 3);

  // === РУКИ ===
  ctx.fillStyle = "#fba870";
  if (airPose) {
    ctx.fillRect(px + 1,  py + 16, 4, 6);
    ctx.fillRect(px + 19, py + 14, 4, 6);
  } else {
    ctx.fillRect(px + 1,  py + 14 + Math.round(legPhase * 2), 4, 6);
    ctx.fillRect(px + 19, py + 14 - Math.round(legPhase * 2), 4, 6);
  }

  // === НОГИ ===
  if (airPose) {
    ctx.fillStyle = "#0038a8";
    ctx.fillRect(px + 4,  py + 28, 8, 5);
    ctx.fillRect(px + 12, py + 26, 8, 5);
    ctx.fillStyle = "#5a2a00";
    ctx.fillRect(px + 2,  py + 32, 11, 4);
    ctx.fillRect(px + 11, py + 30, 11, 4);
  } else {
    const lA = Math.round(legPhase * 4);
    ctx.fillStyle = "#0038a8";
    ctx.fillRect(px + 4,  py + 28, 8, 5 + lA);
    ctx.fillRect(px + 12, py + 28, 8, 5 - lA);
    ctx.fillStyle = "#5a2a00";
    ctx.fillRect(px + 2,  py + 32 + lA, 11, 4);
    ctx.fillRect(px + 11, py + 32 - lA, 11, 4);
    // блик на ботинках
    ctx.fillStyle = "#7a4220";
    ctx.fillRect(px + 3,  py + 32 + lA, 3, 1);
    ctx.fillRect(px + 12, py + 32 - lA, 3, 1);
  }

  ctx.restore();
}

// ── МОНЕТА ───────────────────────────────────────────────────────────────────
function drawCoin(ctx: CanvasRenderingContext2D, cx: number, cy: number, anim: number) {
  const squeeze = Math.abs(Math.sin(anim * 0.06));
  const rx = 7 * (0.3 + 0.7 * squeeze), ry = 7;
  ctx.fillStyle = "#f0a800";
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f8c800";
  ctx.beginPath(); ctx.ellipse(cx - rx * 0.2, cy - ry * 0.2, rx * 0.5, ry * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath(); ctx.ellipse(cx - rx * 0.3, cy - ry * 0.3, rx * 0.22, ry * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  if (squeeze < 0.3) {
    ctx.fillStyle = "#c07000";
    ctx.fillRect(cx - 2, cy - 5, 4, 10);
  }
}

// ── ФЛАГ ФИНИШ ────────────────────────────────────────────────────────────────
function drawFinish(ctx: CanvasRenderingContext2D, fx: number, fy: number, fgy: number, locked: boolean, frame: number) {
  // флагшток
  const poleH = fgy - fy;
  ctx.fillStyle = locked ? "#808080" : "#888";
  ctx.fillRect(fx + 18, fy, 4, poleH);
  ctx.fillStyle = locked ? "#606060" : "#aaa";
  ctx.fillRect(fx + 19, fy, 1, poleH);
  // шар на верхушке
  ctx.fillStyle = locked ? "#888" : "#f0c000";
  ctx.beginPath(); ctx.arc(fx + 20, fy, 6, 0, Math.PI * 2); ctx.fill();
  if (!locked) {
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(fx + 18, fy - 2, 2, 0, Math.PI * 2); ctx.fill();
  }
  // флаг
  if (locked) {
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.moveTo(fx + 22, fy + 4);
    ctx.lineTo(fx + 42, fy + 16);
    ctx.lineTo(fx + 22, fy + 28);
    ctx.closePath(); ctx.fill();
    // замок поверх
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔒", fx + 32, fy + 16);
  } else {
    // анимация флага — волнение
    const wave = Math.sin(frame * 0.08) * 4;
    ctx.fillStyle = "#e40000";
    ctx.beginPath();
    ctx.moveTo(fx + 22, fy + 4);
    ctx.quadraticCurveTo(fx + 32 + wave, fy + 10, fx + 42 + wave, fy + 16);
    ctx.quadraticCurveTo(fx + 32 + wave, fy + 22, fx + 22, fy + 28);
    ctx.closePath(); ctx.fill();
    // буква M на флаге
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("M", fx + 30 + wave * 0.5, fy + 16);
  }
}

// ── ФОН ──────────────────────────────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, lvl: LevelData, frame: number, lvlIdx: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, lvl.bg); grad.addColorStop(1, lvl.bgColor2);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  if (lvlIdx === 0) {
    // NES-стиль облака: белые прямоугольные с пиксельными краями
    const clouds = [[60, 50], [220, 70], [420, 45], [610, 65]];
    for (const [cx, cy] of clouds) {
      const bx = cx + Math.sin(frame * 0.005 + cx * 0.1) * 2;
      ctx.fillStyle = "#fff";
      ctx.fillRect(bx + 12, cy, 30, 10);
      ctx.fillRect(bx + 6,  cy + 6, 42, 10);
      ctx.fillRect(bx,      cy + 12, 54, 10);
      ctx.fillRect(bx + 4,  cy + 4, 6, 4);
      ctx.fillRect(bx + 22, cy - 4, 16, 6);
      ctx.fillRect(bx + 44, cy + 4, 6, 4);
    }
    // пиксельные кусты
    const bushes = [[100, 355], [320, 358], [520, 354], [700, 356]];
    for (const [bx, by] of bushes) {
      ctx.fillStyle = "#00a800";
      ctx.fillRect(bx, by, 48, 14);
      ctx.fillRect(bx + 8, by - 8, 32, 10);
      ctx.fillRect(bx + 16, by - 14, 16, 8);
      ctx.fillStyle = "#00d000";
      ctx.fillRect(bx + 2, by, 4, 6);
      ctx.fillRect(bx + 10, by - 6, 4, 4);
      ctx.fillRect(bx + 20, by - 12, 4, 4);
    }
  } else if (lvlIdx === 1) {
    // снежинки NES-стиль
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 137 + frame * 0.4) % (W + 10)) - 5;
      const sy = ((i * 61  + frame * 0.6) % H);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(sx, sy, 2, 2);
      ctx.fillRect(sx + 1, sy - 1, 2, 2); // крест
      ctx.fillRect(sx - 1, sy + 1, 2, 2);
    }
    // пиксельные горы
    ctx.fillStyle = "#90b8d0";
    [[0, 200, 200, 370], [160, 150, 260, 370], [340, 120, 300, 370], [560, 160, 260, 370]].forEach(([mx, my, mw, mh]) => {
      ctx.beginPath(); ctx.moveTo(mx, mh); ctx.lineTo(mx + mw / 2, my); ctx.lineTo(mx + mw, mh); ctx.closePath(); ctx.fill();
    });
    // снежные вершины
    ctx.fillStyle = "#fff";
    [[100, 200, 40], [260, 150, 50], [490, 160, 40]].forEach(([mx, my, mw]) => {
      ctx.beginPath(); ctx.moveTo(mx - mw, my + 30); ctx.lineTo(mx, my); ctx.lineTo(mx + mw, my + 30); ctx.closePath(); ctx.fill();
    });
  } else {
    // огненное небо
    const lvg = ctx.createLinearGradient(0, H, 0, H - 120);
    lvg.addColorStop(0, "rgba(255,60,0,0.7)"); lvg.addColorStop(1, "rgba(255,60,0,0)");
    ctx.fillStyle = lvg; ctx.fillRect(0, H - 120, W, 120);
    // пиксельные «зубцы» замка
    ctx.fillStyle = "#2a0800";
    for (let bx = 0; bx < W; bx += 60) {
      ctx.fillRect(bx, 0, 30, 40);
    }
    // пузыри лавы
    for (let i = 0; i < 6; i++) {
      const bx = 60 + i * 120;
      const by = H - 15 + Math.sin(frame * 0.06 + i * 1.2) * 6;
      const br = 5 + Math.sin(frame * 0.09 + i * 0.8) * 3;
      ctx.fillStyle = "rgba(255,100,0,0.6)";
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    }
    // факелы
    for (const tx of [48, W - 52]) {
      ctx.fillStyle = "#5a2a00"; ctx.fillRect(tx, 290, 8, 60);
      const fl = Math.sin(frame * 0.15 + tx) * 3;
      ctx.fillStyle = "#ff6600";
      ctx.beginPath(); ctx.moveTo(tx, 290); ctx.lineTo(tx + 4, 270 + fl); ctx.lineTo(tx + 8, 290); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ffcc00";
      ctx.beginPath(); ctx.moveTo(tx + 1, 290); ctx.lineTo(tx + 4, 278 + fl); ctx.lineTo(tx + 7, 290); ctx.closePath(); ctx.fill();
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  КОМПОНЕНТ
// ══════════════════════════════════════════════════════════════════════════════
export default function PlatformerPage({ setCurrentPage }: PlatformerPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stateRef = useRef({
    p: { x: 48, y: 300, w: 24, h: 34, vx: 0, vy: 0, onGround: false, coyoteTime: 0, jumpBuffer: 0, facingRight: true, dead: false, deathTimer: 0 },
    level: null as LevelData | null,
    keys: {} as Record<string, boolean>,
    coins: 0, kills: 0,
    currentLevel: 0,
    status: "playing" as "playing" | "dead" | "win" | "levelwin",
    levelWinTimer: 0, animFrame: 0, walkAnim: 0,
  });

  const [uiState, setUiState] = useState({
    currentLevel: 0, coins: 0, kills: 0,
    status: "playing" as "playing" | "dead" | "win" | "levelwin",
    totalCoins: 10, requiredCoins: 8, requiredKills: 2, finishLocked: true,
  });

  const loadLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx]();
    const s = stateRef.current;
    s.level = lvl; s.currentLevel = idx; s.coins = 0; s.kills = 0;
    s.status = "playing"; s.levelWinTimer = 0;
    s.p = { x: lvl.startX, y: lvl.startY, w: 24, h: 34, vx: 0, vy: 0, onGround: false, coyoteTime: 0, jumpBuffer: 0, facingRight: true, dead: false, deathTimer: 0 };
    setUiState({ currentLevel: idx, coins: 0, kills: 0, status: "playing", totalCoins: lvl.coins.length, requiredCoins: lvl.requiredCoins, requiredKills: lvl.requiredKills, finishLocked: true });
  }, []);

  useEffect(() => { loadLevel(0); }, [loadLevel]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = true;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
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
    const GRAVITY = 0.5, JUMP = -11.5, SPEED = 3.8;

    function rectOverlap(a: Rect, b: Rect) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function update() {
      const s = stateRef.current;
      if (!s.level) return;
      const { p, level, keys } = s;

      if (s.status === "levelwin") {
        s.levelWinTimer++;
        if (s.levelWinTimer > 110) {
          if (s.currentLevel < 2) loadLevel(s.currentLevel + 1);
          else { s.status = "win"; setUiState(u => ({ ...u, status: "win" })); }
        }
        return;
      }
      if (s.status === "dead") {
        p.deathTimer++;
        p.vy += GRAVITY * 0.6;
        p.y += p.vy;
        if (p.deathTimer > 100) loadLevel(s.currentLevel);
        return;
      }

      s.animFrame++;
      const left  = keys["ArrowLeft"]  || keys["KeyA"];
      const right = keys["ArrowRight"] || keys["KeyD"];
      const jumpK = keys["ArrowUp"]    || keys["KeyW"] || keys["Space"];

      if (left)       { p.vx = -SPEED; p.facingRight = false; }
      else if (right) { p.vx =  SPEED; p.facingRight = true;  }
      else            { p.vx *= 0.72; if (Math.abs(p.vx) < 0.1) p.vx = 0; }
      if ((left || right) && p.onGround) s.walkAnim++;

      // jump buffer
      if (jumpK) p.jumpBuffer = 10; else if (p.jumpBuffer > 0) p.jumpBuffer--;
      // coyote time
      if (p.onGround) p.coyoteTime = 6; else if (p.coyoteTime > 0) p.coyoteTime--;
      // apply jump
      if (p.jumpBuffer > 0 && p.coyoteTime > 0) {
        p.vy = JUMP; p.jumpBuffer = 0; p.coyoteTime = 0; p.onGround = false;
      }
      // variable height
      if (!jumpK && p.vy < -4) p.vy += 1.8;

      p.vy = Math.min(p.vy + GRAVITY, 18);
      p.x += p.vx;
      p.onGround = false;

      // X collisions
      for (const pl of level.platforms) {
        if (rectOverlap(p, pl)) {
          if (p.vx > 0) p.x = pl.x - p.w;
          else if (p.vx < 0) p.x = pl.x + pl.w;
          p.vx = 0;
        }
      }
      p.y += p.vy;
      // Y collisions
      for (const pl of level.platforms) {
        if (rectOverlap(p, pl)) {
          if (p.vy > 0) { p.y = pl.y - p.h; p.vy = 0; p.onGround = true; }
          else          { p.y = pl.y + pl.h; p.vy = 0; }
        }
      }
      p.x = Math.max(0, Math.min(W - p.w, p.x));

      if (p.y > H + 40) {
        s.status = "dead"; p.dead = true; p.deathTimer = 0; p.vy = -9;
        setUiState(u => ({ ...u, status: "dead" })); return;
      }

      // enemies
      for (const e of level.enemies) {
        if (e.dead) { e.deadTimer++; continue; }
        e.x += e.vx;
        if (e.x <= e.minX) { e.x = e.minX; e.vx = Math.abs(e.vx); }
        if (e.x + e.w >= e.maxX) { e.x = e.maxX - e.w; e.vx = -Math.abs(e.vx); }
        if (rectOverlap(p, { x: e.x, y: e.y, w: e.w, h: e.h })) {
          if (p.vy > 0 && (p.y + p.h) - e.y < 20) {
            e.dead = true; e.deadTimer = 0; p.vy = -9;
            s.kills++;
            setUiState(u => {
              const locked = s.kills < s.level!.requiredKills || s.coins < s.level!.requiredCoins;
              return { ...u, kills: s.kills, finishLocked: locked };
            });
          } else {
            s.status = "dead"; p.dead = true; p.deathTimer = 0; p.vy = -9;
            setUiState(u => ({ ...u, status: "dead" })); return;
          }
        }
      }

      // coins
      for (const c of level.coins) {
        if (c.collected) continue;
        c.anim++;
        const dx = p.x + p.w / 2 - c.x, dy = p.y + p.h / 2 - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < 18) {
          c.collected = true; s.coins++;
          setUiState(u => {
            const locked = s.kills < s.level!.requiredKills || s.coins < s.level!.requiredCoins;
            return { ...u, coins: s.coins, finishLocked: locked };
          });
        }
      }

      // finish
      if (s.coins >= level.requiredCoins && s.kills >= level.requiredKills) {
        const fRect: Rect = { x: level.finishX - 22, y: level.finishY, w: 44, h: level.finishGroundY - level.finishY };
        if (rectOverlap(p, fRect)) {
          s.status = "levelwin"; s.levelWinTimer = 0;
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

      // сначала финиш (за платформами)
      const finishUnlocked = s.coins >= level.requiredCoins && s.kills >= level.requiredKills;
      drawFinish(ctx, level.finishX, level.finishY, level.finishGroundY, !finishUnlocked, s.animFrame);

      // платформы поверх фона, но финиш уже нарисован
      for (const pl of level.platforms) drawPlatform(ctx, pl, s.animFrame);

      // монеты
      for (const c of level.coins) if (!c.collected) drawCoin(ctx, c.x, c.y, c.anim);

      // враги
      for (const e of level.enemies) {
        if (e.deadTimer > 45) continue;
        if (e.type === "goomba") drawGoomba(ctx, e, s.animFrame);
        else drawKoopa(ctx, e, s.animFrame);
      }

      // игрок
      drawMario(ctx, p.x, p.y, p.facingRight, s.walkAnim, p.onGround, p.dead);

      // HUD поверх
      if (s.status === "dead") {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ff4444";
        ctx.font = "bold 44px 'VT323', monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 10);
        ctx.fillStyle = "#fff";
        ctx.font = "17px 'IBM Plex Mono', monospace";
        ctx.fillText("Перезапуск...", W / 2, H / 2 + 30);
      }
      if (s.status === "levelwin") {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#f8d000";
        ctx.font = "bold 46px 'VT323', monospace";
        ctx.textAlign = "center";
        const msgs = ["🎉 УРОВЕНЬ 1 ПРОЙДЕН!", "🎉 УРОВЕНЬ 2 ПРОЙДЕН!", "🏆 ЗАМОК ВЗЯТ!"];
        ctx.fillText(msgs[s.currentLevel] ?? "🎉", W / 2, H / 2 - 12);
        ctx.fillStyle = "#fff";
        ctx.font = "17px 'IBM Plex Mono', monospace";
        ctx.fillText(s.currentLevel < 2 ? "Следующий уровень..." : "Боузер повержен!", W / 2, H / 2 + 32);
      }
      if (s.status === "win") {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#f8d000";
        ctx.font = "bold 46px 'VT323', monospace";
        ctx.textAlign = "center";
        ctx.fillText("🏆 ПРИНЦЕССА СПАСЕНА!", W / 2, H / 2 - 20);
        ctx.fillStyle = "#aaffaa";
        ctx.font = "18px 'IBM Plex Mono', monospace";
        ctx.fillText("Нажми R — сыграть снова", W / 2, H / 2 + 28);
      }
    }

    function loop() { update(); draw(); raf = requestAnimationFrame(loop); }
    const onKey = (e: KeyboardEvent) => { if (e.code === "KeyR" && stateRef.current.status === "win") loadLevel(0); };
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
              <span className={`font-digit ${uiState.coins >= uiState.requiredCoins ? "text-ms-success" : "text-ms-danger"}`}>
                {uiState.coins}/{uiState.requiredCoins}
              </span>
            </div>
            <div className="ms-display gap-2">
              <span>💀</span>
              <span className={`font-digit ${uiState.kills >= uiState.requiredKills ? "text-ms-success" : "text-ms-danger"}`}>
                {uiState.kills}/{uiState.requiredKills}
              </span>
            </div>
            {uiState.finishLocked && uiState.status === "playing"
              ? <span className="ms-badge ms-badge-danger text-xs">🔒 Финиш закрыт</span>
              : uiState.status === "playing"
              ? <span className="ms-badge ms-badge-success text-xs">🚩 Финиш открыт!</span>
              : null}
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
        ⌨️ ←→ / WASD — движение &nbsp;·&nbsp; ↑ / W / Пробел — прыжок &nbsp;·&nbsp; 👾 Прыгай на врагов сверху &nbsp;·&nbsp; 🔒 Собери монеты и убей врагов — откроется финиш
      </div>
    </div>
  );
}
