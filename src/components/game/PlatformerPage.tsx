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

// Точные цвета с картинки (пипеткой)
const C = {
  // небо
  skyBlue:  "#6b8cff", skyBlue2: "#8faeff",
  // кирпич — тёмно-красный как на картинке
  brickDk:  "#6b1800", brickMd:  "#b83010", brickLt:  "#d04820", brickMortar: "#000000",
  // земля — такой же красно-кирпичный, более насыщенный
  groundDk: "#6b1800", groundMd: "#b83010", groundLt: "#d04820",
  groundGrass: "#5cb840", groundGrassLt: "#80d050",
  // ?-блок — ярко жёлтый как на картинке
  qblockBg:  "#f8b800", qblockLt:  "#fce870", qblockDk:  "#986000", qblockBorder: "#000",
  // камень
  stoneDk:  "#505050", stoneMd: "#787878", stoneLt: "#a8a8a8",
  // снег
  snowDk:   "#6898b8", snowMd:  "#8ab4cc", snowWht: "#e8f4ff", snowTop: "#ffffff",
  // лава
  lavaDk:   "#6a1000", lavaMd:  "#a02000", lavaLt:  "#cc3000", lavaGlow: "#ff5500",
  // труба — тёмно-зелёная как на картинке
  pipeDk:   "#143800", pipeMd:  "#286300", pipeLt:  "#3c8c00", pipeSh:  "#0a2000",
};

