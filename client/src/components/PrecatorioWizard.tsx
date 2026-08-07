import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DESCONTO_CATEGORIAS,
  DESCONTO_TIPOS,
  emptyForm,
  NATUREZAS,
  newDesconto,
  TIPOS_PRECATORIO,
  TRIBUNAIS_POR_TIPO,
  WIZARD_STEPS,
  type PrecatorioFormData,
  type TipoPrecatorio,
} from '@/data/precatorioForm';
import { PRECATORIO_STATUS, type PrecatorioStatus } from '@/data/status';
import { fetchEstados, fetchMunicipios, type IbgeEstado, type IbgeMunicipio } from '@/services/ibge';

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-slate-300 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';
const select = `${field} appearance-none cursor-pointer pr-9`;

function Label({ htmlFor, children, required }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-sky-600">*</span>}
    </label>
  );
}

function FieldWrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function Toggle({
  checked,
  onChange,
  onLabel,
  offLabel,
  id,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'inline-flex items-center gap-2 rounded-full px-1 py-1 pr-3 text-xs font-semibold transition-colors duration-200',
        checked ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600',
      ].join(' ')}
    >
      <span
        className={[
          'relative h-6 w-11 rounded-full transition-colors duration-200',
          checked ? 'bg-sky-600' : 'bg-slate-300',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
      {checked ? onLabel : offLabel}
    </button>
  );
}

