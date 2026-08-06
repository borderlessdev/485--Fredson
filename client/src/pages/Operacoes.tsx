import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { PRECATORIO_STATUS, STATUS_DOTS, STATUS_STYLES, type PrecatorioStatus } from '@/data/status';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Operacao {
  id: number;
  cotacao: string;
  cadastradoEm: string;
  processo: string;
  tribunal: string;
  credor: string;
  status: PrecatorioStatus;
  valor: number;
  face: number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const OPERACOES: Operacao[] = [
  { id: 30, cotacao: '#592030', cadastradoEm: '2026-03-24 14:22:04', processo: '481983-62.2023.8.04.0001', tribunal: 'TJAM',  credor: 'BERNARDES LEITE DE OLIVEIRA',    status: 'Em Análise',            valor: 13989.79,  face: 28000    },
  { id: 28, cotacao: '#592028', cadastradoEm: '2026-02-05 17:07:00', processo: '1007017-64.2021.4.01.3300',  tribunal: 'TRF1',  credor: 'MARIO LUIZ SOUZA CARDOSO',       status: 'Concluído',             valor: 33027.46,  face: 66000    },
  { id: 25, cotacao: '#592025', cadastradoEm: '2026-02-03 17:33:37', processo: '10194248820244013400',       tribunal: 'TRF1',  credor: 'LIA MARCIA DA SILVA SANTOS',     status: 'Em Análise',            valor: 247432.05, face: 495000   },
  { id: 24, cotacao: '#592024', cadastradoEm: '2026-02-03 13:04:06', processo: '0039519-60.2004.4.01.3400',  tribunal: 'TRF1',  credor: 'IVETTE MAURELLI DIAS',           status: 'Aguardando Documentos', valor: 91744.85,  face: 183000   },
  { id: 23, cotacao: '#592023', cadastradoEm: '2026-02-03 12:58:31', processo: '0039519-60.2004.4.01.3400',  tribunal: 'TRF1',  credor: 'ARMANDO BERNARDES NETO',         status: 'Aguardando Proposta',   valor: 22935.55,  face: 45000    },
  { id: 22, cotacao: '#592022', cadastradoEm: '2026-02-03 12:52:50', processo: '1016656-92.2024.4.01.3400',  tribunal: 'TRF1',  credor: 'MARCELO TADEU DOS SANTOS',       status: 'Proposta Enviada',      valor: 11468.11,  face: 23000    },
  { id: 21, cotacao: '#592021', cadastradoEm: '2026-02-02 19:30:54', processo: '1016656-92.2024.4.01.3400',  tribunal: 'TRF1',  credor: 'MARCOS TADEU DA SILVA',          status: 'Aprovado',              valor: 11468.11,  face: 23000    },
  { id: 20, cotacao: '#592020', cadastradoEm: '2026-01-30 15:13:59', processo: '3000365-32.2023.8.06.0041',  tribunal: 'JFCE',  credor: 'FRANCISCO HENRIQUE COSTA',       status: 'Em Cessão',             valor: 22808.48,  face: 45000    },
  { id: 19, cotacao: '#592019', cadastradoEm: '2026-01-30 15:13:00', processo: '3000365-32.2023.8.06.0041',  tribunal: 'TJCE',  credor: 'ALUISIO TAVEIRA DE MELO',        status: 'Concluído',             valor: 34212.72,  face: 68000    },
  { id: 18, cotacao: '#592018', cadastradoEm: '2026-01-30 14:36:34', processo: '1030945-30.2024.4.01.3400',  tribunal: 'TRF1',  credor: 'ANA ODORIGES DA SILVA',          status: 'Em Análise',            valor: 129079.69, face: 258000   },
  { id: 17, cotacao: '#592017', cadastradoEm: '2026-01-28 09:11:22', processo: '0058823-10.2019.4.01.3400',  tribunal: 'TRF1',  credor: 'JOSE CARLOS FERREIRA LIMA',      status: 'Proposta Enviada',      valor: 54320.00,  face: 108000   },
  { id: 16, cotacao: '#592016', cadastradoEm: '2026-01-27 16:45:10', processo: '0091234-55.2020.4.03.0000',  tribunal: 'TRF3',  credor: 'MARIA APARECIDA ROCHA',          status: 'Proposta Rejeitada',    valor: 18750.00,  face: 37000    },
  { id: 15, cotacao: '#592015', cadastradoEm: '2026-01-25 11:20:48', processo: '0072341-88.2021.5.03.0052',  tribunal: 'TRT3',  credor: 'ROBERTO ALVES MENDONCA',         status: 'Concluído',             valor: 67890.50,  face: 135000   },
  { id: 14, cotacao: '#592014', cadastradoEm: '2026-01-24 08:55:33', processo: '1023456-78.2022.8.19.0001',  tribunal: 'TJRJ',  credor: 'CLAUDIA SANTOS OLIVEIRA',        status: 'Em Análise',            valor: 42100.00,  face: 84000    },
  { id: 13, cotacao: '#592013', cadastradoEm: '2026-01-22 14:30:07', processo: '0034567-21.2018.4.05.8300',  tribunal: 'TRF5',  credor: 'PAULO HENRIQUE NASCIMENTO',      status: 'Aguardando Proposta',   valor: 98430.00,  face: 196000   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const TRIBUNAL_STYLES: Record<string, string> = {
  TRF1: 'bg-sky-50 text-sky-700',
  TRF3: 'bg-sky-50 text-sky-700',
  TRF5: 'bg-sky-50 text-sky-700',
  TJAM: 'bg-violet-50 text-violet-700',
  TJCE: 'bg-teal-50 text-teal-700',
  TJRJ: 'bg-indigo-50 text-indigo-700',
  TRT3: 'bg-orange-50 text-orange-700',
  JFCE: 'bg-cyan-50 text-cyan-700',
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoPlus() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
function IcoSearch() {
  return (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </svg>
  );
}
function IcoChevronDown() {
  return (
    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function IcoChevronRight() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
function IcoX() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all';
const selectCls =
  'w-full appearance-none px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all';

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Fechar" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <IcoX />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; count?: number }[];
}) {
  return (
    <div className="relative min-w-[180px]">
      <label className="sr-only">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200
                   text-sm text-slate-700 font-medium outline-none cursor-pointer
                   focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.count !== undefined ? `${o.label} (${o.count})` : o.label}
          </option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <IcoChevronDown />
      </span>
    </div>
  );
}

function DetailModal({
  op,
  onClose,
  onStatusChange,
}: {
  op: Operacao;
  onClose: () => void;
  onStatusChange: (id: number, status: PrecatorioStatus) => void;
}) {
  const [status, setStatus] = useState(op.status);

  return (
    <ModalShell
      title={`Operação ${op.cotacao}`}
      subtitle={`ID ${op.id} · cadastrado em ${op.cadastradoEm}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => {
              onStatusChange(op.id, status);
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Salvar status
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Processo</p>
            <p className="text-sm font-semibold text-slate-800 mt-1 break-all">{op.processo}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tribunal</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{op.tribunal}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credor</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{op.credor}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valor</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{BRL.format(op.valor)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valor Face</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{BRL.format(op.face)}</p>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Status</label>
          <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as PrecatorioStatus)}>
            {PRECATORIO_STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </ModalShell>
  );
}

type NovaForm = {
  processo: string;
  tribunal: string;
  credor: string;
  status: PrecatorioStatus;
  valor: string;
  face: string;
};

const EMPTY_FORM: NovaForm = {
  processo: '',
  tribunal: 'TRF1',
  credor: '',
  status: 'Aguardando Proposta',
  valor: '',
  face: '',
};

function NovaOperacaoModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (op: Omit<Operacao, 'id' | 'cotacao' | 'cadastradoEm'>) => void;
}) {
  const [form, setForm] = useState<NovaForm>(EMPTY_FORM);
  const [error, setError] = useState('');

  function set<K extends keyof NovaForm>(key: K, value: NovaForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.processo.trim() || !form.credor.trim()) {
      setError('Preencha processo e credor.');
      return;
    }
    const valor = Number(form.valor.replace(/\./g, '').replace(',', '.'));
    const face = Number(form.face.replace(/\./g, '').replace(',', '.'));
    if (Number.isNaN(valor) || Number.isNaN(face) || valor < 0 || face < 0) {
      setError('Informe valores numéricos válidos.');
      return;
    }
    onCreate({
      processo: form.processo.trim(),
      tribunal: form.tribunal.trim().toUpperCase(),
      credor: form.credor.trim().toUpperCase(),
      status: form.status,
      valor,
      face,
    });
    onClose();
  }

  return (
    <ModalShell
      title="Nova Operação"
      subtitle="Cadastre um precatório na lista"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="nova-operacao-form"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Criar operação
          </button>
        </>
      }
    >
      <form id="nova-operacao-form" onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Processo</label>
          <input className={inputCls} value={form.processo} onChange={(e) => set('processo', e.target.value)} placeholder="0000000-00.0000.0.00.0000" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Tribunal</label>
            <input className={inputCls} value={form.tribunal} onChange={(e) => set('tribunal', e.target.value)} placeholder="TRF1" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Status</label>
            <select className={selectCls} value={form.status} onChange={(e) => set('status', e.target.value as PrecatorioStatus)}>
              {PRECATORIO_STATUS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Credor</label>
          <input className={inputCls} value={form.credor} onChange={(e) => set('credor', e.target.value)} placeholder="Nome do credor" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Valor (R$)</label>
            <input className={inputCls} value={form.valor} onChange={(e) => set('valor', e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Valor Face (R$)</label>
            <input className={inputCls} value={form.face} onChange={(e) => set('face', e.target.value)} placeholder="0,00" />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OperacoesPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [ops, setOps] = useState<Operacao[]>(OPERACOES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterTribunal, setFilterTribunal] = useState<string>('Todos');
  const [selected, setSelected] = useState<Operacao | null>(null);
  const [showNova, setShowNova] = useState(false);

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  function clearFilters() {
    setSearch('');
    setFilterStatus('Todos');
    setFilterTribunal('Todos');
  }

  function handleStatusChange(id: number, status: PrecatorioStatus) {
    setOps((prev) => prev.map((op) => (op.id === id ? { ...op, status } : op)));
  }

  function handleCreate(data: Omit<Operacao, 'id' | 'cotacao' | 'cadastradoEm'>) {
    const nextId = Math.max(...ops.map((o) => o.id), 0) + 1;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const cadastradoEm = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setOps((prev) => [
      {
        id: nextId,
        cotacao: `#${590000 + nextId}`,
        cadastradoEm,
        ...data,
      },
      ...prev,
    ]);
  }

  const tribunais = [...new Set(ops.map((o) => o.tribunal))].sort();

  const statusOptions = [
    { value: 'Todos', label: 'Todos os status', count: ops.length },
    ...PRECATORIO_STATUS.map((s) => ({
      value: s,
      label: s,
      count: ops.filter((o) => o.status === s).length,
    })),
  ];

  const tribunalOptions = [
    { value: 'Todos', label: 'Todos os tribunais' },
    ...tribunais.map((t) => ({
      value: t,
      label: t,
      count: ops.filter((o) => o.tribunal === t).length,
    })),
  ];

  const hasActiveFilters =
    search !== '' || filterStatus !== 'Todos' || filterTribunal !== 'Todos';

  const filtered = ops.filter((op) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      q === '' ||
      op.cotacao.toLowerCase().includes(q) ||
      op.processo.toLowerCase().includes(q) ||
      op.credor.toLowerCase().includes(q) ||
      op.tribunal.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'Todos' || op.status === filterStatus;
    const matchTribunal = filterTribunal === 'Todos' || op.tribunal === filterTribunal;
    return matchSearch && matchStatus && matchTribunal;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Sidebar */}
      <Sidebar
        onLogout={handleLogout}
        userName={user?.name ?? ''}
        userEmail={user?.email ?? ''}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-none">Precatórios</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs text-slate-500">Operações em andamento</p>
              <span className="inline-flex items-center justify-center h-4 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {filtered.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNova(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-semibold transition-colors duration-150 shadow-sm"
          >
            <IcoPlus />
            Nova Operação
          </button>
        </header>

        {/* Toolbar */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <IcoSearch />
              </span>
              <input
                type="text"
                placeholder="Buscar cotação, processo, credor ou tribunal…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm
                           text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-200
                           focus:border-blue-400 transition-all"
              />
            </div>

            <FilterSelect
              label="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
            />

            <FilterSelect
              label="Tribunal"
              value={filterTribunal}
              onChange={setFilterTribunal}
              options={tribunalOptions}
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                           text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-800
                           transition-colors"
              >
                <IcoX />
                Limpar
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                  Busca: “{search}”
                  <button type="button" onClick={() => setSearch('')} className="hover:text-blue-900" aria-label="Remover busca">
                    <IcoX />
                  </button>
                </span>
              )}
              {filterStatus !== 'Todos' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-100">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[filterStatus as PrecatorioStatus]}`} />
                  {filterStatus}
                  <button type="button" onClick={() => setFilterStatus('Todos')} className="hover:text-amber-950" aria-label="Remover status">
                    <IcoX />
                  </button>
                </span>
              )}
              {filterTribunal !== 'Todos' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-[11px] font-semibold border border-sky-100">
                  Tribunal: {filterTribunal}
                  <button type="button" onClick={() => setFilterTribunal('Todos')} className="hover:text-sky-900" aria-label="Remover tribunal">
                    <IcoX />
                  </button>
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-medium">
                {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

            {/* Table head */}
            <div className="grid grid-cols-[48px_160px_170px_1fr_200px_130px_140px_100px] gap-0
                            border-b border-slate-200 bg-slate-50 px-4">
              <div className="py-3" />
              <div className="py-3 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Cotação / Cód.</div>
              <div className="py-3 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Cadastrado em</div>
              <div className="py-3 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Processo</div>
              <div className="py-3 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Credor</div>
              <div className="py-3 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Status</div>
              <div className="py-3 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase text-right">Valor</div>
              <div className="py-3 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase text-center">Ações</div>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Nenhuma operação encontrada.
              </div>
            ) : (
              filtered.map((op, i) => {
                const initial = op.credor[0]?.toUpperCase() ?? '?';
                return (
                  <div
                    key={op.id}
                    className={[
                      'grid grid-cols-[48px_160px_170px_1fr_200px_130px_140px_100px] gap-0 items-center px-4',
                      'transition-colors duration-100 hover:bg-slate-50 group',
                      i < filtered.length - 1 ? 'border-b border-slate-100' : '',
                    ].join(' ')}
                  >
                    {/* Hash icon */}
                    <div className="py-4">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
                        #
                      </span>
                    </div>

                    {/* Cotação */}
                    <div className="py-4 pr-3">
                      <p className="text-[13px] font-semibold text-slate-800 leading-none">{op.cotacao}</p>
                      <p className="text-[11px] text-slate-400 mt-1">ID: {op.id}</p>
                    </div>

                    {/* Data */}
                    <div className="py-4 pr-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[12px] text-slate-600">{op.cadastradoEm}</span>
                      </div>
                    </div>

                    {/* Processo */}
                    <div className="py-4 pr-3">
                      <p className="text-[12px] text-slate-700 font-mono leading-none truncate max-w-[200px]">{op.processo}</p>
                      <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${TRIBUNAL_STYLES[op.tribunal] ?? 'bg-slate-100 text-slate-600'}`}>
                        {op.tribunal}
                      </span>
                    </div>

                    {/* Credor */}
                    <div className="py-4 pr-3 flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold shrink-0">
                        {initial}
                      </span>
                      <span className="text-[12px] text-slate-700 truncate">{op.credor}</span>
                    </div>

                    {/* Status */}
                    <div className="py-4 pr-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${STATUS_STYLES[op.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOTS[op.status]}`} />
                        {op.status}
                      </span>
                    </div>

                    {/* Valor */}
                    <div className="py-4 pr-3 text-right">
                      <p className="text-[13px] font-bold text-slate-800 leading-none">{BRL.format(op.valor)}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Face: {BRL.format(op.face)}</p>
                    </div>

                    {/* Ações */}
                    <div className="py-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setSelected(op)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200
                                         text-[12px] font-medium text-slate-600
                                         hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50
                                         transition-all duration-150 group-hover:border-slate-300"
                      >
                        Detalhes
                        <IcoChevronRight />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selected && (
        <DetailModal
          op={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      {showNova && (
        <NovaOperacaoModal
          onClose={() => setShowNova(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