// ── УРОВНИ ───────────────────────────────────────────────────────────────────
function makeLevel1(): LevelData {
  // Финиш на x=720, земля y=368. Флагшток стоит на двух каменных блоках 720..752 y=336..368
  return {
    name: "1-1: Грибное королевство",
    bg: "#6b8cff", bgColor2: "#6b8cff",
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
//  ПИКСЕЛЬНЫЕ ТЕКСТУРЫ (цвета точно с картинки)
// ══════════════════════════════════════════════════════════════════════════════

const T = 16;

// Земля — красно-кирпичный паттерн как на картинке (нижняя полоса)
function drawGround(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // верхушка — тёмно-красная строка
  ctx.fillStyle = C.groundDk;
  ctx.fillRect(x, y, w, 2);
  // тело из кирпичных тайлов
  for (let row = 0; row * T < h - 2; row++) {
    const ty = y + 2 + row * T;
    const shift = (row % 2) * (T / 2);
    ctx.fillStyle = C.groundMd;
    ctx.fillRect(x, ty, w, T);
    // горизонтальные швы
    ctx.fillStyle = C.groundDk;
    ctx.fillRect(x, ty, w, 1);
    // вертикальные швы со сдвигом
    for (let col = -1; col * T < w + T; col++) {
      const tx = x + col * T - shift + T - 1;
      if (tx >= x && tx < x + w) {
        ctx.fillStyle = C.groundDk;
        ctx.fillRect(tx, ty, 2, T);
      }
    }
    // светлые блики — верх-лево каждого кирпича
    ctx.fillStyle = C.groundLt;
    for (let col = -1; col * T < w + T; col++) {
      const bx = x + col * T - shift;
      if (bx + 2 >= x && bx < x + w) {
        ctx.fillRect(Math.max(x, bx + 2), ty + 1, 4, 1);
      }
    }
  }
}

// Кирпичный блок — точно как на картинке: тёмно-красный с чёрными швами
function drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.brickMd;
  ctx.fillRect(x, y, w, h);
  for (let row = 0; row * 8 < h; row++) {
    const ty = y + row * 8;
    const shift = (row % 2) * T;
    // горизонтальный шов
    ctx.fillStyle = C.brickMortar;
    ctx.fillRect(x, ty, w, 1);
    // вертикальные швы
    for (let col = -1; col * T < w + T; col++) {
      const tx = x + col * T + T - shift;
      if (tx > x && tx < x + w) {
        ctx.fillRect(tx, ty, 1, 8);
      }
    }
    // светлый блик строки
    ctx.fillStyle = C.brickLt;
    ctx.fillRect(x, ty + 1, w, 1);
  }
  // внешняя обводка
  ctx.fillStyle = C.brickMortar;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
}

// ?-блок — жёлтый с чёрной рамкой и оранжевым ? как на картинке
function drawQBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  // фон
  ctx.fillStyle = C.qblockBg;
  ctx.fillRect(x, y, w, h);
  // светлые блики — верхний и левый край (изнутри рамки)
  ctx.fillStyle = C.qblockLt;
  ctx.fillRect(x + 2, y + 2, w - 4, 2);
  ctx.fillRect(x + 2, y + 2, 2, h - 4);
  // тёмная тень — правый и нижний (изнутри)
  ctx.fillStyle = C.qblockDk;
  ctx.fillRect(x + 2, y + h - 4, w - 4, 2);
  ctx.fillRect(x + w - 4, y + 2, 2, h - 4);
  // чёрная внешняя рамка
  ctx.fillStyle = C.qblockBorder;
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillRect(x, y, 2, h);
  ctx.fillRect(x + w - 2, y, 2, h);
  // угловые точки (декор как на картинке)
  ctx.fillRect(x + 3, y + 3, 2, 2);
  ctx.fillRect(x + w - 5, y + 3, 2, 2);
  ctx.fillRect(x + 3, y + h - 5, 2, 2);
  ctx.fillRect(x + w - 5, y + h - 5, 2, 2);
  // символ ? — оранжевый как на картинке
  const bob = Math.sin(frame * 0.1) > 0 ? 1 : 0;
  ctx.fillStyle = "#c84000";
  ctx.font = `bold ${Math.round(h * 0.65)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", x + w / 2, y + h / 2 + bob);
}

// Каменный блок
function drawStone(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.stoneMd;
  ctx.fillRect(x, y, w, h);
  for (let row = 0; row * T < h; row++) {
    const ty = y + row * T;
    const shift = (row % 2) * (T / 2);
    ctx.fillStyle = C.stoneDk;
    ctx.fillRect(x, ty, w, 1);
    for (let col = -1; col * T < w + T; col++) {
      const tx = x + col * T + T - shift;
      if (tx > x && tx < x + w) ctx.fillRect(tx, ty, 1, T);
    }
    ctx.fillStyle = C.stoneLt;
    ctx.fillRect(x, ty + 1, w, 1);
  }
  ctx.fillStyle = C.stoneLt;
  ctx.fillRect(x, y, w, 1);
}

// Снег
function drawSnow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = C.snowMd;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.snowWht;
  ctx.fillRect(x, y, w, 5);
  ctx.fillStyle = C.snowTop;
  ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = C.snowDk;
  for (let row = 1; row * T < h; row++) {
    ctx.fillRect(x, y + row * T, w, 1);
    for (let col = 0; col * T < w; col++) ctx.fillRect(x + col * T, y + row * T, 1, T);
  }
}

// Лава
function drawLava(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number) {
  ctx.fillStyle = C.lavaMd;
  ctx.fillRect(x, y, w, h);
  for (let row = 0; row * T < h; row++) {
    for (let col = 0; col * T < w; col++) {
      ctx.fillStyle = C.lavaDk;
      ctx.fillRect(x + col * T, y + row * T, T - 1, T - 1);
      ctx.fillStyle = C.lavaLt;
      ctx.fillRect(x + col * T + 1, y + row * T + 1, 3, 1);
    }
  }
  ctx.fillStyle = C.lavaGlow;
  ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = "#ff8800";
  ctx.fillRect(x, y, w, 1);
  ctx.fillStyle = "rgba(255,140,0,0.7)";
  ctx.beginPath();
  ctx.arc(x + (frame * 2) % (w || 1), y + 1, 3, 0, Math.PI * 2);
  ctx.fill();
}

// Труба — тёмно-зелёная как на картинке
function drawPipe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const bw = Math.round(w * 0.75); // тело уже шапки
  const bx = x + Math.round((w - bw) / 2);

  // === ТЕЛО трубы ===
  // левая тёмная полоса
  ctx.fillStyle = C.pipeDk;
  ctx.fillRect(bx, y + 14, 4, h - 14);
  // основной цвет
  ctx.fillStyle = C.pipeMd;
  ctx.fillRect(bx + 4, y + 14, bw - 8, h - 14);
  // светлая полоса блик
  ctx.fillStyle = C.pipeLt;
  ctx.fillRect(bx + 4, y + 14, 4, h - 14);
  // тёмная правая тень
  ctx.fillStyle = C.pipeSh;
  ctx.fillRect(bx + bw - 6, y + 14, 6, h - 14);
  // шахматный паттерн тела (как на картинке)
  for (let row = 0; row < Math.ceil((h - 14) / 8); row++) {
    for (let col = 0; col < Math.ceil(bw / 8); col++) {
      if ((row + col) % 2 === 1) {
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        const px = bx + col * 8, py = y + 14 + row * 8;
        ctx.fillRect(px, py, Math.min(8, bx + bw - px), Math.min(8, y + h - py));
      }
    }
  }

  // === ШАПКА трубы (шире) ===
  ctx.fillStyle = C.pipeDk;
  ctx.fillRect(x, y + 2, 4, 12);
  ctx.fillStyle = C.pipeMd;
  ctx.fillRect(x + 4, y + 2, w - 8, 12);
  ctx.fillStyle = C.pipeLt;
  ctx.fillRect(x + 4, y + 2, 5, 12);
  ctx.fillStyle = C.pipeSh;
  ctx.fillRect(x + w - 6, y + 2, 6, 12);
  // верхняя кромка шапки
  ctx.fillStyle = C.pipeDk;
  ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = C.pipeLt;
  ctx.fillRect(x + 2, y + 1, w - 4, 1);
  // нижняя кромка шапки / стык с телом
  ctx.fillStyle = C.pipeDk;
  ctx.fillRect(x, y + 13, w, 1);
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

// ── ВРАГИ (цвета с картинки: Гумба красно-коричневый) ───────────────────────
function drawGoomba(ctx: CanvasRenderingContext2D, e: Enemy, frame: number) {
  const px = Math.round(e.x), py = Math.round(e.y);
  const W2 = e.w, H2 = e.h;

  if (e.dead) {
    // сплющенный — тонкая лепёшка
    ctx.fillStyle = "#8b3000";
    ctx.fillRect(px, py + H2 - 5, W2, 5);
    ctx.fillStyle = "#c04010";
    ctx.fillRect(px + 2, py + H2 - 8, W2 - 4, 4);
    // глаза сплющены
    ctx.fillStyle = "#fff";
    ctx.fillRect(px + 3, py + H2 - 7, 4, 2);
    ctx.fillRect(px + W2 - 7, py + H2 - 7, 4, 2);
    return;
  }

  const walk = Math.floor(frame / 9) % 2;

  // ── ноги (коричневые, анимированные) ──
  ctx.fillStyle = "#3a1000";
  if (walk === 0) {
    ctx.fillRect(px + 1,     py + H2 - 6, 9, 6);   // лев вниз
    ctx.fillRect(px + W2 - 8, py + H2 - 4, 8, 4);  // прав вверх
  } else {
    ctx.fillRect(px + 1,     py + H2 - 4, 9, 4);
    ctx.fillRect(px + W2 - 8, py + H2 - 6, 8, 6);
  }

  // ── тело (красно-коричневое как на картинке) ──
  ctx.fillStyle = "#c04010";
  ctx.fillRect(px + 2, py + 8, W2 - 4, H2 - 13);

  // ── голова (чуть светлее, широкая) ──
  ctx.fillStyle = "#c84818";
  ctx.fillRect(px, py, W2, 11);
  // выступ голова по бокам шире тела
  ctx.fillRect(px - 1, py + 2, W2 + 2, 9);

  // ── брови — нависают внутрь (злые) ──
  ctx.fillStyle = "#2a0800";
  ctx.fillRect(px + 1, py + 2, 8, 3);
  ctx.fillRect(px + W2 - 9, py + 2, 8, 3);
  ctx.fillRect(px + 1, py + 2, 2, 5);         // внутренний угол лев
  ctx.fillRect(px + W2 - 3, py + 2, 2, 5);    // внутренний угол прав

  // ── белки глаз ──
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(px + 3, py + 4, 6, 5);
  ctx.fillRect(px + W2 - 9, py + 4, 6, 5);
  // ── зрачки ──
  ctx.fillStyle = "#000000";
  ctx.fillRect(px + 5, py + 5, 3, 3);
  ctx.fillRect(px + W2 - 7, py + 5, 3, 3);

  // ── зубы (белый прямоугольник снизу) ──
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(px + 3, py + 8, 5, 2);
  ctx.fillRect(px + W2 - 8, py + 8, 5, 2);
  ctx.fillStyle = "#2a0800";
  ctx.fillRect(px + 7, py + 8, 1, 2);
  ctx.fillRect(px + W2 - 5, py + 8, 1, 2);
}

function drawKoopa(ctx: CanvasRenderingContext2D, e: Enemy, frame: number) {
  const px = Math.round(e.x), py = Math.round(e.y);
  if (e.dead) {
    ctx.fillStyle = "#286300";
    ctx.fillRect(px + 2, py + 2, e.w - 4, e.h - 4);
    ctx.fillStyle = "#f0c000";
    ctx.fillRect(px + 5, py + 5, e.w - 10, e.h - 10);
    ctx.fillStyle = "#286300";
    ctx.fillRect(px + 5, py + e.h / 2 - 1, e.w - 10, 2);
    ctx.fillRect(px + e.w / 2 - 1, py + 5, 2, e.h - 10);
    return;
  }
  const walk = Math.floor(frame / 10) % 2;
  ctx.fillStyle = "#5ab82a";
  ctx.fillRect(px + (walk ? 0 : 2), py + e.h - 6, 9, 6);
  ctx.fillRect(px + e.w - (walk ? 9 : 11), py + e.h - 6, 9, 6);
  ctx.fillStyle = "#286300";
  ctx.fillRect(px + 2, py + 6, e.w - 4, e.h - 8);
  ctx.fillStyle = "#f0c000";
  ctx.fillRect(px + 5, py + 9, e.w - 10, e.h - 16);
  ctx.fillStyle = "#286300";
  for (let i = 0; i < 3; i++) ctx.fillRect(px + 5, py + 9 + i * 4, e.w - 10, 1);
  ctx.fillRect(px + e.w / 2 - 1, py + 9, 1, e.h - 16);
  ctx.fillStyle = "#5ab82a";
  ctx.fillRect(px + 5, py + 1, e.w - 10, 7);
  ctx.fillRect(px + 4, py - 5, e.w - 8, 8);
  ctx.fillStyle = "#fff";
  ctx.fillRect(px + 5, py - 4, 5, 4);
  ctx.fillRect(px + e.w - 10, py - 4, 5, 4);
  ctx.fillStyle = "#000";
  ctx.fillRect(px + 7, py - 3, 2, 2);
  ctx.fillRect(px + e.w - 8, py - 3, 2, 2);
}

// ── МАРИО (цвета как на картинке: коричнево-красный костюм, бежевое лицо) ──
function drawMario(ctx: CanvasRenderingContext2D, x: number, y: number, facingRight: boolean, walkAnim: number, onGround: boolean, dead: boolean) {
  const px = Math.round(x), py = Math.round(y);
  ctx.save();
  if (!facingRight) {
    ctx.translate(px + 24, 0);
    ctx.scale(-1, 1);
    ctx.translate(-px, 0);
  }

  // Цвета с картинки — пипеткой
  const HAT    = "#b83010";  // тёмно-красная кепка
  const SKIN   = "#e8a868";  // бежево-оранжевое лицо/руки
  const SHIRT  = "#b83010";  // красная рубашка
  const PANTS  = "#8b5000";  // коричневые штаны/комбинезон
  const BOOT   = "#503000";  // тёмно-коричневые ботинки
  const HAIR   = "#503000";  // тёмно-коричневые усы/волосы
  const BLACK  = "#000000";

  if (dead) {
    ctx.fillStyle = HAT;    ctx.fillRect(px + 3, py,     18, 4);
    ctx.fillStyle = HAT;    ctx.fillRect(px + 7, py - 6, 10, 6);
    ctx.fillStyle = SKIN;   ctx.fillRect(px + 4, py + 4, 16, 9);
    ctx.fillStyle = SHIRT;  ctx.fillRect(px + 5, py + 13, 14, 9);
    ctx.fillStyle = PANTS;  ctx.fillRect(px + 5, py + 20, 14, 7);
    ctx.restore();
    return;
  }

  const lp = onGround ? Math.sin(walkAnim * 0.3) : 0;
  const air = !onGround;
  const lA = Math.round(lp * 4);

  // === КЕПКА ===
  ctx.fillStyle = HAT;
  ctx.fillRect(px + 2, py,      20, 4);    // козырёк
  ctx.fillRect(px + 6, py - 7,  12, 7);    // верх
  ctx.fillStyle = BLACK;
  ctx.fillRect(px + 6, py - 1,  12, 1);    // тёмная граница кепки/лба

  // === ВОЛОСЫ ===
  ctx.fillStyle = HAIR;
  ctx.fillRect(px + 6,  py + 1, 4, 3);
  ctx.fillRect(px + 14, py + 1, 4, 3);

  // === ЛИЦО ===
  ctx.fillStyle = SKIN;
  ctx.fillRect(px + 4, py + 3, 16, 9);
  // глаза
  ctx.fillStyle = BLACK;
  ctx.fillRect(px + 7,  py + 5, 3, 3);
  ctx.fillRect(px + 14, py + 5, 3, 3);
  // нос
  ctx.fillStyle = SKIN;
  ctx.fillRect(px + 13, py + 8, 5, 3);
  ctx.fillStyle = BLACK;
  ctx.fillRect(px + 13, py + 8, 1, 1);

  // === УСИКИ ===
  ctx.fillStyle = HAIR;
  ctx.fillRect(px + 6, py + 10, 12, 2);

  // === РУБАШКА ===
  ctx.fillStyle = SHIRT;
  ctx.fillRect(px + 4, py + 12, 16, 8);
  // === РУКИ ===
  ctx.fillStyle = SKIN;
  if (air) {
    ctx.fillRect(px + 0,  py + 14, 4, 5);
    ctx.fillRect(px + 20, py + 12, 4, 5);
  } else {
    ctx.fillRect(px + 0,  py + 13 + Math.round(lp * 2), 4, 5);
    ctx.fillRect(px + 20, py + 13 - Math.round(lp * 2), 4, 5);
  }

  // === ШТАНЫ/КОМБИНЕЗОН ===
  ctx.fillStyle = PANTS;
  ctx.fillRect(px + 4, py + 20, 16, 8);
  // подтяжки
  ctx.fillStyle = SHIRT;
  ctx.fillRect(px + 6,  py + 20, 3, 5);
  ctx.fillRect(px + 15, py + 20, 3, 5);

  // === НОГИ ===
  if (air) {
    ctx.fillStyle = PANTS;
    ctx.fillRect(px + 4,  py + 28, 8, 5);
    ctx.fillRect(px + 12, py + 25, 8, 5);
    ctx.fillStyle = BOOT;
    ctx.fillRect(px + 2,  py + 32, 11, 4);
    ctx.fillRect(px + 11, py + 29, 11, 4);
  } else {
    ctx.fillStyle = PANTS;
    ctx.fillRect(px + 4,  py + 28, 8, 5 + lA);
    ctx.fillRect(px + 12, py + 28, 8, 5 - lA);
    ctx.fillStyle = BOOT;
    ctx.fillRect(px + 2,  py + 32 + lA, 11, 4);
    ctx.fillRect(px + 11, py + 32 - lA, 11, 4);
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

// ── ОБЛАКО (точно как на картинке: белое с голубыми пикселями снизу) ─────────
function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  const s = scale;
  // Форма облака с картинки — пиксельный blob
  const pixels: [number, number, number, number, string][] = [
    // [dx, dy, w, h, color]
    [6,  12, 36, 8,  "#ffffff"],
    [2,  8,  44, 10, "#ffffff"],
    [0,  4,  48, 10, "#ffffff"],
    [4,  0,  40, 6,  "#ffffff"],
    [10, -4, 28, 6,  "#ffffff"],
    // голубые акценты снизу (точно с картинки)
    [4,  18, 6,  2,  "#80d0e8"],
    [14, 20, 8,  2,  "#80d0e8"],
    [26, 20, 6,  2,  "#80d0e8"],
    [36, 18, 8,  2,  "#80d0e8"],
    // чёрные края (пиксельная обводка)
    [0,   4, 2,  16, "#000"],
    [46,  4, 2,  16, "#000"],
    [4,   0, 40, 2,  "#000"],
    [4,  20, 40, 2,  "#000"],
    [2,   2, 2,  2,  "#000"],
    [44,  2, 2,  2,  "#000"],
  ];
  for (const [dx, dy, w, h, color] of pixels) {
    ctx.fillStyle = color;
    ctx.fillRect(cx + dx * s, cy + dy * s, w * s, h * s);
  }
}

// ── ФОН ──────────────────────────────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, lvl: LevelData, frame: number, lvlIdx: number) {
  // Небо — точный цвет с картинки #6b8cff
  ctx.fillStyle = lvl.bg;
  ctx.fillRect(0, 0, W, H);

  if (lvlIdx === 0) {
    // Облака из картинки (медленно плывут)
    const cloudPositions = [
      [40  + (frame * 0.15) % W,        55, 0.9],
      [280 + (frame * 0.10) % W,        45, 1.1],
      [520 + (frame * 0.12) % W,        60, 0.8],
    ];
    for (const [cx, cy, sc] of cloudPositions) {
      drawCloud(ctx, (cx % (W + 60)) - 10, cy, sc);
    }

    // Пиксельные кусты (зелёные, как на картинке)
    const bushes: [number, number][] = [[95, 356], [310, 358], [510, 355], [690, 357]];
    for (const [bx, by] of bushes) {
      ctx.fillStyle = "#00a800";
      ctx.fillRect(bx,      by,      48, 12);
      ctx.fillRect(bx + 8,  by - 8,  32, 10);
      ctx.fillRect(bx + 16, by - 14, 16, 8);
      ctx.fillStyle = "#00cc00";
      ctx.fillRect(bx + 2,  by,      4,  4);
      ctx.fillRect(bx + 10, by - 6,  4,  4);
      ctx.fillRect(bx + 20, by - 12, 4,  4);
      // тёмный низ
      ctx.fillStyle = "#006000";
      ctx.fillRect(bx, by + 10, 48, 2);
    }
  } else if (lvlIdx === 1) {
    // Снег
    for (let i = 0; i < 28; i++) {
      const sx = ((i * 137 + frame * 0.4) % (W + 10)) - 5;
      const sy = ((i * 61  + frame * 0.7) % H);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(sx, sy, 2, 2);
      ctx.fillRect(sx + 1, sy - 1, 2, 2);
      ctx.fillRect(sx - 1, sy + 1, 2, 2);
    }
    // горы
    ctx.fillStyle = "#90b8d0";
    for (const [mx, my, mw] of [[0,200,200],[160,150,260],[340,120,300],[560,160,240]]) {
      ctx.beginPath(); ctx.moveTo(mx, 370); ctx.lineTo(mx + mw/2, my); ctx.lineTo(mx + mw, 370); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#fff";
    for (const [mx, my, mw] of [[100,200,36],[265,150,46],[490,160,38]]) {
      ctx.beginPath(); ctx.moveTo(mx - mw, my + 28); ctx.lineTo(mx, my); ctx.lineTo(mx + mw, my + 28); ctx.closePath(); ctx.fill();
    }
  } else {
    // замок — огненное небо
    const lvg = ctx.createLinearGradient(0, H, 0, H - 130);
    lvg.addColorStop(0, "rgba(255,60,0,0.75)"); lvg.addColorStop(1, "rgba(255,60,0,0)");
    ctx.fillStyle = lvg; ctx.fillRect(0, H - 130, W, 130);
    // зубцы замка
    ctx.fillStyle = "#2a0800";
    for (let bx = 0; bx < W; bx += 56) ctx.fillRect(bx, 0, 28, 38);
    // пузыри лавы
    for (let i = 0; i < 6; i++) {
      const bx = 60 + i * 120;
      const by = H - 14 + Math.sin(frame * 0.06 + i * 1.2) * 6;
      const br = 5 + Math.sin(frame * 0.09 + i * 0.8) * 3;
      ctx.fillStyle = "rgba(255,100,0,0.65)";
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    }
    // факелы
    for (const tx of [44, W - 50]) {
      ctx.fillStyle = "#5a2a00"; ctx.fillRect(tx, 285, 8, 68);
      const fl = Math.sin(frame * 0.18 + tx) * 3;
      ctx.fillStyle = "#ff6600";
      ctx.beginPath(); ctx.moveTo(tx, 285); ctx.lineTo(tx + 4, 265 + fl); ctx.lineTo(tx + 8, 285); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ffdd00";
      ctx.beginPath(); ctx.moveTo(tx + 1, 285); ctx.lineTo(tx + 4, 274 + fl); ctx.lineTo(tx + 7, 285); ctx.closePath(); ctx.fill();
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