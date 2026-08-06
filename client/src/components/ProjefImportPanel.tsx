import { useState } from 'react';
import { openProjef, PROJEF_HELP, PROJEF_URL } from '@/data/projef';

type ProjefImportPanelProps = {
  onImport: (payload: { codigo: string; valor: string; juros?: string; dataAtualizacao: string }) => void;
  compact?: boolean;
};

export default function ProjefImportPanel({ onImport, compact = false }: ProjefImportPanelProps) {
  const today = new Date().toISOString().split('T')[0];
  const [codigo, setCodigo] = useState('');
  const [valor, setValor] = useState('');
  const [juros, setJuros] = useState('');
  const [dataAtualizacao, setDataAtualizacao] = useState(today);
  const [msg, setMsg] = useState('');

  function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!valor.trim()) {
      setMsg('Informe o valor atualizado do PROJEF.');
      return;
    }
    onImport({
      codigo: codigo.trim(),
      valor: valor.trim(),
      juros: juros.trim() || undefined,
      dataAtualizacao,
    });
    setMsg('Valor importado do PROJEF.');
  }

  return (
    <div className={compact ? '' : 'bg-white rounded-xl border border-slate-200 p-5'}>
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0 bg-indigo-500" />
          <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">Atualização PROJEF</p>
        </div>
      )}

      <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{PROJEF_HELP}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={openProjef}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700
                     text-white text-xs font-semibold transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Abrir PROJEF Web
        </button>
        <a
          href={PROJEF_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200
                     text-slate-600 text-[11px] font-medium transition-colors"
        >
          jfrs.jus.br/projefweb
        </a>
      </div>

      <form onSubmit={handleImport} className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">
              Código do cálculo
            </label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="ID PROJEF (opc.)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700
                         outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">
              Data atualização
            </label>
            <input
              type="date"
              value={dataAtualizacao}
              onChange={(e) => setDataAtualizacao(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700
                         outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">
              Valor atualizado (R$)
            </label>
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800
                         outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">
              Juros (opc.)
            </label>
            <input
              value={juros}
              onChange={(e) => setJuros(e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700
                         outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
        >
          {compact ? 'Atualizar valor da operação' : 'Importar valor para o cálculo'}
        </button>
        {msg && (
          <p className={`text-[11px] font-medium ${msg.includes('Informe') ? 'text-red-500' : 'text-emerald-600'}`}>
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
