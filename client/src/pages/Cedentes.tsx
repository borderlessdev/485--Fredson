import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusEsteira = 'Em Análise' | 'Captando Investidor' | 'Vendido' | 'Reprovado' | 'Em Negociação';
type EstadoCivil = 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável';

interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: 'Corrente' | 'Poupança';
  pix: string;
}

interface Arquivo {
  id: number;
  nome: string;
  tipo: string;
  tamanho: number;
  dataUpload: string;
}

interface Cedente {
  id: number;
  nome: string;
  cpf: string;
  estadoCivil: EstadoCivil | '';
  email: string;
  telefone: string;
  origemLead: string;
  statusEsteira: StatusEsteira;
  dadosBancarios: DadosBancarios;
  processo: string;
  valorFace: number;
  arquivos: Arquivo[];
  cadastradoEm: string;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED: Cedente[] = [
  {
    id: 1, nome: 'MARIO LUIZ SOUZA BRANDAO', cpf: '123.456.789-00',
    estadoCivil: 'Casado(a)', email: 'mario@email.com', telefone: '(11) 99999-0001',
    origemLead: 'Indicação', statusEsteira: 'Vendido',
    dadosBancarios: { banco: 'Bradesco', agencia: '1234', conta: '56789-0', tipoConta: 'Corrente', pix: '12345678900' },
    processo: '1007017-64.2021.4.01.3300', valorFace: 66000, arquivos: [], cadastradoEm: '2026-02-05',
  },
  {
    id: 2, nome: 'LIA MARCIA DA SILVA SANTOS', cpf: '987.654.321-00',
    estadoCivil: 'Solteiro(a)', email: 'lia@email.com', telefone: '(21) 98888-0002',
    origemLead: 'Site', statusEsteira: 'Em Análise',
    dadosBancarios: { banco: 'Itaú', agencia: '5678', conta: '13579-1', tipoConta: 'Poupança', pix: 'lia@email.com' },
    processo: '10194248820244013400', valorFace: 495000, arquivos: [], cadastradoEm: '2026-02-03',
  },
  {
    id: 3, nome: 'ARMANDO BERNARDES NETO', cpf: '111.222.333-44',
    estadoCivil: 'Divorciado(a)', email: 'armando@email.com', telefone: '(31) 97777-0003',
    origemLead: 'WhatsApp', statusEsteira: 'Em Análise',
    dadosBancarios: { banco: 'Caixa', agencia: '0001', conta: '00001234-5', tipoConta: 'Corrente', pix: '11122233344' },
    processo: '0039519-60.2004.4.01.3400', valorFace: 45000, arquivos: [], cadastradoEm: '2026-02-03',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_STYLES: Record<StatusEsteira, string> = {
  'Em Análise':         'bg-amber-50 text-amber-700 border border-amber-200',
  'Vendido':            'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Em Negociação':      'bg-blue-50 text-blue-700 border border-blue-200',
  'Reprovado':          'bg-red-50 text-red-700 border border-red-200',
  'Captando Investidor':'bg-violet-50 text-violet-700 border border-violet-200',
};
const STATUS_DOT: Record<StatusEsteira, string> = {
  'Em Análise':         'bg-amber-400',
  'Vendido':            'bg-emerald-400',
  'Em Negociação':      'bg-blue-400',
  'Reprovado':          'bg-red-400',
  'Captando Investidor':'bg-violet-400',
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Field component ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">{label}</label>
      {children}
    </div>
  );
}

// ── CedenteCard (modal/drawer) ────────────────────────────────────────────────

function CedenteDrawer({
  cedente,
  onClose,
  onSave,
}: {
  cedente: Cedente;
  onClose: () => void;
  onSave: (c: Cedente) => void;
}) {
  const [form, setForm] = useState<Cedente>({ ...cedente, dadosBancarios: { ...cedente.dadosBancarios } });
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all';
  const selectCls = `${inputCls} appearance-none cursor-pointer`;

  function set(field: keyof Cedente, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setBank(field: keyof DadosBancarios, value: string) {
    setForm((f) => ({ ...f, dadosBancarios: { ...f.dadosBancarios, [field]: value } }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const novos: Arquivo[] = files.map((f) => ({
      id: Date.now() + Math.random(),
      nome: f.name,
      tipo: f.type,
      tamanho: f.size,
      dataUpload: new Date().toLocaleDateString('pt-BR'),
    }));
    setForm((f) => ({ ...f, arquivos: [...f.arquivos, ...novos] }));
    e.target.value = '';
  }

  function removeArquivo(id: number) {
    setForm((f) => ({ ...f, arquivos: f.arquivos.filter((a) => a.id !== id) }));
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-[520px] shrink-0 bg-white h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-sky-500 shrink-0">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase">Ficha do Cedente</p>
            <p className="text-base font-bold text-white mt-0.5 truncate max-w-[340px]">{form.nome || 'Novo Cedente'}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Dados pessoais */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] text-blue-600 uppercase mb-3">Dados Pessoais</p>
            <div className="space-y-3">
              <Field label="Nome Completo">
                <input className={inputCls} value={form.nome} onChange={(e) => set('nome', e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CPF">
                  <input className={inputCls} placeholder="000.000.000-00" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} />
                </Field>
                <Field label="Estado Civil">
                  <div className="relative">
                    <select className={selectCls} value={form.estadoCivil} onChange={(e) => set('estadoCivil', e.target.value as EstadoCivil)}>
                      <option value="">Selecione…</option>
                      {(['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'] as EstadoCivil[]).map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="E-mail">
                  <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </Field>
                <Field label="Telefone">
                  <input className={inputCls} placeholder="(00) 00000-0000" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Origem do Lead">
                  <input className={inputCls} placeholder="Ex: Indicação, Site, WhatsApp…" value={form.origemLead} onChange={(e) => set('origemLead', e.target.value)} />
                </Field>
                <Field label="Status da Esteira">
                  <div className="relative">
                    <select className={selectCls} value={form.statusEsteira} onChange={(e) => set('statusEsteira', e.target.value as StatusEsteira)}>
                      {(['Em Análise', 'Captando Investidor', 'Em Negociação', 'Vendido', 'Reprovado'] as StatusEsteira[]).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                </Field>
              </div>
            </div>
          </section>

          {/* Dados bancários */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] text-emerald-600 uppercase mb-3">Dados Bancários</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Banco">
                  <input className={inputCls} value={form.dadosBancarios.banco} onChange={(e) => setBank('banco', e.target.value)} />
                </Field>
                <Field label="Tipo de Conta">
                  <div className="relative">
                    <select className={selectCls} value={form.dadosBancarios.tipoConta} onChange={(e) => setBank('tipoConta', e.target.value as 'Corrente' | 'Poupança')}>
                      <option>Corrente</option>
                      <option>Poupança</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Agência">
                  <input className={inputCls} value={form.dadosBancarios.agencia} onChange={(e) => setBank('agencia', e.target.value)} />
                </Field>
                <Field label="Conta">
                  <input className={inputCls} value={form.dadosBancarios.conta} onChange={(e) => setBank('conta', e.target.value)} />
                </Field>
              </div>
              <Field label="PIX">
                <input className={inputCls} placeholder="CPF, e-mail, telefone ou chave aleatória" value={form.dadosBancarios.pix} onChange={(e) => setBank('pix', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* Dados do processo */}
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] text-amber-600 uppercase mb-3">Dados do Precatório</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Número do Processo">
                <input className={inputCls} value={form.processo} onChange={(e) => set('processo', e.target.value)} />
              </Field>
              <Field label="Valor Face (R$)">
                <input className={inputCls} type="number" value={form.valorFace} onChange={(e) => set('valorFace', Number(e.target.value))} />
              </Field>
            </div>
          </section>

          {/* Arquivos */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase">Arquivos do Cliente</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Anexar arquivo
              </button>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {form.arquivos.length === 0 ? (
              <div
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-slate-200
                           cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-all text-slate-400"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs">Clique ou arraste arquivos aqui</p>
              </div>
            ) : (
              <div className="space-y-2">
                {form.arquivos.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{a.nome}</p>
                      <p className="text-[10px] text-slate-400">{formatBytes(a.tamanho)} · {a.dataUpload}</p>
                    </div>
                    <button onClick={() => removeArquivo(a.id)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-2 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all"
                >
                  + Adicionar mais arquivos
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3 shrink-0 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CedentesPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cedentes, setCedentes] = useState<Cedente[]>(SEED);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [editing, setEditing] = useState<Cedente | null>(null);

  // Auto-open new cedente drawer when coming from Calculadora (?new=1)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') {
      const novo: Cedente = {
        id: Date.now(),
        nome: params.get('nome') ?? '',
        cpf: '',
        estadoCivil: '',
        email: '',
        telefone: '',
        origemLead: params.get('origemLead') ?? '',
        statusEsteira: 'Em Análise',
        dadosBancarios: { banco: '', agencia: '', conta: '', tipoConta: 'Corrente', pix: '' },
        processo: params.get('processo') ?? '',
        valorFace: Number(params.get('valorFace') ?? 0),
        arquivos: [],
        cadastradoEm: new Date().toISOString().split('T')[0],
      };
      setCedentes((prev) => [novo, ...prev]);
      setEditing(novo);
      // Clean URL
      navigate('/cedentes', { replace: true });
    }
  }, [location.search, navigate]);

  function handleLogout() { signOut(); navigate('/login', { replace: true }); }

  function handleSave(updated: Cedente) {
    setCedentes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleNew() {
    const novo: Cedente = {
      id: Date.now(), nome: '', cpf: '', estadoCivil: '', email: '', telefone: '',
      origemLead: '', statusEsteira: 'Em Análise',
      dadosBancarios: { banco: '', agencia: '', conta: '', tipoConta: 'Corrente', pix: '' },
      processo: '', valorFace: 0, arquivos: [], cadastradoEm: new Date().toISOString().split('T')[0],
    };
    setCedentes((prev) => [novo, ...prev]);
    setEditing(novo);
  }

  const statusOptions = ['Todos', 'Em Análise', 'Captando Investidor', 'Em Negociação', 'Vendido', 'Reprovado'];

  const filtered = cedentes.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.nome.toLowerCase().includes(q) || c.cpf.includes(q) || c.processo.includes(q);
    const matchStatus = filterStatus === 'Todos' || c.statusEsteira === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar onLogout={handleLogout} userName={user?.name ?? ''} userEmail={user?.email ?? ''} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-none">Cedentes</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs text-slate-500">Gestão de leads e cedentes</p>
              <span className="inline-flex items-center justify-center h-4 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {filtered.length}
              </span>
            </div>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo Cedente
          </button>
        </header>

        {/* Toolbar */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </span>
            <input
              type="text" placeholder="Buscar por nome, CPF ou processo…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm
                         text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {statusOptions.map((s) => (
              <button
                key={s} onClick={() => setFilterStatus(s)}
                className={['px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150',
                  filterStatus === s ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

            {/* Head */}
            <div className="grid grid-cols-[48px_1fr_140px_180px_130px_130px_100px] border-b border-slate-200 bg-slate-50 px-4">
              {['', 'Nome / Processo', 'CPF', 'Origem', 'Status', 'Valor Face', 'Ações'].map((h, i) => (
                <div key={i} className={`py-3 text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase ${i > 4 ? 'text-right' : ''}`}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">Nenhum cedente encontrado.</div>
            ) : (
              filtered.map((c, i) => (
                <div
                  key={c.id}
                  className={['grid grid-cols-[48px_1fr_140px_180px_130px_130px_100px] items-center px-4 hover:bg-slate-50 transition-colors group',
                    i < filtered.length - 1 ? 'border-b border-slate-100' : '',
                  ].join(' ')}
                >
                  <div className="py-4">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white font-bold text-[11px]">
                      {c.nome[0]?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div className="py-4 pr-3">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">{c.nome || <em className="text-slate-400">Sem nome</em>}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{c.processo || '—'}</p>
                  </div>
                  <div className="py-4 pr-3 text-[12px] text-slate-600">{c.cpf || '—'}</div>
                  <div className="py-4 pr-3 text-[12px] text-slate-600 truncate">{c.origemLead || '—'}</div>
                  <div className="py-4 pr-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold ${STATUS_STYLES[c.statusEsteira]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[c.statusEsteira]}`} />
                      {c.statusEsteira}
                    </span>
                  </div>
                  <div className="py-4 pr-3 text-right">
                    <p className="text-[13px] font-bold text-slate-800">{c.valorFace > 0 ? BRL.format(c.valorFace) : '—'}</p>
                    {c.arquivos.length > 0 && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.arquivos.length} arquivo{c.arquivos.length > 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <div className="py-4 flex justify-end">
                    <button
                      onClick={() => setEditing(c)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600
                                 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all duration-150 group-hover:border-slate-300"
                    >
                      Editar
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {editing && (
        <CedenteDrawer cedente={editing} onClose={() => setEditing(null)} onSave={handleSave} />
      )}
    </div>
  );
}
