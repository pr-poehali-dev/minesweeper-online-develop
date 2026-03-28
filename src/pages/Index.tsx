import { useState } from "react";
import HomePage from "@/components/game/HomePage";
import GamePage from "@/components/game/GamePage";
import RulesPage from "@/components/game/RulesPage";
import StatsPage from "@/components/game/StatsPage";
import LeaderboardPage from "@/components/game/LeaderboardPage";
import SettingsPage from "@/components/game/SettingsPage";
import PlatformerPage from "@/components/game/PlatformerPage";
import Layout from "@/components/game/Layout";

export type Page = "home" | "game" | "rules" | "stats" | "leaderboard" | "settings" | "platformer";
export type GameMode = "classic" | "blitz" | "infinite";
export type Difficulty = "easy" | "medium" | "hard";

export interface GameResult {
  id: string;
  playerName: string;
  mode: GameMode;
  difficulty: Difficulty;
  time: number;
  score: number;
  won: boolean;
  date: string;
}

const defaultSettings = {
  playerName: "Игрок",
  theme: "classic" as "classic" | "dark",
  soundEnabled: true,
};

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [gameMode, setGameMode] = useState<GameMode>("classic");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [settings, setSettings] = useState(defaultSettings);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([
    { id: "1", playerName: "Космонавт", mode: "classic", difficulty: "hard", time: 142, score: 9800, won: true, date: "2026-03-27" },
    { id: "2", playerName: "Звёздочка", mode: "blitz", difficulty: "medium", time: 45, score: 7200, won: true, date: "2026-03-27" },
    { id: "3", playerName: "Пилот", mode: "classic", difficulty: "medium", time: 88, score: 6500, won: true, date: "2026-03-26" },
    { id: "4", playerName: "Орбита", mode: "infinite", difficulty: "easy", time: 320, score: 5900, won: true, date: "2026-03-26" },
    { id: "5", playerName: "Нептун", mode: "blitz", difficulty: "hard", time: 60, score: 4300, won: false, date: "2026-03-25" },
  ]);

  const startGame = (mode: GameMode, diff: Difficulty) => {
    setGameMode(mode);
    setDifficulty(diff);
    setCurrentPage("game");
  };

  const addResult = (result: Omit<GameResult, "id" | "date" | "playerName">) => {
    const newResult: GameResult = {
      ...result,
      id: Date.now().toString(),
      playerName: settings.playerName,
      date: new Date().toISOString().split("T")[0],
    };
    setGameHistory((prev) => [newResult, ...prev].slice(0, 100));
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} theme={settings.theme}>
      {currentPage === "home" && <HomePage onStartGame={startGame} setCurrentPage={setCurrentPage} />}
      {currentPage === "game" && (
        <GamePage
          mode={gameMode}
          difficulty={difficulty}
          playerName={settings.playerName}
          onGameEnd={addResult}
          setCurrentPage={setCurrentPage}
          soundEnabled={settings.soundEnabled}
        />
      )}
      {currentPage === "rules" && <RulesPage />}
      {currentPage === "stats" && <StatsPage gameHistory={gameHistory} playerName={settings.playerName} />}
      {currentPage === "leaderboard" && <LeaderboardPage gameHistory={gameHistory} />}
      {currentPage === "settings" && (
        <SettingsPage settings={settings} setSettings={setSettings} />
      )}
      {currentPage === "platformer" && (
        <PlatformerPage setCurrentPage={setCurrentPage} />
      )}
    </Layout>
  );
};

export default Index;