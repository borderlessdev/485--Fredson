import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import PrecatorioWizard from '@/components/PrecatorioWizard';
import PrecatorioDetailPanel from '@/components/PrecatorioDetailPanel';
import {
  formatMoneyInput,
  parseMoney,
  type PrecatorioFormData,
} from '@/data/precatorioForm';
import { PRECATORIO_STATUS, STATUS_DOTS, STATUS_STYLES, type PrecatorioStatus } from '@/data/status';
import {
  createPrecatorio,
  listPrecatorios,
  seedDemoPrecatoriosIfEmpty,
  updatePrecatorio,
  type PrecatorioRecord,
} from '@/services/precatorios';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const TRIBUNAL_STYLES: Record<string, string> = {
  TRF1: 'bg-sky-50 text-sky-700',
  TRF3: 'bg-sky-50 text-sky-700',
  TJCE: 'bg-teal-50 text-teal-700',
  TJAM: 'bg-violet-50 text-violet-700',
  TJRJ: 'bg-indigo-50 text-indigo-700',
};

function faceOf(d: PrecatorioFormData) {
  return parseMoney(d.principal) + parseMoney(d.juros);
}

function IcoPlus() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
function IcoSearch() {
  return (
    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </svg>
  );
}
function IcoX() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      role="status"
      className="fixed right-5 top-5 z-[60] flex w-[min(100%,360px)] items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl animate-[fadeIn_220ms_ease]"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">Registro salvo com sucesso</p>
        <p className="mt-0.5 text-xs text-slate-500">{message}</p>
      </div>
      <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Fechar">
        <IcoX />
      </button>
    </div>
  );
}

