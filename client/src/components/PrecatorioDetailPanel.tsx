import { useEffect, useMemo, useState } from 'react';
import { parseMoney } from '@/data/precatorioForm';
import { PRECATORIO_STATUS, STATUS_DOTS, STATUS_STYLES, type PrecatorioStatus } from '@/data/status';
import { openProjef } from '@/data/projef';
import ProjefImportPanel from '@/components/ProjefImportPanel';
import type { PrecatorioRecord } from '@/services/precatorios';
import {
  downloadBlob,
  loadOficioAnexo,
  openBlobPreview,
  type OficioAnexo,
} from '@/services/oficioAnexos';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export type { PrecatorioRecord };

interface Props {
  record: PrecatorioRecord;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (id: string, status: PrecatorioStatus) => void;
  onValorUpdate: (id: string, principal: number) => void;
  onQuoteChange?: (id: string, ofertaPct: number, comissaoPct: number) => void;
}

export default function PrecatorioDetailPanel({
  record,
  onClose,
  onEdit,
  onStatusChange,
  onValorUpdate,
  onQuoteChange,
}: Props) {
  const d = record.data;
  const principal = parseMoney(d.principal);
  const juros = parseMoney(d.juros);
  const face = principal + juros;
  const pctCredor = Math.min(100, Math.max(0, parseFloat(d.percentualCredor) || 100));

  const [status, setStatus] = useState(record.status);
  const [ofertaPct, setOfertaPct] = useState(record.ofertaPct || 70);
  const [comissaoPct, setComissaoPct] = useState(record.comissaoPct || 1);
  const [flash, setFlash] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [fileError, setFileError] = useState('');
  const [anexo, setAnexo] = useState<OficioAnexo | null>(null);
  const [anexoLoading, setAnexoLoading] = useState(false);

  useEffect(() => {
    if (!d.oficioAnexo && !d.oficioNome) {
      setAnexo(null);
      return;
    }
    let cancelled = false;
    setAnexoLoading(true);
    setFileError('');
    void loadOficioAnexo(record.id)
      .then((loaded) => {
        if (!cancelled) setAnexo(loaded);
      })
      .catch(() => {
        if (!cancelled) setFileError('Não foi possível carregar o ofício.');
      })
      .finally(() => {
        if (!cancelled) setAnexoLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [record.id, d.oficioAnexo, d.oficioNome]);

  const calc = useMemo(() => {
    const valorAtualizado = face > 0 ? face : principal;
    const baseCedivel = valorAtualizado * (pctCredor / 100);
    const preco = baseCedivel * (ofertaPct / 100);
    const comissao = preco * (comissaoPct / 100);
    const min = preco * 0.92;
    const max = preco * 1.05;
    return { valorAtualizado, preco, comissao, min, max, baseCedivel };
  }, [face, principal, pctCredor, ofertaPct, comissaoPct]);

  function recalcular() {
    onQuoteChange?.(record.id, ofertaPct, comissaoPct);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 700);
  }

  async function handleDownloadOficio() {
    if (!anexo) return;
    setFileBusy(true);
    setFileError('');
    try {
      downloadBlob(anexo.blob, anexo.nome || d.oficioNome || 'oficio.pdf');
    } catch {
      setFileError('Não foi possível baixar o ofício.');
    } finally {
      setFileBusy(false);
    }
  }

  function handleViewOficio() {
    if (!anexo) return;
    openBlobPreview(anexo.blob);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-4 lg:p-6">
      <button type="button" className="absolute inset-0 bg-slate-900/55 backdrop-blur-[3px]" onClick={onClose} aria-label="Fechar" />

      <aside
        className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl animate-[fadeScale_220ms_ease] sm:h-[calc(100vh-2rem)] sm:max-h-[960px] sm:rounded-2xl lg:h-[calc(100vh-3rem)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.14),_transparent_65%)]"
          aria-hidden
        />

        <header className="relative z-10 flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
              Editando cotação {record.cotacao}
            </p>
            <h2 id="detail-title" className="font-display mt-0.5 text-xl font-semibold text-slate-900">
              {d.requerente || 'Precatório'}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status]}`} />
                {status}
              </span>
              {d.tribunal && (
                <span className="rounded-lg bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">
                  {d.tribunal}
                </span>
              )}
              {d.tipo && (
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                  {d.tipo}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
            >
              Editar precatório
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
              aria-label="Fechar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Summary */}
            <div className="space-y-5 border-b border-slate-100 px-5 py-5 sm:px-6 lg:border-b-0 lg:border-r">
              <Section title="Documentos">
                {d.oficioNome ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                        <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800" title={d.oficioNome}>
                          {d.oficioNome}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">Ofício requisitório anexado</p>
                        {anexoLoading ? (
                          <p className="mt-2 text-xs text-slate-400">Carregando arquivo…</p>
                        ) : anexo ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handleViewOficio}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-50"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Visualizar
                            </button>
                            <button
                              type="button"
                              disabled={fileBusy}
                              onClick={() => void handleDownloadOficio()}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              {fileBusy ? 'Baixando…' : 'Baixar'}
                            </button>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-amber-700">
                            Arquivo não encontrado — edite o precatório e anexe o PDF novamente.
                          </p>
                        )}
                        {fileError && <p className="mt-2 text-xs text-rose-600">{fileError}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Nenhum ofício anexado</p>
                )}
              </Section>

              <Section title="Preços">
                <Row label="Preço" value={BRL.format(calc.preco)} strong />
                <Row label="Preço mínimo" value={BRL.format(calc.min)} />
                <Row label="Preço máximo" value={BRL.format(calc.max)} />
                <Row label="Percentual de oferta" value={`${ofertaPct.toFixed(2)}%`} />
                <Row label="Valor atualizado" value={BRL.format(calc.valorAtualizado)} />
              </Section>

              <Section title="Comissões">
                <Row label="Comissão" value={`${comissaoPct.toFixed(2)}%`} />
                <Row label="Valor de comissão" value={BRL.format(calc.comissao)} strong />
              </Section>

              <Section title="Precatório">
                <Row label="Documento" value={d.documento || '—'} mono />
                <Row label="Número do processo" value={d.codigoProcesso || '—'} mono />
                <Row label="Tribunal" value={d.tribunal || '—'} />
                <Row label="Tipo" value={d.tipo || '—'} />
                <Row label="Natureza" value={d.natureza || '—'} />
                <Row label="Local" value={[d.cidade, d.estadoNome || d.estadoUF].filter(Boolean).join(' · ') || '—'} />
              </Section>

              <Section title="Dados base para cálculo">
                <Row label="Principal" value={BRL.format(principal)} />
                <Row label="Juros" value={BRL.format(juros)} />
                <Row label="PSS" value={d.possuiPss ? 'Sim' : 'Não'} />
              </Section>

              <Section title="Descontos e datas">
                {d.descontos.length === 0 ? (
                  <p className="text-xs text-slate-400">Sem descontos cadastrados</p>
                ) : (
                  d.descontos.map((x) => (
                    <Row
                      key={x.id}
                      label={x.categoria}
                      value={`${x.quantidade || '—'} (${x.tipoValor})`}
                    />
                  ))
                )}
                <Row label="Percentual do credor" value={`${pctCredor.toFixed(2)}%`} />
                <Row label="Data base" value={fmtDate(d.dataBase)} />
                <Row label="Data de expedição" value={fmtDate(d.dataExpedicao)} />
              </Section>
            </div>

            {/* Interactive */}
            <div className="space-y-5 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%)] px-5 py-5 sm:px-6">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Status</label>
                <select
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PrecatorioStatus)}
                >
                  {PRECATORIO_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-end justify-between">
                  <label className="text-[13px] font-medium text-slate-700">Preço (oferta)</label>
                  <span className="font-display text-lg font-semibold tabular-nums text-slate-900">
                    {BRL.format(calc.preco)}
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={98}
                  step={0.05}
                  value={ofertaPct}
                  onChange={(e) => setOfertaPct(Number(e.target.value))}
                  className="w-full accent-sky-600"
                  aria-label="Percentual de oferta"
                />
                <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>40%</span>
                  <span className="text-sky-600">{ofertaPct.toFixed(2)}%</span>
                  <span>98%</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-end justify-between">
                  <label className="text-[13px] font-medium text-slate-700">Comissão</label>
                  <span className="text-sm font-bold tabular-nums text-slate-800">
                    {BRL.format(calc.comissao)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.05}
                  value={comissaoPct}
                  onChange={(e) => setComissaoPct(Number(e.target.value))}
                  className="w-full accent-sky-600"
                  aria-label="Percentual de comissão"
                />
                <p className="mt-1 text-right text-xs font-semibold text-slate-500">{comissaoPct.toFixed(2)}%</p>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Atualizar via PROJEF
                </p>
                <ProjefImportPanel
                  compact
                  onImport={({ valor }) => {
                    const n = Number(valor.replace(/\./g, '').replace(',', '.'));
                    if (Number.isNaN(n)) return;
                    onValorUpdate(record.id, n);
                  }}
                />
                <button
                  type="button"
                  onClick={openProjef}
                  className="mt-2 text-xs font-semibold text-indigo-700 hover:underline"
                >
                  Abrir PROJEF
                </button>
              </div>

              <button
                type="button"
                onClick={onEdit}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Atualizar dados do precatório
              </button>

              <button
                type="button"
                onClick={recalcular}
                className={[
                  'w-full rounded-xl py-3 text-sm font-bold tracking-wide text-white transition-all duration-300',
                  flash
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-200 scale-[1.01]'
                    : 'bg-sky-600 shadow-md shadow-sky-200 hover:bg-sky-700',
                ].join(' ')}
              >
                {flash ? 'Cotação recalculada' : 'Recalcular cotação'}
              </button>

              <button
                type="button"
                onClick={() => {
                  onQuoteChange?.(record.id, ofertaPct, comissaoPct);
                  onStatusChange(record.id, status);
                  onClose();
                }}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Salvar status e fechar
              </button>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes fadeScale {
          from { transform: scale(0.98) translateY(8px); opacity: 0.55; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  strong,
  mono,
}: {
  label: string;
  value: string;
  strong?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-1.5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={[
          'text-right text-sm text-slate-800',
          strong ? 'font-bold' : 'font-medium',
          mono ? 'font-mono text-[12px]' : '',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
