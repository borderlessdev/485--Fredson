export interface IbgeEstado {
  id: number;
  sigla: string;
  nome: string;
}

export interface IbgeMunicipio {
  id: number;
  nome: string;
}

const ESTADOS_CACHE: IbgeEstado[] = [];
const MUNICIPIOS_CACHE = new Map<string, IbgeMunicipio[]>();

/** Fallback se a API do IBGE estiver indisponível */
const ESTADOS_FALLBACK: IbgeEstado[] = [
  { id: 12, sigla: 'AC', nome: 'Acre' },
  { id: 27, sigla: 'AL', nome: 'Alagoas' },
  { id: 16, sigla: 'AP', nome: 'Amapá' },
  { id: 13, sigla: 'AM', nome: 'Amazonas' },
  { id: 29, sigla: 'BA', nome: 'Bahia' },
  { id: 23, sigla: 'CE', nome: 'Ceará' },
  { id: 53, sigla: 'DF', nome: 'Distrito Federal' },
  { id: 32, sigla: 'ES', nome: 'Espírito Santo' },
  { id: 52, sigla: 'GO', nome: 'Goiás' },
  { id: 21, sigla: 'MA', nome: 'Maranhão' },
  { id: 51, sigla: 'MT', nome: 'Mato Grosso' },
  { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
  { id: 15, sigla: 'PA', nome: 'Pará' },
  { id: 25, sigla: 'PB', nome: 'Paraíba' },
  { id: 41, sigla: 'PR', nome: 'Paraná' },
  { id: 26, sigla: 'PE', nome: 'Pernambuco' },
  { id: 22, sigla: 'PI', nome: 'Piauí' },
  { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
  { id: 24, sigla: 'RN', nome: 'Rio Grande do Norte' },
  { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' },
  { id: 11, sigla: 'RO', nome: 'Rondônia' },
  { id: 14, sigla: 'RR', nome: 'Roraima' },
  { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
  { id: 35, sigla: 'SP', nome: 'São Paulo' },
  { id: 28, sigla: 'SE', nome: 'Sergipe' },
  { id: 17, sigla: 'TO', nome: 'Tocantins' },
];

export async function fetchEstados(): Promise<IbgeEstado[]> {
  if (ESTADOS_CACHE.length) return ESTADOS_CACHE;
  try {
    const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    if (!res.ok) throw new Error('IBGE estados');
    const data = (await res.json()) as IbgeEstado[];
    ESTADOS_CACHE.push(...data);
    return ESTADOS_CACHE;
  } catch {
    return ESTADOS_FALLBACK;
  }
}

export async function fetchMunicipios(uf: string): Promise<IbgeMunicipio[]> {
  if (!uf) return [];
  const key = uf.toUpperCase();
  const cached = MUNICIPIOS_CACHE.get(key);
  if (cached) return cached;
  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${key}/municipios?orderBy=nome`,
    );
    if (!res.ok) throw new Error('IBGE municipios');
    const data = (await res.json()) as IbgeMunicipio[];
    MUNICIPIOS_CACHE.set(key, data);
    return data;
  } catch {
    if (key === 'DF') {
      const df = [{ id: 5300108, nome: 'Brasília' }];
      MUNICIPIOS_CACHE.set(key, df);
      return df;
    }
    return [];
  }
}