export default function OperacoesPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [ops, setOps] = useState<PrecatorioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterTribunal, setFilterTribunal] = useState('Todos');
  const [wizard, setWizard] = useState<{ mode: 'create' | 'edit'; initial?: PrecatorioFormData; editId?: string } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const selected = ops.find((o) => o.id === selectedId) ?? null;

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setOps([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const rows = await seedDemoPrecatoriosIfEmpty();
        if (!cancelled) setOps(rows);
      } catch (e) {
        console.error(e);
        try {
          const rows = await listPrecatorios();
          if (!cancelled) setOps(rows);
        } catch (err) {
          console.error(err);
          if (!cancelled) setError('Não foi possível carregar os precatórios do Firebase.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  const tribunais = useMemo(
    () => [...new Set(ops.map((o) => o.data.tribunal).filter(Boolean))].sort(),
    [ops],
  );

  const filtered = ops.filter((op) => {
    const q = search.toLowerCase().trim();
    const d = op.data;
    const matchSearch =
      q === '' ||
      op.cotacao.toLowerCase().includes(q) ||
      d.codigoProcesso.toLowerCase().includes(q) ||
      d.requerente.toLowerCase().includes(q) ||
      d.documento.toLowerCase().includes(q) ||
      d.tribunal.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'Todos' || op.status === filterStatus;
    const matchTribunal = filterTribunal === 'Todos' || d.tribunal === filterTribunal;
    return matchSearch && matchStatus && matchTribunal;
  });

  const hasFilters = search !== '' || filterStatus !== 'Todos' || filterTribunal !== 'Todos';

  const stats = useMemo(() => {
    const totalFace = ops.reduce((s, o) => s + faceOf(o.data), 0);
    const emAnalise = ops.filter((o) => o.status === 'Em Análise').length;
    return { total: ops.length, emAnalise, totalFace };
  }, [ops]);

  async function handleSave(data: PrecatorioFormData) {
    setSaving(true);
    setError('');
    try {
      if (wizard?.mode === 'edit' && wizard.editId) {
        await updatePrecatorio(wizard.editId, { data, status: (data.status || undefined) as PrecatorioStatus | undefined });
        setOps((prev) =>
          prev.map((op) =>
            op.id === wizard.editId
              ? { ...op, status: (data.status || op.status) as PrecatorioStatus, data }
              : op,
          ),
        );
        setSelectedId(wizard.editId);
        setToast('O precatório foi atualizado no Firebase.');
      } else {
        const record = await createPrecatorio({ data });
        setOps((prev) => [record, ...prev]);
        setSelectedId(record.id);
        setToast('O precatório foi salvo no Firebase.');
      }
      setWizard(null);
    } catch (e) {
      console.error(e);
      setError('Falha ao salvar no Firebase. Verifique as regras e a conexão.');
    } finally {
      setSaving(false);
    }
  }

  async function persistStatus(id: string, status: PrecatorioStatus) {
    setOps((prev) => prev.map((op) => (op.id === id ? { ...op, status, data: { ...op.data, status } } : op)));
    try {
      await updatePrecatorio(id, { status });
    } catch (e) {
      console.error(e);
      setError('Não foi possível atualizar o status.');
    }
  }

  async function persistValor(id: string, principal: number) {
    const formatted = formatMoneyInput(principal);
    setOps((prev) =>
      prev.map((op) => (op.id === id ? { ...op, data: { ...op.data, principal: formatted } } : op)),
    );
    try {
      await updatePrecatorio(id, { principal });
    } catch (e) {
      console.error(e);
      setError('Não foi possível atualizar o valor.');
    }
  }

  async function persistQuote(id: string, ofertaPct: number, comissaoPct: number) {
    setOps((prev) => prev.map((op) => (op.id === id ? { ...op, ofertaPct, comissaoPct } : op)));
    try {
      await updatePrecatorio(id, { ofertaPct, comissaoPct });
    } catch (e) {
      console.error(e);
      setError('Não foi possível salvar a cotação.');
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fb]">
      <Sidebar onLogout={handleLogout} userName={user?.name ?? ''} userEmail={user?.email ?? ''} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative shrink-0 overflow-hidden border-b border-slate-200/80 bg-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.08),_transparent_55%),radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.06),_transparent_50%)]"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-end justify-between gap-4 px-6 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-600">Monitor · Firebase</p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Meus Precatórios</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-500">
                Dados persistidos em tempo real no Firestore da sua conta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWizard({ mode: 'create' })}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-all hover:bg-sky-700 hover:shadow-md disabled:opacity-60"
            >
              <IcoPlus />
              Novo precatório
            </button>
          </div>

          <div className="relative grid gap-3 border-t border-slate-100 px-6 py-3 sm:grid-cols-3">
            <Stat label="Carteira" value={String(stats.total)} hint="registros" />
            <Stat label="Em análise" value={String(stats.emAnalise)} hint="aguardando decisão" />
            <Stat label="Valor face" value={BRL.format(stats.totalFace)} hint="principal + juros" />
          </div>
        </header>

        <div className="shrink-0 border-b border-slate-200/80 bg-white/80 px-6 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px] max-w-md flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <IcoSearch />
              </span>
              <input
                type="search"
                placeholder="Buscar cotação, processo, credor…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              aria-label="Filtrar por status"
            >
              <option value="Todos">Todos os status</option>
              {PRECATORIO_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterTribunal}
              onChange={(e) => setFilterTribunal(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              aria-label="Filtrar por tribunal"
            >
              <option value="Todos">Todos os tribunais</option>
              {tribunais.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilterStatus('Todos');
                  setFilterTribunal('Todos');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                <IcoX />
                Limpar
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)]">
            <div className="hidden grid-cols-[140px_1fr_180px_130px_140px_110px] gap-0 border-b border-slate-200 bg-slate-50/90 px-4 md:grid">
              {['Cotação', 'Credor / processo', 'Tribunal', 'Status', 'Valor face', 'Ações'].map((h) => (
                <div key={h} className="py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  {h}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center text-sm text-slate-500">Carregando precatórios…</div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <p className="font-display text-lg font-semibold text-slate-800">Nenhum precatório encontrado</p>
                <p className="mt-1 text-sm text-slate-500">Ajuste os filtros ou cadastre um novo.</p>
                <button
                  type="button"
                  onClick={() => setWizard({ mode: 'create' })}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  <IcoPlus />
                  Novo precatório
                </button>
              </div>
            ) : (
              filtered.map((op, i) => {
                const d = op.data;
                const face = faceOf(d);
                const initial = (d.requerente[0] || '?').toUpperCase();
                return (
                  <div
                    key={op.id}
                    className={[
                      'group grid items-center gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-sky-50/40 md:grid-cols-[140px_1fr_180px_130px_140px_110px]',
                      i < filtered.length - 1 ? 'border-b border-slate-100' : '',
                    ].join(' ')}
                  >
                    <div>
                      <p className="text-[13px] font-semibold text-slate-800">{op.cotacao}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400" title={op.id}>
                        {op.id.slice(0, 8)}…
                      </p>
                    </div>

                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-cyan-50 text-xs font-bold text-sky-800 ring-1 ring-sky-100">
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-slate-800">
                          {d.requerente || 'Sem requerente'}
                        </p>
                        <p className="truncate font-mono text-[11px] text-slate-500">
                          {d.codigoProcesso || '—'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          TRIBUNAL_STYLES[d.tribunal] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {d.tribunal || '—'}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-400">{d.tipo || '—'}</p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[op.status]}`}
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOTS[op.status]}`} />
                        {op.status}
                      </span>
                    </div>

                    <div className="md:text-right">
                      <p className="text-[13px] font-bold tabular-nums text-slate-800">
                        {BRL.format(face || parseMoney(d.principal))}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Princ. {BRL.format(parseMoney(d.principal))}
                      </p>
                    </div>

                    <div className="flex gap-1.5 md:justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedId(op.id)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                      >
                        Abrir
                      </button>
                      <button
                        type="button"
                        onClick={() => setWizard({ mode: 'edit', initial: d, editId: op.id })}
                        className="rounded-lg border border-transparent px-2 py-1.5 text-[12px] font-semibold text-slate-400 transition-colors hover:text-sky-700"
                        aria-label="Editar no fluxo"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {wizard && (
        <PrecatorioWizard
          mode={wizard.mode}
          initial={wizard.initial}
          onCancel={() => setWizard(null)}
          onSave={handleSave}
        />
      )}

      {selected && !wizard && (
        <PrecatorioDetailPanel
          record={selected}
          onClose={() => setSelectedId(null)}
          onEdit={() => {
            setWizard({ mode: 'edit', initial: selected.data, editId: selected.id });
            setSelectedId(null);
          }}
          onStatusChange={persistStatus}
          onValorUpdate={persistValor}
          onQuoteChange={persistQuote}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/70 px-3.5 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="font-display mt-0.5 text-lg font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500">{hint}</p>
    </div>
  );
}
