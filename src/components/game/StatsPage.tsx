import { type GameResult } from "@/pages/Index";

interface StatsPageProps {
  gameHistory: GameResult[];
  playerName: string;
}

export default function StatsPage({ gameHistory, playerName }: StatsPageProps) {
  const myGames = gameHistory.filter(g => g.playerName === playerName);
  const totalGames = myGames.length;
  const wonGames = myGames.filter(g => g.won).length;
  const winRate = totalGames > 0 ? Math.round((wonGames / totalGames) * 100) : 0;
  const bestTime = myGames.filter(g => g.won).reduce((best, g) => Math.min(best, g.time), Infinity);
  const totalScore = myGames.reduce((sum, g) => sum + g.score, 0);
  const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;

  const byDifficulty = ["easy", "medium", "hard"].map(diff => {
    const games = myGames.filter(g => g.difficulty === diff);
    const won = games.filter(g => g.won).length;
    return { diff, total: games.length, won, rate: games.length > 0 ? Math.round((won / games.length) * 100) : 0 };
  });

  const diffLabel: Record<string, string> = { easy: "Лёгкий 😊", medium: "Средний 😤", hard: "Сложный 💀" };
  const formatTime = (s: number) => s === Infinity ? "—" : `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="ms-panel">
        <div className="ms-panel-title">📊 Статистика игрока: <span className="text-ms-primary">{playerName}</span></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Всего игр", value: totalGames, icon: "🎮" },
          { label: "Победы", value: wonGames, icon: "🏆" },
          { label: "Процент побед", value: `${winRate}%`, icon: "📈" },
          { label: "Лучшее время", value: formatTime(bestTime), icon: "⏱" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="ms-stat-card">
            <div className="text-2xl">{icon}</div>
            <div className="font-digit text-2xl text-ms-primary">{value}</div>
            <div className="font-mono text-xs text-ms-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="ms-panel">
        <div className="ms-panel-title">🎯 По сложности</div>
        <div className="space-y-3 mt-3">
          {byDifficulty.map(({ diff, total, won, rate }) => (
            <div key={diff} className="space-y-1">
              <div className="flex justify-between font-mono text-sm">
                <span>{diffLabel[diff]}</span>
                <span className="text-ms-muted">{won}/{total} игр ({rate}%)</span>
              </div>
              <div className="ms-progress-bar">
                <div className="ms-progress-fill" style={{ width: `${rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ms-panel">
        <div className="ms-panel-title">📅 Последние игры</div>
        {myGames.length === 0 ? (
          <div className="font-mono text-sm text-ms-muted py-4 text-center">Нет сыгранных партий</div>
        ) : (
          <div className="space-y-2 mt-3">
            {myGames.slice(0, 8).map(g => (
              <div key={g.id} className="ms-history-row">
                <span>{g.won ? "✅" : "💥"}</span>
                <span className="font-mono text-xs ms-badge">{g.mode}</span>
                <span className="font-mono text-xs ms-badge ms-badge-muted">{g.difficulty}</span>
                <span className="font-mono text-xs text-ms-muted ml-auto">{formatTime(g.time)}</span>
                <span className="font-digit text-sm text-ms-primary">{g.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ms-panel flex justify-between font-mono text-sm">
        <span className="text-ms-muted">Сумма очков:</span>
        <span className="font-digit text-ms-primary text-lg">{totalScore.toLocaleString()}</span>
      </div>
    </div>
  );
}