function StepRail({
  step,
  maxReached,
  onJump,
}: {
  step: number;
  maxReached: number;
  onJump: (n: number) => void;
}) {
  return (
    <nav aria-label="Etapas do cadastro" className="mb-6">
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
        {WIZARD_STEPS.map((s, i) => {
          const active = step === s.id;
          const done = s.id < step || (s.id <= maxReached && s.id !== step);
          const reachable = s.id <= maxReached;
          return (
            <li key={s.id} className="flex flex-1 items-center">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onJump(s.id)}
                className={[
                  'group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-200',
                  active ? 'bg-sky-50 ring-1 ring-sky-200' : reachable ? 'hover:bg-slate-50' : 'opacity-50',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors',
                    done && !active
                      ? 'bg-sky-600 text-white'
                      : active
                        ? 'bg-sky-100 text-sky-800 ring-2 ring-sky-400'
                        : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {done && !active ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.id
                  )}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${active ? 'text-sky-900' : 'text-slate-800'}`}>
                    {s.label}
                  </span>
                  <span className="hidden text-[11px] text-slate-400 sm:block">{s.hint}</span>
                </span>
              </button>
              {i < WIZARD_STEPS.length - 1 && (
                <div
                  className={`mx-1 hidden h-px flex-1 sm:block ${s.id < step ? 'bg-sky-300' : 'bg-slate-200'}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500 ease-out"
          style={{ width: `${((step - 1) / (WIZARD_STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </nav>
  );
}

export interface PrecatorioWizardProps {
  initial?: Partial<PrecatorioFormData>;
  mode?: 'create' | 'edit';
  onCancel: () => void;
  onSave: (data: PrecatorioFormData) => void;
}

export default function PrecatorioWizard({
  initial,
  mode = 'create',
  onCancel,
  onSave,
}: PrecatorioWizardProps) {
  const [form, setForm] = useState<PrecatorioFormData>(() => ({ ...emptyForm(), ...initial }));
  const [step, setStep] = useState(1);
  const [maxReached, setMaxReached] = useState(1);
  const [error, setError] = useState('');
  const [estados, setEstados] = useState<IbgeEstado[]>([]);
  const [cidades, setCidades] = useState<IbgeMunicipio[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEstados().then(setEstados);
  }, []);

  useEffect(() => {
    if (!form.estadoUF) {
      setCidades([]);
      return;
    }
    let cancelled = false;
    setLoadingCidades(true);
    fetchMunicipios(form.estadoUF).then((list) => {
      if (!cancelled) {
        setCidades(list);
        setLoadingCidades(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [form.estadoUF]);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  function patch<K extends keyof PrecatorioFormData>(key: K, value: PrecatorioFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  }

  const tribunais = useMemo(() => {
    if (!form.tipo) return [];
    return TRIBUNAIS_POR_TIPO[form.tipo as TipoPrecatorio] ?? [];
  }, [form.tipo]);

  function validateStep(n: number): string | null {
    if (n === 1) {
      if (!form.tipo) return 'Selecione o tipo de precatório.';
      if (!form.tribunal) return 'Selecione o tribunal.';
      return null;
    }
    if (n === 2) {
      if (!form.documento.trim()) return 'Informe CPF ou CNPJ.';
      if (!form.requerente.trim()) return 'Informe o requerente.';
      if (!form.requerido.trim()) return 'Informe o requerido.';
      if (!form.natureza) return 'Selecione a natureza.';
      if (!form.status) return 'Selecione o status.';
      return null;
    }
    if (n === 3) {
      if (!form.principal.trim()) return 'Informe o valor principal.';
      if (!form.codigoProcesso.trim()) return 'Informe o código do processo de origem.';
      return null;
    }
    if (n === 4) {
      if (!form.confirmado) return 'Marque a verificação dos dados para continuar.';
      return null;
    }
    return null;
  }

  function goNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    const next = Math.min(4, step + 1);
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
  }

  function goBack() {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  }

  function jumpTo(n: number) {
    if (n > maxReached) return;
    setError('');
    setStep(n);
  }

  function handleSave() {
    const err = validateStep(4);
    if (err) {
      setError(err);
      return;
    }
    onSave(form);
  }

  function onOficioChange(file: File | null) {
    if (!form.tribunal) {
      setError('É necessário selecionar um tribunal antes de fazer upload do ofício.');
      return;
    }
    patch('oficioNome', file?.name ?? '');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end sm:items-center sm:justify-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]" onClick={onCancel} aria-label="Fechar" />

      <div
        className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[min(92vh,820px)] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        {/* ambient */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.12),_transparent_70%)]"
          aria-hidden
        />

        <header className="relative z-10 flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
              {mode === 'edit' ? 'Editar precatório' : 'Novo precatório'}
            </p>
            <h2 id="wizard-title" className="font-display mt-0.5 text-xl font-semibold tracking-tight text-slate-900">
              Cadastro por fluxo
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Avance ou volte a qualquer etapa já visitada para revisar.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
            aria-label="Fechar cadastro"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div ref={panelRef} className="relative z-10 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <StepRail step={step} maxReached={maxReached} onJump={jumpTo} />

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 animate-[fadeIn_200ms_ease]"
            >
              {error}
            </div>
          )}

          <div key={step} className="animate-[fadeUp_280ms_ease]">
            {step === 1 && (
              <section className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrap>
                    <Label htmlFor="tipo" required>
                      Tipo precatório
                    </Label>
                    <div className="relative">
                      <select
                        id="tipo"
                        className={select}
                        value={form.tipo}
                        onChange={(e) => {
                          const tipo = e.target.value as TipoPrecatorio | '';
                          setForm((prev) => ({
                            ...prev,
                            tipo,
                            tribunal: '',
                            oficioNome: '',
                          }));
                          setError('');
                        }}
                      >
                        <option value="">Selecione o tipo</option>
                        {TIPOS_PRECATORIO.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <Chevron />
                    </div>
                  </FieldWrap>
                  <FieldWrap>
                    <Label htmlFor="tribunal" required>
                      Tribunal
                    </Label>
                    <div className="relative">
                      <select
                        id="tribunal"
                        className={select}
                        value={form.tribunal}
                        disabled={!form.tipo}
                        onChange={(e) => patch('tribunal', e.target.value)}
                      >
                        <option value="">Selecione o tribunal</option>
                        {tribunais.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <Chevron />
                    </div>
                  </FieldWrap>
                </div>

                <FieldWrap>
                  <Label>Ofício requisitório</Label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="sr-only"
                    onChange={(e) => onOficioChange(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.tribunal) {
                        setError('É necessário selecionar um tribunal antes de fazer upload do ofício.');
                        return;
                      }
                      fileRef.current?.click();
                    }}
                    className={[
                      'group flex w-full items-center gap-3 rounded-xl border border-dashed px-4 py-4 text-left transition-all duration-200',
                      form.oficioNome
                        ? 'border-sky-300 bg-sky-50/60'
                        : 'border-slate-300 bg-slate-50/80 hover:border-sky-400 hover:bg-sky-50/40',
                    ].join(' ')}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                      {form.oficioNome ? (
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-slate-400 group-hover:text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-800">
                        {form.oficioNome || 'Subir ofício'}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {form.oficioNome ? 'Clique para substituir o PDF' : 'PDF · necessário selecionar o tribunal primeiro'}
                      </span>
                    </span>
                    {form.oficioNome && (
                      <button
                        type="button"
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-white hover:text-rose-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          patch('oficioNome', '');
                          if (fileRef.current) fileRef.current.value = '';
                        }}
                      >
                        Remover
                      </button>
                    )}
                  </button>
                </FieldWrap>

                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-colors hover:border-slate-300">
                  <input
                    type="checkbox"
                    checked={form.eComum}
                    onChange={(e) => patch('eComum', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">
                    É comum? <span className="text-slate-400">(natureza comum do precatório)</span>
                  </span>
                </label>

                <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-center text-xs text-slate-500">
                  Preencha tipo e tribunal para liberar as próximas etapas.
                </p>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrap>
                    <Label htmlFor="doc" required>
                      CPF / CNPJ
                    </Label>
                    <input
                      id="doc"
                      className={field}
                      value={form.documento}
                      onChange={(e) => patch('documento', e.target.value)}
                      placeholder="Informe o CPF/CNPJ"
                      autoComplete="off"
                    />
                  </FieldWrap>
                  <FieldWrap>
                    <Label htmlFor="natureza" required>
                      Natureza
                    </Label>
                    <div className="relative">
                      <select
                        id="natureza"
                        className={select}
                        value={form.natureza}
                        onChange={(e) => patch('natureza', e.target.value)}
                      >
                        <option value="">Selecione a natureza</option>
                        {NATUREZAS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <Chevron />
                    </div>
                  </FieldWrap>
                </div>

                <FieldWrap>
                  <Label htmlFor="requerente" required>
                    Requerente
                  </Label>
                  <input
                    id="requerente"
                    className={field}
                    value={form.requerente}
                    onChange={(e) => patch('requerente', e.target.value)}
                    placeholder="Digite o requerente do processo"
                  />
                </FieldWrap>

                <FieldWrap>
                  <Label htmlFor="requerido" required>
                    Requerido
                  </Label>
                  <input
                    id="requerido"
                    className={field}
                    value={form.requerido}
                    onChange={(e) => patch('requerido', e.target.value)}
                    placeholder="Digite o requerido do processo"
                  />
                </FieldWrap>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrap>
                    <Label htmlFor="vara">Vara</Label>
                    <input
                      id="vara"
                      className={field}
                      value={form.vara}
                      onChange={(e) => patch('vara', e.target.value)}
                      placeholder="Digite a vara"
                    />
                  </FieldWrap>
                  <FieldWrap>
                    <Label htmlFor="status" required>
                      Status precatório
                    </Label>
                    <div className="relative">
                      <select
                        id="status"
                        className={select}
                        value={form.status}
                        onChange={(e) => patch('status', e.target.value as PrecatorioStatus)}
                      >
                        {PRECATORIO_STATUS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <Chevron />
                    </div>
                  </FieldWrap>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrap>
                    <Label htmlFor="estado">Estado</Label>
                    <div className="relative">
                      <select
                        id="estado"
                        className={select}
                        value={form.estadoUF}
                        onChange={(e) => {
                          const uf = e.target.value;
                          const nome = estados.find((x) => x.sigla === uf)?.nome ?? '';
                          setForm((prev) => ({ ...prev, estadoUF: uf, estadoNome: nome, cidade: '' }));
                          setError('');
                        }}
                      >
                        <option value="">Selecione o estado</option>
                        {estados.map((e) => (
                          <option key={e.sigla} value={e.sigla}>
                            {e.nome}
                          </option>
                        ))}
                      </select>
                      <Chevron />
                    </div>
                  </FieldWrap>
                  <FieldWrap>
                    <Label htmlFor="cidade">Cidade</Label>
                    <div className="relative">
                      <select
                        id="cidade"
                        className={select}
                        value={form.cidade}
                        disabled={!form.estadoUF || loadingCidades}
                        onChange={(e) => patch('cidade', e.target.value)}
                      >
                        <option value="">
                          {loadingCidades ? 'Carregando…' : 'Selecione a cidade'}
                        </option>
                        {cidades.map((c) => (
                          <option key={c.id} value={c.nome}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                      <Chevron />
                    </div>
                  </FieldWrap>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrap>
                    <Label htmlFor="dataBase">Data base</Label>
                    <input
                      id="dataBase"
                      type="date"
                      className={field}
                      value={form.dataBase}
                      onChange={(e) => patch('dataBase', e.target.value)}
                    />
                  </FieldWrap>
                  <FieldWrap>
                    <Label htmlFor="dataExp">Data de expedição</Label>
                    <input
                      id="dataExp"
                      type="date"
                      className={field}
                      value={form.dataExpedicao}
                      onChange={(e) => patch('dataExpedicao', e.target.value)}
                    />
                  </FieldWrap>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrap>
                    <Label htmlFor="principal" required>
                      Principal
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        R$
                      </span>
                      <input
                        id="principal"
                        className={`${field} pl-10`}
                        value={form.principal}
                        onChange={(e) => patch('principal', e.target.value)}
                        placeholder="0,00"
                        inputMode="decimal"
                      />
                    </div>
                  </FieldWrap>
                  <FieldWrap>
                    <Label htmlFor="juros">Juros</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        R$
                      </span>
                      <input
                        id="juros"
                        className={`${field} pl-10`}
                        value={form.juros}
                        onChange={(e) => patch('juros', e.target.value)}
                        placeholder="0,00"
                        inputMode="decimal"
                      />
                    </div>
                  </FieldWrap>
                </div>

                {(form.principal || form.juros) && (
                  <div className="flex flex-wrap gap-3 rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-3">
                    <MoneyPill label="Principal" value={form.principal} />
                    <MoneyPill label="Juros" value={form.juros} />
                  </div>
                )}

                <FieldWrap>
                  <Label htmlFor="numPrec">Número do precatório</Label>
                  <input
                    id="numPrec"
                    className={field}
                    value={form.numeroPrecatorio}
                    onChange={(e) => patch('numeroPrecatorio', e.target.value)}
                    placeholder="Digite o número do precatório"
                  />
                </FieldWrap>

                <FieldWrap>
                  <Label htmlFor="codProc" required>
                    Código do processo de origem
                  </Label>
                  <input
                    id="codProc"
                    className={`${field} font-mono text-[13px]`}
                    value={form.codigoProcesso}
                    onChange={(e) => patch('codigoProcesso', e.target.value)}
                    placeholder="0000000-00.0000.0.00.0000"
                  />
                </FieldWrap>

                <FieldWrap>
                  <Label htmlFor="cumprimento">Cumprimento de sentença</Label>
                  <input
                    id="cumprimento"
                    className={`${field} font-mono text-[13px]`}
                    value={form.cumprimentoSentenca}
                    onChange={(e) => patch('cumprimentoSentenca', e.target.value)}
                    placeholder="Digite o código da sentença"
                  />
                </FieldWrap>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-5">
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Possui PSS?</p>
                      <p className="text-xs text-slate-500">Contribuição previdenciária</p>
                    </div>
                    <Toggle
                      id="pss"
                      checked={form.possuiPss}
                      onChange={(v) => patch('possuiPss', v)}
                      onLabel="Com PSS"
                      offLabel="Sem PSS"
                    />
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Reduzir percentual do credor?</p>
                      <p className="text-xs text-slate-500">Define a fatia cedível</p>
                    </div>
                    <Toggle
                      id="reduzir"
                      checked={form.reduzirPercentualCredor}
                      onChange={(v) => patch('reduzirPercentualCredor', v)}
                      onLabel="Sim"
                      offLabel="Não"
                    />
                  </div>

                  <FieldWrap>
                    <Label htmlFor="pctCredor">Percentual do credor</Label>
                    <div className="relative max-w-[200px]">
                      <input
                        id="pctCredor"
                        className={`${field} pr-10`}
                        value={form.percentualCredor}
                        disabled={!form.reduzirPercentualCredor}
                        onChange={(e) => patch('percentualCredor', e.target.value)}
                        inputMode="decimal"
                      />
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        %
                      </span>
                    </div>
                  </FieldWrap>

                  <div className="h-px bg-slate-200" />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Parcela preferencial já foi paga?</p>
                    </div>
                    <Toggle
                      id="preferencial"
                      checked={form.parcelaPreferencialPaga}
                      onChange={(v) => patch('parcelaPreferencialPaga', v)}
                      onLabel="Sim"
                      offLabel="Não"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Descontos</h3>
                      <p className="text-xs text-slate-500">RRA e demais categorias</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => patch('descontos', [...form.descontos, newDesconto()])}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white transition-colors hover:bg-sky-700"
                      aria-label="Adicionar desconto"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {form.descontos.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
                      Nenhum desconto. Use + para adicionar.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {form.descontos.map((d, idx) => (
                        <li key={d.id} className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 sm:grid-cols-[1fr_1fr_100px_36px]">
                          <div className="relative">
                            <select
                              className={select}
                              value={d.categoria}
                              onChange={(e) => {
                                const next = [...form.descontos];
                                next[idx] = { ...d, categoria: e.target.value };
                                patch('descontos', next);
                              }}
                              aria-label="Categoria de desconto"
                            >
                              {DESCONTO_CATEGORIAS.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <Chevron />
                          </div>
                          <div className="relative">
                            <select
                              className={select}
                              value={d.tipoValor}
                              onChange={(e) => {
                                const next = [...form.descontos];
                                next[idx] = { ...d, tipoValor: e.target.value };
                                patch('descontos', next);
                              }}
                              aria-label="Tipo do valor"
                            >
                              {DESCONTO_TIPOS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <Chevron />
                          </div>
                          <input
                            className={field}
                            value={d.quantidade}
                            onChange={(e) => {
                              const next = [...form.descontos];
                              next[idx] = { ...d, quantidade: e.target.value };
                              patch('descontos', next);
                            }}
                            placeholder="Meses / valor"
                            aria-label="Quantidade"
                          />
                          <button
                            type="button"
                            className="flex h-10 w-9 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50"
                            onClick={() => patch('descontos', form.descontos.filter((x) => x.id !== d.id))}
                            aria-label="Remover desconto"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <label
                  className={[
                    'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3.5 transition-colors',
                    form.confirmado
                      ? 'border-sky-300 bg-sky-50/70'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={form.confirmado}
                    onChange={(e) => patch('confirmado', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Verifiquei os dados e garanto que estão corretos
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Necessário para salvar o precatório nesta etapa.
                    </span>
                  </span>
                </label>
              </section>
            )}
          </div>
        </div>

        <footer className="relative z-10 flex items-center justify-between gap-3 border-t border-slate-100 bg-white/90 px-5 py-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={step === 1 ? onCancel : goBack}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-400 sm:inline">
              Etapa {step} de {WIZARD_STEPS.length}
            </span>
            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-colors hover:bg-sky-700"
              >
                Avançar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-colors hover:bg-sky-700"
              >
                Salvar
              </button>
            )}
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Chevron() {
  return (
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );
}

function MoneyPill({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600/80">{label}</p>
      <p className="text-sm font-bold tabular-nums text-slate-900">
        R$ {value || '—'}
      </p>
    </div>
  );
}
