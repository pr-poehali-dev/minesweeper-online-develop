import { useEffect, useRef, useState, useCallback } from "react";
import { type Page } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface PlatformerPageProps {
  setCurrentPage: (page: Page) => void;
}

// ── ТИПЫ ───────────────────────────────────────────────────────────────────
interface Vec2 { x: number; y: number; }
interface Rect { x: number; y: number; w: number; h: number; }
interface Platform extends Rect { color?: string; }
interface Enemy { x: number; y: number; w: number; h: number; vx: number; minX: number; maxX: number; dead: boolean; }
interface Coin { x: number; y: number; r: number; collected: boolean; }
interface LevelData {
  platforms: Platform[];
  enemies: Enemy[];
  coins: Coin[];
  start: Vec2;
  finish: Rect;
  bg: string;
  name: string;
}

// ── УРОВНИ ─────────────────────────────────────────────────────────────────
const W = 800, H = 400;

function makeLevel1(): LevelData {
  return {
    name: "Лесная поляна",
    bg: "#87ceeb",
    start: { x: 60, y: 280 },
    finish: { x: 730, y: 290, w: 40, h: 50 },
    platforms: [
      { x: 0, y: 350, w: 800, h: 50, color: "#5a8c3c" },
      { x: 100, y: 280, w: 100, h: 16, color: "#7a5c3c" },
      { x: 260, y: 240, w: 90, h: 16, color: "#7a5c3c" },
      { x: 390, y: 200, w: 80, h: 16, color: "#7a5c3c" },
      { x: 500, y: 260, w: 100, h: 16, color: "#7a5c3c" },
      { x: 640, y: 290, w: 120, h: 16, color: "#7a5c3c" },
      { x: 180, y: 170, w: 70, h: 16, color: "#7a5c3c" },
    ],
    enemies: [
      { x: 110, y: 258, w: 28, h: 22, vx: 0.8, minX: 100, maxX: 180, dead: false },
      { x: 510, y: 238, w: 28, h: 22, vx: 0.9, minX: 500, maxX: 590, dead: false },
    ],
    coins: [
      { x: 130, y: 260, r: 8, collected: false },
      { x: 160, y: 260, r: 8, collected: false },
      { x: 290, y: 218, r: 8, collected: false },
      { x: 420, y: 178, r: 8, collected: false },
      { x: 450, y: 178, r: 8, collected: false },
      { x: 530, y: 240, r: 8, collected: false },
      { x: 560, y: 240, r: 8, collected: false },
      { x: 200, y: 150, r: 8, collected: false },
      { x: 670, y: 268, r: 8, collected: false },
      { x: 700, y: 268, r: 8, collected: false },
    ],
  };
}

function makeLevel2(): LevelData {
  return {
    name: "Заснеженные горы",
    bg: "#d0e8f5",
    start: { x: 40, y: 310 },
    finish: { x: 730, y: 250, w: 40, h: 50 },
    platforms: [
      { x: 0, y: 360, w: 150, h: 40, color: "#8ab4cc" },
      { x: 200, y: 320, w: 80, h: 16, color: "#ffffff" },
      { x: 330, y: 280, w: 80, h: 16, color: "#ffffff" },
      { x: 200, y: 230, w: 70, h: 16, color: "#ffffff" },
      { x: 100, y: 180, w: 80, h: 16, color: "#ffffff" },
      { x: 260, y: 155, w: 70, h: 16, color: "#ffffff" },
      { x: 400, y: 195, w: 90, h: 16, color: "#ffffff" },
      { x: 530, y: 240, w: 80, h: 16, color: "#ffffff" },
      { x: 650, y: 200, w: 100, h: 16, color: "#ffffff" },
      { x: 460, y: 150, w: 70, h: 16, color: "#ffffff" },
    ],
    enemies: [
      { x: 210, y: 298, w: 28, h: 22, vx: 0.7, minX: 200, maxX: 270, dead: false },
      { x: 410, y: 173, w: 28, h: 22, vx: 1.0, minX: 400, maxX: 480, dead: false },
      { x: 660, y: 178, w: 28, h: 22, vx: 0.8, minX: 650, maxX: 740, dead: false },
    ],
    coins: [
      { x: 220, y: 298, r: 8, collected: false },
      { x: 350, y: 258, r: 8, collected: false },
      { x: 220, y: 208, r: 8, collected: false },
      { x: 120, y: 158, r: 8, collected: false },
      { x: 280, y: 133, r: 8, collected: false },
      { x: 430, y: 173, r: 8, collected: false },
      { x: 480, y: 128, r: 8, collected: false },
      { x: 550, y: 218, r: 8, collected: false },
      { x: 680, y: 178, r: 8, collected: false },
      { x: 710, y: 178, r: 8, collected: false },
    ],
  };
}

