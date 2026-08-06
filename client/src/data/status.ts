export const PRECATORIO_STATUS = [
  'Aguardando Proposta',
  'Proposta Enviada',
  'Proposta Rejeitada',
  'Aguardando Documentos',
  'Em Análise',
  'Aprovado',
  'Em Cessão',
  'Concluído',
] as const;

export type PrecatorioStatus = (typeof PRECATORIO_STATUS)[number];

export const STATUS_STYLES: Record<PrecatorioStatus, string> = {
  'Aguardando Proposta':    'bg-slate-50 text-slate-700 border border-slate-200',
  'Proposta Enviada':       'bg-blue-50 text-blue-700 border border-blue-200',
  'Proposta Rejeitada':     'bg-red-50 text-red-700 border border-red-200',
  'Aguardando Documentos':  'bg-orange-50 text-orange-700 border border-orange-200',
  'Em Análise':             'bg-amber-50 text-amber-700 border border-amber-200',
  'Aprovado':               'bg-teal-50 text-teal-700 border border-teal-200',
  'Em Cessão':              'bg-violet-50 text-violet-700 border border-violet-200',
  'Concluído':              'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export const STATUS_DOTS: Record<PrecatorioStatus, string> = {
  'Aguardando Proposta':    'bg-slate-400',
  'Proposta Enviada':       'bg-blue-400',
  'Proposta Rejeitada':     'bg-red-400',
  'Aguardando Documentos':  'bg-orange-400',
  'Em Análise':             'bg-amber-400',
  'Aprovado':               'bg-teal-400',
  'Em Cessão':              'bg-violet-400',
  'Concluído':              'bg-emerald-400',
};
