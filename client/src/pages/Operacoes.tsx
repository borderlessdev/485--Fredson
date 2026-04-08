import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusOp = 'Em Análise' | 'Vendido' | 'Em Negociação' | 'Reprovado';

interface Operacao {
  id: number;
  cotacao: string;
  cadastradoEm: string;
  processo: string;
  tribunal: string;
  credor: string;
  status: StatusOp;
  valor: number;
  face: number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const OPERACOES: Operacao[] = [
  { id: 30, cotacao: '#592030', cadastradoEm: '2026-03-24 14:22:04', processo: '481983-62.2023.8.04.0001', tribunal: 'TJAM',  credor: 'BERNARDES LEITE DE OLIVEIRA',    status: 'Em Análise',    valor: 13989.79,  face: 28000    },
  { id: 28, cotacao: '#592028', cadastradoEm: '2026-02-05 17:07:00', processo: '1007017-64.2021.4.01.3300',  tribunal: 'TRF1',  credor: 'MARIO LUIZ SOUZA CARDOSO',       status: 'Vendido',       valor: 33027.46,  face: 66000    },
  { id: 25, cotacao: '#592025', cadastradoEm: '2026-02-03 17:33:37', processo: '10194248820244013400',       tribunal: 'TRF1',  credor: 'LIA MARCIA DA SILVA SANTOS',     status: 'Em Análise',    valor: 247432.05, face: 495000   },
  { id: 24, cotacao: '#592024', cadastradoEm: '2026-02-03 13:04:06', processo: '0039519-60.2004.4.01.3400',  tribunal: 'TRF1',  credor: 'IVETTE MAURELLI DIAS',           status: 'Em Análise',    valor: 91744.85,  face: 183000   },
  { id: 23, cotacao: '#592023', cadastradoEm: '2026-02-03 12:58:31', processo: '0039519-60.2004.4.01.3400',  tribunal: 'TRF1',  credor: 'ARMANDO BERNARDES NETO',         status: 'Em Análise',    valor: 22935.55,  face: 45000    },
  { id: 22, cotacao: '#592022', cadastradoEm: '2026-02-03 12:52:50', processo: '1016656-92.2024.4.01.3400',  tribunal: 'TRF1',  credor: 'MARCELO TADEU DOS SANTOS',       status: 'Em Análise',    valor: 11468.11,  face: 23000    },
  { id: 21, cotacao: '#592021', cadastradoEm: '2026-02-02 19:30:54', processo: '1016656-92.2024.4.01.3400',  tribunal: 'TRF1',  credor: 'MARCOS TADEU DA SILVA',          status: 'Em Análise',    valor: 11468.11,  face: 23000    },
  { id: 20, cotacao: '#592020', cadastradoEm: '2026-01-30 15:13:59', processo: '3000365-32.2023.8.06.0041',  tribunal: 'JFCE',  credor: 'FRANCISCO HENRIQUE COSTA',       status: 'Vendido',       valor: 22808.48,  face: 45000    },
  { id: 19, cotacao: '#592019', cadastradoEm: '2026-01-30 15:13:00', processo: '3000365-32.2023.8.06.0041',  tribunal: 'TJCE',  credor: 'ALUISIO TAVEIRA DE MELO',        status: 'Vendido',       valor: 34212.72,  face: 68000    },
  { id: 18, cotacao: '#592018', cadastradoEm: '2026-01-30 14:36:34', processo: '1030945-30.2024.4.01.3400',  tribunal: 'TRF1',  credor: 'ANA ODORIGES DA SILVA',          status: 'Em Análise',    valor: 129079.69, face: 258000   },
  { id: 17, cotacao: '#592017', cadastradoEm: '2026-01-28 09:11:22', processo: '0058823-10.2019.4.01.3400',  tribunal: 'TRF1',  credor: 'JOSE CARLOS FERREIRA LIMA',      status: 'Em Negociação', valor: 54320.00,  face: 108000   },
  { id: 16, cotacao: '#592016', cadastradoEm: '2026-01-27 16:45:10', processo: '0091234-55.2020.4.03.0000',  tribunal: 'TRF3',  credor: 'MARIA APARECIDA ROCHA',          status: 'Reprovado',     valor: 18750.00,  face: 37000    },
  { id: 15, cotacao: '#592015', cadastradoEm: '2026-01-25 11:20:48', processo: '0072341-88.2021.5.03.0052',  tribunal: 'TRT3',  credor: 'ROBERTO ALVES MENDONCA',         status: 'Vendido',       valor: 67890.50,  face: 135000   },
  { id: 14, cotacao: '#592014', cadastradoEm: '2026-01-24 08:55:33', processo: '1023456-78.2022.8.19.0001',  tribunal: 'TJRJ',  credor: 'CLAUDIA SANTOS OLIVEIRA',        status: 'Em Análise',    valor: 42100.00,  face: 84000    },
  { id: 13, cotacao: '#592013', cadastradoEm: '2026-01-22 14:30:07', processo: '0034567-21.2018.4.05.8300',  tribunal: 'TRF5',  credor: 'PAULO HENRIQUE NASCIMENTO',      status: 'Em Negociação', valor: 98430.00,  face: 196000   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_STYLES: Record<StatusOp, string> = {
  'Em Análise':    'bg-amber-50 text-amber-700 border border-amber-200',
  'Vendido':       'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Em Negociação': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Reprovado':     'bg-red-50 text-red-700 border border-red-200',
};

const STATUS_DOTS: Record<StatusOp, string> = {
  'Em Análise':    'bg-amber-400',
  'Vendido':       'bg-emerald-400',
  'Em Negociação': 'bg-blue-400',
  'Reprovado':     'bg-red-400',
};

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
function IcoFilter() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M10 12h4" />
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function OperacoesPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  const statusOptions = ['Todos', 'Em Análise', 'Vendido', 'Em Negociação', 'Reprovado'];

  const filtered = OPERACOES.filter((op) => {
    const matchSearch =
      search === '' ||
      op.cotacao.toLowerCase().includes(search.toLowerCase()) ||
      op.processo.toLowerCase().includes(search.toLowerCase()) ||
      op.credor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || op.status === filterStatus;
    return matchSearch && matchStatus;
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
            <h1 className="text-lg font-semibold text-slate-900 leading-none">Operações em andamento</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs text-slate-500">Cotações / Vendas</p>
              <span className="inline-flex items-center justify-center h-4 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {filtered.length}
              </span>
            </div>
          </div>

          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-semibold transition-colors duration-150 shadow-sm"
          >
            <IcoPlus />
            Nova Operação
          </button>
        </header>

        {/* Toolbar */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <IcoSearch />
            </span>
            <input
              type="text"
              placeholder="Buscar cotação, processo, credor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm
                         text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-200
                         focus:border-blue-400 transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <IcoFilter />
            <div className="flex gap-1">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150',
                    filterStatus === s
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
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
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200
                                         text-[12px] font-medium text-slate-600
                                         hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50
                                         transition-all duration-150 group-hover:border-slate-300">
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
    </div>
  );
}
