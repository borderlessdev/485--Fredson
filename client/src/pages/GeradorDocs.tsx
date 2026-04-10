import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';

// ── Types ─────────────────────────────────────────────────────────────────────

type TipoDoc = 'CONTRATO' | 'PROCURAÇÃO' | 'TERMO' | 'NOTIFICAÇÃO' | 'OUTRO';

interface Template {
  id: number;
  nome: string;
  tipo: TipoDoc;
  conteudo: string;
  criadoEm: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractVars(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.replace(/[{}]/g, '').trim()))];
}

function highlightVars(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\{\{([^}]+)\}\}/g, '<mark class="bg-blue-100 text-blue-700 rounded px-0.5 font-semibold not-italic">{{$1}}</mark>');
}

const TIPO_STYLES: Record<TipoDoc, { ring: string; icon: string; badge: string; badgeTxt: string; dot: string }> = {
  'CONTRATO':    { ring: 'hover:border-blue-300',   icon: 'bg-blue-50 text-blue-600',    badge: 'bg-blue-50 text-blue-700 border-blue-200',    badgeTxt: 'CONTRATO',    dot: 'bg-blue-500'    },
  'PROCURAÇÃO':  { ring: 'hover:border-violet-300', icon: 'bg-violet-50 text-violet-600',badge: 'bg-violet-50 text-violet-700 border-violet-200',badgeTxt: 'PROCURAÇÃO',  dot: 'bg-violet-500'  },
  'TERMO':       { ring: 'hover:border-emerald-300',icon: 'bg-emerald-50 text-emerald-600',badge:'bg-emerald-50 text-emerald-700 border-emerald-200',badgeTxt:'TERMO',      dot: 'bg-emerald-500' },
  'NOTIFICAÇÃO': { ring: 'hover:border-amber-300',  icon: 'bg-amber-50 text-amber-600',  badge: 'bg-amber-50 text-amber-700 border-amber-200',  badgeTxt: 'NOTIFICAÇÃO', dot: 'bg-amber-500'   },
  'OUTRO':       { ring: 'hover:border-slate-300',  icon: 'bg-slate-100 text-slate-500', badge: 'bg-slate-100 text-slate-600 border-slate-200', badgeTxt: 'OUTRO',       dot: 'bg-slate-400'   },
};

const VARIAVEIS_UTEIS = [
  'CEDENTE_NOME', 'CEDENTE_CPF', 'CEDENTE_ESTADO_CIVIL',
  'INVESTIDOR_NOME', 'EMPRESA_NOME',
  'NUMERO_PROCESSO', 'TRIBUNAL', 'VALOR_FACE', 'VALOR_CESSAO',
  'CIDADE', 'DATA_ASSINATURA',
];

