import { type Page } from "@/pages/Index";
import Icon from "@/components/ui/icon";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  theme: "classic" | "dark";
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "House" },
  { id: "game", label: "Сапёр", icon: "Gamepad2" },
  { id: "platformer", label: "Платформер", icon: "Joystick" },
  { id: "leaderboard", label: "Лидеры", icon: "Trophy" },
  { id: "stats", label: "Статистика", icon: "BarChart2" },
  { id: "rules", label: "Правила", icon: "BookOpen" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

export default function Layout({ children, currentPage, setCurrentPage, theme }: LayoutProps) {
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? "ms-dark" : "ms-light"}`}>
      <header className="ms-titlebar">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💣</span>
          <span className="font-title text-xl tracking-widest uppercase">Попов Сапёр из гимназии</span>
        </div>
        <div className="flex gap-1">
          <div className="ms-win-btn">─</div>
          <div className="ms-win-btn">□</div>
          <div className="ms-win-btn ms-win-close">✕</div>
        </div>
      </header>

      <nav className="ms-menubar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`ms-menu-item ${currentPage === item.id ? "ms-menu-active" : ""}`}
          >
            <Icon name={item.icon} size={14} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>

      <footer className="ms-statusbar">
        <span>💣 Попов Сапёр из гимназии v1.0</span>
        <span className="ml-auto">poehali.dev</span>
      </footer>
    </div>
  );
}