function makeLevel3(): LevelData {
  return {
    name: "Вулканический остров",
    bg: "#1a0a00",
    start: { x: 40, y: 330 },
    finish: { x: 740, y: 140, w: 40, h: 50 },
    platforms: [
      { x: 0, y: 370, w: 120, h: 30, color: "#8b1a00" },
      { x: 160, y: 340, w: 70, h: 16, color: "#cc3300" },
      { x: 270, y: 300, w: 70, h: 16, color: "#cc3300" },
      { x: 380, y: 260, w: 70, h: 16, color: "#cc3300" },
      { x: 490, y: 220, w: 70, h: 16, color: "#cc3300" },
      { x: 380, y: 180, w: 70, h: 16, color: "#ff5500" },
      { x: 260, y: 200, w: 70, h: 16, color: "#ff5500" },
      { x: 140, y: 240, w: 70, h: 16, color: "#ff5500" },
      { x: 140, y: 160, w: 70, h: 16, color: "#ff5500" },
      { x: 280, y: 130, w: 70, h: 16, color: "#ff5500" },
      { x: 420, y: 155, w: 70, h: 16, color: "#ff5500" },
      { x: 560, y: 160, w: 70, h: 16, color: "#ff5500" },
      { x: 680, y: 145, w: 110, h: 16, color: "#ff5500" },
    ],
    enemies: [
      { x: 170, y: 318, w: 28, h: 22, vx: 1.0, minX: 160, maxX: 220, dead: false },
      { x: 280, y: 278, w: 28, h: 22, vx: 1.1, minX: 270, maxX: 330, dead: false },
      { x: 500, y: 198, w: 28, h: 22, vx: 1.2, minX: 490, maxX: 550, dead: false },
      { x: 560, y: 138, w: 28, h: 22, vx: 1.0, minX: 560, maxX: 620, dead: false },
      { x: 690, y: 123, w: 28, h: 22, vx: 0.9, minX: 680, maxX: 780, dead: false },
    ],
    coins: [
      { x: 180, y: 318, r: 8, collected: false },
      { x: 300, y: 278, r: 8, collected: false },
      { x: 400, y: 238, r: 8, collected: false },
      { x: 510, y: 198, r: 8, collected: false },
      { x: 400, y: 158, r: 8, collected: false },
      { x: 160, y: 218, r: 8, collected: false },
      { x: 160, y: 138, r: 8, collected: false },
      { x: 300, y: 108, r: 8, collected: false },
      { x: 440, y: 133, r: 8, collected: false },
      { x: 580, y: 138, r: 8, collected: false },
      { x: 710, y: 123, r: 8, collected: false },
      { x: 740, y: 123, r: 8, collected: false },
    ],
  };
}

const LEVELS = [makeLevel1, makeLevel2, makeLevel3];