const SEED: Template[] = [
  {
    id: 1, nome: 'Contrato de Cessão', tipo: 'CONTRATO', criadoEm: '2026-01-15',
    conteudo:
`INSTRUMENTO PARTICULAR DE CESSÃO DE CRÉDITO

CEDENTE: {{CEDENTE_NOME}}, portador do CPF nº {{CEDENTE_CPF}}, estado civil {{CEDENTE_ESTADO_CIVIL}}, residente e domiciliado no Brasil.

CESSIONÁRIO: {{INVESTIDOR_NOME}}

OBJETO: Precatório nº {{NUMERO_PROCESSO}}, inscrito junto ao Tribunal {{TRIBUNAL}}, com valor de face de R$ {{VALOR_FACE}}.

VALOR DA CESSÃO: R$ {{VALOR_CESSAO}}

Pelo presente instrumento, as partes acima qualificadas têm entre si justo e acordado a cessão de crédito referente ao precatório acima descrito, nas condições estabelecidas neste contrato.`,
  },
  {
    id: 2, nome: 'Procuração Padrão', tipo: 'PROCURAÇÃO', criadoEm: '2026-01-20',
    conteudo:
`PROCURAÇÃO AD JUDICÍA

OUTORGANTE: {{CEDENTE_NOME}}, CPF {{CEDENTE_CPF}}.

OUTORGADO: {{EMPRESA_NOME}}

Pelo presente instrumento particular de procuração, o(a) Outorgante nomeia e constitui como seu bastante procurador o Outorgado, a quem confere amplos poderes para representá-lo(a) perante o Tribunal {{TRIBUNAL}}, referente ao processo nº {{NUMERO_PROCESSO}}.`,
  },
  {
    id: 3, nome: 'Termo de Quitação', tipo: 'TERMO', criadoEm: '2026-02-10',
    conteudo:
`TERMO DE QUITAÇÃO E RECIBO

Pelo presente instrumento, {{CEDENTE_NOME}}, portador do CPF nº {{CEDENTE_CPF}}, declara ter recebido de {{INVESTIDOR_NOME}} a quantia de R$ {{VALOR_CESSAO}}, referente à cessão do precatório nº {{NUMERO_PROCESSO}}, dando plena, geral e irrevogável quitação.

Local e data: {{CIDADE}}, {{DATA_ASSINATURA}}.`,
  },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoDoc({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({ template, onClose }: { template: Template; onClose: () => void }) {
  const st = TIPO_STYLES[template.tipo];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${st.icon}`}>
              <IcoDoc />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">{template.nome}</p>
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded border text-[10px] font-bold tracking-wider ${st.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {template.tipo}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div
            className="text-[13px] leading-7 text-slate-700 whitespace-pre-wrap font-serif"
            dangerouslySetInnerHTML={{ __html: highlightVars(template.conteudo) }}
          />
        </div>

        {/* Variables footer */}
        {extractVars(template.conteudo).length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Variáveis detectadas</p>
            <div className="flex flex-wrap gap-1.5">
              {extractVars(template.conteudo).map((v) => (
                <span key={v} className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-mono font-semibold">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Template Drawer ───────────────────────────────────────────────────────────

function TemplateDrawer({
  template, isNew, onClose, onSave,
}: {
  template: Template; isNew: boolean; onClose: () => void; onSave: (t: Template) => void;
}) {
  const [form, setForm] = useState<Template>({ ...template });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertVar(v: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = form.conteudo.slice(0, start) + `{{${v}}}` + form.conteudo.slice(end);
    setForm((f) => ({ ...f, conteudo: newVal }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + v.length + 4, start + v.length + 4);
    }, 0);
  }

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[560px] shrink-0 bg-white h-full overflow-y-auto flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-violet-600 to-purple-500 shrink-0">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase">{isNew ? 'Novo Modelo' : 'Editar Modelo'}</p>
            <p className="text-base font-bold text-white mt-0.5 truncate max-w-[380px]">{form.nome || 'Sem nome'}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-4">
          {/* Nome + Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">Nome do Modelo</label>
              <input className={inputCls} placeholder="Ex: Contrato de Cessão" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">Tipo</label>
              <div className="relative">
                <select className={`${inputCls} appearance-none cursor-pointer`} value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoDoc }))}>
                  {(['CONTRATO', 'PROCURAÇÃO', 'TERMO', 'NOTIFICAÇÃO', 'OUTRO'] as TipoDoc[]).map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </div>
          </div>

          {/* Variable helper */}
          <div>
            <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-2 block">Inserir Variável</label>
            <div className="flex flex-wrap gap-1.5">
              {VARIAVEIS_UTEIS.map((v) => (
                <button
                  key={v} type="button" onClick={() => insertVar(v)}
                  className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 text-[10px] font-mono font-semibold transition-colors"
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <label className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase mb-1 block">Conteúdo do Documento</label>
            <textarea
              ref={textareaRef}
              rows={16}
              className={`${inputCls} font-mono text-[12px] leading-relaxed resize-none`}
              placeholder="Digite o conteúdo do documento. Use {{VARIAVEL}} para inserir campos dinâmicos."
              value={form.conteudo}
              onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
            />
          </div>

          {/* Detected vars */}
          {extractVars(form.conteudo).length > 0 && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Variáveis detectadas</p>
              <div className="flex flex-wrap gap-1.5">
                {extractVars(form.conteudo).map((v) => (
                  <span key={v} className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-blue-600 text-[11px] font-mono font-semibold shadow-sm">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3 shrink-0 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            disabled={!form.nome.trim() || !form.conteudo.trim()}
            className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Salvar modelo
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function GeradorDocsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>(SEED);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [editing, setEditing] = useState<Template | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);

  function handleLogout() { signOut(); navigate('/login', { replace: true }); }

  function handleNew() {
    setEditing({ id: Date.now(), nome: '', tipo: 'CONTRATO', conteudo: '', criadoEm: new Date().toISOString().split('T')[0] });
    setIsNew(true);
  }

  function handleSave(t: Template) {
    if (isNew) setTemplates((p) => [t, ...p]);
    else setTemplates((p) => p.map((x) => (x.id === t.id ? t : x)));
    setEditing(null);
    setIsNew(false);
  }

  function handleDelete(id: number) {
    setTemplates((p) => p.filter((t) => t.id !== id));
  }

  const tipoOptions = ['Todos', 'CONTRATO', 'PROCURAÇÃO', 'TERMO', 'NOTIFICAÇÃO', 'OUTRO'];

  const filtered = templates.filter((t) => {
    const q = search.toLowerCase();
    return (!q || t.nome.toLowerCase().includes(q)) && (filterTipo === 'Todos' || t.tipo === filterTipo);
  });

  const preview = previewId != null ? templates.find((t) => t.id === previewId) : null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar onLogout={handleLogout} userName={user?.name ?? ''} userEmail={user?.email ?? ''} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 leading-none">Gerador de Documentos</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs text-slate-500">Modelos de contratos e documentos jurídicos</p>
              <span className="inline-flex items-center justify-center h-4 min-w-[20px] px-1.5 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                {filtered.length}
              </span>
            </div>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo Modelo
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
              type="text" placeholder="Buscar por nome do modelo…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {tipoOptions.map((t) => (
              <button
                key={t} onClick={() => setFilterTipo(t)}
                className={['px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                  filterTipo === t ? 'bg-violet-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto px-6 py-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
              <IcoDoc className="w-12 h-12" />
              <p className="text-sm font-medium">Nenhum modelo encontrado</p>
              <button onClick={handleNew} className="text-xs text-violet-600 hover:underline">+ Criar novo modelo</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t) => {
                const st = TIPO_STYLES[t.tipo];
                const vars = extractVars(t.conteudo);
                return (
                  <div
                    key={t.id}
                    className={`group bg-white rounded-2xl border border-slate-200 ${st.ring} hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden`}
                  >
                    {/* Card header with gradient stripe */}
                    <div className="h-1 w-full rounded-t-2xl" style={{ background: `var(--stripe-${t.tipo.toLowerCase().replace('ã', 'a').replace('ç', 'c')})` }}
                      ref={(el) => { if (el) el.style.background = st.dot.replace('bg-', 'var(--tw-') + ')'; }}
                    />

                    <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${st.icon}`}>
                          <IcoDoc className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">{t.nome}</p>
                          <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider ${st.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.badgeTxt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content preview */}
                    <div className="px-5 pb-3 flex-1">
                      <div
                        className="text-[11px] leading-relaxed text-slate-500 font-mono bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 overflow-hidden"
                        style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 5, overflow: 'hidden' }}
                        dangerouslySetInnerHTML={{ __html: highlightVars(t.conteudo.slice(0, 400)) }}
                      />
                    </div>

                    {/* Variables */}
                    {vars.length > 0 && (
                      <div className="px-5 pb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1.5">
                          {vars.length} variável{vars.length > 1 ? 'is' : ''}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {vars.slice(0, 4).map((v) => (
                            <span key={v} className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-mono font-semibold border border-blue-100">
                              {`{{${v}}}`}
                            </span>
                          ))}
                          {vars.length > 4 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-semibold">
                              +{vars.length - 4} mais
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.criadoEm).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => setPreviewId(t.id)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Pré-visualizar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setEditing(t); setIsNew(false); }}
                          className="p-2 rounded-lg text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <TemplateDrawer template={editing} isNew={isNew} onClose={() => { setEditing(null); setIsNew(false); }} onSave={handleSave} />
      )}
      {preview && (
        <PreviewModal template={preview} onClose={() => setPreviewId(null)} />
      )}
    </div>
  );
}
