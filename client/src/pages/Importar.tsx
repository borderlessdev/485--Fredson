import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface ParsedRow {
  idx: number;
  processo: string;
  valor: string;
  cedente: string;
  status: string;
  valid: boolean;
  errors: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_VALID: string[] = ['Em Análise', 'Captando Investidor', 'Em Negociação', 'Vendido', 'Reprovado'];

function parseCSV(raw: string): ParsedRow[] {
  const lines = raw.trim().split('\n').filter((l) => l.trim());
  return lines.map((line, i) => {
    const cols = line.split(',').map((c) => c.trim());
    const [processo = '', valor = '', cedente = '', status = ''] = cols;
    const errors: string[] = [];
    if (!processo) errors.push('Processo vazio');
    if (!cedente) errors.push('Cedente vazio');
    if (!valor || isNaN(Number(valor.replace(/[R$. ]/g, '').replace(',', '.')))) errors.push('Valor inválido');
    if (status && !STATUS_VALID.includes(status)) errors.push(`Status "${status}" desconhecido`);
    return { idx: i + 1, processo, valor, cedente, status: status || 'Em Análise', valid: errors.length === 0, errors };
  });
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
function tryFormatBRL(v: string) {
  const n = parseFloat(v.replace(/[R$. ]/g, '').replace(',', '.'));
  return isNaN(n) ? v : BRL.format(n);
}

const STATUS_STYLES: Record<string, string> = {
  'Em Análise':          'bg-amber-50 text-amber-700 border-amber-200',
  'Captando Investidor': 'bg-violet-50 text-violet-700 border-violet-200',
  'Em Negociação':       'bg-blue-50 text-blue-700 border-blue-200',
  'Vendido':             'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Reprovado':           'bg-red-50 text-red-700 border-red-200',
};

// ── Step indicator ────────────────────────────────────────────────────────────

function Stepper({ step }: { step: Step }) {
  const steps = [
    { n: 1 as Step, label: 'Preparar dados' },
    { n: 2 as Step, label: 'Revisar importação' },
    { n: 3 as Step, label: 'Concluir' },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                done  ? 'bg-emerald-500 border-emerald-500 text-white' :
                active ? 'bg-blue-600 border-blue-600 text-white' :
                         'bg-white border-slate-300 text-slate-400',
              ].join(' ')}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.n}
              </div>
              <p className={['text-[11px] font-semibold mt-1 whitespace-nowrap',
                active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400',
              ].join(' ')}>{s.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={['h-0.5 w-20 mx-2 mb-4 rounded transition-all', done ? 'bg-emerald-400' : 'bg-slate-200'].join(' ')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ImportarPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [rawText, setRawText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleLogout() { signOut(); navigate('/login', { replace: true }); }

  function handleFileSelect(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setRawText((e.target?.result as string) ?? '');
    reader.readAsText(file, 'utf-8');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv' || f.type === 'text/plain')) {
      handleFileSelect(f);
    }
  }

  function handleReview() {
    const parsed = parseCSV(rawText);
    setRows(parsed);
    setStep(2);
  }

  function handleImport() {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImportDone(true);
      setStep(3);
    }, 1800);
  }

  function handleReset() {
    setStep(1);
    setRawText('');
    setRows([]);
    setImportDone(false);
  }

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar onLogout={handleLogout} userName={user?.name ?? ''} userEmail={user?.email ?? ''} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-none">Importação em Massa</h1>
            <p className="text-xs text-slate-500 mt-1">Importe cedentes e processos via CSV ou colagem direta</p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Stepper */}
            <div className="bg-white rounded-2xl border border-slate-200 px-8 py-5 flex justify-center shadow-sm">
              <Stepper step={step} />
            </div>

            {/* ── STEP 1: Preparar ─────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Format guide */}
                <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">Formato esperado</p>
                      <p className="text-xs text-slate-500 mt-0.5 mb-3">Cada linha representa um registro. Separador: vírgula.</p>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[
                          { col: 'Coluna 1', desc: 'Número do Processo', ex: '1234567-00.2024.1.01.0000', color: 'blue' },
                          { col: 'Coluna 2', desc: 'Valor (R$)', ex: '50000', color: 'emerald' },
                          { col: 'Coluna 3', desc: 'Nome do Cedente', ex: 'João da Silva', color: 'violet' },
                          { col: 'Coluna 4', desc: 'Status (opcional)', ex: 'Em Análise', color: 'amber' },
                        ].map(({ col, desc, ex, color }) => (
                          <div key={col} className={`rounded-xl bg-${color}-50 border border-${color}-100 p-3`}>
                            <p className={`text-[10px] font-bold uppercase tracking-widest text-${color}-500`}>{col}</p>
                            <p className="text-[12px] font-semibold text-slate-700 mt-1">{desc}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">{ex}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <code className="text-[11px] text-emerald-400 font-mono">
                          1234567-00.2024.1.01.0000, 50000, João da Silva, Em Análise
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload area */}
                <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-800 mb-4">Selecionar arquivo ou colar dados</p>

                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={[
                      'flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all mb-4',
                      dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30',
                    ].join(' ')}
                  >
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-600">Arraste um arquivo CSV aqui</p>
                    <p className="text-xs text-slate-400">ou clique para selecionar do computador</p>
                    <span className="mt-1 px-3 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                      .CSV · .TXT
                    </span>
                  </div>
                  <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }} />

                  {/* OR divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-200" />
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ou cole diretamente</p>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={8}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={`Cole aqui os dados do Excel (Ctrl+V)...\n\nExemplo:\n1234567-00.2024.1.01.0000, 50000, João da Silva, Em Análise\n9876543-00.2023.1.01.0000, 120000, Maria Souza, Vendido`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 placeholder-slate-400
                               focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all resize-none leading-relaxed"
                  />

                  {rawText.trim() && (
                    <p className="text-[11px] text-slate-400 mt-2">
                      {rawText.trim().split('\n').filter((l) => l.trim()).length} linha(s) detectada(s)
                    </p>
                  )}
                </div>

                <button
                  onClick={handleReview}
                  disabled={!rawText.trim()}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Revisar dados
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── STEP 2: Revisar ───────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-4">

                {/* Summary chips */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total de linhas', value: rows.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { label: 'Válidas',          value: validRows.length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { label: 'Com erros',        value: invalidRows.length, color: invalidRows.length > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-400 border-slate-200' },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-2xl border px-5 py-4 ${s.color} text-center shadow-sm`}>
                      <p className="text-2xl font-black">{s.value}</p>
                      <p className="text-[11px] font-semibold mt-0.5 opacity-70">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700">Prévia dos dados</p>
                    <p className="text-xs text-slate-400">{rows.length} registro(s)</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {['#', 'Processo', 'Valor', 'Cedente', 'Status', ''].map((h, i) => (
                            <th key={i} className={`px-4 py-2.5 text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase text-left ${i === 0 ? 'w-10' : ''}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.idx} className={['border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors', !r.valid ? 'bg-red-50/40' : ''].join(' ')}>
                            <td className="px-4 py-3 text-[11px] text-slate-400 font-mono">{r.idx}</td>
                            <td className="px-4 py-3">
                              <p className="text-[12px] font-mono text-slate-700 truncate max-w-[180px]">{r.processo || <em className="text-red-400 not-italic">vazio</em>}</p>
                            </td>
                            <td className="px-4 py-3 text-[12px] font-semibold text-slate-800 whitespace-nowrap">
                              {r.valor ? tryFormatBRL(r.valor) : <em className="text-red-400 not-italic text-[11px]">inválido</em>}
                            </td>
                            <td className="px-4 py-3 text-[12px] text-slate-700 max-w-[160px] truncate">{r.cedente || <em className="text-red-400 not-italic">vazio</em>}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${STATUS_STYLES[r.status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {r.valid ? (
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <div className="group relative inline-block">
                                  <svg className="w-4 h-4 text-red-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                  </svg>
                                  <div className="absolute right-0 bottom-6 hidden group-hover:block w-48 bg-slate-900 text-white text-[10px] rounded-lg px-3 py-2 shadow-xl z-10">
                                    {r.errors.join(', ')}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {invalidRows.length > 0 && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-xs text-amber-700">
                      <strong>{invalidRows.length} linha(s) com erro</strong> serão ignoradas. Somente as {validRows.length} válidas serão importadas.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    ← Voltar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={validRows.length === 0 || importing}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {importing ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Importando…
                      </>
                    ) : (
                      <>Importar {validRows.length} registro(s)</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Concluído ─────────────────────────────────────── */}
            {step === 3 && importDone && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Success header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xl font-black text-white">Importação concluída!</p>
                  <p className="text-sm text-white/80 mt-1">{validRows.length} registro(s) adicionado(s) com sucesso</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                  <div className="px-6 py-5 text-center">
                    <p className="text-3xl font-black text-emerald-600">{validRows.length}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Importados com sucesso</p>
                  </div>
                  <div className="px-6 py-5 text-center">
                    <p className={`text-3xl font-black ${invalidRows.length > 0 ? 'text-red-500' : 'text-slate-300'}`}>{invalidRows.length}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Ignorados (com erro)</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-5 flex gap-3">
                  <button
                    onClick={() => navigate('/cedentes')}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
                  >
                    Ver Cedentes importados
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Nova importação
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
