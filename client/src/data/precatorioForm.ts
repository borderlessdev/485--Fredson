import type { PrecatorioStatus } from '@/data/status';

export const TIPOS_PRECATORIO = ['Federal', 'Estadual', 'Municipal'] as const;
export type TipoPrecatorio = (typeof TIPOS_PRECATORIO)[number];

export const NATUREZAS = ['Alimentar', 'Comum', 'Outros'] as const;

export const TRIBUNAIS_POR_TIPO: Record<TipoPrecatorio, string[]> = {
  Federal: ['TRF1', 'TRF2', 'TRF3', 'TRF4', 'TRF5', 'TRF6', 'STF', 'STJ'],
  Estadual: ['TJAC', 'TJAL', 'TJAM', 'TJAP', 'TJBA', 'TJCE', 'TJDFT', 'TJES', 'TJGO', 'TJMA', 'TJMG', 'TJMS', 'TJMT', 'TJPA', 'TJPB', 'TJPE', 'TJPI', 'TJPR', 'TJRJ', 'TJRN', 'TJRO', 'TJRR', 'TJRS', 'TJSC', 'TJSE', 'TJSP', 'TJTO'],
  Municipal: ['JFCE', 'JFRS', 'JFSP', 'Outro'],
};

export const DESCONTO_CATEGORIAS = ['RRA', 'Honorários', 'Assistência judiciária', 'Outros'] as const;
export const DESCONTO_TIPOS = ['Inteiro', 'Percentual', 'Valor'] as const;

export interface DescontoRow {
  id: string;
  categoria: string;
  tipoValor: string;
  quantidade: string;
}

export interface PrecatorioFormData {
  tipo: TipoPrecatorio | '';
  tribunal: string;
  oficioNome: string;
  oficioAnexo: boolean;
  eComum: boolean;
  documento: string;
  requerente: string;
  requerido: string;
  natureza: string;
  vara: string;
  status: PrecatorioStatus | '';
  estadoUF: string;
  estadoNome: string;
  cidade: string;
  dataBase: string;
  dataExpedicao: string;
  principal: string;
  juros: string;
  numeroPrecatorio: string;
  codigoProcesso: string;
  cumprimentoSentenca: string;
  possuiPss: boolean;
  reduzirPercentualCredor: boolean;
  percentualCredor: string;
  parcelaPreferencialPaga: boolean;
  descontos: DescontoRow[];
  confirmado: boolean;
}

export function emptyForm(): PrecatorioFormData {
  return {
    tipo: '',
    tribunal: '',
    oficioNome: '',
    oficioAnexo: false,
    eComum: false,
    documento: '',
    requerente: '',
    requerido: '',
    natureza: '',
    vara: '',
    status: 'Aguardando Proposta',
    estadoUF: '',
    estadoNome: '',
    cidade: '',
    dataBase: '',
    dataExpedicao: '',
    principal: '',
    juros: '',
    numeroPrecatorio: '',
    codigoProcesso: '',
    cumprimentoSentenca: '',
    possuiPss: false,
    reduzirPercentualCredor: false,
    percentualCredor: '100',
    parcelaPreferencialPaga: false,
    descontos: [],
    confirmado: false,
  };
}

export function newDesconto(): DescontoRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoria: 'RRA',
    tipoValor: 'Inteiro',
    quantidade: '',
  };
}

export function parseMoney(v: string): number {
  if (!v.trim()) return 0;
  return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
}

export function formatMoneyInput(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const WIZARD_STEPS = [
  { id: 1, label: 'Identificação', hint: 'Tipo, tribunal e ofício' },
  { id: 2, label: 'Partes', hint: 'Credor, requerido e localização' },
  { id: 3, label: 'Valores', hint: 'Principal, juros e processo' },
  { id: 4, label: 'Condições', hint: 'PSS, descontos e confirmação' },
] as const;
