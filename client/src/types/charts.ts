export interface EvolutionPoint {
  mes: string;
  total: number;
}

export interface StatusPoint {
  status: string;
  quantidade: number;
  valorTotal: number;
}

export interface LineSeries<TDatum> {
  key: string;
  label: string;
  color: string;
  valueAccessor: (datum: TDatum) => number;
  formatter?: (value: number) => string;
}
