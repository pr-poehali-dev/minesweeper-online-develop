import { useState, useEffect, useCallback, useRef } from "react";
import { type GameMode, type Difficulty, type Page } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface GamePageProps {
  mode: GameMode;
  difficulty: Difficulty;
  playerName: string;
  onGameEnd: (result: { mode: GameMode; difficulty: Difficulty; time: number; score: number; won: boolean }) => void;
  setCurrentPage: (page: Page) => void;
  soundEnabled: boolean;
}

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
};

const CONFIGS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

const BLITZ_TIME = 60;

const NUM_COLORS: Record<number, string> = {
  1: "text-ms-num1",
  2: "text-ms-num2",
  3: "text-ms-num3",
  4: "text-ms-num4",
  5: "text-ms-num5",
  6: "text-ms-num6",
  7: "text-ms-num7",
  8: "text-ms-num8",
};

function createEmptyBoard(rows: number, cols: number): CellState[][] {
  return Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }))
  );
}

function placeMines(board: CellState[][], rows: number, cols: number, mines: number, firstRow: number, firstCol: number): CellState[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!newBoard[r][c].isMine && !(Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1)) {
      newBoard[r][c].isMine = true;
      placed++;
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newBoard[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) count++;
          }
        }
        newBoard[r][c].neighborCount = count;
      }
    }
  }
  return newBoard;
}

function revealCells(board: CellState[][], rows: number, cols: number, row: number, col: number): CellState[][] {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  const stack = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) continue;
    newBoard[r][c].isRevealed = true;
    if (newBoard[r][c].neighborCount === 0 && !newBoard[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          stack.push([r + dr, c + dc]);
        }
      }
    }
  }
  return newBoard;
}

function calculateScore(won: boolean, time: number, mines: number, mode: GameMode): number {
  if (!won) return 0;
  const base = mines * 100;
  const timeBonus = Math.max(0, 5000 - time * 10);
  const modeMultiplier = mode === "blitz" ? 1.5 : mode === "infinite" ? 0.8 : 1;
  return Math.floor((base + timeBonus) * modeMultiplier);
}

