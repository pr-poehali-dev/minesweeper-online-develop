import { useState } from "react";
import { type GameResult, type GameMode, type Difficulty } from "@/pages/Index";

interface LeaderboardPageProps {
  gameHistory: GameResult[];
}

type Filter = "all" | GameMode;

export default function LeaderboardPage({ gameHistory }: LeaderboardPageProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [diffFilter, setDiffFilter] = useState<"all" | Difficulty>("all");

  const filtered = gameHistory
    .filter(g => g.won)
    .filter(g => filter === "all" || g.mode === filter)
    .filter(g => diffFilter === "all" || g.difficulty === diffFilter)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  const modeLabel: Record<string, string> = { classic: "Классик", blitz: "Блиц", infinite: "Бескон." };
  const diffLabel: Record<string, string> = { easy: "😊", medium: "😤", hard: "💀" };
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="ms-panel">
        <div className="ms-panel-title">🏆 Таблица лидеров</div>
      </div>

      <div className="ms-panel flex flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {(["all", "classic", "blitz", "infinite"] as const).map(m => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`ms-filter-btn ${filter === m ? "ms-filter-active" : ""}`}
            >
              {m === "all" ? "Все режимы" : modeLabel[m]}
            </button>
          ))}
        </div>
        <div className="w-px bg-ms-border hidden md:block" />
        <div className="flex gap-1 flex-wrap">
          {(["all", "easy", "medium", "hard"] as const).map(d => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={`ms-filter-btn ${diffFilter === d ? "ms-filter-active" : ""}`}
            >
              {d === "all" ? "Все" : diffLabel[d]}
            </button>
          ))}
        </div>
      </div>

      <div className="ms-panel">
        {filtered.length === 0 ? (
          <div className="font-mono text-sm text-ms-muted py-8 text-center">
            Нет записей в этой категории
          </div>
        ) : (
          <div className="space-y-1">
            <div className="ms-lb-header">
              <span className="w-8">#</span>
              <span className="flex-1">Игрок</span>
              <span className="w-16 text-center">Режим</span>
              <span className="w-8 text-center">Сл.</span>
              <span className="w-20 text-right">Время</span>
              <span className="w-20 text-right">Очки</span>
            </div>
            {filtered.map((entry, i) => (
              <div
                key={entry.id}
                className={`ms-lb-row ${i < 3 ? "ms-lb-top" : ""}`}
              >
                <span className="w-8 font-digit text-lg">
                  {i < 3 ? medals[i] : `${i + 1}`}
                </span>
                <span className="flex-1 font-mono text-sm truncate">{entry.playerName}</span>
                <span className="w-16 text-center">
                  <span className="ms-badge text-xs">{modeLabel[entry.mode]}</span>
                </span>
                <span className="w-8 text-center text-base">{diffLabel[entry.difficulty]}</span>
                <span className="w-20 text-right font-digit text-sm text-ms-muted">{formatTime(entry.time)}</span>
                <span className="w-20 text-right font-digit text-ms-primary font-bold">{entry.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
