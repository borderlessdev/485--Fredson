import { useMemo, useState } from 'react';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ day: number | null; date: Date | null }> = [];

  for (let i = 0; i < startPad; i++) cells.push({ day: null, date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: new Date(year, month, d) });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, date: null });
  return cells;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export default function LoginCalendar() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonth(year, month), [year, month]);

  function prevMonth() {
    setCursor(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCursor(new Date(year, month + 1, 1));
  }

  return (
    <div className="relative bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Mês anterior"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide">{MONTHS[month]}</p>
          <p className="text-xs text-white/60">{year}</p>
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Próximo mês"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-white/50 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.day || !cell.date) {
            return <div key={`empty-${i}`} className="h-9" />;
          }
          const isToday = sameDay(cell.date, today);
          const isSelected = sameDay(cell.date, selected);
          return (
            <button
              key={cell.day}
              type="button"
              onClick={() => setSelected(cell.date!)}
              className={[
                'h-9 rounded-lg text-sm font-medium transition-all',
                isSelected
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : isToday
                    ? 'bg-white/20 text-white ring-1 ring-white/40'
                    : 'text-white/85 hover:bg-white/15',
              ].join(' ')}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-white/60 text-center">
        Selecionado:{' '}
        <span className="text-white font-medium">
          {selected.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
      </p>
    </div>
  );
}
