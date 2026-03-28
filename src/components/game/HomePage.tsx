import { useState } from "react";
import { type GameMode, type Difficulty, type Page } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface HomePageProps {
  onStartGame: (mode: GameMode, difficulty: Difficulty) => void;
  setCurrentPage: (page: Page) => void;
}

const modes: { id: GameMode; label: string; icon: string; desc: string; color: string }[] = [
  { id: "classic", label: "Классический", icon: "Target", desc: "Открой все клетки без мин", color: "ms-mode-classic" },
  { id: "blitz", label: "Блиц", icon: "Zap", desc: "60 секунд — успей или взорвись!", color: "ms-mode-blitz" },
  { id: "infinite", label: "Бесконечный", icon: "Infinity", desc: "Играй сколько угодно без конца", color: "ms-mode-infinite" },
];

const difficulties: { id: Difficulty; label: string; emoji: string; grid: string; mines: string }[] = [
  { id: "easy", label: "Лёгкий", emoji: "😊", grid: "9×9", mines: "10 мин" },
  { id: "medium", label: "Средний", emoji: "😤", grid: "16×16", mines: "40 мин" },
  { id: "hard", label: "Сложный", emoji: "💀", grid: "30×16", mines: "99 мин" },
];

export default function HomePage({ onStartGame, setCurrentPage }: HomePageProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>("medium");

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="ms-panel text-center py-8">
        <div className="text-6xl mb-3">💣</div>
        <h1 className="font-title text-4xl tracking-widest uppercase text-ms-primary mb-2">МиноИскатель</h1>
        <p className="font-mono text-sm text-ms-muted">Классическая игра Сапёр — найди все мины!</p>
      </div>

      <div className="ms-panel">
        <div className="ms-panel-title">⚡ Выберите режим</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`ms-mode-card ${selectedMode === mode.id ? "ms-mode-selected" : ""}`}
            >
              <Icon name={mode.icon} size={28} />
              <div className="font-title text-lg">{mode.label}</div>
              <div className="text-xs font-mono text-ms-muted">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="ms-panel">
        <div className="ms-panel-title">🎯 Сложность</div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              onClick={() => setSelectedDiff(diff.id)}
              className={`ms-diff-card ${selectedDiff === diff.id ? "ms-diff-selected" : ""}`}
            >
              <div className="text-2xl">{diff.emoji}</div>
              <div className="font-title text-base">{diff.label}</div>
              <div className="text-xs font-mono text-ms-muted">{diff.grid}</div>
              <div className="text-xs font-mono text-ms-danger">{diff.mines}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStartGame(selectedMode, selectedDiff)}
        className="ms-btn-primary w-full py-4 text-xl font-title tracking-widest uppercase"
      >
        🚀 Начать игру
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setCurrentPage("leaderboard")} className="ms-btn-secondary flex items-center justify-center gap-2">
          <Icon name="Trophy" size={16} />
          Таблица лидеров
        </button>
        <button onClick={() => setCurrentPage("rules")} className="ms-btn-secondary flex items-center justify-center gap-2">
          <Icon name="BookOpen" size={16} />
          Правила игры
        </button>
      </div>
    </div>
  );
}
