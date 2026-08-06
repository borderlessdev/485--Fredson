import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import { openProjef, PROJEF_URL } from '@/data/projef';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PrioridadePagamento {
  id: number;
  descricao: string;
  valor: number;
}

interface Resultado {
  valorBruto: number;
  ir: number;
  totalPrioridades: number;
  valorLiquido: number;
  valorCedivel: number;
  percentualDesconto: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
function fmtBRL(v: number) {
  return BRL.format(v);
}

function parseBRL(v: string): number {
  return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
}

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-slate-300 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-200';
const select =
  `${field} appearance-none cursor-pointer pr-9`;

function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-slate-700">
      {children}
    </label>
  );
}

function StepBadge({ n, active, done }: { n: number; active?: boolean; done?: boolean }) {
  return (
    <span
      className={[
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums',
        done
          ? 'bg-sky-600 text-white'
          : active
            ? 'bg-sky-100 text-sky-800 ring-2 ring-sky-300'
            : 'bg-slate-100 text-slate-500',
      ].join(' ')}
    >
      {done ? (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        n
      )}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CalculadoraPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const resultRef = useRef<HTMLElement>(null);

  const [esfera, setEsfera] = useState('Federal');
  const [tipo, setTipo] = useState('Precatório');
  const today = new Date().toISOString().split('T')[0];
  const [dataBase, setDataBase] = useState(today);
  const [dataAtual, setDataAtual] = useState(today);
  const [valorPrincipal, setValorPrincipal] = useState('');
  const [juros, setJuros] = useState('');
  const [descontos, setDescontos] = useState('');
  const [aplicarIR, setAplicarIR] = useState(true);
  const [numDependentes, setNumDependentes] = useState(1);
  const [prioridades, setPrioridades] = useState<PrioridadePagamento[]>([]);
  const [percentualCedivel, setPercentualCedivel] = useState(100);

  const [showProjef, setShowProjef] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [projefCodigo, setProjefCodigo] = useState('');
  const [projefValor, setProjefValor] = useState('');
  const [projefJuros, setProjefJuros] = useState('');
  const [projefMsg, setProjefMsg] = useState('');

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDragOver, setPdfDragOver] = useState(false);
  const [nomeCredor, setNomeCredor] = useState('');
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const face = parseBRL(valorPrincipal);
  const step1Done = face > 0;
  const step2Done = true;

  const resultado: Resultado | null = useMemo(() => {
    if (!face) return null;
    const jurosVal = parseBRL(juros);
    const descontosVal = parseBRL(descontos);
    const totalPrioridades = prioridades.reduce((acc, p) => acc + Number(p.valor), 0);
    const valorBruto = face + jurosVal - descontosVal;
    const deducaoPorDep = 2275.08 * numDependentes;
    const baseIR = Math.max(0, valorBruto - deducaoPorDep - totalPrioridades);
    const ir = aplicarIR ? baseIR * 0.275 : 0;
    const valorLiquido = valorBruto - ir - totalPrioridades;
    const valorCedivel = valorLiquido * (percentualCedivel / 100);
    const percentualDesconto = valorBruto > 0 ? ((valorBruto - valorCedivel) / valorBruto) * 100 : 0;
    return { valorBruto, ir, totalPrioridades, valorLiquido, valorCedivel, percentualDesconto };
  }, [face, juros, descontos, aplicarIR, numDependentes, prioridades, percentualCedivel]);

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  function addPrioridade() {
    setPrioridades((prev) => [...prev, { id: Date.now(), descricao: '', valor: 0 }]);
  }

  function removePrioridade(id: number) {
    setPrioridades((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePrioridade(id: number, fieldName: 'descricao' | 'valor', value: string | number) {
    setPrioridades((prev) => prev.map((p) => (p.id === id ? { ...p, [fieldName]: value } : p)));
  }

  function importProjef(e: React.FormEvent) {
    e.preventDefault();
    if (!projefValor.trim()) {
      setProjefMsg('Informe o valor atualizado do PROJEF.');
      return;
    }
    setValorPrincipal(projefValor.trim());
    if (projefJuros.trim()) setJuros(projefJuros.trim());
    setDataAtual(today);
    if (projefCodigo.trim()) setProjefCodigo(projefCodigo.trim());
    setProjefMsg('Valor importado. O resultado à direita já atualizou.');
    setShowProjef(false);
  }

  function parsePdfName(name: string) {
    const processoMatch = name.match(/(\d{7}-?\d{2}\.?\d{4}\.?\d{1}\.?\d{2}\.?\d{4}|\d{10,25})/);
    const valorMatch = name.match(/R\$[\s]*([\d.,]+)/i);
    return {
      processo: processoMatch ? processoMatch[1] : '',
      valor: valorMatch ? valorMatch[1] : '',
    };
  }

  function handlePdfSelect(file: File) {
    setPdfFile(file);
    const parsed = parsePdfName(file.name);
    if (parsed.processo) setNumeroProcesso(parsed.processo);
    if (parsed.valor) setValorPrincipal(parsed.valor);
  }

  function handlePdfDrop(e: React.DragEvent) {
    e.preventDefault();
    setPdfDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') handlePdfSelect(file);
  }

  function goToResult() {
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleRegistrarCedente() {
    if (!resultado) return;
    const params = new URLSearchParams({
      nome: nomeCredor,
      processo: numeroProcesso,
      valorFace: String(Math.round(resultado.valorBruto)),
      origemLead: 'Calculadora',
    });
    navigate(`/cedentes?new=1&${params.toString()}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef2f6]">
      <Sidebar onLogout={handleLogout} userName={user?.name ?? ''} userEmail={user?.email ?? ''} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 sm:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-pretty font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Calculadora Jurídica
            </h1>
            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
              Simule o valor cedível em 3 passos
            </p>
          </div>
          <ol className="hidden items-center gap-2 md:flex" aria-label="Progresso">
            <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <StepBadge n={1} active={!step1Done} done={step1Done} /> Valores
            </li>
            <span className="h-px w-6 bg-slate-200" aria-hidden="true" />
            <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <StepBadge n={2} active={step1Done} done={step1Done && step2Done} /> Ajustes
            </li>
            <span className="h-px w-6 bg-slate-200" aria-hidden="true" />
            <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <StepBadge n={3} active={!!resultado} done={!!resultado} /> Resultado
            </li>
          </ol>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">

            {/* ── Form column ─────────────────────────────────────────────── */}
            <div className="space-y-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

              {/* Step 1 */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 motion-safe:animate-fade-in">
                <div className="mb-6 flex items-start gap-3">
                  <StepBadge n={1} active={!step1Done} done={step1Done} />
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">Dados e valores</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Informe o precatório e o valor de face. O restante é opcional.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label htmlFor="esfera">Esfera</Label>
                    <div className="relative">
                      <select id="esfera" name="esfera" autoComplete="off" value={esfera} onChange={(e) => setEsfera(e.target.value)} className={select}>
                        <option>Federal</option>
                        <option>Estadual</option>
                        <option>Municipal</option>
                      </select>
                      <Chevron />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <div className="relative">
                      <select id="tipo" name="tipo" autoComplete="off" value={tipo} onChange={(e) => setTipo(e.target.value)} className={select}>
                        <option>Precatório</option>
                        <option>RPV</option>
                      </select>
                      <Chevron />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dataBase">Data-base</Label>
                    <input id="dataBase" name="dataBase" type="date" value={dataBase} onChange={(e) => setDataBase(e.target.value)} className={field} />
                  </div>
                  <div>
                    <Label htmlFor="dataAtual">Data atual</Label>
                    <input id="dataAtual" name="dataAtual" type="date" value={dataAtual} onChange={(e) => setDataAtual(e.target.value)} className={field} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <Label htmlFor="valorPrincipal">Valor principal (face)</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400" aria-hidden="true">R$</span>
                      <input
                        id="valorPrincipal"
                        name="valorPrincipal"
                        inputMode="decimal"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="125.000,00…"
                        value={valorPrincipal}
                        onChange={(e) => setValorPrincipal(e.target.value)}
                        className={`${field} pl-10 text-base font-semibold tabular-nums`}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="juros">Juros</Label>
                    <input id="juros" name="juros" inputMode="decimal" autoComplete="off" spellCheck={false} placeholder="0,00…" value={juros} onChange={(e) => setJuros(e.target.value)} className={`${field} tabular-nums`} />
                  </div>
                  <div>
                    <Label htmlFor="descontos">Descontos</Label>
                    <input id="descontos" name="descontos" inputMode="decimal" autoComplete="off" spellCheck={false} placeholder="0,00…" value={descontos} onChange={(e) => setDescontos(e.target.value)} className={`${field} tabular-nums`} />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProjef((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    aria-expanded={showProjef}
                  >
                    Atualizar via PROJEF
                    <svg className={`h-3.5 w-3.5 transition-transform ${showProjef ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <a
                    href={PROJEF_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                  >
                    Abrir site oficial
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {showProjef && (
                  <form onSubmit={importProjef} className="mt-4 rounded-xl border border-sky-100 bg-sky-50/50 p-4 motion-safe:animate-fade-in">
                    <p className="mb-3 text-xs leading-relaxed text-slate-600">
                      Calcule no PROJEF Web e cole o valor aqui. Não há API pública - a atualização é manual.
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="projefCodigo">Código (opc.)</Label>
                        <input id="projefCodigo" name="projefCodigo" autoComplete="off" spellCheck={false} value={projefCodigo} onChange={(e) => setProjefCodigo(e.target.value)} placeholder="ID do cálculo…" className={field} />
                      </div>
                      <div>
                        <Label htmlFor="projefValor">Valor atualizado</Label>
                        <input id="projefValor" name="projefValor" inputMode="decimal" autoComplete="off" spellCheck={false} value={projefValor} onChange={(e) => setProjefValor(e.target.value)} placeholder="0,00…" className={`${field} font-semibold tabular-nums`} />
                      </div>
                      <div>
                        <Label htmlFor="projefJuros">Juros (opc.)</Label>
                        <input id="projefJuros" name="projefJuros" inputMode="decimal" autoComplete="off" spellCheck={false} value={projefJuros} onChange={(e) => setProjefJuros(e.target.value)} placeholder="0,00…" className={`${field} tabular-nums`} />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={openProjef} className="rounded-xl bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                        Abrir PROJEF
                      </button>
                      <button type="submit" className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.98]">
                        Importar valor
                      </button>
                      {projefMsg && (
                        <p className={`text-xs font-medium ${projefMsg.includes('Informe') ? 'text-red-600' : 'text-emerald-700'}`} aria-live="polite">
                          {projefMsg}
                        </p>
                      )}
                    </div>
                  </form>
                )}
              </section>

              {/* Step 2 */}
              <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-5 sm:p-7">
                <div className="mb-6 flex items-start gap-3">
                  <StepBadge n={2} active={step1Done} done={step1Done} />
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">Ajustes da proposta</h2>
                    <p className="mt-0.5 text-sm text-slate-500">IR, prioridades e quanto do líquido será cedido.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                      <label className="flex cursor-pointer items-center gap-3 select-none">
                        <input
                          type="checkbox"
                          checked={aplicarIR}
                          onChange={(e) => setAplicarIR(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus-visible:ring-sky-300"
                        />
                        <span className="text-sm font-medium text-slate-800">Aplicar IR (RRA 27,5%)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="deps">Dep.</Label>
                        <input
                          id="deps"
                          name="dependentes"
                          type="number"
                          min={0}
                          max={20}
                          value={numDependentes}
                          onChange={(e) => setNumDependentes(Number(e.target.value))}
                          className="w-14 rounded-lg border border-slate-200 bg-white py-1.5 text-center text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                          disabled={!aplicarIR}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[13px] font-medium text-slate-700">Pagamentos prioritários</p>
                        <button type="button" onClick={addPrioridade} className="text-xs font-semibold text-sky-700 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 rounded-md px-1">
                          + Adicionar
                        </button>
                      </div>
                      {prioridades.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 py-4 text-center text-xs text-slate-400">
                          Nenhum. Adicione se houver honorários ou RRA prioritária.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {prioridades.map((p) => (
                            <li key={p.id} className="flex gap-2">
                              <input
                                aria-label="Descrição da prioridade"
                                placeholder="Descrição…"
                                value={p.descricao}
                                onChange={(e) => updatePrioridade(p.id, 'descricao', e.target.value)}
                                className={`${field} flex-1`}
                              />
                              <input
                                aria-label="Valor da prioridade"
                                inputMode="decimal"
                                placeholder="0…"
                                value={String(p.valor || '')}
                                onChange={(e) => updatePrioridade(p.id, 'valor', parseFloat(e.target.value) || 0)}
                                className={`${field} w-24 tabular-nums`}
                              />
                              <button type="button" onClick={() => removePrioridade(p.id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200" aria-label="Remover prioridade">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5">
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <p className="text-[13px] font-medium text-slate-700">Percentual cedível</p>
                        <p className="mt-0.5 text-xs text-slate-500">Quanto do líquido entra na proposta</p>
                      </div>
                      <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-sky-800">{percentualCedivel}%</p>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={percentualCedivel}
                      onChange={(e) => setPercentualCedivel(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer accent-sky-600"
                      aria-label="Percentual cedível"
                    />
                    <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                      <span>1%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setShowPdf((v) => !v)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 rounded-md"
                    aria-expanded={showPdf}
                  >
                    {showPdf ? 'Ocultar' : 'Anexar'} PDF / dados do credor
                    <svg className={`h-3.5 w-3.5 transition-transform ${showPdf ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showPdf && (
                    <div className="mt-3 space-y-3 motion-safe:animate-fade-in">
                      <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pdfInputRef.current?.click(); } }}
                        onDragOver={(e) => { e.preventDefault(); setPdfDragOver(true); }}
                        onDragLeave={() => setPdfDragOver(false)}
                        onDrop={handlePdfDrop}
                        onClick={() => pdfInputRef.current?.click()}
                        className={[
                          'flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition-[border-color,background-color] duration-150',
                          pdfDragOver ? 'border-sky-400 bg-sky-50' : pdfFile ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/40',
                        ].join(' ')}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white">
                          <svg className={`h-5 w-5 ${pdfFile ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{pdfFile ? pdfFile.name : 'Arraste um PDF ou clique para escolher…'}</p>
                          <p className="text-[11px] text-slate-400">Opcional - pode inferir processo e valor do nome do arquivo</p>
                        </div>
                      </div>
                      <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfSelect(f); e.target.value = ''; }} />
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="credor">Nome do credor</Label>
                          <input id="credor" name="credor" autoComplete="name" value={nomeCredor} onChange={(e) => setNomeCredor(e.target.value)} placeholder="Nome completo…" className={field} />
                        </div>
                        <div>
                          <Label htmlFor="processo">Número do processo</Label>
                          <input id="processo" name="processo" autoComplete="off" spellCheck={false} value={numeroProcesso} onChange={(e) => setNumeroProcesso(e.target.value)} placeholder="0000000-00.0000.0.00.0000…" className={`${field} font-mono text-[13px]`} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Mobile CTA */}
              <div className="mt-4 lg:hidden">
                <button
                  type="button"
                  onClick={goToResult}
                  disabled={!resultado}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-700 py-3.5 text-sm font-bold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 active:scale-[0.99]"
                >
                  Ver resultado
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Live result rail ─────────────────────────────────────────── */}
            <aside
              ref={resultRef}
              className="border-t border-slate-200 bg-white lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-l lg:border-t-0"
              style={{ scrollMarginTop: '1rem' }}
            >
              <div className="flex h-full min-h-[420px] flex-col p-5 sm:p-6 lg:p-7">
                <div className="mb-5 flex items-start gap-3">
                  <StepBadge n={3} active={!!resultado} done={!!resultado} />
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900">Resultado ao vivo</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Atualiza enquanto você preenche</p>
                  </div>
                </div>

                {!resultado ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                      <svg className="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Comece pelo valor de face</p>
                    <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-slate-400">
                      Digite o valor principal no passo 1. A memória de cálculo aparece aqui na hora.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative overflow-hidden rounded-2xl bg-sky-800 px-5 py-6 text-white">
                      <div
                        className="pointer-events-none absolute inset-0 opacity-25"
                        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                        aria-hidden="true"
                      />
                      <p className="relative text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/80">Valor cedível</p>
                      <p className="relative mt-2 font-display text-3xl font-bold tracking-tight tabular-nums xl:text-4xl">
                        {fmtBRL(resultado.valorCedivel)}
                      </p>
                      <p className="relative mt-2 text-xs text-sky-100/75">
                        {percentualCedivel}% do líquido · {esfera} · {tipo}
                      </p>
                    </div>

                    <ul className="mt-5 space-y-1">
                      <WaterfallRow label="Bruto (face + juros − desc.)" value={fmtBRL(resultado.valorBruto)} />
                      {aplicarIR && (
                        <WaterfallRow label={`IR RRA · ${numDependentes} dep.`} value={`− ${fmtBRL(resultado.ir)}`} negative />
                      )}
                      {resultado.totalPrioridades > 0 && (
                        <WaterfallRow label="Prioridades" value={`− ${fmtBRL(resultado.totalPrioridades)}`} negative />
                      )}
                      <li className="my-2 border-t border-slate-100" aria-hidden="true" />
                      <WaterfallRow label="Líquido" value={fmtBRL(resultado.valorLiquido)} strong />
                      <WaterfallRow label={`Cedível (${percentualCedivel}%)`} value={fmtBRL(resultado.valorCedivel)} strong accent />
                    </ul>

                    <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                      <p className="text-[11px] font-medium text-slate-500">Desconto efetivo sobre o bruto</p>
                      <p className="mt-1 font-display text-2xl font-bold tabular-nums text-sky-800">
                        {resultado.percentualDesconto.toFixed(2).replace('.', ',')}%
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {dataBase} → {dataAtual}
                        {projefCodigo ? ` · PROJEF ${projefCodigo}` : ''}
                      </p>
                    </div>

                    <div className="mt-auto space-y-2 pt-6">
                      {(nomeCredor || numeroProcesso) && (
                        <button
                          type="button"
                          onClick={handleRegistrarCedente}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 active:scale-[0.98]"
                        >
                          Cadastrar como cedente
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setValorPrincipal('');
                          setJuros('');
                          setDescontos('');
                          setPrioridades([]);
                          setPercentualCedivel(100);
                          setProjefMsg('');
                        }}
                        className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                      >
                        Limpar simulação
                      </button>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  );
}

function WaterfallRow({
  label,
  value,
  negative,
  strong,
  accent,
}: {
  label: string;
  value: string;
  negative?: boolean;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <li
      className={[
        'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5',
        accent ? 'bg-sky-50 ring-1 ring-sky-100' : '',
      ].join(' ')}
    >
      <span className={`text-sm ${strong ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{label}</span>
      <span
        className={[
          'shrink-0 text-sm font-bold tabular-nums',
          negative ? 'text-rose-600' : accent ? 'text-sky-800' : 'text-slate-900',
        ].join(' ')}
      >
        {value}
      </span>
    </li>
  );
}
