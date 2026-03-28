export default function RulesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="ms-panel">
        <div className="ms-panel-title">📖 Правила игры</div>
        <p className="font-mono text-sm text-ms-muted mt-2">
          МиноИскатель — классическая логическая игра. Твоя цель — открыть все клетки, не задев ни одной мины.
        </p>
      </div>

      <div className="ms-panel space-y-3">
        <div className="ms-panel-title">🖱️ Управление</div>
        <div className="space-y-2 font-mono text-sm">
          <div className="ms-rule-row">
            <span className="ms-key">ЛКМ</span>
            <span>Открыть клетку</span>
          </div>
          <div className="ms-rule-row">
            <span className="ms-key">ПКМ</span>
            <span>Поставить / убрать флажок 🚩</span>
          </div>
          <div className="ms-rule-row">
            <span className="ms-key">😊</span>
            <span>Нажать на смайлик — начать заново</span>
          </div>
        </div>
      </div>

      <div className="ms-panel space-y-3">
        <div className="ms-panel-title">🔢 Значение цифр</div>
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {[
            { n: 1, color: "text-ms-num1", desc: "1 мина рядом" },
            { n: 2, color: "text-ms-num2", desc: "2 мины рядом" },
            { n: 3, color: "text-ms-num3", desc: "3 мины рядом" },
            { n: 4, color: "text-ms-num4", desc: "4 мины рядом" },
            { n: 5, color: "text-ms-num5", desc: "5 мин рядом" },
            { n: 6, color: "text-ms-num6", desc: "6 мин рядом" },
          ].map(({ n, color, desc }) => (
            <div key={n} className="flex items-center gap-3 ms-rule-row">
              <span className={`font-digit text-xl font-bold ${color} w-6 text-center`}>{n}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ms-panel space-y-3">
        <div className="ms-panel-title">⚡ Режимы игры</div>
        <div className="space-y-3 font-mono text-sm">
          <div className="ms-rule-row flex-col items-start gap-1">
            <div className="flex items-center gap-2"><span className="ms-badge">Классический</span></div>
            <span className="text-ms-muted">Открой все безопасные клетки. Без ограничений по времени.</span>
          </div>
          <div className="ms-rule-row flex-col items-start gap-1">
            <div className="flex items-center gap-2"><span className="ms-badge ms-badge-danger">Блиц</span></div>
            <span className="text-ms-muted">60 секунд на всё. Таймер считает вниз — спеши!</span>
          </div>
          <div className="ms-rule-row flex-col items-start gap-1">
            <div className="flex items-center gap-2"><span className="ms-badge ms-badge-success">Бесконечный</span></div>
            <span className="text-ms-muted">После победы — новое поле. Играй без остановки, накапливай очки.</span>
          </div>
        </div>
      </div>

      <div className="ms-panel space-y-2">
        <div className="ms-panel-title">🏆 Очки</div>
        <div className="font-mono text-sm space-y-1 text-ms-muted">
          <div>• Базовые очки: <span className="text-ms-primary">мины × 100</span></div>
          <div>• Бонус за скорость: <span className="text-ms-primary">до 5000 очков</span></div>
          <div>• Блиц-режим: <span className="text-ms-primary">×1.5 множитель</span></div>
          <div>• При проигрыше: <span className="text-ms-danger">0 очков</span></div>
        </div>
      </div>
    </div>
  );
}
