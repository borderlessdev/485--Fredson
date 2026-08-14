/** API pública Bacen SGS — https://api.bcb.gov.br */

const SGS_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';

/** Taxa Selic diária (% a.d.) — série oficial usada em correção EC 113/21. */
export const SELIC_DIARIA_SERIE = 11;

/** EC 113/21: Selic substitui correção+juros a partir de dez/2021. */
export const EC113_INICIO = '2021-12-01';

export type BacenPonto = { data: string; valor: number };

export type AtualizacaoSelic = {
  valorOriginal: number;
  valorAtualizado: number;
  fator: number;
  diasUteis: number;
  dataInicioEfetiva: string;
  dataFim: string;
  fonte: string;
};

function toBrDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

function parseBrDate(br: string): Date {
  const [d, m, y] = br.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function isoFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + days);
  return isoFromDate(d);
}

function fmtBRL(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function fetchSerie(
  codigo: number,
  dataInicialIso: string,
  dataFinalIso: string,
): Promise<BacenPonto[]> {
  const url =
    `${SGS_BASE}.${codigo}/dados?formato=json` +
    `&dataInicial=${encodeURIComponent(toBrDate(dataInicialIso))}` +
    `&dataFinal=${encodeURIComponent(toBrDate(dataFinalIso))}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Bacen SGS ${codigo} retornou HTTP ${res.status}`);
  }
  const raw = (await res.json()) as Array<{ data: string; valor: string }>;
  return raw.map((p) => ({
    data: p.data,
    valor: Number(String(p.valor).replace(',', '.')),
  }));
}

/**
 * Busca Selic diária. O Bacen limita janelas longas (~10 anos) —
 * fatiamos automaticamente.
 */
export async function fetchSelicDiaria(dataInicialIso: string, dataFinalIso: string): Promise<BacenPonto[]> {
  if (dataFinalIso < dataInicialIso) {
    throw new Error('Data final deve ser posterior à data inicial.');
  }

  const chunks: BacenPonto[] = [];
  let cursor = dataInicialIso;
  while (cursor <= dataFinalIso) {
    const endDate = new Date(`${cursor}T12:00:00`);
    endDate.setFullYear(endDate.getFullYear() + 9);
    let endIso = isoFromDate(endDate);
    if (endIso > dataFinalIso) endIso = dataFinalIso;
    const part = await fetchSerie(SELIC_DIARIA_SERIE, cursor, endIso);
    chunks.push(...part);
    if (endIso >= dataFinalIso) break;
    cursor = addDaysIso(endIso, 1);
  }

  const seen = new Set<string>();
  return chunks.filter((p) => {
    if (seen.has(p.data)) return false;
    seen.add(p.data);
    return true;
  });
}

/**
 * Atualiza valor pela Selic diária acumulada (produto dos fatores 1 + taxa/100).
 * Com EC 113 ligada, o início efetivo não ocorre antes de 01/12/2021.
 */
export async function atualizarValorPorSelic(opts: {
  valor: number;
  dataBaseIso: string;
  dataAtualIso: string;
  aplicarEc113?: boolean;
}): Promise<AtualizacaoSelic> {
  const { valor, dataAtualIso, aplicarEc113 = true } = opts;
  if (!(valor > 0)) throw new Error('Informe um valor principal maior que zero.');
  if (!opts.dataBaseIso || !dataAtualIso) throw new Error('Informe data-base e data atual.');

  let inicio = opts.dataBaseIso.slice(0, 10);
  if (aplicarEc113 && inicio < EC113_INICIO) inicio = EC113_INICIO;

  // Dia seguinte à data-base até a data de atualização (prática usual de calendário de juros)
  const inicioSerie = addDaysIso(inicio, 1);
  const fim = dataAtualIso.slice(0, 10);

  if (fim < inicioSerie) {
    return {
      valorOriginal: valor,
      valorAtualizado: valor,
      fator: 1,
      diasUteis: 0,
      dataInicioEfetiva: inicio,
      dataFim: fim,
      fonte: `Bacen SGS ${SELIC_DIARIA_SERIE} (sem dias no intervalo)`,
    };
  }

  const pontos = await fetchSelicDiaria(inicioSerie, fim);
  let fator = 1;
  for (const p of pontos) {
    // série 11: percentual ao dia (ex.: 0.052531 => 0,052531%)
    fator *= 1 + p.valor / 100;
  }

  const valorAtualizado = Math.round(valor * fator * 100) / 100;

  return {
    valorOriginal: valor,
    valorAtualizado,
    fator,
    diasUteis: pontos.length,
    dataInicioEfetiva: inicio,
    dataFim: fim,
    fonte: `Bacen SGS ${SELIC_DIARIA_SERIE} · Selic diária${aplicarEc113 ? ' · EC 113/21' : ''}`,
  };
}

export function formatAtualizacaoMsg(r: AtualizacaoSelic): string {
  const pct = ((r.fator - 1) * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
  return `Atualizado: ${fmtBRL(r.valorOriginal)} → ${fmtBRL(r.valorAtualizado)} (+${pct}%, ${r.diasUteis} dias úteis).`;
}

export { parseBrDate, toBrDate, fmtBRL };
