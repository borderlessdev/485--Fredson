import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

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

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoCalc() {
  return (
    <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function IcoCheck() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ color, label }: { color: string; label: string }) {
  return (
    <div className={`flex items-center gap-2 mb-4`}>
      <span className={`w-3.5 h-3.5 rounded-sm flex-shrink-0 ${color}`} />
      <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">{label}</p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CalculadoraPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Form state
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
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [calculado, setCalculado] = useState(false);

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDragOver, setPdfDragOver] = useState(false);
  const [nomeCredor, setNomeCredor] = useState('');
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [registrado, setRegistrado] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  function handleLogout() {
    signOut();
    navigate('/login', { replace: true });
  }

  function parseBRL(v: string): number {
    return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
  }

  function addPrioridade() {
    setPrioridades((prev) => [
      ...prev,
      { id: Date.now(), descricao: '', valor: 0 },
    ]);
  }

  function removePrioridade(id: number) {
    setPrioridades((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePrioridade(id: number, field: 'descricao' | 'valor', value: string | number) {
    setPrioridades((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }

  const calcular = useCallback(() => {
    const face = parseBRL(valorPrincipal);
    if (!face) return;

    const jurosVal = parseBRL(juros);
    const descontosVal = parseBRL(descontos);
    const totalPrioridades = prioridades.reduce((acc, p) => acc + Number(p.valor), 0);

    const valorBruto = face + jurosVal - descontosVal;

    // IR simplificado: 27.5% sobre o excedente acima da faixa isenta, por dependente
    const deducaoPorDep = 2275.08 * numDependentes;
    const baseIR = Math.max(0, valorBruto - deducaoPorDep - totalPrioridades);
    const ir = aplicarIR ? baseIR * 0.275 : 0;

    const valorLiquido = valorBruto - ir - totalPrioridades;
    const valorCedivel = valorLiquido * (percentualCedivel / 100);
    const percentualDesconto = valorBruto > 0 ? ((valorBruto - valorCedivel) / valorBruto) * 100 : 0;

    setResultado({ valorBruto, ir, totalPrioridades, valorLiquido, valorCedivel, percentualDesconto });
    setCalculado(true);
    setRegistrado(false);
  }, [valorPrincipal, juros, descontos, aplicarIR, numDependentes, prioridades, percentualCedivel]);

  // Parse PDF filename for processo number and optional value
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
    setRegistrado(false);
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

  function handleRegistrarCedente() {
    if (!resultado) return;
    // Build query string for Cedentes page pre-fill
    const params = new URLSearchParams({
      nome: nomeCredor,
      processo: numeroProcesso,
      valorFace: String(Math.round(resultado.valorBruto)),
      origemLead: 'Calculadora',
    });
    navigate(`/cedentes?new=1&${params.toString()}`);
  }

  const inputClass =
    'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all';
  const selectClass =
    'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all appearance-none cursor-pointer';
  const labelClass = 'text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1.5 block';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar onLogout={handleLogout} userName={user?.name ?? ''} userEmail={user?.email ?? ''} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-none">Calculadora Jurídica</h1>
            <p className="text-xs text-slate-500 mt-1">Simulação de Precificação e Cessão de Crédito (EC113/RRA)</p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="flex gap-5 max-w-[1100px] mx-auto">

            {/* ── Left: Form ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 w-[440px] shrink-0">

              {/* Dados do processo */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionHeader color="bg-blue-500" label="Dados do Processo" />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelClass}>Esfera</label>
                    <div className="relative">
                      <select value={esfera} onChange={(e) => setEsfera(e.target.value)} className={selectClass}>
                        <option>Federal</option>
                        <option>Estadual</option>
                        <option>Municipal</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Tipo</label>
                    <div className="relative">
                      <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectClass}>
                        <option>Precatório</option>
                        <option>RPV</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Data Base (Inscrição)</label>
                    <input type="date" value={dataBase} onChange={(e) => setDataBase(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Data Atual/Exped.</label>
                    <input type="date" value={dataAtual} onChange={(e) => setDataAtual(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Valores financeiros */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionHeader color="bg-emerald-500" label="Valores Financeiros" />
                <div className="mb-3">
                  <label className={labelClass}>Valor Principal (Face)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={valorPrincipal}
                      onChange={(e) => setValorPrincipal(e.target.value)}
                      className={`${inputClass} pl-9 text-base font-semibold`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Juros (Opcional)</label>
                    <input type="text" inputMode="decimal" placeholder="0,00" value={juros} onChange={(e) => setJuros(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Descontos Prévios</label>
                    <input type="text" inputMode="decimal" placeholder="0,00" value={descontos} onChange={(e) => setDescontos(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Deduções legais */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionHeader color="bg-amber-500" label="Deduções Legais" />

                {/* IR checkbox */}
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div
                      onClick={() => setAplicarIR((v) => !v)}
                      className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded flex items-center justify-center border-2 transition-all cursor-pointer ${
                        aplicarIR ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'
                      }`}
                    >
                      {aplicarIR && <IcoCheck />}
                    </div>
                    <span className="text-sm text-slate-700 font-medium">Aplicar Imposto de Renda (RRA)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={numDependentes}
                    onChange={(e) => setNumDependentes(Number(e.target.value))}
                    className="w-16 text-center border border-slate-200 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    title="Número de dependentes"
                  />
                </div>

                {/* Pagamentos prioritários */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass}>Pagamentos Prioritários</label>
                    <button
                      onClick={addPrioridade}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      + Adicionar
                    </button>
                  </div>
                  {prioridades.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      Nenhuma prioridade cadastrada.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {prioridades.map((p) => (
                        <div key={p.id} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Descrição"
                            value={p.descricao}
                            onChange={(e) => updatePrioridade(p.id, 'descricao', e.target.value)}
                            className={`${inputClass} flex-1`}
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="Valor"
                            value={String(p.valor || '')}
                            onChange={(e) => updatePrioridade(p.id, 'valor', parseFloat(e.target.value) || 0)}
                            className={`${inputClass} w-28`}
                          />
                          <button
                            onClick={() => removePrioridade(p.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Percentual cedível */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className={labelClass}>Percentual Cedível (% do Líquido)</label>
                  <span className="text-sm font-bold text-blue-600">{percentualCedivel}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={percentualCedivel}
                  onChange={(e) => setPercentualCedivel(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* ── PDF Upload ──────────────────────────────────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <SectionHeader color="bg-red-500" label="Importar PDF de Precatório" />

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setPdfDragOver(true); }}
                  onDragLeave={() => setPdfDragOver(false)}
                  onDrop={handlePdfDrop}
                  onClick={() => pdfInputRef.current?.click()}
                  className={[
                    'flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                    pdfDragOver ? 'border-blue-400 bg-blue-50' :
                      pdfFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40',
                  ].join(' ')}
                >
                  {pdfFile ? (
                    <>
                      <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs font-semibold text-emerald-700 max-w-[220px] text-center truncate">{pdfFile.name}</p>
                      <p className="text-[10px] text-emerald-500">Clique para substituir</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-xs text-slate-500 font-medium">Arraste o PDF ou clique para selecionar</p>
                      <p className="text-[10px] text-slate-400">O número do processo e o valor serão preenchidos automaticamente</p>
                    </>
                  )}
                </div>
                <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfSelect(f); e.target.value = ''; }} />

                {/* Credor / Processo */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">Nome do Credor</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      placeholder="Ex: João da Silva"
                      value={nomeCredor}
                      onChange={(e) => setNomeCredor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">Número do Processo</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                      placeholder="0000000-00.0000.0.00.0000"
                      value={numeroProcesso}
                      onChange={(e) => setNumeroProcesso(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Calcular button */}
              <button
                onClick={calcular}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                           bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                           text-white font-bold text-sm tracking-wide
                           transition-all duration-150 shadow-sm"
              >
                CALCULAR PROPOSTA
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* ── Right: Result ────────────────────────────────────────────── */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
              {!calculado ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
                  <IcoCalc />
                  <p className="text-base font-semibold text-slate-500">Aguardando Dados</p>
                  <p className="text-sm text-slate-400 max-w-[240px]">
                    Preencha os campos de entrada e clique em calcular para gerar a memória de cálculo detalhada.
                  </p>
                </div>
              ) : resultado ? (
                <>
                  {/* Result header */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-sky-500">
                    <p className="text-xs font-bold tracking-widest text-white/70 uppercase">Memória de Cálculo</p>
                    <p className="text-xl font-bold text-white mt-0.5">{fmtBRL(resultado.valorCedivel)}</p>
                    <p className="text-xs text-white/70 mt-0.5">Valor Cedível ({percentualCedivel}% do líquido)</p>
                  </div>

                  {/* Result rows */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                    <ResultRow label="Valor Bruto (Face + Juros − Descontos)" value={fmtBRL(resultado.valorBruto)} />
                    {aplicarIR && (
                      <ResultRow label={`Imposto de Renda RRA (27,5% − ${numDependentes} dep.)`} value={`− ${fmtBRL(resultado.ir)}`} negative />
                    )}
                    {resultado.totalPrioridades > 0 && (
                      <ResultRow label="Pagamentos Prioritários" value={`− ${fmtBRL(resultado.totalPrioridades)}`} negative />
                    )}
                    <div className="h-px bg-slate-100 my-2" />
                    <ResultRow label="Valor Líquido" value={fmtBRL(resultado.valorLiquido)} highlight />
                    <ResultRow label={`Valor Cedível (${percentualCedivel}%)`} value={fmtBRL(resultado.valorCedivel)} highlight />
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Desconto efetivo sobre o bruto</p>
                      <p className="text-2xl font-bold text-blue-600">{resultado.percentualDesconto.toFixed(2).replace('.', ',')}%</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {esfera} · {tipo} · {dataBase} → {dataAtual}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-6 pb-5 space-y-2">
                    {(nomeCredor || numeroProcesso) && !registrado && (
                      <button
                        onClick={handleRegistrarCedente}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                   bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold
                                   transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Cadastrar como Cedente
                      </button>
                    )}
                    <button
                      onClick={() => { setCalculado(false); setRegistrado(false); }}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium
                                 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Nova Simulação
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value, negative = false, highlight = false }: {
  label: string; value: string; negative?: boolean; highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${highlight ? 'bg-blue-50' : ''}`}>
      <span className={`text-sm ${highlight ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{label}</span>
      <span className={`text-sm font-bold ${negative ? 'text-red-500' : highlight ? 'text-blue-700' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}
