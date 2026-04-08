import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

// ── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const values = [8, 12, 9, 15, 13, 18];
  const W = 400; const H = 140;
  const pT = 16; const pR = 16; const pB = 28; const pL = 32;
  const cW = W - pL - pR; const cH = H - pT - pB;
  const max = 20;
  const pts = values.map((v, i) => ({
    x: pL + (i / (values.length - 1)) * cW,
    y: pT + cH - (v / max) * cH,
  }));
  const line = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${pT + cH} L${pts[0].x},${pT + cH} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 140 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 5, 10, 15, 20].map((v) => {
        const y = pT + cH - (v / max) * cH;
        return (
          <g key={v}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
      ))}
      {months.map((m, i) => {
        const x = pL + (i / (months.length - 1)) * cW;
        return <text key={m} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">{m}</text>;
      })}
    </svg>
  );
}

// ── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart() {
  const data = [
    { label: 'Proposta', value: 10, color: '#6366f1' },
    { label: 'Pago',     value: 10, color: '#818cf8' },
    { label: 'Aguard.',  value: 4,  color: '#a5b4fc' },
    { label: 'Analise',  value: 3,  color: '#c7d2fe' },
    { label: 'Rejeit.',  value: 2,  color: '#e0e7ff' },
    { label: 'Sessao',   value: 1,  color: '#eef2ff' },
  ];
  const W = 320; const H = 140;
  const pT = 16; const pR = 16; const pB = 32; const pL = 28;
  const cW = W - pL - pR; const cH = H - pT - pB;
  const max = 12;
  const barW = cW / data.length - 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 140 }}>
      {[0, 4, 8, 12].map((v) => {
        const y = pT + cH - (v / max) * cH;
        return (
          <g key={v}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{v}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barH = (d.value / max) * cH;
        const x = pL + i * (cW / data.length) + 3;
        const y = pT + cH - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill={d.color} />
            <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="8" fill="#94a3b8">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Static data ──────────────────────────────────────────────────────────────
const recentActivity = [
  { id: 1, action: 'Proposta enviada',     client: 'Empresa Alpha', time: 'ha 2h',  status: 'Enviada'   },
  { id: 2, action: 'Pagamento confirmado', client: 'Beta Corp',     time: 'ha 4h',  status: 'Pago'      },
  { id: 3, action: 'Nova negociacao',      client: 'Gama Ltda.',    time: 'ha 6h',  status: 'Analise'   },
  { id: 4, action: 'Documento gerado',     client: 'Delta S.A.',    time: 'ontem',  status: 'Concluido' },
  { id: 5, action: 'Proposta rejeitada',   client: 'Epsilon Tech',  time: 'ontem',  status: 'Rejeitada' },
];

const statusColors: Record<string, string> = {
  Enviada:   'bg-blue-50 text-blue-700 border border-blue-100',
  Pago:      'bg-emerald-50 text-emerald-700 border border-emerald-100',
  Analise:   'bg-amber-50 text-amber-700 border border-amber-100',
  Concluido: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  Rejeitada: 'bg-red-50 text-red-700 border border-red-100',
};

const stats = [
  {
    label: 'Total de projetos',
    value: '31',
    sub: 'todos os registros',
    accent: 'text-slate-900',
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    ring: 'ring-indigo-100',
    bg: 'bg-indigo-50',
  },
  {
    label: 'Em Negociacao',
    value: '0',
    sub: 'pipeline aberto',
    accent: 'text-amber-500',
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    ring: 'ring-amber-100',
    bg: 'bg-amber-50',
  },
  {
    label: 'Potencial de Compra',
    value: 'R$ 6,49M',
    sub: 'Nominal: R$ 12,2M',
    accent: 'text-indigo-600',
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    ring: 'ring-indigo-100',
    bg: 'bg-indigo-50',
  },
  {
    label: 'Em Analise',
    value: '3',
    sub: 'inclui pendentes',
    accent: 'text-violet-600',
    icon: (
      <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    ring: 'ring-violet-100',
    bg: 'bg-violet-50',
  },
];

// ── Bell icon ─────────────────────────────────────────────────────────────────
function IcoBell() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  function handleLogout() {
    signOut();
    navigate('/dashboard', { replace: true });
  }

  return (
    // Root: full-screen flex row — sidebar takes its natural w-64, content takes the rest
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <Sidebar
        onLogout={handleLogout}
        userName={user?.name ?? ''}
        userEmail={user?.email ?? ''}
      />

      {/* ── Main (scrollable) ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Visao geral do sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors">
              <IcoBell />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2.5 pl-1 border-l border-slate-200 ml-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs select-none shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900 leading-none">{user?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Stats grid ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${s.bg} ring-1 ${s.ring} flex items-center justify-center shrink-0`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold leading-none ${s.accent}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Conversion pill ────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-white rounded-xl border border-slate-200 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span className="text-sm text-slate-600">Conversao (Pago):</span>
              <span className="text-sm font-bold text-slate-900">32,3%</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-sm text-slate-600">Pagos:</span>
              <span className="text-sm font-bold text-slate-900">10</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full" />
              <span className="text-sm text-slate-600">Total:</span>
              <span className="text-sm font-bold text-slate-900">31</span>
            </div>
          </div>

          {/* ── Charts ─────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Evolucao</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Projetos criados por mes (ultimos 6)</p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg ring-1 ring-indigo-100">
                  Pago: 10
                </span>
              </div>
              <LineChart />
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Distribuicao por Status</h3>
                <p className="text-xs text-slate-400 mt-0.5">Conversao: 32,3%</p>
              </div>
              <BarChart />
            </div>
          </div>

          {/* ── Bottom cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Ultimos leads */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Ultimos Leads</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Ultimas 5 atividades</p>
                </div>
                <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-md">Ver todos</span>
              </div>
              <div className="divide-y divide-slate-50">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-[11px] font-bold text-indigo-600">{a.client[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{a.client}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{a.action}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[a.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {a.status}
                      </span>
                      <p className="text-[10px] text-slate-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conta */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">Informacoes da conta</h3>
                <p className="text-xs text-slate-400 mt-0.5">Dados do usuario ativo</p>
              </div>

              {/* User banner */}
              <div className="px-5 py-4 border-b border-slate-50 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm select-none">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium shrink-0">
                    Ativo
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {[
                  { label: 'ID do usuario', value: `#${user?.id}`  },
                  { label: 'Plano',         value: 'Profissional'  },
                  { label: 'Token JWT',     value: 'Valido'        },
                  { label: 'Ultimo acesso', value: 'Agora'         },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className="text-xs font-semibold text-slate-800">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
