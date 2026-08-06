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
  { status: 'Aguard. Prop.', quantidade: 4, valorTotal: 970000 },
  { status: 'Prop. Env.', quantidade: 10, valorTotal: 1820000 },
  { status: 'Prop. Rej.', quantidade: 2, valorTotal: 420000 },
  { status: 'Aguard. Docs', quantidade: 3, valorTotal: 680000 },
  { status: 'Em Análise', quantidade: 5, valorTotal: 740000 },
  { status: 'Aprovado', quantidade: 4, valorTotal: 1100000 },
  { status: 'Em Cessão', quantidade: 3, valorTotal: 890000 },
  { status: 'Concluído', quantidade: 8, valorTotal: 6490000 },
];

export const formatCurrencyBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
