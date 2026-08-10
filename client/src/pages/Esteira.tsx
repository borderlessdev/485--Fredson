import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { PRECATORIO_STATUS, STATUS_DOTS, STATUS_STYLES, type PrecatorioStatus } from '@/data/status';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Card {
  id: number;
  processo: string;
  credor: string;
  tribunal: string;
  status: PrecatorioStatus;
  valor: number;
  atualizadoEm: string;
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const INITIAL_CARDS: Card[] = [
  { id: 30, processo: '481983-62.2023.8.04.0001', credor: 'BERNARDES LEITE DE OLIVEIRA', tribunal: 'TJAM', status: 'Em Análise', valor: 28000, atualizadoEm: 'Hoje' },
  { id: 25, processo: '10194248820244013400', credor: 'LIA MARCIA DA SILVA SANTOS', tribunal: 'TRF1', status: 'Em Análise', valor: 495000, atualizadoEm: 'Ontem' },
  { id: 24, processo: '0039519-60.2004.4.01.3400', credor: 'IVETTE MAURELLI DIAS', tribunal: 'TRF1', status: 'Aguardando Documentos', valor: 183000, atualizadoEm: '2d' },
  { id: 23, processo: '0039519-60.2004.4.01.3400', credor: 'ARMANDO BERNARDES NETO', tribunal: 'TRF1', status: 'Aguardando Proposta', valor: 45000, atualizadoEm: '3d' },
  { id: 22, processo: '1016656-92.2024.4.01.3400', credor: 'MARCELO TADEU DOS SANTOS', tribunal: 'TRF1', status: 'Proposta Enviada', valor: 23000, atualizadoEm: '3d' },
  { id: 21, processo: '1016656-92.2024.4.01.3400', credor: 'MARCOS TADEU DA SILVA', tribunal: 'TRF1', status: 'Aprovado', valor: 23000, atualizadoEm: '4d' },
  { id: 18, processo: '1030945-30.2024.4.01.3400', credor: 'ANA ODORIGES DA SILVA', tribunal: 'TRF1', status: 'Em Análise', valor: 258000, atualizadoEm: '5d' },
  { id: 17, processo: '0045554-45.2013.8.13.0363', credor: 'JOSE CARLOS FERREIRA LIMA', tribunal: 'TJMG', status: 'Proposta Rejeitada', valor: 108000, atualizadoEm: '1 sem' },
  { id: 28, processo: '1007017-64.2021.4.01.3300', credor: 'MARIO LUIZ SOUZA BRANDAO', tribunal: 'TRF1', status: 'Concluído', valor: 66000, atualizadoEm: '1 sem' },
  { id: 26, processo: '3000365-32.2023.8.06.0041', credor: 'FRANCISCO HENRIQUE DE MACEDO', tribunal: 'TJCE', status: 'Em Cessão', valor: 45000, atualizadoEm: '2 sem' },
  { id: 19, processo: '3000365-32.2023.8.06.0041', credor: 'ALUISIO TAVEIRA DOS SANTOS', tribunal: 'TJCE', status: 'Concluído', valor: 68000, atualizadoEm: '2 sem' },
  { id: 15, processo: '1001244-06.2022.4.06.3804', credor: 'CLESIO RODRIGUES ALVES JUNIOR', tribunal: 'TRF6', status: 'Concluído', valor: 135000, atualizadoEm: '3 sem' },
  { id: 14, processo: '3000268-32.2023.8.06.0041', credor: 'FRANCISCO HENRIQUE DE MACEDO', tribunal: 'TJCE', status: 'Em Cessão', valor: 84000, atualizadoEm: '3 sem' },
  { id: 13, processo: '3000268-32.2023.8.06.0041', credor: 'IRAILDE PEREIRA DE LIMA', tribunal: 'TJCE', status: 'Aprovado', valor: 196000, atualizadoEm: '1 mês' },
  { id: 6, processo: '5023469-75.2023.4.04.7003', credor: 'RICARDO AMARAL GOMES FERNANDES', tribunal: 'TRF4', status: 'Concluído', valor: 92000, atualizadoEm: '1 mês' },
];

const COLUMN_TINT: Record<PrecatorioStatus, string> = {
  'Aguardando Proposta': 'from-slate-100/80 to-transparent',
  'Proposta Enviada': 'from-sky-100/70 to-transparent',
  'Proposta Rejeitada': 'from-rose-100/70 to-transparent',
  'Aguardando Documentos': 'from-orange-100/70 to-transparent',
  'Em Análise': 'from-amber-100/70 to-transparent',
  'Aprovado': 'from-teal-100/70 to-transparent',
  'Em Cessão': 'from-violet-100/70 to-transparent',
  'Concluído': 'from-emerald-100/70 to-transparent',
};

const COLUMN_RING: Record<PrecatorioStatus, string> = {
  'Aguardando Proposta': 'ring-slate-300 bg-slate-50/80',
  'Proposta Enviada': 'ring-sky-300 bg-sky-50/80',
  'Proposta Rejeitada': 'ring-rose-300 bg-rose-50/70',
  'Aguardando Documentos': 'ring-orange-300 bg-orange-50/70',
  'Em Análise': 'ring-amber-300 bg-amber-50/70',
  'Aprovado': 'ring-teal-300 bg-teal-50/70',
  'Em Cessão': 'ring-violet-300 bg-violet-50/70',
  'Concluído': 'ring-emerald-300 bg-emerald-50/70',
};

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function shortProcesso(p: string) {
  if (p.length <= 22) return p;
  return `${p.slice(0, 10)}…${p.slice(-8)}`;
}

function IcoSearch() {
  return (
    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </svg>
  );
}

function IcoGrip() {
  return (
    <svg className="h-3.5 w-3.5 text-slate-300" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="5" cy="4" r="1.2" />
      <circle cx="11" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EsteiraPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<PrecatorioStatus | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const active = cards.find((c) => c.id === activeId) ?? null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.processo.toLowerCase().includes(q) ||
        c.credor.toLowerCase().includes(q) ||
        c.tribunal.toLowerCase().includes(q) ||
        String(c.id).includes(q),
    );
  }, [cards, search]);

  const counts = useMemo(() => {
    const map = Object.fromEntries(PRECATORIO_STATUS.map((s) => [s, 0])) as Record<PrecatorioStatus, number>;
    for (const c of cards) map[c.status] += 1;
    return map;
  }, [cards]);

  const pipelineValue = useMemo(
    () => cards.filter((c) => c.status !== 'Concluído' && c.status !== 'Proposta Rejeitada').reduce((s, c) => s + c.valor, 0),
    [cards],
  );

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  }

  function onDragStart(e: React.DragEvent, id: number) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
  }

  function onDragOver(e: React.DragEvent, col: PrecatorioStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overCol !== col) setOverCol(col);
  }

  function onDrop(col: PrecatorioStatus) {
    if (draggingId === null) return;
    const card = cards.find((c) => c.id === draggingId);
    if (card && card.status !== col) {
      setCards((prev) => prev.map((c) => (c.id === draggingId ? { ...c, status: col, atualizadoEm: 'Agora' } : c)));
      flash(`#${draggingId} → ${col}`);
    }
    setDraggingId(null);
    setOverCol(null);
  }

  function onDragEnd() {
    setDraggingId(null);
    setOverCol(null);
  }

  function moveCard(id: number, status: PrecatorioStatus) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status, atualizadoEm: 'Agora' } : c)));
    flash(`#${id} → ${status}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f6fa]">
      <Sidebar onLogout={handleLogout} userName={user?.name ?? ''} userEmail={user?.email ?? ''} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="relative shrink-0 overflow-hidden border-b border-slate-200/80 bg-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.09),_transparent_55%),radial-gradient(ellipse_at_80%_0%,_rgba(45,212,191,0.06),_transparent_45%)]"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-end justify-between gap-4 px-6 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">Operações</p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Esteira</h1>
              <p className="mt-1 max-w-lg text-sm text-slate-500">
                Arraste cards entre status · {cards.length} operações · pipeline {BRL.format(pipelineValue)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <IcoSearch />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar processo, credor…"
                  className="w-[220px] rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <button
                type="button"
                onClick={() => navigate('/precatorios')}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-colors hover:bg-sky-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Novo precatório
              </button>
            </div>
          </div>

          {/* Mini pipeline strip */}
          <div className="relative flex gap-1.5 overflow-x-auto px-6 pb-3">
            {PRECATORIO_STATUS.map((s) => (
              <div
                key={s}
                className="flex min-w-0 shrink-0 items-center gap-1.5 rounded-lg border border-slate-100 bg-white/80 px-2.5 py-1.5"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[s]}`} />
                <span className="max-w-[88px] truncate text-[10px] font-semibold text-slate-600">{s.split(' ')[0]}</span>
                <span className="font-display text-xs font-bold tabular-nums text-slate-900">{counts[s]}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full min-w-max gap-3 px-5 py-4">
            {PRECATORIO_STATUS.map((col, colIdx) => {
              const colCards = filtered.filter((c) => c.status === col);
              const isOver = overCol === col;
              return (
                <section
                  key={col}
                  aria-label={col}
                  onDragOver={(e) => onDragOver(e, col)}
                  onDragLeave={() => {
                    if (overCol === col) setOverCol(null);
                  }}
                  onDrop={() => onDrop(col)}
                  className={[
                    'flex w-[272px] shrink-0 flex-col rounded-2xl border transition-all duration-200',
                    isOver
                      ? `border-transparent ring-2 ${COLUMN_RING[col]} shadow-md`
                      : 'border-slate-200/90 bg-white/70',
                  ].join(' ')}
                  style={{ animationDelay: `${colIdx * 40}ms` }}
                >
                  <div className={`rounded-t-2xl bg-gradient-to-b ${COLUMN_TINT[col]} px-3.5 pb-2.5 pt-3.5`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white shadow-sm ${STATUS_DOTS[col]}`} />
                          <h2 className="truncate text-[13px] font-semibold text-slate-800" title={col}>
                            {col}
                          </h2>
                        </div>
                        <p className="mt-1 pl-[18px] text-[11px] text-slate-400">
                          {colCards.length} {colCards.length === 1 ? 'card' : 'cards'}
                          {search && filtered.length !== cards.length ? ' · filtrado' : ''}
                        </p>
                      </div>
                      <span className="font-display flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-white/90 px-1.5 text-sm font-bold tabular-nums text-slate-800 shadow-sm ring-1 ring-slate-200/80">
                        {colCards.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-2.5 pb-3 pt-1 scrollbar-thin">
                    {colCards.length === 0 && (
                      <div
                        className={[
                          'mt-1 flex h-24 flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors',
                          isOver ? 'border-sky-400 bg-sky-50/50 text-sky-600' : 'border-slate-200/80 text-slate-400',
                        ].join(' ')}
                      >
                        <p className="text-xs font-medium">{isOver ? 'Solte aqui' : 'Vazio'}</p>
                        <p className="mt-0.5 text-[10px] opacity-80">Arraste um card</p>
                      </div>
                    )}

                    {colCards.map((card, i) => {
                      const isActive = activeId === card.id;
                      const isDragging = draggingId === card.id;
                      return (
                        <article
                          key={card.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, card.id)}
                          onDragEnd={onDragEnd}
                          onClick={() => setActiveId(card.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setActiveId(card.id);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-grabbed={isDragging}
                          className={[
                            'group relative cursor-grab rounded-xl border bg-white p-3 text-left outline-none transition-all duration-200 active:cursor-grabbing',
                            'focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1',
                            isDragging ? 'scale-[0.97] opacity-35 shadow-none' : 'hover:-translate-y-0.5 hover:shadow-md',
                            isActive
                              ? 'border-sky-300 shadow-md ring-2 ring-sky-100'
                              : 'border-slate-200/90 shadow-[0_1px_0_rgba(15,23,42,0.03)] hover:border-slate-300',
                          ].join(' ')}
                          style={{ animationDelay: `${colIdx * 40 + i * 30}ms` }}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <IcoGrip />
                              #{card.id}
                            </span>
                            <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-100">
                              {card.tribunal}
                            </span>
                          </div>

                          <p className="font-mono text-[12px] font-semibold leading-snug text-slate-800" title={card.processo}>
                            {shortProcesso(card.processo)}
                          </p>

                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-cyan-50 text-[10px] font-bold text-sky-800 ring-1 ring-sky-100">
                              {initials(card.credor)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-medium text-slate-700">{card.credor || 'Sem credor'}</p>
                              <p className="text-[10px] text-slate-400">{card.atualizadoEm}</p>
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2">
                            <span className="font-display text-[13px] font-bold tabular-nums text-slate-900">
                              {BRL.format(card.valor)}
                            </span>
                            <span className="text-[10px] font-semibold text-sky-600 opacity-0 transition-opacity group-hover:opacity-100">
                              Abrir →
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {active && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]" onClick={() => setActiveId(null)} aria-label="Fechar" />
          <aside
            className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl animate-[slideIn_240ms_ease]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="esteira-card-title"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.14),_transparent_70%)]" aria-hidden />
            <header className="relative z-10 flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">Operação #{active.id}</p>
                <h2 id="esteira-card-title" className="font-display mt-0.5 text-xl font-semibold text-slate-900">
                  {active.credor || 'Sem credor'}
                </h2>
                <span className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[active.status]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[active.status]}`} />
                  {active.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                aria-label="Fechar painel"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="relative z-10 flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <dl className="space-y-3">
                <Row label="Processo" value={active.processo} mono />
                <Row label="Tribunal" value={active.tribunal} />
                <Row label="Valor face" value={BRL.format(active.valor)} strong />
                <Row label="Atualizado" value={active.atualizadoEm} />
              </dl>

              <div>
                <label htmlFor="move-status" className="mb-1.5 block text-[13px] font-medium text-slate-700">
                  Mover para status
                </label>
                <select
                  id="move-status"
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                  value={active.status}
                  onChange={(e) => moveCard(active.id, e.target.value as PrecatorioStatus)}
                >
                  {PRECATORIO_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <footer className="relative z-10 flex gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => navigate('/precatorios')}
                className="flex-1 rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
              >
                Abrir em Precatórios
              </button>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>
            </footer>
          </aside>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg animate-[fadeIn_180ms_ease]"
        >
          {toast}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 6px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 5px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
      `}</style>
    </div>
  );
}

function Row({ label, value, mono, strong }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd
        className={[
          'max-w-[70%] break-all text-right text-sm text-slate-800',
          mono ? 'font-mono text-[12px]' : '',
          strong ? 'font-bold' : 'font-medium',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}
