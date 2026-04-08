import { type EvolutionPoint, type StatusPoint } from '@/types/charts';

export const evolutionDataset: EvolutionPoint[] = [
  { mes: 'Jan', total: 8 },
  { mes: 'Fev', total: 12 },
  { mes: 'Mar', total: 9 },
  { mes: 'Abr', total: 15 },
  { mes: 'Mai', total: 13 },
  { mes: 'Jun', total: 18 },
];

export const statusDataset: StatusPoint[] = [
  { status: 'Proposta', quantidade: 10, valorTotal: 1820000 },
  { status: 'Pago', quantidade: 10, valorTotal: 6490000 },
  { status: 'Aguard.', quantidade: 4, valorTotal: 970000 },
  { status: 'Analise', quantidade: 3, valorTotal: 740000 },
  { status: 'Rejeit.', quantidade: 2, valorTotal: 420000 },
  { status: 'Sessao', quantidade: 1, valorTotal: 210000 },
];

export const formatCurrencyBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
