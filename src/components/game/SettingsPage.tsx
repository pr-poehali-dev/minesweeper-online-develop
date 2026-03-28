interface Settings {
  playerName: string;
  theme: "classic" | "dark";
  soundEnabled: boolean;
}

interface SettingsPageProps {
  settings: Settings;
  setSettings: (s: Settings) => void;
}

export default function SettingsPage({ settings, setSettings }: SettingsPageProps) {
  const update = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch });

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <div className="ms-panel">
        <div className="ms-panel-title">⚙️ Настройки</div>
      </div>

      <div className="ms-panel space-y-4">
        <div className="ms-panel-title">👤 Игрок</div>
        <div className="space-y-2">
          <label className="font-mono text-sm text-ms-muted">Имя игрока</label>
          <input
            className="ms-input w-full"
            value={settings.playerName}
            onChange={e => update({ playerName: e.target.value })}
            maxLength={20}
            placeholder="Введите имя..."
          />
          <div className="font-mono text-xs text-ms-muted">Это имя появится в таблице лидеров</div>
        </div>
      </div>

      <div className="ms-panel space-y-4">
        <div className="ms-panel-title">🎨 Оформление</div>
        <div className="space-y-2">
          <label className="font-mono text-sm text-ms-muted">Тема интерфейса</label>
          <div className="flex gap-3">
            {(["classic", "dark"] as const).map(t => (
              <button
                key={t}
                onClick={() => update({ theme: t })}
                className={`ms-theme-btn ${settings.theme === t ? "ms-theme-selected" : ""}`}
              >
                <span>{t === "classic" ? "☀️" : "🌙"}</span>
                <span className="font-mono text-sm">{t === "classic" ? "Классическая" : "Тёмная"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ms-panel space-y-4">
        <div className="ms-panel-title">🔊 Звук</div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm">Звуковые эффекты</span>
          <button
            onClick={() => update({ soundEnabled: !settings.soundEnabled })}
            className={`ms-toggle ${settings.soundEnabled ? "ms-toggle-on" : "ms-toggle-off"}`}
          >
            <div className="ms-toggle-thumb" />
          </button>
        </div>
      </div>

      <div className="ms-panel font-mono text-xs text-ms-muted space-y-1">
        <div>💣 МиноИскатель v1.0</div>
        <div>Классическая игра Сапёр с режимами Блиц и Бесконечный</div>
        <div>Сделано на poehali.dev</div>
      </div>
    </div>
  );
}