export default function GamePage({ mode, difficulty, playerName, onGameEnd, setCurrentPage, soundEnabled }: GamePageProps) {
  const config = CONFIGS[difficulty];
  const [board, setBoard] = useState<CellState[][]>(() => createEmptyBoard(config.rows, config.cols));
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [time, setTime] = useState(mode === "blitz" ? BLITZ_TIME : 0);
  const [flagCount, setFlagCount] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [shaking, setShaking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reportedRef = useRef(false);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard(config.rows, config.cols));
    setGameStatus("idle");
    setTime(mode === "blitz" ? BLITZ_TIME : 0);
    setFlagCount(0);
    setFirstClick(true);
    reportedRef.current = false;
  }, [config.rows, config.cols, mode]);

  useEffect(() => {
    resetGame();
  }, [difficulty, mode, resetGame]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (gameStatus === "playing") {
      intervalRef.current = setInterval(() => {
        setTime(t => {
          if (mode === "blitz") {
            if (t <= 1) {
              setGameStatus("lost");
              return 0;
            }
            return t - 1;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [gameStatus, mode]);

  useEffect(() => {
    if ((gameStatus === "won" || gameStatus === "lost") && !reportedRef.current) {
      reportedRef.current = true;
      const finalTime = mode === "blitz" ? BLITZ_TIME - time : time;
      onGameEnd({
        mode,
        difficulty,
        time: finalTime,
        score: calculateScore(gameStatus === "won", finalTime, config.mines, mode),
        won: gameStatus === "won",
      });
    }
  }, [gameStatus, mode, time, config.mines, difficulty, onGameEnd]);

  const checkWin = (b: CellState[][]) => {
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (!b[r][c].isMine && !b[r][c].isRevealed) return false;
      }
    }
    return true;
  };

  const handleClick = (row: number, col: number) => {
    if (gameStatus === "won" || gameStatus === "lost") return;
    if (board[row][col].isFlagged || board[row][col].isRevealed) return;

    let newBoard = board;
    if (firstClick) {
      newBoard = placeMines(board, config.rows, config.cols, config.mines, row, col);
      setFirstClick(false);
      setGameStatus("playing");
    }

    if (newBoard[row][col].isMine) {
      const exploded = newBoard.map(r => r.map(c => ({ ...c, isRevealed: c.isMine ? true : c.isRevealed })));
      setBoard(exploded);
      setGameStatus("lost");
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      return;
    }

    const revealed = revealCells(newBoard, config.rows, config.cols, row, col);
    setBoard(revealed);
    if (checkWin(revealed)) setGameStatus("won");
  };

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameStatus === "won" || gameStatus === "lost") return;
    if (board[row][col].isRevealed) return;
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setFlagCount(f => newBoard[row][col].isFlagged ? f + 1 : f - 1);
    setBoard(newBoard);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const minesLeft = config.mines - flagCount;

  const modeName = { classic: "Классический", blitz: "Блиц", infinite: "Бесконечный" }[mode];
  const diffName = { easy: "Лёгкий", medium: "Средний", hard: "Сложный" }[difficulty];

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      <div className="ms-panel w-full max-w-fit">
        <div className="flex items-center gap-4 flex-wrap justify-between">
          <div className="flex items-center gap-3">
            <span className="ms-badge">{modeName}</span>
            <span className="ms-badge ms-badge-muted">{diffName}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="ms-display">
              <span>💣</span>
              <span className="font-digit text-ms-danger">{String(minesLeft).padStart(3, "0")}</span>
            </div>
            <button
              onClick={resetGame}
              className={`ms-face-btn ${gameStatus === "won" ? "ms-face-win" : gameStatus === "lost" ? "ms-face-lose" : gameStatus === "playing" ? "ms-face-play" : ""}`}
              title="Новая игра"
            >
              {gameStatus === "won" ? "😎" : gameStatus === "lost" ? "😵" : gameStatus === "playing" ? "😮" : "🙂"}
            </button>
            <div className="ms-display">
              <span>⏱</span>
              <span className={`font-digit ${mode === "blitz" && time <= 10 ? "text-ms-danger animate-pulse" : "text-ms-primary"}`}>
                {formatTime(time)}
              </span>
            </div>
          </div>
          <button onClick={() => setCurrentPage("home")} className="ms-btn-secondary text-sm flex items-center gap-1">
            <Icon name="ChevronLeft" size={14} />
            Меню
          </button>
        </div>
      </div>

      {(gameStatus === "won" || gameStatus === "lost") && (
        <div className={`ms-result-banner ${gameStatus === "won" ? "ms-result-win" : "ms-result-lose"} animate-scale-in`}>
          <span className="text-3xl">{gameStatus === "won" ? "🎉" : "💥"}</span>
          <div>
            <div className="font-title text-xl">{gameStatus === "won" ? "ПОБЕДА!" : "ВЗРЫВ!"}</div>
            <div className="font-mono text-sm">{gameStatus === "won" ? `Время: ${formatTime(mode === "blitz" ? BLITZ_TIME - time : time)}` : "Попробуй ещё раз"}</div>
          </div>
          <button onClick={resetGame} className="ms-btn-primary">
            Играть снова
          </button>
        </div>
      )}

      <div
        className={`ms-board-container ${shaking ? "animate-shake" : ""}`}
        style={{ overflowX: "auto", maxWidth: "100%" }}
      >
        <div
          className="ms-board"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
            gap: "2px",
            padding: "8px",
          }}
        >
          {board.map((row, ri) =>
            row.map((cell, ci) => {
              let content = "";
              let cellClass = "ms-cell";

              if (cell.isRevealed) {
                if (cell.isMine) {
                  cellClass += " ms-cell-mine";
                  content = "💣";
                } else {
                  cellClass += " ms-cell-open";
                  content = cell.neighborCount > 0 ? String(cell.neighborCount) : "";
                }
              } else if (cell.isFlagged) {
                cellClass += " ms-cell-flagged";
                content = "🚩";
              } else {
                cellClass += " ms-cell-hidden";
              }

              return (
                <button
                  key={`${ri}-${ci}`}
                  className={`${cellClass} ${cell.isRevealed && cell.neighborCount > 0 ? NUM_COLORS[cell.neighborCount] : ""}`}
                  onClick={() => handleClick(ri, ci)}
                  onContextMenu={(e) => handleRightClick(e, ri, ci)}
                  style={{ width: 28, height: 28, fontSize: 12, lineHeight: 1 }}
                >
                  {content}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="text-xs font-mono text-ms-muted">ПКМ — поставить флажок · ЛКМ — открыть клетку</div>
    </div>
  );
}
