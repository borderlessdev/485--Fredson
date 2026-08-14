import { useMemo, useState } from 'react';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

type CalendarEvent = {
  id: string;
  dateKey: string;
  title: string;
  time?: string;
};

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

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

function seedEvents(_today: Date): CalendarEvent[] {
  return [];
}

export default function DashboardCalendar() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const [events, setEvents] = useState<CalendarEvent[]>(() => seedEvents(today));
  const [draftTitle, setDraftTitle] = useState('');
  const [draftTime, setDraftTime] = useState('');

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonth(year, month), [year, month]);
  const selectedKey = toKey(selected);
  const dayEvents = events.filter((e) => e.dateKey === selectedKey);

  function prevMonth() {
    setCursor(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCursor(new Date(year, month + 1, 1));
  }

  function goToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(today);
  }

  function addEvent(e: React.FormEvent) {
    e.preventDefault();
    const title = draftTitle.trim();
    if (!title) return;
    setEvents((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        dateKey: selectedKey,
        title,
        time: draftTime.trim() || undefined,
      },
    ]);
    setDraftTitle('');
    setDraftTime('');
  }

  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 leading-none">Calendário</h3>
          <p className="text-xs text-slate-500 mt-1">Agenda e compromissos</p>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md transition-colors"
        >
          Hoje
        </button>
      </div>

      <div className="px-5 pt-4 pb-3 border-b border-slate-50">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Mês anterior"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">{MONTHS[month]}</p>
            <p className="text-[11px] text-slate-400">{year}</p>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Próximo mês"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell.day || !cell.date) {
              return <div key={`empty-${i}`} className="h-9" />;
            }
            const key = toKey(cell.date);
            const isToday = sameDay(cell.date, today);
            const isSelected = sameDay(cell.date, selected);
            const hasEvents = events.some((ev) => ev.dateKey === key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(cell.date!)}
                className={[
                  'relative h-9 rounded-lg text-sm font-medium transition-all',
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : isToday
                      ? 'bg-sky-50 text-sky-800 ring-1 ring-sky-200'
                      : 'text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                {cell.day}
                {hasEvents && (
                  <span
                    className={[
                      'absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                      isSelected ? 'bg-white' : 'bg-sky-500',
                    ].join(' ')}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 flex-1 flex flex-col min-h-0">
        <p className="text-xs font-semibold text-slate-800 mb-2">
          {selected.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>

        <div className="space-y-2 flex-1 overflow-y-auto min-h-[88px] max-h-[140px] mb-3">
          {dayEvents.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-lg">
              Nenhum evento neste dia
            </p>
          ) : (
            dayEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{ev.title}</p>
                  {ev.time && <p className="text-[10px] text-slate-500 mt-0.5">{ev.time}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeEvent(ev.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  aria-label="Remover evento"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={addEvent} className="flex gap-2 shrink-0">
          <input
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Novo evento…"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs
                       text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
          />
          <input
            type="time"
            value={draftTime}
            onChange={(e) => setDraftTime(e.target.value)}
            className="w-[96px] px-2 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs
                       text-slate-700 outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={!draftTitle.trim()}
            className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-40
                       text-white text-xs font-semibold transition-colors shrink-0"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