// ── ГЛАВНЫЙ КОМПОНЕНТ ──────────────────────────────────────────────────────
export default function PlatformerPage({ setCurrentPage }: PlatformerPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    player: { x: 60, y: 280, w: 24, h: 32, vx: 0, vy: 0, onGround: false, facingRight: true, dead: false, deathTimer: 0 },
    level: null as LevelData | null,
    keys: {} as Record<string, boolean>,
    coins: 0,
    currentLevel: 0,
    status: "playing" as "playing" | "dead" | "win" | "levelwin",
    levelWinTimer: 0,
    animFrame: 0,
    walkAnim: 0,
  });

  const [uiState, setUiState] = useState({
    currentLevel: 0,
    coins: 0,
    status: "playing" as "playing" | "dead" | "win" | "levelwin",
    totalCoins: 10,
  });

  const loadLevel = useCallback((idx: number) => {
    const lvl = LEVELS[idx]();
    const s = stateRef.current;
    s.level = lvl;
    s.currentLevel = idx;
    s.coins = 0;
    s.status = "playing";
    s.levelWinTimer = 0;
    s.player = { x: lvl.start.x, y: lvl.start.y, w: 24, h: 32, vx: 0, vy: 0, onGround: false, facingRight: true, dead: false, deathTimer: 0 };
    setUiState({ currentLevel: idx, coins: 0, status: "playing", totalCoins: lvl.coins.length });
  }, []);

  useEffect(() => { loadLevel(0); }, [loadLevel]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { stateRef.current.keys[e.code] = true; e.preventDefault(); };
    const up = (e: KeyboardEvent) => { stateRef.current.keys[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  // touch controls
  const touchRef = useRef<Record<string, boolean>>({});
  const setTouchKey = (key: string, val: boolean) => {
    stateRef.current.keys[key] = val;
    touchRef.current[key] = val;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const GRAVITY = 0.45;
    const JUMP_FORCE = -10;
    const SPEED = 3.5;

    function rectOverlap(a: Rect, b: Rect) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function update() {
      const s = stateRef.current;
      if (!s.level) return;
      const { player, level, keys } = s;

      if (s.status === "levelwin") {
        s.levelWinTimer++;
        if (s.levelWinTimer > 90) {
          if (s.currentLevel < 2) {
            loadLevel(s.currentLevel + 1);
          } else {
            s.status = "win";
            setUiState(u => ({ ...u, status: "win" }));
          }
        }
        return;
      }

      if (s.status === "dead") {
        player.deathTimer = (player.deathTimer || 0) + 1;
        if (player.deathTimer > 80) { loadLevel(s.currentLevel); }
        return;
      }

      s.animFrame++;

      // movement
      const left = keys["ArrowLeft"] || keys["KeyA"];
      const right = keys["ArrowRight"] || keys["KeyD"];
      const jump = keys["ArrowUp"] || keys["KeyW"] || keys["Space"];

      if (left) { player.vx = -SPEED; player.facingRight = false; }
      else if (right) { player.vx = SPEED; player.facingRight = true; }
      else { player.vx *= 0.75; }

      if (left || right) s.walkAnim++;

      player.vy += GRAVITY;
      player.x += player.vx;
      player.y += player.vy;

      if (jump && player.onGround) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
      }

      player.onGround = false;

      // platform collision
      for (const p of level.platforms) {
        if (rectOverlap(player, p)) {
          const overlapL = player.x + player.w - p.x;
          const overlapR = p.x + p.w - player.x;
          const overlapT = player.y + player.h - p.y;
          const overlapB = p.y + p.h - player.y;
          const minX = Math.min(overlapL, overlapR);
          const minY = Math.min(overlapT, overlapB);
          if (minY < minX) {
            if (overlapT < overlapB) { player.y = p.y - player.h; player.vy = 0; player.onGround = true; }
            else { player.y = p.y + p.h; player.vy = 0; }
          } else {
            if (overlapL < overlapR) player.x = p.x - player.w;
            else player.x = p.x + p.w;
            player.vx = 0;
          }
        }
      }

      // bounds
      if (player.x < 0) player.x = 0;
      if (player.x + player.w > W) player.x = W - player.w;

      // fall death
      if (player.y > H + 60) {
        s.status = "dead";
        player.dead = true;
        player.deathTimer = 0;
        setUiState(u => ({ ...u, status: "dead" }));
        return;
      }

      // enemies
      for (const e of level.enemies) {
        if (e.dead) continue;
        e.x += e.vx;
        if (e.x <= e.minX || e.x + e.w >= e.maxX) e.vx *= -1;

        const pr: Rect = { x: player.x, y: player.y, w: player.w, h: player.h };
        const er: Rect = { x: e.x, y: e.y, w: e.w, h: e.h };

        if (rectOverlap(pr, er)) {
          const playerBottom = player.y + player.h;
          const enemyTop = e.y;
          if (playerBottom - enemyTop < 16 && player.vy > 0) {
            e.dead = true;
            player.vy = -7;
          } else {
            s.status = "dead";
            player.dead = true;
            player.deathTimer = 0;
            setUiState(u => ({ ...u, status: "dead" }));
            return;
          }
        }
      }

      // coins
      let coinCount = s.coins;
      for (const c of level.coins) {
        if (c.collected) continue;
        const dx = player.x + player.w / 2 - c.x;
        const dy = player.y + player.h / 2 - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < c.r + 14) {
          c.collected = true;
          coinCount++;
        }
      }
      if (coinCount !== s.coins) {
        s.coins = coinCount;
        setUiState(u => ({ ...u, coins: coinCount }));
      }

      // finish
      if (rectOverlap({ x: player.x, y: player.y, w: player.w, h: player.h }, level.finish)) {
        s.status = "levelwin";
        s.levelWinTimer = 0;
        setUiState(u => ({ ...u, status: "levelwin" }));
      }
    }

    function drawPlayer(ctx: CanvasRenderingContext2D) {
      const s = stateRef.current;
      const { player } = s;
      const px = Math.round(player.x);
      const py = Math.round(player.y);

      ctx.save();
      if (!player.facingRight) {
        ctx.translate(px + player.w, py);
        ctx.scale(-1, 1);
        ctx.translate(-px, -py);
      }

      // body
      ctx.fillStyle = s.status === "dead" ? "#888" : "#e8c87a";
      ctx.fillRect(px + 4, py + 14, 16, 18);

      // head
      ctx.fillStyle = s.status === "dead" ? "#aaa" : "#f5d89a";
      ctx.fillRect(px + 3, py, 18, 16);

      // eyes
      ctx.fillStyle = "#333";
      ctx.fillRect(px + 7, py + 5, 3, 3);
      ctx.fillRect(px + 14, py + 5, 3, 3);

      // legs walk animation
      if (s.walkAnim > 0 && player.onGround) {
        const legPhase = Math.sin(s.walkAnim * 0.25) * 4;
        ctx.fillStyle = "#3a6bbf";
        ctx.fillRect(px + 4, py + 28, 7, 4 + Math.round(legPhase));
        ctx.fillRect(px + 13, py + 28, 7, 4 - Math.round(legPhase));
      } else {
        ctx.fillStyle = "#3a6bbf";
        ctx.fillRect(px + 4, py + 28, 7, 4);
        ctx.fillRect(px + 13, py + 28, 7, 4);
      }

      ctx.restore();
    }

    function drawScene() {
      const s = stateRef.current;
      if (!s.level) return;
      const { level } = s;

      // bg
      ctx.fillStyle = level.bg;
      ctx.fillRect(0, 0, W, H);

      // bg decorations
      if (s.currentLevel === 0) {
        ctx.fillStyle = "#90ee90";
        for (let i = 0; i < 5; i++) {
          const bx = 60 + i * 150, by = 310;
          ctx.beginPath(); ctx.arc(bx, by - 20, 22, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(bx + 16, by - 28, 18, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#5a8c3c"; ctx.fillRect(bx - 3, by - 10, 6, 20); ctx.fillStyle = "#90ee90";
        }
      } else if (s.currentLevel === 1) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        for (let i = 0; i < 8; i++) {
          ctx.fillRect(i * 100 + 20, 30 + (i % 3) * 20, 60, 20);
        }
      } else {
        // lava glow
        const grd = ctx.createLinearGradient(0, H, 0, H - 80);
        grd.addColorStop(0, "rgba(255,80,0,0.5)");
        grd.addColorStop(1, "rgba(255,80,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, H - 80, W, 80);
      }

      // platforms
      for (const p of level.platforms) {
        ctx.fillStyle = p.color || "#7a5c3c";
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(p.x, p.y, p.w, 3);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(p.x, p.y + p.h - 3, p.w, 3);
      }

      // coins
      for (const c of level.coins) {
        if (c.collected) continue;
        const pulse = Math.sin(s.animFrame * 0.08 + c.x * 0.1) * 1.5;
        ctx.fillStyle = "#FFD700";
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r + pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FFA500";
        ctx.beginPath(); ctx.arc(c.x - 2, c.y - 2, 3, 0, Math.PI * 2); ctx.fill();
      }

      // enemies
      for (const e of level.enemies) {
        if (e.dead) continue;
        ctx.fillStyle = "#cc2200";
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = "#ff4422";
        ctx.fillRect(e.x + 2, e.y + 2, e.w - 4, e.h / 2);
        ctx.fillStyle = "#fff";
        ctx.fillRect(e.x + 5, e.y + 5, 4, 4);
        ctx.fillRect(e.x + e.w - 9, e.y + 5, 4, 4);
        ctx.fillStyle = "#000";
        ctx.fillRect(e.x + 6, e.y + 6, 2, 3);
        ctx.fillRect(e.x + e.w - 8, e.y + 6, 2, 3);
      }

      // finish flag
      const f = level.finish;
      ctx.fillStyle = s.currentLevel < 2 ? "#22cc44" : "#FFD700";
      ctx.fillRect(f.x + 18, f.y, 4, f.h);
      ctx.fillStyle = s.currentLevel < 2 ? "#22cc44" : "#FFD700";
      ctx.beginPath();
      ctx.moveTo(f.x + 22, f.y);
      ctx.lineTo(f.x + 22 + 20, f.y + 12);
      ctx.lineTo(f.x + 22, f.y + 24);
      ctx.closePath();
      ctx.fill();

      // player
      drawPlayer(ctx);

      // overlays
      if (s.status === "dead") {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ff4444";
        ctx.font = "bold 36px 'VT323', monospace";
        ctx.textAlign = "center";
        ctx.fillText("💥 УПАЛ!", W / 2, H / 2 - 10);
        ctx.fillStyle = "#fff";
        ctx.font = "20px 'IBM Plex Mono', monospace";
        ctx.fillText("Перезапуск...", W / 2, H / 2 + 30);
      }

      if (s.status === "levelwin") {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 42px 'VT323', monospace";
        ctx.textAlign = "center";
        const msgs = ["🎉 УРОВЕНЬ 1 ПРОЙДЕН!", "🎉 УРОВЕНЬ 2 ПРОЙДЕН!", "🏆 ФИНАЛ ПРОЙДЕН!"];
        ctx.fillText(msgs[s.currentLevel] || "🎉 УРОВЕНЬ ПРОЙДЕН!", W / 2, H / 2 - 10);
        ctx.fillStyle = "#fff";
        ctx.font = "20px 'IBM Plex Mono', monospace";
        ctx.fillText(s.currentLevel < 2 ? "Следующий уровень..." : "Ты победил!", W / 2, H / 2 + 32);
      }

      if (s.status === "win") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 48px 'VT323', monospace";
        ctx.textAlign = "center";
        ctx.fillText("🏆 ВСЕ УРОВНИ ПРОЙДЕНЫ!", W / 2, H / 2 - 20);
        ctx.fillStyle = "#aaffaa";
        ctx.font = "22px 'IBM Plex Mono', monospace";
        ctx.fillText("Нажми R для новой игры", W / 2, H / 2 + 24);
      }
    }

    function loop() {
      update();
      drawScene();
      raf = requestAnimationFrame(loop);
    }

    // restart on R
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyR" && stateRef.current.status === "win") { loadLevel(0); }
    };
    window.addEventListener("keydown", onKey);

    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", onKey); };
  }, [loadLevel]);

  const levelNames = ["1. Лесная поляна", "2. Снежные горы", "3. Вулкан"];

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      {/* header */}
      <div className="ms-panel w-full max-w-3xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="font-title text-lg text-ms-primary">🕹️ ПЛАТФОРМЕР</span>
            <span className="ms-badge">{levelNames[uiState.currentLevel]}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="ms-display">
              <span>🪙</span>
              <span className="font-digit text-ms-primary">{uiState.coins}/{uiState.totalCoins}</span>
            </div>
            <button
              onClick={() => { loadLevel(uiState.currentLevel); }}
              className="ms-btn-secondary text-sm flex items-center gap-1"
              title="Начать уровень заново (R)"
            >
              <Icon name="RotateCcw" size={13} />
              Рестарт
            </button>
            <button
              onClick={() => setCurrentPage("game")}
              className="ms-btn-secondary text-sm flex items-center gap-1"
            >
              <Icon name="ChevronLeft" size={14} />
              Сапёр
            </button>
          </div>
        </div>
      </div>

      {/* canvas */}
      <div className="ms-board-container" style={{ maxWidth: "100%", overflowX: "auto" }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", imageRendering: "pixelated" }}
        />
      </div>

      {/* touch controls */}
      <div className="flex items-center gap-3 mt-1">
        <button
          onPointerDown={() => setTouchKey("ArrowLeft", true)}
          onPointerUp={() => setTouchKey("ArrowLeft", false)}
          onPointerLeave={() => setTouchKey("ArrowLeft", false)}
          className="ms-btn-secondary w-14 h-14 text-xl flex items-center justify-center select-none"
        >◀</button>
        <button
          onPointerDown={() => setTouchKey("Space", true)}
          onPointerUp={() => setTouchKey("Space", false)}
          onPointerLeave={() => setTouchKey("Space", false)}
          className="ms-btn-primary w-16 h-14 text-2xl flex items-center justify-center select-none"
        >↑</button>
        <button
          onPointerDown={() => setTouchKey("ArrowRight", true)}
          onPointerUp={() => setTouchKey("ArrowRight", false)}
          onPointerLeave={() => setTouchKey("ArrowRight", false)}
          className="ms-btn-secondary w-14 h-14 text-xl flex items-center justify-center select-none"
        >▶</button>
      </div>

      <div className="text-xs font-mono text-ms-muted">
        ⌨️ Управление: ←→ / WASD — движение · ↑ / W / Пробел — прыжок · 👾 Прыгай на врагов сверху!
      </div>
    </div>
  );
}
