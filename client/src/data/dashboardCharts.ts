import { type EvolutionPoint, type StatusPoint } from '@/types/charts';

export const evolutionDataset: EvolutionPoint[] = [];

export const statusDataset: StatusPoint[] = [];

export const formatCurrencyBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
