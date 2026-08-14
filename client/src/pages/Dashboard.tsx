import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import DashboardCalendar from '@/components/DashboardCalendar';
import { formatCurrencyBRL } from '@/data/dashboardCharts';
import { STATUS_STYLES } from '@/data/status';
import {
  emptyMetrics,
  formatCompactBRL,
  loadDashboardMetrics,
  type DashboardMetrics,
} from '@/services/dashboardMetrics';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setMetrics(emptyMetrics);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await loadDashboardMetrics();
        if (!cancelled) setMetrics(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Não foi possível carregar os indicadores.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const cards = [
    {
      label: 'Carteira ativa',
      value: formatCompactBRL(metrics.carteiraAtiva),
      note: metrics.qtdAtivos > 0 ? `${metrics.qtdAtivos} processos ativos` : 'sem registros',
    },
    {
      label: 'Valor em cessão',
      value: formatCompactBRL(metrics.valorEmCessao),
      note:
        metrics.qtdEmCessao > 0
          ? `${metrics.qtdEmCessao} em formalização`
          : 'nenhum processo em formalização',
    },
    {
      label: 'Ticket médio',
      value: formatCompactBRL(metrics.ticketMedio),
      note: metrics.qtdAtivos > 0 ? 'carteira atual' : 'carteira vazia',
    },
    {
      label: 'Concluídos',
      value: String(metrics.totalConcluidos),
      note: `conversão ${metrics.conversao}`,
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gamma-bg">
      <Sidebar onLogout={handleLogout} userName={user?.name ?? ''} userEmail={user?.email ?? ''} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-[70px] shrink-0 items-center gap-4 border-b border-gamma-border bg-white/96 px-4 backdrop-blur sm:px-8 lg:px-8">
          <div className="min-w-0 pl-10 lg:pl-0">
            <h1 className="font-display text-lg font-semibold tracking-[-0.02em] text-gamma-text">Dashboard</h1>
            <p className="mt-0.5 truncate text-[11px] capitalize text-gamma-muted">{todayLabel}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/precatorios')}
              className="btn-primary hidden sm:inline-flex"
            >
              + Novo precatório
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gamma-soft text-xs font-extrabold text-[#177566]">
              {initials}
            </div>
          </div>
        </header>

        <main className="scrollbar-gamma flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker-gamma">Visão executiva</p>
              <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.03em] text-gamma-text">
                Carteira e operação
              </h2>
              <p className="mt-1.5 text-[13px] text-gamma-secondary">
                Indicadores essenciais, andamento da esteira e pontos que exigem atenção.
              </p>
            </div>
            {loading && <p className="text-[12px] text-gamma-muted">Carregando indicadores…</p>}
          </div>

          {error && (
            <div className="mb-5 rounded-gamma border border-[#F1D6D9] bg-[#FFF3F4] px-4 py-3 text-[13px] text-gamma-danger">
              {error}
            </div>
          )}

          {/* Metric strip */}
          <section className="mb-5 grid overflow-hidden rounded-gamma-card border border-gamma-border bg-white shadow-gamma sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((m, i) => (
              <article
                key={m.label}
                className={`relative min-h-[118px] px-5 py-5 ${i > 0 ? 'border-t border-gamma-border sm:border-t-0 sm:border-l' : ''} ${i === 2 ? 'xl:border-l' : ''}`}
              >
                <p className="text-[11px] font-bold text-gamma-secondary">{m.label}</p>
                <p className="font-display mt-3 text-[1.55rem] font-semibold leading-none tracking-[-0.035em] text-gamma-text">
                  {m.value}
                </p>
                <p className="mt-2.5 text-[10px] text-gamma-muted">{m.note}</p>
                <span className="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-gamma-strong/80" />
              </article>
            ))}
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="surface-gamma overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-gamma-border px-5 py-4">
                <div>
                  <h3 className="font-display text-sm font-semibold tracking-[-0.02em] text-gamma-text">Pipeline da carteira</h3>
                  <p className="mt-1 text-[11px] text-gamma-muted">Clique em uma etapa para abrir a esteira.</p>
                </div>
                <button type="button" onClick={() => navigate('/esteira')} className="btn-secondary !min-h-[34px] !px-3 !text-[11px]">
                  Abrir esteira →
                </button>
              </div>
              <div className="space-y-3 px-5 py-5">
                {metrics.pipeline.length === 0 ? (
                  <p className="py-6 text-center text-[13px] text-gamma-muted">Nenhum processo na esteira ainda.</p>
                ) : (
                  metrics.pipeline.map((row) => (
                    <button
                      key={row.name}
                      type="button"
                      onClick={() => navigate('/esteira')}
                      className="grid w-full grid-cols-[120px_1fr_28px] items-center gap-3 text-left sm:grid-cols-[140px_1fr_32px]"
                    >
                      <span className="truncate text-[12px] font-semibold text-gamma-secondary">{row.name}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-gamma-pale">
                        <span className="block h-full rounded-full bg-gamma-strong" style={{ width: row.width }} />
                      </span>
                      <span className="text-right font-display text-sm font-semibold tabular-nums text-gamma-text">{row.qty}</span>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="surface-gamma overflow-hidden">
              <div className="border-b border-gamma-border px-5 py-4">
                <h3 className="font-display text-sm font-semibold tracking-[-0.02em] text-gamma-text">Agenda</h3>
                <p className="mt-1 text-[11px] text-gamma-muted">Compromissos e follow-ups</p>
              </div>
              <div className="p-3 sm:p-4">
                <DashboardCalendar />
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-5">
            <section className="surface-gamma overflow-hidden p-5 lg:col-span-3">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-sm font-semibold text-gamma-text">Evolução</h3>
                  <p className="mt-1 text-[11px] text-gamma-muted">Precatórios cadastrados por mês</p>
                </div>
                <span className="rounded-gamma bg-gamma-soft px-2.5 py-1 text-[11px] font-bold text-[#177566]">
                  Total: {metrics.totalRegistros}
                </span>
              </div>
              <LineChart
                data={metrics.evolution}
                xLabelAccessor={(item) => item.mes}
                series={[
                  {
                    key: 'total-projetos',
                    label: 'Precatórios',
                    color: '#00BFA8',
                    valueAccessor: (item) => item.total,
                  },
                ]}
              />
            </section>

            <section className="surface-gamma overflow-hidden p-5 lg:col-span-2">
              <h3 className="font-display text-sm font-semibold text-gamma-text">Distribuição por status</h3>
              <p className="mt-1 mb-4 text-[11px] text-gamma-muted">Conversão: {metrics.conversao}</p>
              <BarChart
                data={metrics.status}
                xLabelAccessor={(item) => item.status}
                valueAccessor={(item) => item.quantidade}
                tooltipTitleAccessor={(item) => item.status}
                tooltipValueFormatter={(item) => `${item.quantidade}`}
                tooltipExtraFormatter={(item) => formatCurrencyBRL(item.valorTotal)}
              />
            </section>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="surface-gamma overflow-hidden">
              <div className="flex items-center justify-between border-b border-gamma-border px-5 py-4">
                <div>
                  <h3 className="font-display text-sm font-semibold text-gamma-text">Atividades recentes</h3>
                  <p className="mt-1 text-[11px] text-gamma-muted">Últimas movimentações</p>
                </div>
              </div>
              <div className="divide-y divide-gamma-border">
                {metrics.atividades.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[13px] text-gamma-muted">Nenhuma atividade registrada.</p>
                ) : (
                  metrics.atividades.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => navigate('/precatorios')}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gamma-pale"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gamma-soft text-xs font-bold text-[#177566]">
                        {a.client[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gamma-text">{a.client}</p>
                        <p className="truncate text-xs text-gamma-muted">{a.action}</p>
                      </div>
                      <div className="shrink-0 space-y-1 text-right">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[a.status]}`}>
                          {a.status}
                        </span>
                        <p className="text-[10px] text-gamma-muted">{a.time}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="surface-gamma overflow-hidden">
              <div className="border-b border-gamma-border px-5 py-4">
                <h3 className="font-display text-sm font-semibold text-gamma-text">Atenção operacional</h3>
                <p className="mt-1 text-[11px] text-gamma-muted">Exceções e pendências prioritárias</p>
              </div>
              <ul className="space-y-0 divide-y divide-gamma-border px-2 py-1">
                {metrics.pendencias.length === 0 ? (
                  <li className="px-3 py-8 text-center text-[13px] text-gamma-muted">
                    Nenhuma pendência no momento.
                  </li>
                ) : (
                  metrics.pendencias.map((t) => (
                    <li key={t} className="flex items-start gap-3 px-3 py-3.5 text-sm text-gamma-text">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gamma-warning" />
                      {t}
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
